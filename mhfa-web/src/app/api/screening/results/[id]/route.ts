import { db } from "@/db";
import { screeningSessions, screeningAnswers, resultMappings, guides, contacts } from "@/db/schema";
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
      )
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
        where: eq(screeningAnswers.sessionId, sessionId)
      });

      const optionIds: string[] = [];
      userAnswers.forEach(ans => {
        if (Array.isArray(ans.selectedOptionIds)) {
          optionIds.push(...(ans.selectedOptionIds as string[]));
        }
      });

      let selectedOptions: any[] = [];
      if (optionIds.length > 0) {
        selectedOptions = await db.query.options.findMany({
          where: (options, { inArray }) => inArray(options.id, optionIds)
        });
      }

      const q1Opt = selectedOptions.find(o => o.questionId.endsWith("-q1"));
      const q3Opt = selectedOptions.find(o => o.questionId.endsWith("-q3"));
      const q4Opt = selectedOptions.find(o => o.questionId.endsWith("-q4"));
      const q6Opt = selectedOptions.find(o => o.questionId.endsWith("-q6"));

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
      } else {
        const anxText = isAnxBerat ? "ansietas berat" : isAnxRingan ? "ansietas ringan" : "tidak ada gejala ansietas";
        const depText = isDepBerat ? "depresi berat" : isDepRingan ? "depresi ringan" : "tidak ada gejala depresi";
        summarySentence = `Kesehatan mental sepertinya kurang baik, kamu mengalami ${anxText} dan ${depText}.`;
      }

      defaultDescription = summarySentence;
    } else {
      const mapping = await db.query.resultMappings.findFirst({
        where: and(
          eq(resultMappings.questionnaireId, sess.questionnaireId),
          lte(resultMappings.minScore, sess.score),
          gte(resultMappings.maxScore, sess.score)
        )
      });
      defaultDescription = mapping?.description || "Kondisi emosional Anda relatif stabil.";
    }

    // 3. Fetch Guides matching condition label
    const allGuides = await db.query.guides.findMany();
    const matchingGuides = allGuides.filter(g => 
      Array.isArray(g.conditionTags) && g.conditionTags.includes(sess.conditionLabel)
    );

    // 4. Fetch Contacts
    const allContacts = await db.query.contacts.findMany();

    return NextResponse.json({
      session: sess,
      description: defaultDescription,
      anxietasLabel,
      depresiLabel,
      summarySentence,
      guides: matchingGuides,
      contacts: allContacts
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
