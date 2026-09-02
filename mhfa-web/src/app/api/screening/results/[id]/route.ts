import { db } from "@/db";
import { screeningSessions, screeningAnswers, resultMappings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, lte, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await auth.api.getSession({
      headers: await headers()
    });

    if (!sessionUser || !sessionUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;

    // 1. Fetch Session
    const sess = await db.query.screeningSessions.findFirst({
      where: and(
        eq(screeningSessions.id, sessionId),
        eq(screeningSessions.userId, sessionUser.user.id)
      ),
      columns: {
        id: true,
        questionnaireId: true,
        score: true,
        conditionLabel: true,
        completedAt: true,
      },
    });

    if (!sess) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Compute details if mmys-combined
    let anxietasLabel = "";
    let depresiLabel = "";
    let summarySentence = "";
    let defaultDescription = "Kondisi emosional Anda relatif stabil.";

    if (sess.questionnaireId === "mmys-combined") {
      const userAnswers = await db.query.screeningAnswers.findMany({
        where: eq(screeningAnswers.sessionId, sessionId),
        columns: {
          selectedOptionIds: true,
        },
      });

      const optionIds: string[] = [];
      userAnswers.forEach(ans => {
        if (Array.isArray(ans.selectedOptionIds)) {
          optionIds.push(...(ans.selectedOptionIds as string[]));
        }
      });

      const selectedOptions = optionIds.length > 0
        ? await db.query.options.findMany({
          where: (options, { inArray }) => inArray(options.id, optionIds),
          columns: {
            id: true,
            questionId: true,
            score: true,
          },
        })
        : [];

      const findOpt = (qNum: number) =>
        selectedOptions.find(o =>
          o.questionId === `mmys-combined-q${qNum}` ||
          o.questionId?.endsWith(`-q${qNum}`) ||
          o.id?.includes(`-q${qNum}-`)
        );

      const q1Opt = findOpt(1);
      const q3Opt = findOpt(3);
      const q4Opt = findOpt(4);
      const q6Opt = findOpt(6);

      const q1Score = q1Opt?.score ?? 0;
      const q3Score = q3Opt?.score ?? 0;
      const q4Score = q4Opt?.score ?? 0;
      const q6Score = q6Opt?.score ?? 0;

      const isAnxBerat = q1Score === 1 && q3Score === 1;
      const isAnxRingan = !isAnxBerat && (q1Score === 1 || q3Score === 1);

      const isDepBerat = q4Score === 1 && q6Score === 1;
      const isDepRingan = !isDepBerat && (q4Score === 1 || q6Score === 1);

      anxietasLabel = isAnxBerat
        ? "Menunjukkan kemungkinan gejala anxietas berat"
        : isAnxRingan
        ? "Menunjukkan kemungkinan gejala anxietas ringan"
        : "Tidak menunjukkan kemungkinan gejala ansietas";

      depresiLabel = isDepBerat
        ? "Menunjukkan kemungkinan gejala depresi berat"
        : isDepRingan
        ? "Menunjukkan kemungkinan gejala depresi ringan"
        : "Tidak menunjukkan kemungkinan gejala depresi";

      if (!isAnxBerat && !isAnxRingan && !isDepBerat && !isDepRingan) {
        summarySentence = "Kesehatan mental kamu dalam kondisi baik. Tidak menunjukkan kemungkinan gejala ansietas maupun depresi.";
        sess.conditionLabel = "Risiko Rendah";
      } else {
        const anxText = isAnxBerat ? "ansietas berat" : isAnxRingan ? "ansietas ringan" : "tidak ada gejala ansietas";
        const depText = isDepBerat ? "depresi berat" : isDepRingan ? "depresi ringan" : "tidak ada gejala depresi";
        summarySentence = `Kesehatan mental sepertinya kurang baik, kamu mengalami ${anxText} dan ${depText}.`;
        sess.conditionLabel = (isAnxBerat || isDepBerat) ? "Risiko Tinggi" : "Risiko Sedang";
      }

      defaultDescription = summarySentence;
    } else {
      const mapping = await db.query.resultMappings.findFirst({
        where: and(
          eq(resultMappings.questionnaireId, sess.questionnaireId),
          lte(resultMappings.minScore, sess.score),
          gte(resultMappings.maxScore, sess.score)
        ),
        columns: {
          description: true,
        },
      });
      defaultDescription = mapping?.description || "Kondisi emosional Anda relatif stabil.";
    }

    return NextResponse.json({
      session: sess,
      description: defaultDescription,
      anxietasLabel,
      depresiLabel,
      summarySentence,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load screening result";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
