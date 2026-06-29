import { db } from "@/db";
import { questionnaires, questions, options, resultMappings, screeningSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Helper to infer category
function inferCategory(id: string, title: string): string {
  const normalized = (id + " " + title).toLowerCase();
  if (normalized.includes("depresi") || normalized.includes("phq")) return "Depresi";
  if (normalized.includes("cemas") || normalized.includes("gad") || normalized.includes("anxiety")) return "Kecemasan";
  if (normalized.includes("stres") || normalized.includes("stress") || normalized.includes("dass")) return "Stres";
  return "Umum";
}

// Get all questionnaires
export async function GET() {
  try {
    const list = await db.query.questionnaires.findMany({
      with: {
        questions: true
      }
    });

    // Fetch usage counts for each questionnaire
    const usages = await db
      .select({
        questionnaireId: screeningSessions.questionnaireId,
        count: sql<number>`count(${screeningSessions.id})::int`
      })
      .from(screeningSessions)
      .groupBy(screeningSessions.questionnaireId);

    const usageMap = new Map(usages.map(u => [u.questionnaireId, u.count]));

    const formatted = list.map((q) => {
      const qCount = q.questions?.length || 0;
      const usageCount = usageMap.get(q.id) || 0;
      return {
        id: q.id,
        title: q.title,
        code: q.id.toUpperCase(),
        description: q.description || "",
        questionCount: qCount,
        lastUpdated: "Terbaru",
        isActive: q.status === "Aktif",
        usageCount: usageCount,
        category: inferCategory(q.id, q.title)
      };
    });

    return NextResponse.json({ questionnaires: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create new questionnaire (with questions, options, resultMappings)
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, status, questions: inputQuestions, scoreRanges } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const qId = id || `qnr-${Math.random().toString(36).substring(2, 11)}`;

    await db.transaction(async (tx) => {
      // 1. Insert questionnaire
      await tx.insert(questionnaires).values({
        id: qId,
        title,
        description: description || "",
        status: status || "Aktif"
      });

      // 2. Insert questions & options
      if (inputQuestions && Array.isArray(inputQuestions)) {
        for (let i = 0; i < inputQuestions.length; i++) {
          const q = inputQuestions[i];
          const questionId = q.id && !q.id.startsWith("q-") ? q.id : `q-${randomUUID().substring(0, 8)}`;

          await tx.insert(questions).values({
            id: questionId,
            questionnaireId: qId,
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

      // 3. Insert result mappings (score ranges)
      if (scoreRanges && Array.isArray(scoreRanges)) {
        const mappingsToInsert = scoreRanges.map((sr: any) => ({
          id: sr.id && !sr.id.startsWith("sr-") ? sr.id : `rm-${randomUUID().substring(0, 8)}`,
          questionnaireId: qId,
          minScore: typeof sr.min === "number" ? sr.min : 0,
          maxScore: typeof sr.max === "number" ? sr.max : 0,
          label: sr.label || "Risiko Rendah",
          description: sr.color || "success" // We can store the color string in the description field
        }));

        if (mappingsToInsert.length > 0) {
          await tx.insert(resultMappings).values(mappingsToInsert);
        }
      }
    });

    return NextResponse.json({ success: true, id: qId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
