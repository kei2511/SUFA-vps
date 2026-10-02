import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { INIT_SQL } from "@/db/init-sql";
import { questionnaires, questions, options, resultMappings } from "@/db/schema";
import { eq } from "drizzle-orm";

const PHQ9_QUESTIONS = [
  "Kurang berminat atau tidak menikmati aktivitas yang biasanya menyenangkan.",
  "Merasa sedih, murung, atau putus asa.",
  "Sulit tidur, sering terbangun, atau tidur terlalu banyak.",
  "Merasa lelah atau tidak bertenaga.",
  "Nafsu makan berkurang atau berlebihan.",
  "Merasa diri tidak berharga atau merasa gagal.",
  "Sulit berkonsentrasi saat bekerja, belajar, atau membaca.",
  "Bergerak atau berbicara lebih lambat dari biasanya, atau sebaliknya merasa sangat gelisah sehingga sulit diam.",
  "Memiliki pikiran bahwa Anda lebih baik meninggal atau ingin menyakiti diri sendiri.",
];

const GAD7_QUESTIONS = [
  "Merasa gugup, cemas, atau tegang.",
  "Tidak mampu menghentikan atau mengendalikan rasa khawatir.",
  "Terlalu banyak mengkhawatirkan berbagai hal.",
  "Sulit merasa rileks.",
  "Sangat gelisah sehingga sulit duduk diam.",
  "Mudah marah atau mudah tersinggung.",
  "Merasa takut seolah-olah sesuatu yang buruk akan terjadi.",
];

const OPTIONS = [
  { text: "Tidak Pernah", score: 0 },
  { text: "Beberapa Hari", score: 1 },
  { text: ">7 Hari", score: 2 },
  { text: "Hampir Setiap Hari", score: 3 },
];

const PHQ9_RESULT_MAPPINGS = [
  { minScore: 0, maxScore: 4, label: "Minimal", description: "Tidak ada gejala depresi yang signifikan." },
  { minScore: 5, maxScore: 9, label: "Ringan", description: "Gejala depresi ringan. Disarankan untuk memantau kondisi dan mencari dukungan jika perlu." },
  { minScore: 10, maxScore: 14, label: "Sedang", description: "Gejala depresi sedang. Disarankan untuk berkonsultasi dengan profesional." },
  { minScore: 15, maxScore: 19, label: "Sedang Berat", description: "Gejala depresi sedang-berat. Sangat disarankan untuk segera berkonsultasi dengan psikolog atau psikiater." },
  { minScore: 20, maxScore: 27, label: "Berat", description: "Gejala depresi berat. Segera cari bantuan profesional." },
];

const GAD7_RESULT_MAPPINGS = [
  { minScore: 0, maxScore: 4, label: "Minimal", description: "Tidak ada gejala kecemasan yang signifikan." },
  { minScore: 5, maxScore: 9, label: "Ringan", description: "Gejala kecemasan ringan. Disarankan untuk memantau kondisi." },
  { minScore: 10, maxScore: 14, label: "Sedang", description: "Gejala kecemasan sedang. Disarankan untuk berkonsultasi dengan profesional." },
  { minScore: 15, maxScore: 21, label: "Berat", description: "Gejala kecemasan berat. Segera cari bantuan profesional." },
];

const MMYS_COMBINED_QUESTIONS = [
  "Dalam 2 minggu terakhir, Saya sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi",
  "Dalam 2 minggu terakhir, Saya berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi",
  "Dalam 2 minggu terakhir, Saya sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negatif yang belum tentu terjadi",
  "Dalam 2 minggu terakhir, Saya sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas",
  "Dalam 2 minggu terakhir, Saya tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya saya suka",
  "Dalam 2 minggu terakhir, Saya merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan",
];

const MMYS_OPTIONS = [
  { text: "Ya", score: 1 },
  { text: "Tidak", score: 0 },
];

export async function GET() {
  try {
    // 1. Run DDL migration to create all tables & basic seed
    await db.execute(sql.raw(INIT_SQL));

    // 2. Populate PHQ-9 questions if not exist
    for (let i = 0; i < PHQ9_QUESTIONS.length; i++) {
      const qid = `phq9-q${i + 1}`;
      const existing = await db.query.questions.findFirst({ where: eq(questions.id, qid) });
      if (!existing) {
        await db.insert(questions).values({
          id: qid,
          questionnaireId: "phq-9",
          text: PHQ9_QUESTIONS[i],
          type: "single",
          order: i + 1,
        });
        for (const opt of OPTIONS) {
          await db.insert(options).values({
            id: `${qid}-opt${opt.score}`,
            questionId: qid,
            text: opt.text,
            score: opt.score,
          });
        }
      }
    }

    for (const mapping of PHQ9_RESULT_MAPPINGS) {
      const mid = `phq9-map-${mapping.minScore}-${mapping.maxScore}`;
      const existing = await db.query.resultMappings.findFirst({ where: eq(resultMappings.id, mid) });
      if (!existing) {
        await db.insert(resultMappings).values({
          id: mid,
          questionnaireId: "phq-9",
          minScore: mapping.minScore,
          maxScore: mapping.maxScore,
          label: mapping.label,
          description: mapping.description,
        });
      }
    }

    // 3. Populate GAD-7 questions if not exist
    for (let i = 0; i < GAD7_QUESTIONS.length; i++) {
      const qid = `gad7-q${i + 1}`;
      const existing = await db.query.questions.findFirst({ where: eq(questions.id, qid) });
      if (!existing) {
        await db.insert(questions).values({
          id: qid,
          questionnaireId: "gad-7",
          text: GAD7_QUESTIONS[i],
          type: "single",
          order: i + 1,
        });
        for (const opt of OPTIONS) {
          await db.insert(options).values({
            id: `${qid}-opt${opt.score}`,
            questionId: qid,
            text: opt.text,
            score: opt.score,
          });
        }
      }
    }

    for (const mapping of GAD7_RESULT_MAPPINGS) {
      const mid = `gad7-map-${mapping.minScore}-${mapping.maxScore}`;
      const existing = await db.query.resultMappings.findFirst({ where: eq(resultMappings.id, mid) });
      if (!existing) {
        await db.insert(resultMappings).values({
          id: mid,
          questionnaireId: "gad-7",
          minScore: mapping.minScore,
          maxScore: mapping.maxScore,
          label: mapping.label,
          description: mapping.description,
        });
      }
    }

    // 4. Populate MMYS Combined questions if not exist
    for (let i = 0; i < MMYS_COMBINED_QUESTIONS.length; i++) {
      const qid = `mmys-combined-q${i + 1}`;
      const existing = await db.query.questions.findFirst({ where: eq(questions.id, qid) });
      if (!existing) {
        await db.insert(questions).values({
          id: qid,
          questionnaireId: "mmys-combined",
          text: MMYS_COMBINED_QUESTIONS[i],
          type: "single",
          order: i + 1,
        });
        for (const opt of MMYS_OPTIONS) {
          await db.insert(options).values({
            id: `${qid}-opt${opt.score}`,
            questionId: qid,
            text: opt.text,
            score: opt.score,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database tables and questionnaire seeds initialized successfully!",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
