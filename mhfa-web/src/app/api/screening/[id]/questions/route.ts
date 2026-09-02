import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionnaireId } = await params;
    
    // Query questions and their options ordered by question order
    const list = await db.query.questions.findMany({
      where: eq(questions.questionnaireId, questionnaireId),
      orderBy: [asc(questions.order)],
      columns: {
        id: true,
        questionnaireId: true,
        text: true,
        type: true,
        order: true,
      },
      with: {
        options: {
          columns: {
            id: true,
            questionId: true,
            text: true,
          },
        },
      },
    });

    return NextResponse.json(
      { questions: list },
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load questions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
