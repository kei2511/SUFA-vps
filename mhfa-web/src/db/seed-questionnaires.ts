import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { questionnaires, questions, options, resultMappings } from "./schema";

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

async function seed() {
  console.log("=== MEMULAI SEED PHQ-9 DAN GAD-7 ===\n");

  try {
    const { db } = await import("./index");

    // 1. Create PHQ-9 Questionnaire
    const phq9Id = "phq-9";
    console.log("1. Membuat kuesioner PHQ-9...");

    await db.insert(questionnaires).values({
      id: phq9Id,
      title: "PHQ-9 (Patient Health Questionnaire-9)",
      description: "Kuesioner skrining depresi. Selama 2 minggu terakhir, seberapa sering Anda mengalami kondisi berikut?",
      status: "Aktif",
    });

    // Insert PHQ-9 questions
    for (let i = 0; i < PHQ9_QUESTIONS.length; i++) {
      const questionId = `phq9-q${i + 1}`;
      await db.insert(questions).values({
        id: questionId,
        questionnaireId: phq9Id,
        text: PHQ9_QUESTIONS[i],
        type: "single",
        order: i + 1,
      });

      // Insert options for each question
      for (const opt of OPTIONS) {
        await db.insert(options).values({
          id: `${questionId}-opt${opt.score}`,
          questionId: questionId,
          text: opt.text,
          score: opt.score,
        });
      }
    }
    console.log(`   -> PHQ-9: ${PHQ9_QUESTIONS.length} pertanyaan berhasil dibuat\n`);

    // Insert PHQ-9 result mappings
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
    console.log(`   -> PHQ-9: ${PHQ9_RESULT_MAPPINGS.length} interpretasi hasil berhasil dibuat\n`);

    // 2. Create GAD-7 Questionnaire
    const gad7Id = "gad-7";
    console.log("2. Membuat kuesioner GAD-7...");

    await db.insert(questionnaires).values({
      id: gad7Id,
      title: "GAD-7 (Generalized Anxiety Disorder-7)",
      description: "Kuesioner skrining kecemasan. Selama 2 minggu terakhir, seberapa sering Anda mengalami kondisi berikut?",
      status: "Aktif",
    });

    // Insert GAD-7 questions
    for (let i = 0; i < GAD7_QUESTIONS.length; i++) {
      const questionId = `gad7-q${i + 1}`;
      await db.insert(questions).values({
        id: questionId,
        questionnaireId: gad7Id,
        text: GAD7_QUESTIONS[i],
        type: "single",
        order: i + 1,
      });

      // Insert options for each question
      for (const opt of OPTIONS) {
        await db.insert(options).values({
          id: `${questionId}-opt${opt.score}`,
          questionId: questionId,
          text: opt.text,
          score: opt.score,
        });
      }
    }
    console.log(`   -> GAD-7: ${GAD7_QUESTIONS.length} pertanyaan berhasil dibuat\n`);

    // Insert GAD-7 result mappings
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
    console.log(`   -> GAD-7: ${GAD7_RESULT_MAPPINGS.length} interpretasi hasil berhasil dibuat\n`);

    console.log("=== SEED PHQ-9 DAN GAD-7 SELESAI DENGAN SUKSES! ===");
    console.log("\nRingkasan:");
    console.log("- 2 kuesioner (PHQ-9, GAD-7)");
    console.log(`- ${PHQ9_QUESTIONS.length + GAD7_QUESTIONS.length} pertanyaan`);
    console.log(`- ${(PHQ9_QUESTIONS.length + GAD7_QUESTIONS.length) * 4} opsi jawaban`);
    console.log(`- ${PHQ9_RESULT_MAPPINGS.length + GAD7_RESULT_MAPPINGS.length} interpretasi hasil`);

  } catch (error: any) {
    // If error is duplicate key, it means data already exists
    if (error.code === "23505") {
      console.log("\nData PHQ-9 dan GAD-7 sudah ada di database.");
      console.log("Hapus data lama terlebih dahulu jika ingin re-seed.");
    } else {
      console.error("\nSEED GAGAL DENGAN ERROR:");
      console.error(error);
      process.exit(1);
    }
  }
}

seed();
