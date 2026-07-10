import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const screeningSessionId = searchParams.get("screeningSessionId");

    let currentSession = null;
    let hasCompleted = false;

    if (screeningSessionId) {
      const chatSess = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.screeningSessionId, screeningSessionId)
      });
      if (chatSess) {
        currentSession = chatSess;
        if (chatSess.status === "completed") {
          hasCompleted = true;
        }
      }
    } else {
      // Fallback
      const chatSess = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.patientId, session.user.id),
          inArray(chatSessions.status, ["waiting", "active"])
        ),
        orderBy: [desc(chatSessions.startedAt)]
      });
      currentSession = chatSess || null;

      const completedSession = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.patientId, session.user.id),
          eq(chatSessions.status, "completed")
        )
      });
      hasCompleted = !!completedSession;
    }

    return NextResponse.json({
      session: currentSession || null,
      hasCompleted
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
