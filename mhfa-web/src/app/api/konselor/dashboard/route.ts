import { db } from "@/db";
import { chatSessions, user, screeningSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, sql, isNull, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Konselor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const counselorId = session.user.id;

    // 1. Fetch Queue: chatSessions where status is 'active' and counselorId is null
    const queueList = await db.query.chatSessions.findMany({
      where: and(
        eq(chatSessions.status, "active"),
        isNull(chatSessions.counselorId)
      ),
      orderBy: [desc(chatSessions.startedAt)]
    });

    // For each queue item, fetch patient name and their latest screening session condition
    const queueWithPatients = await Promise.all(
      queueList.map(async (sess) => {
        const patientUser = await db.query.user.findFirst({
          where: eq(user.id, sess.patientId)
        });

        const latestScreening = await db.query.screeningSessions.findFirst({
          where: eq(screeningSessions.userId, sess.patientId),
          orderBy: [desc(screeningSessions.completedAt)]
        });

        // Calculate wait time in minutes
        const waitMs = Date.now() - new Date(sess.startedAt).getTime();
        const waitMins = Math.max(0, Math.floor(waitMs / 60000));

        return {
          id: sess.id,
          name: patientUser?.name || "Konseli Anonim",
          condition: latestScreening?.conditionLabel || "Tidak Ada Data Skrining",
          waitTime: `${waitMins} mnt`,
          initial: (patientUser?.name || "P").charAt(0).toUpperCase()
        };
      })
    );

    // 2. Fetch Active Sessions: chatSessions where status is 'active' and counselorId matches current counselor
    const activeList = await db.query.chatSessions.findMany({
      where: and(
        eq(chatSessions.status, "active"),
        eq(chatSessions.counselorId, counselorId)
      ),
      orderBy: [desc(chatSessions.startedAt)]
    });

    const activeWithPatients = await Promise.all(
      activeList.map(async (sess) => {
        const patientUser = await db.query.user.findFirst({
          where: eq(user.id, sess.patientId)
        });

        // Format start time
        const start = new Date(sess.startedAt);
        const timeText = start.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        }) + " WIB";

        return {
          id: sess.id,
          name: patientUser?.name || "Konseli Anonim",
          type: sess.type === "first_aid" ? "First Aid (SUFA)" : "Curhat Teks",
          time: timeText,
          icon: sess.type === "first_aid" ? "call" : "chat"
        };
      })
    );

    // 3. Stats calculation
    // Completed today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const completedTodayList = await db.query.chatSessions.findMany({
      where: and(
        eq(chatSessions.status, "completed"),
        eq(chatSessions.counselorId, counselorId),
        gte(chatSessions.endedAt, startOfToday)
      )
    });

    const completedToday = completedTodayList.length;

    // Total Handled
    const totalHandledList = await db.query.chatSessions.findMany({
      where: and(
        eq(chatSessions.status, "completed"),
        eq(chatSessions.counselorId, counselorId)
      )
    });
    const totalHandled = totalHandledList.length;

    // Average duration in minutes
    let avgDuration = 0;
    if (totalHandled > 0) {
      let totalDurationMs = 0;
      totalHandledList.forEach((sess) => {
        if (sess.endedAt) {
          totalDurationMs += new Date(sess.endedAt).getTime() - new Date(sess.startedAt).getTime();
        }
      });
      avgDuration = Math.round(totalDurationMs / (totalHandled * 60000));
    }

    return NextResponse.json({
      counselorName: session.user.name || "Konselor SUFA",
      queue: queueWithPatients,
      activeSessions: activeWithPatients,
      stats: {
        completedToday,
        totalHandled,
        avgDuration
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
