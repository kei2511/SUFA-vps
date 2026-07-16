import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { questionnaires } from "./schema";
import { eq } from "drizzle-orm";

async function runTest() {
  console.log("=== RUNNING MMYS SCORING VALIDATION TEST ===\n");

  try {
    const { db } = await import("./index");

    // 1. Verify questionnaires exist
    const mmysAnx = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.id, "mmys-anx"),
      with: {
        questions: {
          with: {
            options: true
          }
        }
      }
    });

    if (!mmysAnx) {
      throw new Error("Questionnaire 'mmys-anx' not found in database. Seed may have failed.");
    }

    console.log("Found 'mmys-anx' with questions and options.");

    // Helper to evaluate label
    function calculateLabel(selectedOptions: any[]) {
      const q1Opt = selectedOptions.find(o => o.questionId.endsWith("-q1"));
      const q3Opt = selectedOptions.find(o => o.questionId.endsWith("-q3"));

      const q1Score = q1Opt?.score ?? 0;
      const q3Score = q3Opt?.score ?? 0;

      if (q1Score === 1 && q3Score === 1) {
        return "Risiko Tinggi";
      } else if (q1Score === 1 || q3Score === 1) {
        return "Risiko Sedang";
      } else {
        return "Risiko Rendah";
      }
    }

    // Prepare all questions and options for testing
    const q1 = mmysAnx.questions.find(q => q.id.endsWith("-q1"))!;
    const q2 = mmysAnx.questions.find(q => q.id.endsWith("-q2"))!;
    const q3 = mmysAnx.questions.find(q => q.id.endsWith("-q3"))!;

    const optYa1 = q1.options.find(o => o.score === 1)!;
    const optTidak1 = q1.options.find(o => o.score === 0)!;
    const optYa2 = q2.options.find(o => o.score === 1)!;
    const optTidak2 = q2.options.find(o => o.score === 0)!;
    const optYa3 = q3.options.find(o => o.score === 1)!;
    const optTidak3 = q3.options.find(o => o.score === 0)!;

    // Test cases: [q1, q2, q3] -> expected label
    const testCases = [
      { options: [optYa1, optYa2, optYa3], expected: "Risiko Tinggi", name: "Ya - Ya - Ya" },
      { options: [optYa1, optTidak2, optYa3], expected: "Risiko Tinggi", name: "Ya - Tidak - Ya" },
      { options: [optYa1, optYa2, optTidak3], expected: "Risiko Sedang", name: "Ya - Ya - Tidak" },
      { options: [optTidak1, optYa2, optYa3], expected: "Risiko Sedang", name: "Tidak - Ya - Ya" },
      { options: [optYa1, optTidak2, optTidak3], expected: "Risiko Sedang", name: "Ya - Tidak - Tidak" },
      { options: [optTidak1, optTidak2, optYa3], expected: "Risiko Sedang", name: "Tidak - Tidak - Ya" },
      { options: [optTidak1, optYa2, optTidak3], expected: "Risiko Rendah", name: "Tidak - Ya - Tidak" },
      { options: [optTidak1, optTidak2, optTidak3], expected: "Risiko Rendah", name: "Tidak - Tidak - Tidak" }
    ];

    let passed = 0;
    for (const tc of testCases) {
      const label = calculateLabel(tc.options);
      if (label === tc.expected) {
        console.log(`✅ Test passed for combination: ${tc.name} -> ${label}`);
        passed++;
      } else {
        console.log(`❌ Test FAILED for combination: ${tc.name}. Expected: ${tc.expected}, Got: ${label}`);
      }
    }

    console.log(`\nTest results: ${passed}/${testCases.length} passed.`);
    if (passed === testCases.length) {
      console.log("SUCCESS: All MMYS scoring combinations verified!");
      process.exit(0);
    } else {
      console.log("FAILURE: Some test cases failed.");
      process.exit(1);
    }

  } catch (error: any) {
    console.error("Test execution failed with error:");
    console.error(error);
    process.exit(1);
  }
}

runTest();
