import { db } from "@/db";
import { chatSessions, user, screeningSessions, counselorNotes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, asc, desc } from "drizzle-orm";
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
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const currentSession = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, sessionId)
    });
    if (!currentSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Hitung posisi antrean jika status waiting
    let queuePosition = 0;
    if (currentSession.status === "waiting") {
      const waitingList = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.status, "waiting"))
        .orderBy(asc(chatSessions.startedAt));
      
      const idx = waitingList.findIndex(s => s.id === sessionId);
      queuePosition = idx !== -1 ? idx + 1 : 1;
    }

    let counselorName = null;
    let counselorStatus = "offline";
    if (currentSession.counselorId) {
      const counselor = await db.query.user.findFirst({
        where: eq(user.id, currentSession.counselorId)
      });
      counselorName = counselor?.name || "Konselor SUFA";
      counselorStatus = counselor?.status === "Aktif" ? "online" : "offline";
    }

    let patientDetail = null;
    let savedNotes = null;

    if (session.user.role === "Konselor") {
      const patient = await db.query.user.findFirst({
        where: eq(user.id, currentSession.patientId)
      });

      const screenings = await db.query.screeningSessions.findMany({
        where: eq(screeningSessions.userId, currentSession.patientId),
        orderBy: [desc(screeningSessions.completedAt)]
      });

      const noteObj = await db.query.counselorNotes.findFirst({
        where: eq(counselorNotes.sessionId, sessionId)
      });

      let parsedNote = { symptoms: "", assessment: "", recommendation: "" };
      if (noteObj?.note) {
        try {
          parsedNote = JSON.parse(noteObj.note);
        } catch (_) {}
      }

      let age = "-";
      if (patient?.dob) {
        const birthDate = new Date(patient.dob);
        if (!isNaN(birthDate.getTime())) {
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          age = calculatedAge > 0 ? `${calculatedAge} Tahun` : "-";
        }
      }

      patientDetail = {
        name: patient?.name || "Konseli Anonim",
        dob: patient?.dob || "-",
        gender: patient?.gender || "-",
        age,
        phone: patient?.phone || "-",
        screenings: screenings.map((s) => ({
          id: s.id,
          score: s.score,
          conditionLabel: s.conditionLabel,
          completedAt: s.completedAt ? new Date(s.completedAt).toLocaleDateString("id-ID") : "-"
        }))
      };

      savedNotes = parsedNote;
    }

    return NextResponse.json({
      status: currentSession.status,
      queuePosition,
      counselorName,
      counselorStatus,
      session: currentSession,
      patientDetail,
      savedNotes
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
