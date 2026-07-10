import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Konselor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Assign counselorId and update startedAt for active, unassigned session
    const result = await db.update(chatSessions)
      .set({
        counselorId: session.user.id,
        startedAt: new Date() // reset startedAt to indicate active conversation start
      })
      .where(and(
        eq(chatSessions.id, sessionId),
        eq(chatSessions.status, "active"),
        isNull(chatSessions.counselorId)
      ))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Session not found or already accepted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
