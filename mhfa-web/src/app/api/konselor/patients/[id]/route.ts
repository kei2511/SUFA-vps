import { db } from "@/db";
import { user, screeningSessions, chatSessions, chatMessages, counselorNotes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || (session.user.role !== "Konselor" && session.user.role !== "Admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Patient user profile
    const patient = await db.query.user.findFirst({
      where: eq(user.id, id)
    });

    if (!patient || (patient.role !== "Pasien" && patient.role !== "Konseli")) {
      return NextResponse.json({ error: "Konseli tidak ditemukan." }, { status: 404 });
    }

    // 2. Fetch Screenings
    const screeningsList = await db.query.screeningSessions.findMany({
      where: and(
        eq(screeningSessions.userId, id),
        eq(screeningSessions.status, "completed")
      ),
      orderBy: [desc(screeningSessions.completedAt)]
    });

    const screenings = screeningsList.map((s) => {
      const dateText = s.completedAt 
        ? new Date(s.completedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        : "Dalam Proses";

      let color = "text-status-success bg-status-success/10";
      if (s.conditionLabel === "Risiko Sedang") {
        color = "text-status-warning bg-status-warning/10";
      } else if (s.conditionLabel === "Risiko Tinggi") {
        color = "text-status-error bg-status-error/10";
      }

      return {
        date: dateText,
        score: s.score,
        condition: s.conditionLabel,
        color
      };
    });

    // 3. Fetch Notes: counselorNotes associated with this patient's chat sessions
    const patientChats = await db.query.chatSessions.findMany({
      where: eq(chatSessions.patientId, id)
    });
    const chatIds = patientChats.map((c) => c.id);

    let notes: any[] = [];
    if (chatIds.length > 0) {
      const notesList = await db.query.counselorNotes.findMany({
        orderBy: [desc(counselorNotes.createdAt)]
      });
      // Filter manually to avoid complex joins in memory
      const filteredNotesList = notesList.filter((n) => chatIds.includes(n.sessionId));

      notes = await Promise.all(
        filteredNotesList.map(async (n) => {
          const counselorUser = await db.query.user.findFirst({
            where: eq(user.id, n.counselorId)
          });
          const noteDate = new Date(n.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });

          // Parse clinical note sections if possible, else return as whole
          let symptoms = n.note;
          let assessment = "-";
          let recommendation = "-";

          // Try parsing as JSON first
          if (n.note.startsWith("{") && n.note.endsWith("}")) {
            try {
              const parsed = JSON.parse(n.note);
              symptoms = parsed.symptoms || n.note;
              assessment = parsed.assessment || "-";
              recommendation = parsed.recommendation || "-";
            } catch {
              // If JSON parse fails, fall through to other formats
            }
          } else if (n.note.includes("||")) {
            // Legacy format: symptoms||assessment||recommendation
            const parts = n.note.split("||");
            symptoms = parts[0]?.trim() || n.note;
            assessment = parts[1]?.trim() || assessment;
            recommendation = parts[2]?.trim() || recommendation;
          }

          return {
            date: noteDate,
            counselorName: counselorUser?.name || "Konselor",
            symptoms,
            assessment,
            recommendation
          };
        })
      );
    }

    // 4. Fetch Transcripts: all messages from completed chat sessions
    const completedChats = patientChats.filter((c) => c.status === "completed");
    const transcripts = await Promise.all(
      completedChats.map(async (chat) => {
        const messages = await db.query.chatMessages.findMany({
          where: eq(chatMessages.sessionId, chat.id),
          orderBy: [chatMessages.createdAt]
        });

        const formattedMessages = messages.map((m) => {
          const time = new Date(m.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
          });
          return {
            sender: m.senderId === id ? "patient" : "counselor",
            text: m.text,
            time
          };
        });

        const sessionDate = new Date(chat.startedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });

        return {
          sessionDate,
          messages: formattedMessages
        };
      })
    );

    // Calculate age from DOB if present
    let age = "Usia tidak diketahui";
    if (patient.dob) {
      const birthYear = new Date(patient.dob).getFullYear();
      if (!isNaN(birthYear)) {
        age = `${new Date().getFullYear() - birthYear} Tahun`;
      }
    }

    const regDate = new Date(patient.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const activeChat = patientChats.find((c) => c.status === "active" || c.status === "waiting");

    return NextResponse.json({
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone || "-",
        age,
        gender: "Perempuan", // Default fallback
        inviteCodeUsed: "-",
        registrationDate: regDate,
        status: activeChat 
          ? (activeChat.status === "active" ? "Aktif" : "Dirujuk")
          : "Selesai",
        screenings,
        notes,
        transcripts
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
