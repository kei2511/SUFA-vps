# Design Specification: MMYS V.1 Questionnaires Integration

This document specifies the design for adding the Mini MindHEAR Youth Scale V.1 (MMYS V.1) questionnaires for adolescents (ages 10-18) and customizing the screening submission scoring logic to support combination-based rules.

## 1. Objectives

- Seed two new questionnaires based on the MMYS V.1 instrument:
  1. **Skala Anxietas (Kecemasan)**: ID `mmys-anx`
  2. **Skala Depresi**: ID `mmys-dep`
- Support binary answers: **Ya** (1 point) and **Tidak** (0 points) for all MMYS questions.
- Update `/api/screening/submit/route.ts` to process scoring for MMYS V.1 dynamically based on the specific combination of answers rather than just a simple range-based sum of points.

## 2. Database Schema & Seed Data

The following data will be seeded into the database:

### 2.1. MMYS Anxietas (`mmys-anx`)

- **Questionnaire**:
  - `id`: `"mmys-anx"`
  - `title`: `"MMYS V.1 - Skala Anxietas (Kecemasan)"`
  - `description`: `"Mini MindHEAR Youth Scale V.1 (Remaja Usia 10-18 Tahun). Pilih jawaban yang paling sesuai dengan apa yang kamu rasakan atau alami dalam 2 minggu terakhir."`
  - `status`: `"Aktif"`

- **Questions**:
  1. `mmys-anx-q1`: `"Dalam 2 minggu terakhir, Saya sering merasa khawatir atau tidak tenang, tegang, deg-degan dan gelisah terutama terhadap hal-hal negatif atau yang belum tentu terjadi"` (type: `single`, order: 1)
  2. `mmys-anx-q2`: `"Dalam 2 minggu terakhir, Saya berpikir berlebihan dan tidak bisa mengendalikan diri, terutama terhadap hal-hal negatif atau yang belum tentu terjadi"` (type: `single`, order: 2)
  3. `mmys-anx-q3`: `"Dalam 2 minggu terakhir, Saya sulit tidur dan berkonsentrasi terutama saat memikirkan hal-hal negatif yang belum tentu terjadi"` (type: `single`, order: 3)

- **Options** (for each question):
  - `mmys-anx-q[N]-opt1`: text: `"Ya"`, score: 1
  - `mmys-anx-q[N]-opt0`: text: `"Tidak"`, score: 0

- **Result Mappings**:
  - `mmys-anx-map-low`: minScore: 0, maxScore: 1, label: `"Risiko Rendah"`, description: `"Tidak menunjukkan kemungkinan gejala ansietas."`
  - `mmys-anx-map-med`: minScore: 2, maxScore: 2, label: `"Risiko Sedang"`, description: `"Menunjukkan kemungkinan gejala anxietas ringan. Disarankan untuk memantau kondisi dan melakukan konseling awal."`
  - `mmys-anx-map-high`: minScore: 3, maxScore: 3, label: `"Risiko Tinggi"`, description: `"Menunjukkan kemungkinan gejala anxietas berat. Sangat disarankan untuk berkonsultasi dengan profesional."`

---

### 2.2. MMYS Depresi (`mmys-dep`)

- **Questionnaire**:
  - `id`: `"mmys-dep"`
  - `title`: `"MMYS V.1 - Skala Depresi"`
  - `description`: `"Mini MindHEAR Youth Scale V.1 (Remaja Usia 10-18 Tahun). Pilih jawaban yang paling sesuai dengan apa yang kamu rasakan atau alami dalam 2 minggu terakhir."`
  - `status`: `"Aktif"`

- **Questions**:
  1. `mmys-dep-q1`: `"Dalam 2 minggu terakhir, Saya sering merasa sedih atau tertekan padahal tidak ada penyebab yang jelas"` (type: `single`, order: 1)
  2. `mmys-dep-q2`: `"Dalam 2 minggu terakhir, Saya tidak tertarik lagi dengan kegiatan atau hal-hal yang biasanya saya suka"` (type: `single`, order: 2)
  3. `mmys-dep-q3`: `"Dalam 2 minggu terakhir, Saya merasa sering capek, sulit tidur, dan sulit fokus saat belajar atau melakukan kegiatan"` (type: `single`, order: 3)

- **Options** (for each question):
  - `mmys-dep-q[N]-opt1`: text: `"Ya"`, score: 1
  - `mmys-dep-q[N]-opt0`: text: `"Tidak"`, score: 0

- **Result Mappings**:
  - `mmys-dep-map-low`: minScore: 0, maxScore: 1, label: `"Risiko Rendah"`, description: `"Tidak menunjukkan kemungkinan gejala depresi."`
  - `mmys-dep-map-med`: minScore: 2, maxScore: 2, label: `"Risiko Sedang"`, description: `"Menunjukkan kemungkinan gejala depresi ringan. Disarankan untuk memantau kondisi."`
  - `mmys-dep-map-high`: minScore: 3, maxScore: 3, label: `"Risiko Tinggi"`, description: `"Menunjukkan kemungkinan gejala depresi berat. Segera hubungi psikolog atau konselor."`

---

## 3. Scoring & Logic Flow

During submission at `/api/screening/submit/route.ts`, the `conditionLabel` and total `score` will be saved.

### Custom Scoring Rules (MMYS V.1)
Let $Q_1$ and $Q_3$ represent the scores (0 or 1) of the 1st and 3rd questions of the scale:
- **Risiko Tinggi (Gejala Berat)**: If $Q_1 = 1 \land Q_3 = 1$
- **Risiko Sedang (Gejala Ringan)**: If $Q_1 = 1 \lor Q_3 = 1$ (excluding when both are 1)
- **Risiko Rendah (Tidak Menunjukkan)**: If $Q_1 = 0 \land Q_3 = 0$

This logic handles the combinations:
- `Ya - Ya - Ya` (Score 3) $\rightarrow$ **Risiko Tinggi**
- `Ya - Tidak - Ya` (Score 2) $\rightarrow$ **Risiko Tinggi**
- `Ya - Ya - Tidak` (Score 2) $\rightarrow$ **Risiko Sedang**
- `Tidak - Ya - Ya` (Score 2) $\rightarrow$ **Risiko Sedang**
- `Ya - Tidak - Tidak` (Score 1) $\rightarrow$ **Risiko Sedang**
- `Tidak - Tidak - Ya` (Score 1) $\rightarrow$ **Risiko Sedang**
- `Tidak - Ya - Tidak` (Score 1) $\rightarrow$ **Risiko Rendah**
- `Tidak - Tidak - Tidak` (Score 0) $\rightarrow$ **Risiko Rendah**

This maps perfectly to the MMYS V.1 guidelines.

## 4. Implementation Steps

1. Create a seed script (or add to `mhfa-web/src/db/seed-questionnaires.ts`) to insert `mmys-anx` and `mmys-dep` questionnaires, questions, options, and default mappings.
2. Edit `/api/screening/submit/route.ts` to implement the custom scoring check if `questionnaireId` is `mmys-anx` or `mmys-dep`.
3. Verify the changes using unit tests or automated scripts to run the seed and mock submissions.
