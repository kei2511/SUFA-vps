import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const jsonPath = path.resolve(__dirname, 'counselor_notes_report.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`JSON report not found at ${jsonPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(jsonPath, 'utf-8');
const data = JSON.parse(rawData);
const notes = data.notes || [];

const formattedData = notes.map((item: any, index: number) => {
  let symptoms = '';
  let assessment = '';
  let recommendation = '';

  if (item.note) {
    try {
      const parsed = JSON.parse(item.note);
      if (typeof parsed === 'object' && parsed !== null) {
        symptoms = parsed.symptoms || '';
        assessment = parsed.assessment || '';
        recommendation = parsed.recommendation || '';
      } else {
        symptoms = String(parsed);
      }
    } catch {
      symptoms = item.note;
    }
  }

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    } catch {
      return isoStr;
    }
  };

  return {
    'No': index + 1,
    'Tanggal Catatan': formatDate(item.createdAt),
    'Kode Konselor': item.counselorCode || '-',
    'Nama Konselor': item.counselorName || '-',
    'Nama Konseli (Pasien)': item.patientName || '-',
    'Email Konseli': item.patientEmail || '-',
    'Keluhan / Gejala (Symptoms)': symptoms,
    'Asesmen (Assessment)': assessment,
    'Rekomendasi (Recommendation)': recommendation,
    'Tipe Sesi': item.sessionType || '-',
    'Status Sesi': item.sessionStatus || '-',
    'Sesi Dimulai': formatDate(item.startedAt),
    'Sesi Selesai': formatDate(item.endedAt)
  };
});

const worksheet = XLSX.utils.json_to_sheet(formattedData);

// Set column widths
const colWidths = [
  { wch: 5 },   // No
  { wch: 20 },  // Tanggal Catatan
  { wch: 15 },  // Kode Konselor
  { wch: 25 },  // Nama Konselor
  { wch: 25 },  // Nama Konseli
  { wch: 30 },  // Email Konseli
  { wch: 45 },  // Keluhan / Gejala
  { wch: 45 },  // Asesmen
  { wch: 45 },  // Rekomendasi
  { wch: 12 },  // Tipe Sesi
  { wch: 12 },  // Status Sesi
  { wch: 20 },  // Sesi Dimulai
  { wch: 20 },  // Sesi Selesai
];
worksheet['!cols'] = colWidths;

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Catatan Konselor');

const outputPath = path.resolve(__dirname, 'Catatan_Konselor_MHFA.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Excel file successfully created: ${outputPath}`);
console.log(`Total rows exported: ${formattedData.length}`);
