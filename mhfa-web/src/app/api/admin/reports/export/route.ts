import { db } from "@/db";
import { screeningSessions, user, chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, gte, lte, desc } from "drizzle-orm";
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

      // Query screening sessions in date range
      const list = await db.query.screeningSessions.findMany({
        where: and(
          gte(screeningSessions.completedAt, startDate),
          lte(screeningSessions.completedAt, endDate)
        ),
        orderBy: [desc(screeningSessions.completedAt)]
      });

      // Filter by condition
      let filtered = list;
      if (condition !== "Semua Kondisi") {
        let matchLabel = "";
        if (condition.includes("Tinggi")) matchLabel = "Risiko Tinggi";
        else if (condition.includes("Sedang")) matchLabel = "Risiko Sedang";
        else if (condition.includes("Rendah")) matchLabel = "Risiko Rendah";

        if (matchLabel) {
          filtered = list.filter(item => item.conditionLabel === matchLabel);
        }
      }

      // Build CSV headers
      csvContent = "ID Sesi,Nama Pasien,Skor,Tingkat Risiko,Tanggal Selesai\n";

      for (const item of filtered) {
        let name = "Anonim";
        if (!anonymize) {
          const patient = await db.query.user.findFirst({
            where: eq(user.id, item.userId)
          });
          name = patient?.name || "Pengguna";
        }
        const formattedDate = new Date(item.completedAt || "").toISOString().replace(/T/, " ").replace(/\..+/, "");
        csvContent += `"${item.id}","${name.replace(/"/g, '""')}",${item.score},"${item.conditionLabel}","${formattedDate}"\n`;
      }

      filename = `mhfa-screening-report-${Date.now()}.csv`;
    } else {
      // Chat consultations
      const list = await db.query.chatSessions.findMany({
        where: and(
          gte(chatSessions.startedAt, startDate),
          lte(chatSessions.startedAt, endDate)
        ),
        orderBy: [desc(chatSessions.startedAt)]
      });

      csvContent = "ID Sesi,ID Pasien,ID Konselor,Tipe Sesi,Status Sesi,Waktu Mulai,Waktu Selesai\n";

      for (const item of list) {
        const start = new Date(item.startedAt).toISOString().replace(/T/, " ").replace(/\..+/, "");
        const end = item.endedAt ? new Date(item.endedAt).toISOString().replace(/T/, " ").replace(/\..+/, "") : "-";
        csvContent += `"${item.id}","${item.patientId}","${item.counselorId || "-"}","${item.type}","${item.status}","${start}","${end}"\n`;
      }

      filename = `mhfa-chat-sessions-report-${Date.now()}.csv`;
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
