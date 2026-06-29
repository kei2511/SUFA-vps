import { db } from "@/db";
import { screeningSessions, chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total Screenings
    const screenings = await db.query.screeningSessions.findMany();
    const totalScreenings = screenings.length;

    // 2. Completed Consultations
    const consultations = await db.query.chatSessions.findMany({
      where: eq(chatSessions.status, "completed")
    });
    const totalConsultations = consultations.length;

    // 3. High Risk Cases
    const highRisk = screenings.filter(s => s.conditionLabel === "Risiko Tinggi").length;

    return NextResponse.json({
      totalScreenings,
      totalConsultations,
      highRiskCases: highRisk
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
