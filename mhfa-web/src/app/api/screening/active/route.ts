import { db } from "@/db";
import { questionnaires } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return all active questionnaires for patient to choose
    const activeQuestionnaires = await db.query.questionnaires.findMany({
      where: eq(questionnaires.status, "Aktif")
    });

    return NextResponse.json({ questionnaires: activeQuestionnaires });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
