import { db } from "@/db";
import { questionnaires } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return all active questionnaires for patient to choose
    const activeQuestionnaires = await db.query.questionnaires.findMany({
      where: eq(questionnaires.status, "Aktif"),
      columns: {
        id: true,
        title: true,
        description: true,
        status: true,
      },
    });

    return NextResponse.json(
      { questionnaires: activeQuestionnaires },
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load questionnaires";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
