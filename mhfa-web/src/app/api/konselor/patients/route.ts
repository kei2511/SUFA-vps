import { db } from "@/db";
import { user, screeningSessions, chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || (session.user.role !== "Konselor" && session.user.role !== "Admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isCounselor = session.user.role === "Konselor";
    const counselorId = session.user.id;

    // Fetch patients for this counselor (or all for Admin)
    const baseWhere = or(eq(user.role, "Pasien"), eq(user.role, "Konseli"));
    const whereClause = isCounselor 
      ? and(baseWhere, eq(user.assignedCounselorId, counselorId))
      : baseWhere;

    const patients = await db.query.user.findMany({
      where: whereClause,
      orderBy: [desc(user.createdAt)]
    });

    const patientList = await Promise.all(
      patients.map(async (p) => {
        // Find latest completed screening
        const latestScreening = await db.query.screeningSessions.findFirst({
          where: and(
            eq(screeningSessions.userId, p.id),
            eq(screeningSessions.status, "completed")
          ),
          orderBy: [desc(screeningSessions.completedAt)]
        });

        // Find active/waiting chat session
        const activeChat = await db.query.chatSessions.findFirst({
          where: and(
            eq(chatSessions.patientId, p.id),
            or(eq(chatSessions.status, "active"), eq(chatSessions.status, "waiting"))
          )
        });

        const screeningDate = latestScreening?.completedAt 
          ? new Date(latestScreening.completedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          : "Belum Skrining";

        let age = "-";
        if (p.dob) {
          const birthDate = new Date(p.dob);
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

        return {
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone || "-",
          createdAt: p.createdAt,
          lastScreeningDate: screeningDate,
          score: latestScreening?.score || 0,
          condition: latestScreening?.conditionLabel || "Normal",
          status: activeChat 
            ? (activeChat.status === "active" ? "Aktif" : "Menunggu")
            : "Selesai",
          dob: p.dob || "-",
          gender: p.gender || "-",
          age
        };
      })
    );

    return NextResponse.json({ patients: patientList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
