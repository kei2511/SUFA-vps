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
      with: {
        options: true
      }
    });

    return NextResponse.json({ questions: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
