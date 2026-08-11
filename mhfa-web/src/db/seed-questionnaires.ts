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

// MMYS V.1 Combined Data Declarations
const MMYS_COMBINED_QUESTIONS = [
  // Skala A (Anxietas)
  "Dalam 2 minggu terakhir, Saya sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi",
  "Dalam 2 minggu terakhir, Saya berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi",
  "Dalam 2 minggu terakhir, Saya sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negatif yang belum tentu terjadi",
  // Skala B (Depresi)
  "Dalam 2 minggu terakhir, Saya sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas",
  "Dalam 2 minggu terakhir, Saya tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya saya suka",
  "Dalam 2 minggu terakhir, Saya merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan"
];

const MMYS_OPTIONS = [
  { text: "Ya", score: 1 },
  { text: "Tidak", score: 0 }
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

    // 3. Deactivate old split MMYS questionnaires if present
    console.log("3. Menindaklanjuti kuesioner MMYS terpisah (mmys-anx & mmys-dep)...");
    await db.update(questionnaires)
      .set({ status: "Nonaktif" })
      .where(eq(questionnaires.id, "mmys-anx"));
    await db.update(questionnaires)
      .set({ status: "Nonaktif" })
      .where(eq(questionnaires.id, "mmys-dep"));
    console.log("   -> mmys-anx dan mmys-dep berhasil dinonaktifkan.\n");

    // 4. Seed MMYS Combined (Deteksi Kesehatan Mental Remaja)
    const mmysCombinedId = "mmys-combined";
    const existingMmysCombined = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.id, mmysCombinedId)
    });

    if (!existingMmysCombined) {
      console.log("4. Membuat kuesioner Deteksi Kesehatan Mental Remaja (mmys-combined)...");
      await db.insert(questionnaires).values({
        id: mmysCombinedId,
        title: "Deteksi Kesehatan Mental Remaja",
        description: "Mini MindHEAR Youth Scale V.1 (MMYS V.1) untuk remaja usia 10-18 tahun. Pilih jawaban yang paling sesuai dengan apa yang kamu rasakan atau alami dalam 2 minggu terakhir.",
        status: "Aktif",
      });

      for (let i = 0; i < MMYS_COMBINED_QUESTIONS.length; i++) {
        const questionId = `mmys-combined-q${i + 1}`;
        await db.insert(questions).values({
          id: questionId,
          questionnaireId: mmysCombinedId,
          text: MMYS_COMBINED_QUESTIONS[i],
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
      console.log(`   -> Deteksi Kesehatan Mental Remaja: ${MMYS_COMBINED_QUESTIONS.length} pertanyaan berhasil dibuat\n`);
    } else {
      console.log("4. Kuesioner Deteksi Kesehatan Mental Remaja sudah ada di database, memperbarui data...");
      await db.update(questionnaires)
        .set({
          title: "Deteksi Kesehatan Mental Remaja",
          description: "Mini MindHEAR Youth Scale V.1 (MMYS V.1) untuk remaja usia 10-18 tahun. Pilih jawaban yang paling sesuai dengan apa yang kamu rasakan atau alami dalam 2 minggu terakhir.",
          status: "Aktif",
        })
        .where(eq(questionnaires.id, mmysCombinedId));
    }

    console.log("=== SEED KUESIONER SELESAI DENGAN SUKSES! ===");

  } catch (error: any) {
    console.error("\nSEED GAGAL DENGAN ERROR:");
    console.error(error);
    process.exit(1);
  }
}

seed();

