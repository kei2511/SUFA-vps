import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { questionnaires, questions, options, resultMappings } from "./schema";
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

// MMYS V.1 Data Declarations
const MMYS_ANX_QUESTIONS = [
  "Dalam 2 minggu terakhir, Saya sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi",
  "Dalam 2 minggu terakhir, Saya berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi",
  "Dalam 2 minggu terakhir, Saya sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negatif yang belum tentu terjadi"
];

const MMYS_DEP_QUESTIONS = [
  "Dalam 2 minggu terakhir, Saya sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas",
  "Dalam 2 minggu terakhir, Saya tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya saya suka",
  "Dalam 2 minggu terakhir, Saya merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan"
];

const MMYS_OPTIONS = [
  { text: "Ya", score: 1 },
  { text: "Tidak", score: 0 }
];

const MMYS_ANX_MAPPINGS = [
  { minScore: 0, maxScore: 1, label: "Risiko Rendah", description: "Tidak menunjukkan kemungkinan gejala ansietas." },
  { minScore: 2, maxScore: 2, label: "Risiko Sedang", description: "Menunjukkan kemungkinan gejala anxietas ringan. Disarankan untuk memantau kondisi dan melakukan konseling awal." },
  { minScore: 3, maxScore: 3, label: "Risiko Tinggi", description: "Menunjukkan kemungkinan gejala anxietas berat. Sangat disarankan untuk berkonsultasi dengan profesional." }
];

const MMYS_DEP_MAPPINGS = [
  { minScore: 0, maxScore: 1, label: "Risiko Rendah", description: "Tidak menunjukkan kemungkinan gejala depresi." },
  { minScore: 2, maxScore: 2, label: "Risiko Sedang", description: "Menunjukkan kemungkinan gejala depresi ringan. Disarankan untuk memantau kondisi." },
  { minScore: 3, maxScore: 3, label: "Risiko Tinggi", description: "Menunjukkan kemungkinan gejala depresi berat. Segera hubungi psikolog atau konselor." }
];

