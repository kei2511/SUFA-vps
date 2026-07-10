import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    let { screeningId, type } = await request.json();
    if (!type) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (screeningId === "direct") {
      screeningId = null;
    }

    if (screeningId) {
      // Periksa jika ada sesi yang sudah berjalan dengan screeningSessionId ini
      const existing = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.screeningSessionId, screeningId)
      });
      if (existing) {
        return NextResponse.json({ success: true, session: existing });
      }
    } else {
      // Cari sesi active/waiting yang tidak memiliki screeningSessionId
      const existing = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.patientId, session.user.id),
          inArray(chatSessions.status, ["waiting", "active"]),
          isNull(chatSessions.screeningSessionId)
        )
      });
      if (existing) {
        return NextResponse.json({ success: true, session: existing });
      }
    }

    // Insert sesi chat baru dengan status 'active' (langsung aktif)
    const newSessionId = randomUUID();
    await db.insert(chatSessions).values({
      id: newSessionId,
      patientId: session.user.id,
      screeningSessionId: screeningId || null,
      type,
      status: "active",
      startedAt: new Date()
    });

    const newSession = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, newSessionId)
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
