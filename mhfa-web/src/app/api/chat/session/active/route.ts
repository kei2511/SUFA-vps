import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentSession = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.patientId, session.user.id),
        inArray(chatSessions.status, ["waiting", "active"])
      ),
      orderBy: [desc(chatSessions.startedAt)]
    });

    const completedSession = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.patientId, session.user.id),
        eq(chatSessions.status, "completed")
      )
    });

    return NextResponse.json({
      session: currentSession || null,
      hasCompleted: !!completedSession
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
