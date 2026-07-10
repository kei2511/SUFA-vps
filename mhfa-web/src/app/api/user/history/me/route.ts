import { db } from "@/db";
import { screeningSessions, chatSessions, professionalContactLogs, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch Screenings
    const screenings = await db.query.screeningSessions.findMany({
      where: eq(screeningSessions.userId, userId),
      orderBy: [desc(screeningSessions.startedAt)]
    });

    // 2. Fetch Chat/Counseling Sessions
    const chats = await db.query.chatSessions.findMany({
      where: eq(chatSessions.patientId, userId),
      orderBy: [desc(chatSessions.startedAt)]
    });

    // Resolve counselor names for chats
    const chatsWithCounselors = await Promise.all(
      chats.map(async (chat) => {
        let counselorName = null;
        if (chat.counselorId) {
          const counselorUser = await db.query.user.findFirst({
            where: eq(user.id, chat.counselorId)
          });
          counselorName = counselorUser?.name || null;
        }
        return {
          ...chat,
          counselorName
        };
      })
    );

    // 3. Fetch Professional Contact Logs
    const contactLogs = await db.query.professionalContactLogs.findMany({
      where: eq(professionalContactLogs.userId, userId),
      orderBy: [desc(professionalContactLogs.contactedAt)]
    });

    // 4. Combine into a unified timeline
    const timeline: any[] = [];

    screenings.forEach((s) => {
      timeline.push({
        id: s.id,
        type: "screening",
        title: "Skrining Kesehatan Mental",
        date: s.completedAt || s.startedAt,
        status: s.status === "completed" ? "Selesai" : "Dalam Proses",
        details: {
          score: s.score,
          conditionLabel: s.conditionLabel
        }
      });
    });

    chatsWithCounselors.forEach((c) => {
      const typeLabel = c.type === "first_aid" ? "P3K Psikologis" : "Konseling Curhat";
      timeline.push({
        id: c.id,
        type: "chat",
        title: `Sesi ${typeLabel}`,
        date: c.endedAt || c.startedAt,
        status: c.status === "completed" ? "Selesai" : c.status === "active" ? "Aktif" : "Menunggu",
        details: {
          counselorName: c.counselorName,
          chatType: c.type
        }
      });
    });

    contactLogs.forEach((l) => {
      const typeLabel = l.contactType === "whatsapp" ? "WhatsApp" : l.contactType === "hotline" ? "Hotline" : "General Action";
      timeline.push({
        id: l.id,
        type: "contact",
        title: "Menghubungi Profesional",
        date: l.contactedAt,
        status: "Selesai",
        details: {
          contactName: l.contactName,
          contactType: typeLabel
        }
      });
    });

    // Sort timeline by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      history: timeline
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
