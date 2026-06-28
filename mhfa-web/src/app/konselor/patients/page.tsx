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

const getInitials = (name: string) => {
  const nameInParentheses = name.match(/\(([^)]+)\)/);
  if (nameInParentheses && nameInParentheses[1]) {
    return nameInParentheses[1]
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  const cleanName = name.replace(/Anonim\s*#\d*/g, "").trim();
  if (!cleanName) {
    const numMatch = name.match(/#(\d+)/);
    return numMatch ? `A${numMatch[1].slice(0, 1)}` : "A";
  }
  return cleanName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

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
                          {getInitials(patient.name)}
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
