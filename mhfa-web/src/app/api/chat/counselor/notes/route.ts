import { db } from "@/db";
import { counselorNotes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user || session.user.role !== "Konselor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { sessionId, symptoms, assessment, recommendation } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const notePayload = JSON.stringify({ symptoms, assessment, recommendation });

    // Check if notes already exist for this session
    const existing = await db.query.counselorNotes.findFirst({
      where: eq(counselorNotes.sessionId, sessionId)
    });

    if (existing) {
      await db.update(counselorNotes)
        .set({ note: notePayload })
        .where(eq(counselorNotes.id, existing.id));
    } else {
      await db.insert(counselorNotes).values({
        id: randomUUID(),
        sessionId,
        counselorId: session.user.id,
        note: notePayload,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
