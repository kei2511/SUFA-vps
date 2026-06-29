import { db } from "@/db";
import { questionnaires, questions, options, resultMappings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Fetch single questionnaire detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const qnr = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.id, id),
      with: {
        questions: {
          with: {
            options: true
          }
        }
      }
    });

    if (!qnr) {
      return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 });
    }

    const mappings = await db.query.resultMappings.findMany({
      where: eq(resultMappings.questionnaireId, id)
    });

    // Format scoreRanges for frontend
    const scoreRanges = mappings.map((m) => ({
      id: m.id,
      label: m.label,
      min: m.minScore,
      max: m.maxScore,
      color: m.description || "info" // we store color in description field
    }));

    return NextResponse.json({
      questionnaire: {
        id: qnr.id,
        title: qnr.title,
        description: qnr.description || "",
        status: qnr.status,
        questions: qnr.questions.map((q) => ({
          id: q.id,
          order: q.order,
          text: q.text,
          type: q.type,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            score: opt.score
          }))
        })).sort((a, b) => a.order - b.order),
        scoreRanges
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update single questionnaire detail (in a clean transaction)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, status, questions: inputQuestions, scoreRanges } = body;

    await db.transaction(async (tx) => {
      // 1. Update basic info
      await tx.update(questionnaires)
        .set({
          title,
          description: description || "",
          status: status || "Aktif"
        })
        .where(eq(questionnaires.id, id));

      // 2. Delete existing questions & resultMappings
      // Cascade deletes will clean up options
      await tx.delete(questions).where(eq(questions.questionnaireId, id));
      await tx.delete(resultMappings).where(eq(resultMappings.questionnaireId, id));

      // 3. Re-insert questions & options
      if (inputQuestions && Array.isArray(inputQuestions)) {
        for (let i = 0; i < inputQuestions.length; i++) {
          const q = inputQuestions[i];
          const questionId = q.id && !q.id.startsWith("q-") ? q.id : `q-${randomUUID().substring(0, 8)}`;

          await tx.insert(questions).values({
            id: questionId,
            questionnaireId: id,
            text: q.text || "",
            type: q.type || "single",
            order: q.order || (i + 1)
          });

          if (q.options && Array.isArray(q.options)) {
            const optionsToInsert = q.options.map((opt: any) => ({
              id: opt.id && !opt.id.includes("-") ? opt.id : `opt-${randomUUID().substring(0, 8)}`,
              questionId,
              text: opt.text || "",
              score: typeof opt.score === "number" ? opt.score : 0
            }));

            if (optionsToInsert.length > 0) {
              await tx.insert(options).values(optionsToInsert);
            }
          }
        }
      }

      // 4. Re-insert result mappings
      if (scoreRanges && Array.isArray(scoreRanges)) {
        const mappingsToInsert = scoreRanges.map((sr: any) => ({
          id: sr.id && !sr.id.startsWith("sr-") ? sr.id : `rm-${randomUUID().substring(0, 8)}`,
          questionnaireId: id,
          minScore: typeof sr.min === "number" ? sr.min : 0,
          maxScore: typeof sr.max === "number" ? sr.max : 0,
          label: sr.label || "Risiko Rendah",
          description: sr.color || "success"
        }));

        if (mappingsToInsert.length > 0) {
          await tx.insert(resultMappings).values(mappingsToInsert);
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete questionnaire
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deleted = await db.delete(questionnaires)
      .where(eq(questionnaires.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
