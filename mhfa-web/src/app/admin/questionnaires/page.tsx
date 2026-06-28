"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Questionnaire {
  id: string;
  title: string;
  code: string;
  description: string;
  questionCount: number;
  lastUpdated: string;
  isActive: boolean;
  usageCount: number;
  category: "Depresi" | "Kecemasan" | "Umum" | "Stres";
}

export default function AdminQuestionnairesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"Semua" | Questionnaire["category"]>("Semua");

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([
    {
      id: "srq-20",
      title: "Self-Reporting Questionnaire (SRQ-20)",
      code: "SRQ-20",
      description: "Instrumen skrining gangguan jiwa umum (20 pertanyaan Ya/Tidak) yang dikembangkan oleh WHO.",
      questionCount: 20,
      lastUpdated: "20 Juni 2026",
      isActive: true,
      usageCount: 4200,
      category: "Umum",
    },
    {
      id: "phq-9",
      title: "Patient Health Questionnaire-9",
      code: "PHQ-9",
      description: "Instrumen skrining depresi 9 item berbasis DSM-5 dengan skala Likert 4 poin.",
      questionCount: 9,
      lastUpdated: "18 Juni 2026",
      isActive: true,
      usageCount: 3150,
      category: "Depresi",
    },
    {
      id: "gad-7",
      title: "Generalized Anxiety Disorder-7",
      code: "GAD-7",
      description: "Instrumen skrining gangguan kecemasan umum 7 item dengan skala frekuensi.",
      questionCount: 7,
      lastUpdated: "15 Juni 2026",
      isActive: true,
      usageCount: 2870,
      category: "Kecemasan",
    },
    {
      id: "dass-21",
      title: "Depression Anxiety Stress Scales-21",
      code: "DASS-21",
      description: "Kuesioner 21 item yang mengukur tiga dimensi: depresi, kecemasan, dan stres.",
      questionCount: 21,
      lastUpdated: "10 Juni 2026",
      isActive: false,
      usageCount: 980,
      category: "Stres",
    },
    {
      id: "k10",
      title: "Kessler Psychological Distress Scale",
      code: "K-10",
      description: "Skala 10 item untuk mengukur distres psikologis non-spesifik dalam 30 hari terakhir.",
      questionCount: 10,
      lastUpdated: "05 Juni 2026",
      isActive: false,
      usageCount: 520,
      category: "Umum",
    },
  ]);

  const toggleActive = (id: string) => {
    setQuestionnaires((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isActive: !q.isActive } : q))
    );
  };

  const filtered = questionnaires.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Semua" || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: Questionnaire["category"]) => {
    switch (category) {
      case "Depresi":
        return "bg-status-error/10 text-status-error border-status-error/20";
      case "Kecemasan":
        return "bg-status-warning/10 text-status-warning border-status-warning/20";
      case "Stres":
        return "bg-tertiary/10 text-tertiary border-tertiary/20";
      case "Umum":
      default:
        return "bg-status-info/10 text-status-info border-status-info/20";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Daftar Kuesioner
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola instrumen skrining kesehatan mental yang tersedia di platform.
          </p>
        </div>
        <Link
          href="/admin/questionnaires/new"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 w-fit active:scale-[0.98] shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Kuesioner
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">quiz</span>
            Total Kuesioner
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{questionnaires.length}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">toggle_on</span>
            Aktif
          </div>
          <p className="font-heading font-bold text-2xl text-status-success">
            {questionnaires.filter((q) => q.isActive).length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">toggle_off</span>
            Nonaktif
          </div>
          <p className="font-heading font-bold text-2xl text-outline">
            {questionnaires.filter((q) => !q.isActive).length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">bar_chart</span>
            Total Penggunaan
          </div>
          <p className="font-heading font-bold text-2xl text-primary">
            {questionnaires.reduce((sum, q) => sum + q.usageCount, 0).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kuesioner..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(["Semua", "Umum", "Depresi", "Kecemasan", "Stres"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container border border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questionnaire Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                <th className="px-6 py-4">Instrumen</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-center">Pertanyaan</th>
                <th className="px-6 py-4 text-center">Penggunaan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {filtered.length > 0 ? (
                filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-surface-container-low transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface truncate max-w-[240px]">{q.title}</p>
                          <p className="text-[10px] text-outline font-mono">{q.code} · Diperbarui {q.lastUpdated}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(q.category)}`}>
                        {q.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-on-surface">
                      {q.questionCount}
                    </td>
                    <td className="px-6 py-4 text-center text-on-surface-variant">
                      {q.usageCount.toLocaleString("id-ID")}×
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(q.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                          q.isActive ? "bg-status-success" : "bg-outline-variant"
                        }`}
                        title={q.isActive ? "Nonaktifkan" : "Aktifkan"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            q.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/questionnaires/${q.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all active:scale-[0.97]"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Edit
                        </Link>
                        <button
                          className="inline-flex items-center p-1.5 text-status-error hover:bg-status-error/10 rounded-lg transition-all active:scale-[0.97]"
                          title="Hapus Kuesioner"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                      search_off
                    </span>
                    Tidak ada kuesioner yang sesuai pencarian.
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