async function seed() {
  console.log("=== MEMULAI SEED KUESIONER ===\n");

  try {
    const { db } = await import("./index");

    // 1. Seed PHQ-9
    const phq9Id = "phq-9";
    const existingPhq9 = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.id, phq9Id)
    });

    if (!existingPhq9) {
      console.log("1. Membuat kuesioner PHQ-9...");
      await db.insert(questionnaires).values({
        id: phq9Id,
        title: "PHQ-9 (Patient Health Questionnaire-9)",
        description: "Kuesioner skrining depresi. Selama 2 minggu terakhir, seberapa sering Anda mengalami kondisi berikut?",
        status: "Aktif",
      });

      for (let i = 0; i < PHQ9_QUESTIONS.length; i++) {
        const questionId = `phq9-q${i + 1}`;
        await db.insert(questions).values({
          id: questionId,
          questionnaireId: phq9Id,
          text: PHQ9_QUESTIONS[i],
          type: "single",
          order: i + 1,
        });

        for (const opt of OPTIONS) {
          await db.insert(options).values({
            id: `${questionId}-opt${opt.score}`,
            questionId: questionId,
            text: opt.text,
            score: opt.score,
          });
        }
      }

      for (const mapping of PHQ9_RESULT_MAPPINGS) {
        await db.insert(resultMappings).values({
          id: `phq9-map-${mapping.minScore}-${mapping.maxScore}`,
          questionnaireId: phq9Id,
          minScore: mapping.minScore,
          maxScore: mapping.maxScore,
          label: mapping.label,
          description: mapping.description,
        });
      }
      console.log(`   -> PHQ-9: ${PHQ9_QUESTIONS.length} pertanyaan berhasil dibuat\n`);
    } else {
      console.log("1. Kuesioner PHQ-9 sudah ada di database, melewati...");
    }

    // 2. Seed GAD-7
    const gad7Id = "gad-7";
    const existingGad7 = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.id, gad7Id)
    });

    if (!existingGad7) {
      console.log("2. Membuat kuesioner GAD-7...");
      await db.insert(questionnaires).values({
        id: gad7Id,
        title: "GAD-7 (Generalized Anxiety Disorder-7)",
        description: "Kuesioner skrining kecemasan. Selama 2 minggu terakhir, seberapa sering Anda mengalami kondisi berikut?",
        status: "Aktif",
      });

      for (let i = 0; i < GAD7_QUESTIONS.length; i++) {
        const questionId = `gad7-q${i + 1}`;
        await db.insert(questions).values({
          id: questionId,
          questionnaireId: gad7Id,
          text: GAD7_QUESTIONS[i],
          type: "single",
          order: i + 1,
        });

        for (const opt of OPTIONS) {
          await db.insert(options).values({
            id: `${questionId}-opt${opt.score}`,
            questionId: questionId,
            text: opt.text,
            score: opt.score,
          });
        }
      }

      for (const mapping of GAD7_RESULT_MAPPINGS) {
        await db.insert(resultMappings).values({
          id: `gad7-map-${mapping.minScore}-${mapping.maxScore}`,
          questionnaireId: gad7Id,
          minScore: mapping.minScore,
          maxScore: mapping.maxScore,
          label: mapping.label,
          description: mapping.description,
        });
      }
      console.log(`   -> GAD-7: ${GAD7_QUESTIONS.length} pertanyaan berhasil dibuat\n`);
    } else {
      console.log("2. Kuesioner GAD-7 sudah ada di database, melewati...");
    }

    // 3. Seed MMYS Anxietas (mmys-anx)
    const mmysAnxId = "mmys-anx";
    const existingMmysAnx = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.id, mmysAnxId)
    });

    if (!existingMmysAnx) {
      console.log("3. Membuat kuesioner MMYS V.1 - Skala Anxietas (Kecemasan)...");
      await db.insert(questionnaires).values({
        id: mmysAnxId,
        title: "MMYS V.1 - Skala Anxietas (Kecemasan)",
        description: "Mini MindHEAR Youth Scale V.1 (Remaja Usia 10-18 Tahun). Pilih jawaban yang paling sesuai dengan apa yang kamu rasakan atau alami dalam 2 minggu terakhir.",
        status: "Aktif",
      });

      for (let i = 0; i < MMYS_ANX_QUESTIONS.length; i++) {
        const questionId = `mmys-anx-q${i + 1}`;
        await db.insert(questions).values({
          id: questionId,
          questionnaireId: mmysAnxId,
          text: MMYS_ANX_QUESTIONS[i],
          type: "single",
          order: i + 1,
        });

        for (const opt of MMYS_OPTIONS) {
          await db.insert(options).values({
            id: `${questionId}-opt${opt.score}`,
            questionId: questionId,
            text: opt.text,
            score: opt.score,
          });
        }
      }

      for (const mapping of MMYS_ANX_MAPPINGS) {
        await db.insert(resultMappings).values({
          id: `mmys-anx-map-${mapping.minScore}-${mapping.maxScore}`,
          questionnaireId: mmysAnxId,
          minScore: mapping.minScore,
          maxScore: mapping.maxScore,
          label: mapping.label,
          description: mapping.description,
        });
      }
      console.log(`   -> MMYS Anxietas: ${MMYS_ANX_QUESTIONS.length} pertanyaan berhasil dibuat\n`);
    } else {
      console.log("3. Kuesioner MMYS Anxietas sudah ada di database, melewati...");
    }

    // 4. Seed MMYS Depresi (mmys-dep)
    const mmysDepId = "mmys-dep";
    const existingMmysDep = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.id, mmysDepId)
    });

    if (!existingMmysDep) {
      console.log("4. Membuat kuesioner MMYS V.1 - Skala Depresi...");
      await db.insert(questionnaires).values({
        id: mmysDepId,
        title: "MMYS V.1 - Skala Depresi",
        description: "Mini MindHEAR Youth Scale V.1 (Remaja Usia 10-18 Tahun). Pilih jawaban yang paling sesuai dengan apa yang kamu rasakan atau alami dalam 2 minggu terakhir.",
        status: "Aktif",
      });

      for (let i = 0; i < MMYS_DEP_QUESTIONS.length; i++) {
        const questionId = `mmys-dep-q${i + 1}`;
        await db.insert(questions).values({
          id: questionId,
          questionnaireId: mmysDepId,
          text: MMYS_DEP_QUESTIONS[i],
          type: "single",
          order: i + 1,
        });

        for (const opt of MMYS_OPTIONS) {
          await db.insert(options).values({
            id: `${questionId}-opt${opt.score}`,
            questionId: questionId,
            text: opt.text,
            score: opt.score,
          });
        }
      }

      for (const mapping of MMYS_DEP_MAPPINGS) {
        await db.insert(resultMappings).values({
          id: `mmys-dep-map-${mapping.minScore}-${mapping.maxScore}`,
          questionnaireId: mmysDepId,
          minScore: mapping.minScore,
          maxScore: mapping.maxScore,
          label: mapping.label,
          description: mapping.description,
        });
      }
      console.log(`   -> MMYS Depresi: ${MMYS_DEP_QUESTIONS.length} pertanyaan berhasil dibuat\n`);
    } else {
      console.log("4. Kuesioner MMYS Depresi sudah ada di database, melewati...");
    }

    console.log("=== SEED KUESIONER SELESAI DENGAN SUKSES! ===");

  } catch (error: any) {
    console.error("\nSEED GAGAL DENGAN ERROR:");
    console.error(error);
    process.exit(1);
  }
}

seed();
