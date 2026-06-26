# Rencana Implementasi Rekam Medis & Profil Pasien bagi Konselor (Fase 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan halaman daftar riwayat pasien konselor dan halaman detail rekam medis pasien dengan grafik tren SVG kustom dan transkrip chat/catatan sesi.

**Architecture:** Frontend Next.js client-side page rendering yang mengonsumsi mock data pasien terstruktur dengan state penanganan filter status dan pencarian.

**Tech Stack:** React 18, Next.js 14, Tailwind CSS, Google Material Symbols.

## Global Constraints
*   Wajib mobile-friendly (mobile-first layout).
*   Gunakan token warna "Serene Trust" (surface-container-lowest, primary, on-surface, dll.).
*   Gunakan ikon Google Material Symbols Outlined (`material-symbols-outlined`).

---

### Task 1: Halaman Riwayat Pasien Konselor

**Files:**
- Create: `src/app/konselor/patients/page.tsx`

**Interfaces:**
- Produces: Antarmuka daftar pasien yang terintegrasi dengan filter pencarian dan pill status di `/konselor/patients`.

- [ ] **Step 1: Buat file halaman `src/app/konselor/patients/page.tsx`**

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  age: string;
  gender: string;
  lastScreeningDate: string;
  score: number;
  condition: "Kecemasan Ringan" | "Kecemasan Sedang" | "Depresi Berat" | "Normal";
  status: "Selesai" | "Aktif" | "Dirujuk";
}

