# MMYS V.1 Questionnaires Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed the database with the two MMYS V.1 questionnaires (Anxiety and Depression) and implement the custom combination-based scoring logic in the submit API.

**Architecture:** Extend the existing seed script to populate MMYS V.1 kuesioner data, then intercept submissions in the API route to apply custom logic when `questionnaireId` matches `mmys-anx` or `mmys-dep`.

**Tech Stack:** Next.js, TypeScript, Drizzle ORM, PostgreSQL.

## Global Constraints

- Do not change any database table schemas (keep database schema intact).
- Output the condition labels exactly as "Risiko Rendah", "Risiko Sedang", and "Risiko Tinggi".
- Maintain clean, readable, and well-documented TypeScript code.

---

### Task 1: Database Seed Script Update

**Files:**
- Modify: `mhfa-web/src/db/seed-questionnaires.ts`
- Test: Run the seeding command `npm run seed` or similar from the package.json to test the seed database execution.

**Interfaces:**
- Consumes: Existing DB schemas from `mhfa-web/src/db/schema.ts`
- Produces: New questionnaire entries in `questionnaires`, `questions`, `options`, and `result_mappings` tables.

- [ ] **Step 1: Write the updated seed code**

Add the MMYS V.1 structures to `mhfa-web/src/db/seed-questionnaires.ts`. Here is the complete code to add to the script:

```typescript
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
```

Ensure these are seeded alongside PHQ-9 and GAD-7 using Drizzle's `db.insert`.

- [ ] **Step 2: Run the seed script**

Execute the seeding command:
Run: `npx tsx src/db/seed-questionnaires.ts` (inside `mhfa-web`)
Expected: Seeding completes successfully, printing the summary of created records.

- [ ] **Step 3: Commit**

```bash
git add mhfa-web/src/db/seed-questionnaires.ts
git commit -m "feat: add MMYS V.1 seed data for anxiety and depression"
```

---

### Task 2: Submit API Scoring Customization

**Files:**
- Modify: `mhfa-web/src/app/api/screening/submit/route.ts`

**Interfaces:**
- Consumes: The submitted payload containing `questionnaireId` and `answers`.
- Produces: The generated screening session with the correct `conditionLabel` according to MMYS specific rules.

- [ ] **Step 1: Write the updated submit API logic**

Edit `mhfa-web/src/app/api/screening/submit/route.ts` to implement the custom scoring logic for MMYS.

```typescript
    // 2. Find condition label based on resultMappings
    let conditionLabel = "Risiko Rendah";

    if (questionnaireId === "mmys-anx" || questionnaireId === "mmys-dep") {
      // Find the scores for the first and third questions
      const q1Opt = selectedOptions.find(o => o.questionId.endsWith("-q1"));
      const q3Opt = selectedOptions.find(o => o.questionId.endsWith("-q3"));

      const q1Score = q1Opt?.score ?? 0;
      const q3Score = q3Opt?.score ?? 0;

      if (q1Score === 1 && q3Score === 1) {
        conditionLabel = "Risiko Tinggi";
      } else if (q1Score === 1 || q3Score === 1) {
        conditionLabel = "Risiko Sedang";
      } else {
        conditionLabel = "Risiko Rendah";
      }
    } else {
      const mapping = await db.query.resultMappings.findFirst({
        where: and(
          eq(resultMappings.questionnaireId, questionnaireId),
          lte(resultMappings.minScore, totalScore),
          gte(resultMappings.maxScore, totalScore)
        )
      });
      conditionLabel = mapping?.label || "Risiko Rendah";
    }
```

- [ ] **Step 2: Verify the custom scoring via a validation script**

Create a test script `mhfa-web/src/db/test-mmys-submit.ts` to test various combinations (e.g. `[1, 0, 1]` $\rightarrow$ `Risiko Tinggi`, `[1, 1, 0]` $\rightarrow$ `Risiko Sedang`, `[0, 1, 0]` $\rightarrow$ `Risiko Rendah`).
Run: `npx tsx src/db/test-mmys-submit.ts`
Expected: Outputs matching correct labels for each combination.

- [ ] **Step 3: Commit**

```bash
git add mhfa-web/src/app/api/screening/submit/route.ts
git commit -m "feat: implement custom scoring for MMYS V.1 kuesioner"
```
