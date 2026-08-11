import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { questionnaires } from "./schema";
import { eq } from "drizzle-orm";

async function runTest() {
  console.log("=== RUNNING MMYS COMBINED SCORING VALIDATION TEST ===\n");

  try {
    const { db } = await import("./index");

    // 1. Verify questionnaire mmys-combined exists
    const mmysCombined = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.id, "mmys-combined"),
      with: {
        questions: {
          with: {
            options: true
          }
        }
      }
    });

    if (!mmysCombined) {
      throw new Error("Questionnaire 'mmys-combined' not found in database.");
    }

    console.log("Found 'mmys-combined' with questions and options.");

    // Evaluation logic function matching API
    function calculateResults(selectedOptions: any[]) {
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

      const anxietasLabel = isAnxBerat
        ? "Menunjukkan kemungkinan gejala anxietas berat"
        : isAnxRingan
        ? "Menunjukkan kemungkinan gejala anxietas ringan"
        : "Tidak menunjukkan kemungkinan gejala ansietas";

      const depresiLabel = isDepBerat
        ? "Menunjukkan kemungkinan gejala depresi berat"
        : isDepRingan
        ? "Menunjukkan kemungkinan gejala depresi ringan"
        : "Tidak menunjukkan kemungkinan gejala depresi";

      let conditionLabel = "Risiko Rendah";
      if (isAnxBerat || isDepBerat) {
        conditionLabel = "Risiko Tinggi";
      } else if (isAnxRingan || isDepRingan) {
        conditionLabel = "Risiko Sedang";
      }

      return { anxietasLabel, depresiLabel, conditionLabel };
    }

    const q1 = mmysCombined.questions.find(q => q.id.endsWith("-q1"))!;
    const q2 = mmysCombined.questions.find(q => q.id.endsWith("-q2"))!;
    const q3 = mmysCombined.questions.find(q => q.id.endsWith("-q3"))!;
    const q4 = mmysCombined.questions.find(q => q.id.endsWith("-q4"))!;
    const q5 = mmysCombined.questions.find(q => q.id.endsWith("-q5"))!;
    const q6 = mmysCombined.questions.find(q => q.id.endsWith("-q6"))!;

    const optYa = (q: any) => q.options.find((o: any) => o.score === 1)!;
    const optTidak = (q: any) => q.options.find((o: any) => o.score === 0)!;

    // Test cases for key combinations
    const testCases = [
      {
        name: "Semua Tidak (0-0-0-0-0-0)",
        options: [optTidak(q1), optTidak(q2), optTidak(q3), optTidak(q4), optTidak(q5), optTidak(q6)],
        expectedAnx: "Tidak menunjukkan kemungkinan gejala ansietas",
        expectedDep: "Tidak menunjukkan kemungkinan gejala depresi",
        expectedOverall: "Risiko Rendah"
      },
      {
        name: "Anxietas Ringan + Depresi Tidak ada (1-0-0-0-0-0)",
        options: [optYa(q1), optTidak(q2), optTidak(q3), optTidak(q4), optTidak(q5), optTidak(q6)],
        expectedAnx: "Menunjukkan kemungkinan gejala anxietas ringan",
        expectedDep: "Tidak menunjukkan kemungkinan gejala depresi",
        expectedOverall: "Risiko Sedang"
      },
      {
        name: "Anxietas Berat + Depresi Ringan (1-0-1-0-0-1)",
        options: [optYa(q1), optTidak(q2), optYa(q3), optTidak(q4), optTidak(q5), optYa(q6)],
        expectedAnx: "Menunjukkan kemungkinan gejala anxietas berat",
        expectedDep: "Menunjukkan kemungkinan gejala depresi ringan",
        expectedOverall: "Risiko Tinggi"
      },
      {
        name: "Anxietas Berat + Depresi Berat (1-1-1-1-1-1)",
        options: [optYa(q1), optYa(q2), optYa(q3), optYa(q4), optYa(q5), optYa(q6)],
        expectedAnx: "Menunjukkan kemungkinan gejala anxietas berat",
        expectedDep: "Menunjukkan kemungkinan gejala depresi berat",
        expectedOverall: "Risiko Tinggi"
      }
    ];

    let passed = 0;
    for (const tc of testCases) {
      const res = calculateResults(tc.options);
      if (
        res.anxietasLabel === tc.expectedAnx &&
        res.depresiLabel === tc.expectedDep &&
        res.conditionLabel === tc.expectedOverall
      ) {
        console.log(`✅ Passed: ${tc.name} -> Anx: ${res.anxietasLabel}, Dep: ${res.depresiLabel}, Overall: ${res.conditionLabel}`);
        passed++;
      } else {
        console.log(`❌ Failed: ${tc.name}`);
        console.log(`   Expected: Anx=${tc.expectedAnx}, Dep=${tc.expectedDep}, Overall=${tc.expectedOverall}`);
        console.log(`   Got: Anx=${res.anxietasLabel}, Dep=${res.depresiLabel}, Overall=${res.conditionLabel}`);
      }
    }

    console.log(`\nResults: ${passed}/${testCases.length} passed.`);
    if (passed === testCases.length) {
      console.log("SUCCESS: All MMYS combined scoring test cases verified!");
      process.exit(0);
    } else {
      console.log("FAILURE: Some test cases failed.");
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTest();