export default function CounselorPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Selesai" | "Aktif" | "Dirujuk">("Semua");

  const patients: Patient[] = [
    {
      id: "412",
      name: "Anonim #412 (Rina K.)",
      age: "26 Tahun",
      gender: "Perempuan",
      lastScreeningDate: "26 Juni 2026",
      score: 14,
      condition: "Kecemasan Sedang",
      status: "Aktif",
    },
    {
      id: "892",
      name: "Anonim #892",
      age: "31 Tahun",
      gender: "Laki-laki",
      lastScreeningDate: "25 Juni 2026",
      score: 22,
      condition: "Depresi Berat",
      status: "Dirujuk",
    },
    {
      id: "102",
      name: "Budi Santoso",
      age: "40 Tahun",
      gender: "Laki-laki",
      lastScreeningDate: "22 Juni 2026",
      score: 9,
      condition: "Kecemasan Ringan",
      status: "Selesai",
    },
    {
      id: "205",
      name: "Dewi Lestari",
      age: "19 Tahun",
      gender: "Perempuan",
      lastScreeningDate: "18 Juni 2026",
      score: 5,
      condition: "Normal",
      status: "Selesai",
    },
    {
      id: "567",
      name: "Anonim #567",
      age: "24 Tahun",
      gender: "Perempuan",
      lastScreeningDate: "12 Juni 2026",
      score: 16,
      condition: "Kecemasan Sedang",
      status: "Selesai",
    },
  ];

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.includes(searchTerm);
    const matchesStatus =
      statusFilter === "Semua" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getConditionColor = (condition: Patient["condition"]) => {
    switch (condition) {
      case "Depresi Berat":
        return "bg-status-error/10 text-status-error border border-status-error/20";
      case "Kecemasan Sedang":
        return "bg-status-warning/10 text-status-warning border border-status-warning/20";
      case "Kecemasan Ringan":
        return "bg-status-info/10 text-status-info border border-status-info/20";
      case "Normal":
      default:
        return "bg-status-success/10 text-status-success border border-status-success/20";
    }
  };

  const getStatusBadge = (status: Patient["status"]) => {
    switch (status) {
      case "Aktif":
        return "bg-status-success/15 text-status-success";
      case "Dirujuk":
        return "bg-status-error/15 text-status-error";
      case "Selesai":
      default:
        return "bg-surface-container text-on-surface-variant";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      <div>
        <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
          Riwayat Pasien & Skrining
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Daftar rekam medis dan histori penanganan pasien yang terdaftar di bawah pengawasan Anda.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pasien berdasarkan nama/ID..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(["Semua", "Selesai", "Aktif", "Dirujuk"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container border border-transparent"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                <th className="px-6 py-4">Nama Pasien / ID</th>
                <th className="px-6 py-4">Usia & Gender</th>
                <th className="px-6 py-4">Skrining Terakhir</th>
                <th className="px-6 py-4">Kondisi Medis</th>
                <th className="px-6 py-4">Status Sesi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-surface-container-low transition-all">
                    <td className="px-6 py-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {patient.name
                            .replace("Anonim #", "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p>{patient.name}</p>
                          <span className="text-[10px] text-outline font-normal">ID: {patient.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {patient.age} / {patient.gender}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {patient.lastScreeningDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getConditionColor(patient.condition)}`}>
                        {patient.condition} (Skor: {patient.score})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/konselor/patients/${patient.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all active:scale-[0.97]"
                      >
                        Rekam Medis
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                      person_search
                    </span>
                    Tidak ada data pasien yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Jalankan compile check untuk memverifikasi file**

Run: `npm run build`
Expected: build sukses tanpa error pada route `/konselor/patients`.

- [ ] **Step 3: Commit perubahan**

```bash
git add src/app/konselor/patients/page.tsx
git commit -m "feat: add counselor patients listing page"
```

---

### Task 2: Halaman Detail Pasien Konselor

**Files:**
- Create: `src/app/konselor/patients/[id]/page.tsx`

**Interfaces:**
- Consumes: Parameter `id` dari router dynamic route `/konselor/patients/[id]`.

- [ ] **Step 1: Buat file halaman `src/app/konselor/patients/[id]/page.tsx`**

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ScreeningRecord {
  date: string;
  score: number;
  condition: string;
  color: string;
}

interface NoteRecord {
  date: string;
  counselorName: string;
  symptoms: string;
  assessment: string;
  recommendation: string;
}

interface TranscriptMessage {
  sender: "patient" | "counselor";
  text: string;
  time: string;
}

export default function CounselorPatientDetailPage() {
  const params = useParams();
  const id = params?.id || "412";

  const [activeTab, setActiveTab] = useState<"transcript" | "notes">("transcript");
  const [selectedTranscriptIndex, setSelectedTranscriptIndex] = useState<number>(0);

  const patientData = {
    id: id,
    name: id === "892" ? "Anonim #892" : id === "102" ? "Budi Santoso" : "Anonim #412 (Rina K.)",
    age: id === "892" ? "31 Tahun" : id === "102" ? "40 Tahun" : "26 Tahun",
    gender: id === "102" ? "Laki-laki" : "Perempuan",
    inviteCodeUsed: "INV-7728",
    registrationDate: "12 Januari 2026",
    status: id === "892" ? "Dirujuk" : id === "102" ? "Selesai" : "Aktif",
    
    screenings: [
      { date: "12 Mei 2026", score: 8, condition: "Kecemasan Ringan", color: "text-status-info bg-status-info/10" },
      { date: "04 Juni 2026", score: 12, condition: "Kecemasan Sedang", color: "text-status-warning bg-status-warning/10" },
      { date: "26 Juni 2026", score: 14, condition: "Kecemasan Sedang", color: "text-status-warning bg-status-warning/10" },
    ] as ScreeningRecord[],

    notes: [
      {
        date: "26 Juni 2026",
        counselorName: "Dr. Sarah Wijaya",
        symptoms: "Kecemasan terkait pekerjaan, insomnia ringan, palpitasi (sesak dada).",
        assessment: "Kecemasan situasional akibat beban kerja baru (proyek kepemimpinan).",
        recommendation: "Latihan pernapasan kotak (box breathing), delegasi tugas, evaluasi lanjutan 3 hari.",
      },
      {
        date: "04 Juni 2026",
        counselorName: "Dr. Sarah Wijaya",
        symptoms: "Kekhawatiran berlebih, sering cemas di pagi hari, nafsu makan menurun.",
        assessment: "Respon stres akibat adaptasi lingkungan kerja.",
        recommendation: "Metode grounding 5-4-3-2-1, journaling harian sebelum tidur.",
      },
    ] as NoteRecord[],

    transcripts: [
      {
        sessionDate: "26 Juni 2026",
        messages: [
          { sender: "patient", text: "Halo dok, saya merasa sangat cemas beberapa hari ini. Dada rasanya sesak.", time: "19:55" },
          { sender: "counselor", text: "Halo, saya dr. Sarah. Mari kita kendalikan bersama. Apakah ada pemicu baru-baru ini?", time: "19:56" },
          { sender: "patient", text: "Saya ditunjuk memimpin proyek besar minggu lalu. Saya cemas sekali takut gagal.", time: "19:58" },
          { sender: "counselor", text: "Mari lakukan latihan pernapasan kotak (box breathing) singkat malam ini.", time: "20:00" },
          { sender: "patient", text: "Baik dok, saya akan coba lakukan. Semoga membantu tidur saya.", time: "20:02" },
        ] as TranscriptMessage[],
      },
      {
        sessionDate: "04 Juni 2026",
        messages: [
          { sender: "patient", text: "Dok, kecemasan saya akhir-akhir ini mulai sering muncul terutama pagi hari.", time: "09:12" },
          { sender: "counselor", text: "Baik, mari kita coba identifikasi pikirannya. Apakah ada kekhawatiran tertentu?", time: "09:14" },
          { sender: "patient", text: "Saya merasa tidak mampu menyelesaikan tugas kantor tepat waktu.", time: "09:16" },
          { sender: "counselor", text: "Mari coba teknik grounding 5-4-3-2-1 untuk membawa pikiran kembali ke masa kini.", time: "09:19" },
        ] as TranscriptMessage[],
      },
    ],
  };

  const getGraphHeight = (score: number) => {
    return `${(score / 25) * 100}%`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      <div className="flex flex-col gap-4">
        <Link
          href="/konselor/patients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Kembali ke Daftar Pasien
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
              Rekam Medis Pasien
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Informasi profil lengkap, log aktivitas skrining, dan transkrip konsultasi lampau.
            </p>
          </div>
          
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            patientData.status === "Aktif"
              ? "bg-status-success/10 text-status-success"
              : patientData.status === "Dirujuk"
              ? "bg-status-error/10 text-status-error"
              : "bg-surface-container text-on-surface-variant"
          }`}>
            Sesi: {patientData.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                {patientData.name
                  .replace("Anonim #", "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-on-surface">{patientData.name}</h3>
                <span className="text-xs text-on-surface-variant">ID: {patientData.id}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Jenis Kelamin:</span>
                <span className="font-semibold text-on-surface">{patientData.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Usia:</span>
                <span className="font-semibold text-on-surface">{patientData.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Kode Undangan:</span>
                <span className="font-mono font-semibold text-primary">{patientData.inviteCodeUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tanggal Daftar:</span>
                <span className="font-semibold text-on-surface">{patientData.registrationDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <h4 className="font-heading font-bold text-sm text-on-surface">Tren Skor Skrining</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Riwayat perkembangan kondisi mental</p>
            </div>

            <div className="h-40 flex items-end justify-around border-b border-l border-outline-variant/60 pb-2 pl-3 pt-4 relative">
              <div className="absolute left-0 right-0 top-[20%] border-t border-dashed border-outline-variant/20" />
              <div className="absolute left-0 right-0 top-[50%] border-t border-dashed border-outline-variant/20" />
              <div className="absolute left-0 right-0 top-[80%] border-t border-dashed border-outline-variant/20" />

              {patientData.screenings.map((scr, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 z-10 w-12">
                  <div className="relative group flex flex-col items-center">
                    <span className="bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-0.5 rounded absolute -top-7 opacity-90 font-bold whitespace-nowrap">
                      Skor: {scr.score}
                    </span>
                    <div
                      style={{ height: getGraphHeight(scr.score) }}
                      className="w-4 bg-primary hover:bg-primary-container rounded-t transition-all duration-500 h-24"
                    />
                  </div>
                  <span className="text-[9px] text-on-surface-variant text-center whitespace-nowrap">
                    {scr.date.split(" ")[0]} {scr.date.split(" ")[1].slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant border-t border-outline-variant/20 pt-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-primary rounded" /> Skor Skrining</span>
              <span>Skor Max: 25</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm h-[520px]">
          <div className="flex bg-surface-container border-b border-outline-variant shrink-0">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                activeTab === "transcript"
                  ? "border-primary text-primary bg-surface-container-lowest"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Transkrip Obrolan Lama
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                activeTab === "notes"
                  ? "border-primary text-primary bg-surface-container-lowest"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Catatan Konseling Internal
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "transcript" && (
              <div className="flex-1 flex overflow-hidden">
                <div className="w-1/3 border-r border-outline-variant/40 overflow-y-auto bg-surface-container-low/20 shrink-0">
                  {patientData.transcripts.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTranscriptIndex(idx)}
                      className={`w-full text-left p-3.5 border-b border-outline-variant/30 text-xs transition-all ${
                        selectedTranscriptIndex === idx
                          ? "bg-primary/5 text-primary font-bold border-r-4 border-r-primary"
                          : "text-on-surface-variant hover:bg-surface-container-high/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span>Sesi {t.sessionDate}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-dim">
                  {patientData.transcripts[selectedTranscriptIndex]?.messages.map((m, mIdx) => {
                    const isCounselor = m.sender === "counselor";
                    return (
                      <div
                        key={mIdx}
                        className={`flex ${isCounselor ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 text-xs shadow-sm ${
                            isCounselor
                              ? "bg-primary text-on-primary rounded-tr-none"
                              : "bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-tl-none"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                          <span
                            className={`text-[8px] block text-right mt-1 ${
                              isCounselor ? "text-on-primary/60" : "text-on-surface-variant/70"
                            }`}
                          >
                            {m.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-dim">
                {patientData.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">event</span>
                        Sesi Tanggal: {note.date}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        Oleh: {note.counselorName}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-on-surface block mb-0.5">Keluhan Utama:</span>
                        <p className="text-on-surface-variant bg-surface-container-low p-2 rounded leading-relaxed">
                          {note.symptoms}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-on-surface block mb-0.5">Asesmen Klinis:</span>
                        <p className="text-on-surface-variant bg-surface-container-low p-2 rounded leading-relaxed">
                          {note.assessment}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-on-surface block mb-0.5">Rencana Tindak Lanjut:</span>
                        <p className="text-on-surface-variant bg-surface-container-low p-2 rounded leading-relaxed">
                          {note.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Jalankan compile check untuk memverifikasi file**

Run: `npm run build`
Expected: build sukses tanpa error pada route `/konselor/patients/[id]`.

- [ ] **Step 3: Commit perubahan**

```bash
git add src/app/konselor/patients/[id]/page.tsx
git commit -m "feat: add counselor patient details page"
```
