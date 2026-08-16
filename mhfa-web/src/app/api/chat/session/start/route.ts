import { db } from "@/db";
import { chatSessions, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, isNull } from "drizzle-orm";
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
    
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}
    let { screeningId, type } = body as any;
    if (!type) type = "curhat";
    if (screeningId === "direct") screeningId = null;

    const patientId = session.user.id;

    // Check if an active session already exists for this patient
    const existing = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.patientId, patientId),
        eq(chatSessions.status, "active")
      )
    });

    if (existing) {
      return NextResponse.json({ success: true, session: existing });
    }

    // Fetch db user to check if assigned to a counselor
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, patientId)
    });

    const newSessionId = randomUUID();
    await db.insert(chatSessions).values({
      id: newSessionId,
      patientId,
      counselorId: dbUser?.assignedCounselorId || null,
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
