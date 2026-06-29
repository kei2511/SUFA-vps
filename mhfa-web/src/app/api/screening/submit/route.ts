import { db } from "@/db";
import { screeningSessions, screeningAnswers, resultMappings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, lte, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionnaireId, answers } = await request.json(); // answers is { [questionId: string]: string } where values are optionIds

    if (!questionnaireId || !answers) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1. Calculate Score
    let totalScore = 0;
    const answerEntries = Object.entries(answers);

    // Fetch all selected options to calculate total score
    const optionIds = answerEntries.map(([_, optId]) => optId as string);
    if (optionIds.length > 0) {
      const selectedOptions = await db.query.options.findMany({
        where: (options, { inArray }) => inArray(options.id, optionIds)
      });
      totalScore = selectedOptions.reduce((acc, opt) => acc + opt.score, 0);
    }

    // 2. Find condition label based on resultMappings
    const mapping = await db.query.resultMappings.findFirst({
      where: and(
        eq(resultMappings.questionnaireId, questionnaireId),
        lte(resultMappings.minScore, totalScore),
        gte(resultMappings.maxScore, totalScore)
      )
    });

    const conditionLabel = mapping?.label || "Risiko Rendah";

    // 3. Insert screening session
    const sessionId = randomUUID();
    await db.insert(screeningSessions).values({
      id: sessionId,
      userId: session.user.id,
      questionnaireId,
      score: totalScore,
      conditionLabel,
      status: "completed",
      completedAt: new Date()
    });

    // 4. Insert screening answers
    const answersToInsert = answerEntries.map(([qId, optId]) => ({
      id: randomUUID(),
      sessionId,
      questionId: qId,
      selectedOptionIds: [optId as string]
    }));

    if (answersToInsert.length > 0) {
      await db.insert(screeningAnswers).values(answersToInsert);
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
