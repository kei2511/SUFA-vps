import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray } from "drizzle-orm";
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
    const { screeningId, type } = await request.json(); // type: "curhat" | "first_aid"
    if (!screeningId || !type) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Periksa jika ada sesi yang sudah berjalan/menunggu
    const existing = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.patientId, session.user.id),
        inArray(chatSessions.status, ["waiting", "active"])
      )
    });
    if (existing) {
      return NextResponse.json({ success: true, session: existing });
    }

    // Insert sesi chat baru dengan status waiting
    const newSessionId = randomUUID();
    await db.insert(chatSessions).values({
      id: newSessionId,
      patientId: session.user.id,
      type,
      status: "waiting",
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
