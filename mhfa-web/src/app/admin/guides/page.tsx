"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Guide {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  conditionTags: string[];
  stepsCount: number;
  views: number;
  lastUpdated: string;
  isPublished: boolean;
}

export default function AdminGuidesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("Semua");

  const [guides, setGuides] = useState<Guide[]>([
    {
      id: "guide-1",
      title: "Teknik Pernapasan Kotak (Box Breathing)",
      description: "Panduan langkah demi langkah teknik pernapasan kotak untuk mengurangi kecemasan akut.",
      youtubeUrl: "https://youtu.be/example1",
      conditionTags: ["Kecemasan", "Stres"],
      stepsCount: 5,
      views: 1240,
      lastUpdated: "24 Juni 2026",
      isPublished: true,
    },
    {
      id: "guide-2",
      title: "Manajemen Stres di Tempat Kerja",
      description: "Video edukasi tentang strategi coping dan manajemen stres profesional untuk lingkungan kerja.",
      youtubeUrl: "https://youtu.be/example2",
      conditionTags: ["Stres", "Umum"],
      stepsCount: 8,
      views: 4200,
      lastUpdated: "20 Juni 2026",
      isPublished: true,
    },
    {
      id: "guide-3",
      title: "Memahami Depresi: Tanda & Cara Bantuan",
      description: "Materi psiko-edukasi mengenai gejala depresi dan langkah pertolongan pertama.",
      youtubeUrl: "https://youtu.be/example3",
      conditionTags: ["Depresi"],
      stepsCount: 6,
      views: 2870,
      lastUpdated: "15 Juni 2026",
      isPublished: true,
    },
    {
      id: "guide-4",
      title: "Teknik Grounding 5-4-3-2-1",
      description: "Panduan teknik grounding sensorik untuk mengatasi serangan panik dan kecemasan berat.",
      youtubeUrl: "https://youtu.be/example4",
      conditionTags: ["Kecemasan"],
      stepsCount: 5,
      views: 1590,
      lastUpdated: "10 Juni 2026",
      isPublished: true,
    },
    {
      id: "guide-5",
      title: "Journaling untuk Kesehatan Mental",
      description: "Tutorial menulis jurnal reflektif sebagai alat self-care harian.",
      youtubeUrl: "https://youtu.be/example5",
      conditionTags: ["Umum", "Depresi"],
      stepsCount: 4,
      views: 680,
      lastUpdated: "05 Juni 2026",
      isPublished: false,
    },
  ]);

  const allTags = ["Semua", "Kecemasan", "Depresi", "Stres", "Umum"];

  const togglePublished = (id: string) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isPublished: !g.isPublished } : g))
    );
  };

  const filtered = guides.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag =
      tagFilter === "Semua" || g.conditionTags.includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Depresi":
        return "bg-status-error/10 text-status-error";
      case "Kecemasan":
        return "bg-status-warning/10 text-status-warning";
      case "Stres":
        return "bg-tertiary/10 text-tertiary";
      case "Umum":
      default:
        return "bg-status-info/10 text-status-info";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Daftar Konten Panduan
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola materi video edukasi dan panduan pendampingan untuk pasien.
          </p>
        </div>
        <Link
          href="/admin/guides/new"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 w-fit active:scale-[0.98] shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Panduan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            Total Panduan
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{guides.length}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">public</span>
            Dipublikasi
          </div>
          <p className="font-heading font-bold text-2xl text-status-success">
            {guides.filter((g) => g.isPublished).length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Draft
          </div>
          <p className="font-heading font-bold text-2xl text-outline">
            {guides.filter((g) => !g.isPublished).length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Total Kunjungan
          </div>
          <p className="font-heading font-bold text-2xl text-primary">
            {guides.reduce((s, g) => s + g.views, 0).toLocaleString("id-ID")}
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
            placeholder="Cari panduan..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                tagFilter === tag
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container border border-transparent"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Guides Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                <th className="px-6 py-4">Panduan</th>
                <th className="px-6 py-4">Tag Kondisi</th>
                <th className="px-6 py-4 text-center">Langkah</th>
                <th className="px-6 py-4 text-center">Kunjungan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {filtered.length > 0 ? (
                filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-surface-container-low transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-status-error/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-status-error text-[18px]">
                            play_circle
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface truncate max-w-[280px]">{g.title}</p>
                          <p className="text-[10px] text-outline truncate max-w-[280px]">
                            Diperbarui {g.lastUpdated}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {g.conditionTags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-on-surface">
                      {g.stepsCount}
                    </td>
                    <td className="px-6 py-4 text-center text-on-surface-variant">
                      {g.views.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePublished(g.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                          g.isPublished ? "bg-status-success" : "bg-outline-variant"
                        }`}
                        title={g.isPublished ? "Jadikan Draft" : "Publikasikan"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            g.isPublished ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/guides/${g.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all active:scale-[0.97]"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Edit
                        </Link>
                        <button
                          className="inline-flex items-center p-1.5 text-status-error hover:bg-status-error/10 rounded-lg transition-all active:scale-[0.97]"
                          title="Hapus Panduan"
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
                    Tidak ada panduan yang sesuai pencarian.
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
