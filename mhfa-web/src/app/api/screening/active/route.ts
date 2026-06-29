import { db } from "@/db";
import { questionnaires } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const activeQ = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.status, "Aktif")
    });

    if (!activeQ) {
      return NextResponse.json({ error: "No active questionnaire found" }, { status: 404 });
    }

    return NextResponse.json({ questionnaire: activeQ });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
