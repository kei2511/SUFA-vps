import fs from 'fs';
import path from 'path';

const reportJsonPath = path.resolve(__dirname, 'counselor_notes_report.json');
const rawData = fs.readFileSync(reportJsonPath, 'utf8');
const report = JSON.parse(rawData);

let md = `# Laporan Penarikan Data Catatan Konselor (Mental Health / SUFA)

> **Ringkasan Data Database**
> - **Total Catatan Konselor Tersimpan**: **${report.summary.totalCounselorNotes} catatan**
> - **Total Sesi Chat**: **${report.summary.totalChatSessions} sesi**
> - **Total Pengguna DB**: **${report.summary.totalUsers} pengguna** (Konselor & Konseli dari SMP 7, SMP 9, SMP 10 & Umum)

---

## Daftar Detail Catatan Konselor (${report.notes.length} Catatan)

| No | Waktu Catatan | Nama Konselor (Kode) | Nama Konseli (Email) | Gejala / Symptoms | Asesmen / Assessment | Rekomendasi / Plan | Status Sesi |
|---|---|---|---|---|---|---|---|
`;

report.notes.forEach((n: any, idx: number) => {
  let symptoms = '-';
  let assessment = '-';
  let recommendation = '-';

  try {
    const parsed = JSON.parse(n.note);
    symptoms = parsed.symptoms || '-';
    assessment = parsed.assessment || '-';
    recommendation = parsed.recommendation || '-';
  } catch (e: any) {
    symptoms = n.note;
  }

  // clean linebreaks for table readability
  symptoms = symptoms.replace(/\n/g, '<br/>');
  assessment = assessment.replace(/\n/g, '<br/>');
  recommendation = recommendation.replace(/\n/g, '<br/>');

  const dateStr = new Date(n.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  md += `| ${n.no} | ${dateStr} | **${n.counselorName}**<br/>(\`${n.counselorCode}\`) | **${n.patientName}**<br/>*${n.patientEmail}* | ${symptoms} | ${assessment} | ${recommendation} | \`${n.sessionStatus}\` |\n`;
});

md += `
---

## Sesi Chat Tanpa Catatan Konselor (${report.summary.totalSessionsWithoutNotes} Sesi)
Beberapa sesi chat aktif/selesai belum diisikan formulir catatan konselor oleh konselor terkait (misalnya sesi hanya berupa uji coba atau sesi curhat yang masih berlangsung).

---
*Laporan ini ditarik secara otomatis langsung dari Database PostgreSQL Supabase pada ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.*
`;

const mdOutputPath = path.resolve(__dirname, 'catatan_konselor_report.md');
fs.writeFileSync(mdOutputPath, md, 'utf8');
console.log(`Markdown report saved to ${mdOutputPath}`);
