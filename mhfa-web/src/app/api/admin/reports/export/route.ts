import { db } from "@/db";
import { screeningSessions, user, chatSessions, screeningAnswers, options } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "screening";
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    let csvContent = "";
    let filename = "export.csv";

    const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
    const endDate = endDateStr ? new Date(endDateStr + "T23:59:59.999Z") : new Date();

    if (type === "screening") {
      const condition = searchParams.get("condition") || "Semua Kondisi";
      const anonymize = searchParams.get("anonymize") === "true";
      const counselorId = searchParams.get("counselorId"); // "all", "unassigned", or specific counselor userId
      const userIdsParam = searchParams.get("userIds"); // comma-separated user IDs
      const targetUserIds = userIdsParam ? userIdsParam.split(",").map(u => u.trim()).filter(Boolean) : [];

      // 1. Fetch all screening sessions ever to accurately calculate test sequence per user
      const allSessions = await db.query.screeningSessions.findMany({
        orderBy: [asc(screeningSessions.completedAt)]
      });

      // Group all sessions by userId
      const userSessionsMap = new Map<string, typeof allSessions>();
      allSessions.forEach(s => {
        if (!userSessionsMap.has(s.userId)) {
          userSessionsMap.set(s.userId, []);
        }
        userSessionsMap.get(s.userId)!.push(s);
      });

      // 2. Fetch users and counselor mappings
      const allUsers = await db.query.user.findMany();
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      // 3. Fetch screening answers & options for MMYS domain calculations
      const allAnswers = await db.query.screeningAnswers.findMany();
      const allOptions = await db.query.options.findMany();
      const optionMap = new Map(allOptions.map(o => [o.id, o]));

      // Group answers by sessionId
      const sessionAnswersMap = new Map<string, typeof allAnswers>();
      allAnswers.forEach(a => {
        if (!sessionAnswersMap.has(a.sessionId)) {
          sessionAnswersMap.set(a.sessionId, []);
        }
        sessionAnswersMap.get(a.sessionId)!.push(a);
      });

      // 4. Filter sessions by date range, condition, group (counselor), and specific user selection
      let filtered = allSessions.filter(s => {
        const completed = new Date(s.completedAt || 0);
        return completed >= startDate && completed <= endDate;
      });

      // Filter by counselor / group
      if (counselorId && counselorId !== "all") {
        filtered = filtered.filter(item => {
          const patient = userMap.get(item.userId);
          if (counselorId === "unassigned") {
            return !patient?.assignedCounselorId;
          }
          return patient?.assignedCounselorId === counselorId;
        });
      }

      // Filter by selected individual konseli
      if (targetUserIds.length > 0) {
        const userSet = new Set(targetUserIds);
        filtered = filtered.filter(item => userSet.has(item.userId));
      }

      // Filter by condition label
      if (condition !== "Semua Kondisi") {
        let matchLabel = "";
        if (condition.includes("Tinggi")) matchLabel = "Risiko Tinggi";
        else if (condition.includes("Sedang")) matchLabel = "Risiko Sedang";
        else if (condition.includes("Rendah")) matchLabel = "Risiko Rendah";

        if (matchLabel) {
          filtered = filtered.filter(item => item.conditionLabel === matchLabel);
        }
      }

      // Sort filtered sessions by counselor name, then patient name, then test order (chronological Tes 1, Tes 2, dst)
      filtered.sort((a, b) => {
        const patientA = userMap.get(a.userId);
        const patientB = userMap.get(b.userId);
        const counselorA = patientA?.assignedCounselorId ? userMap.get(patientA.assignedCounselorId)?.name || "" : "ZZZ";
        const counselorB = patientB?.assignedCounselorId ? userMap.get(patientB.assignedCounselorId)?.name || "" : "ZZZ";

        if (counselorA !== counselorB) return counselorA.localeCompare(counselorB);
        
        const nameA = patientA?.name || "";
        const nameB = patientB?.name || "";
        if (nameA !== nameB) return nameA.localeCompare(nameB);

        return new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime();
      });

      // UTF-8 BOM for Microsoft Excel compatibility
      const BOM = "\uFEFF";
      const headersList = [
        "ID Sesi",
        "ID Konseli",
        "Nama Konseli",
        "Email Konseli",
        "Kelompok / Konselor Pendamping",
        "Urutan Tes (Ke-)",
        "Skor Total",
        "Tingkat Risiko",
        "Gejala Anxietas (Kecemasan)",
        "Gejala Depresi",
        "Perubahan Skor (vs Tes Lalu)",
        "Perubahan Status (vs Tes Lalu)",
        "Waktu Selesai Skrining"
      ];

      csvContent = BOM + headersList.map(h => `"${h}"`).join(",") + "\n";

      for (const item of filtered) {
        const patient = userMap.get(item.userId);
        const counselor = patient?.assignedCounselorId ? userMap.get(patient.assignedCounselorId) : null;

        // User anonymity formatting
        let patientIdDisplay = item.userId;
        let nameDisplay = patient?.name || "Pengguna";
        let emailDisplay = patient?.email || "-";

        if (anonymize) {
          patientIdDisplay = `KONSELI-${item.userId.substring(0, 8)}`;
          nameDisplay = `Konseli ${item.userId.substring(0, 5)}`;
          emailDisplay = "******@disamarkan.id";
        }

        const counselorDisplay = counselor ? `${counselor.name} (${counselor.counselorCode || "Konselor"})` : "Tanpa Konselor";

        // Calculate test sequence & comparative metrics per user
        const userHistory = userSessionsMap.get(item.userId) || [];
        const testIndex = userHistory.findIndex(s => s.id === item.id);
        const testSequence = testIndex !== -1 ? testIndex + 1 : 1;

        let scoreChange = "Baseline (Tes 1)";
        let statusChange = "Baseline (Tes 1)";

        if (testIndex > 0) {
          const prevSession = userHistory[testIndex - 1];
          const diff = item.score - prevSession.score;
          if (diff === 0) {
            scoreChange = "0 (Tetap)";
          } else if (diff < 0) {
            scoreChange = `${diff} (Membaik)`;
          } else {
            scoreChange = `+${diff} (Meningkat)`;
          }

          if (prevSession.conditionLabel === item.conditionLabel) {
            statusChange = `Tetap (${item.conditionLabel})`;
          } else {
            statusChange = `${prevSession.conditionLabel} -> ${item.conditionLabel}`;
          }
        }

        // Compute domain breakdown for MMYS
        let anxietasLabel = "-";
        let depresiLabel = "-";

        if (item.questionnaireId === "mmys-combined") {
          const sessionAns = sessionAnswersMap.get(item.id) || [];
          const optIds: string[] = [];
          sessionAns.forEach(a => {
            if (Array.isArray(a.selectedOptionIds)) {
              optIds.push(...(a.selectedOptionIds as string[]));
            }
          });

          const selectedOpts = optIds.map(id => optionMap.get(id)).filter(Boolean);
          const findOpt = (qNum: number) =>
            selectedOpts.find(o =>
              o?.questionId === `mmys-combined-q${qNum}` ||
              o?.questionId?.endsWith(`-q${qNum}`) ||
              o?.id?.includes(`-q${qNum}-`)
            );

          const q1Score = findOpt(1)?.score ?? 0;
          const q3Score = findOpt(3)?.score ?? 0;
          const q4Score = findOpt(4)?.score ?? 0;
          const q6Score = findOpt(6)?.score ?? 0;

          const isAnxBerat = q1Score === 1 && q3Score === 1;
          const isAnxRingan = !isAnxBerat && (q1Score === 1 || q3Score === 1);

          const isDepBerat = q4Score === 1 && q6Score === 1;
          const isDepRingan = !isDepBerat && (q4Score === 1 || q6Score === 1);

          anxietasLabel = isAnxBerat ? "Anxietas Berat" : isAnxRingan ? "Anxietas Ringan" : "Normal";
          depresiLabel = isDepBerat ? "Depresi Berat" : isDepRingan ? "Depresi Ringan" : "Normal";
        }

        const formattedDate = new Date(item.completedAt || 0).toISOString().replace(/T/, " ").replace(/\..+/, "");

        const row = [
          item.id,
          patientIdDisplay,
          nameDisplay,
          emailDisplay,
          counselorDisplay,
          testSequence,
          item.score,
          item.conditionLabel,
          anxietasLabel,
          depresiLabel,
          scoreChange,
          statusChange,
          formattedDate
        ];

        csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
      }

      filename = `sufa-skrining-longitudinal-${Date.now()}.csv`;
    } else {
      // Chat consultations export
      const list = await db.query.chatSessions.findMany({
        where: and(
          gte(chatSessions.startedAt, startDate),
          lte(chatSessions.startedAt, endDate)
        ),
        orderBy: [desc(chatSessions.startedAt)]
      });

      const BOM = "\uFEFF";
      csvContent = BOM + `"ID Sesi","ID Konseli","ID Konselor","Tipe Sesi","Status Sesi","Waktu Mulai","Waktu Selesai"\n`;

      for (const item of list) {
        const start = new Date(item.startedAt).toISOString().replace(/T/, " ").replace(/\..+/, "");
        const end = item.endedAt ? new Date(item.endedAt).toISOString().replace(/T/, " ").replace(/\..+/, "") : "-";
        csvContent += `"${item.id}","${item.patientId}","${item.counselorId || "-"}","${item.type}","${item.status}","${start}","${end}"\n`;
      }

      filename = `sufa-chat-sessions-report-${Date.now()}.csv`;
    }

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

