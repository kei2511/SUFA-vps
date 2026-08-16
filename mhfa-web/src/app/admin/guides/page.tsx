"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Guide {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  conditionTags: string[];
  status: "Aktif" | "Nonaktif";
}

export default function AdminGuidesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("Semua");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuides = () => {
    fetch("/api/admin/guides")
      .then((res) => res.json())
      .then((data) => {
        if (data.guides) {
          setGuides(data.guides);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching guides:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const allTags = ["Semua", "Kecemasan", "Depresi", "Stres", "Umum"];

  const togglePublished = async (id: string, currentStatus: "Aktif" | "Nonaktif") => {
    const nextStatus = currentStatus === "Aktif" ? "Nonaktif" : "Aktif";
    try {
      const res = await fetch(`/api/admin/guides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setGuides((prev) =>
          prev.map((g) => (g.id === id ? { ...g, status: nextStatus } : g))
        );
      } else {
        alert(data.error || "Gagal mengubah status publikasi.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus panduan ini?")) return;
    try {
      const res = await fetch(`/api/admin/guides/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setGuides((prev) => prev.filter((g) => g.id !== id));
      } else {
        alert(data.error || "Gagal menghapus panduan.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi.");
    }
  };

  const filtered = guides.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag =
      tagFilter === "Semua" || (g.conditionTags && g.conditionTags.includes(tagFilter));
    return matchesSearch && matchesTag;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tagFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGuides = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat konten panduan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Daftar Konten Panduan
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola materi video edukasi dan panduan pendampingan untuk konseli.
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            Total Panduan
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{guides.length}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">public</span>
            Dipublikasi (Aktif)
          </div>
          <p className="font-heading font-bold text-2xl text-status-success">
            {guides.filter((g) => g.status === "Aktif").length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Draft (Nonaktif)
          </div>
          <p className="font-heading font-bold text-2xl text-outline">
            {guides.filter((g) => g.status === "Nonaktif").length}
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
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                <th className="px-6 py-4">Panduan</th>
                <th className="px-6 py-4">Tag Kondisi</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {paginatedGuides.length > 0 ? (
                paginatedGuides.map((g) => (
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
                            {g.description || "Tidak ada deskripsi"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {g.conditionTags && g.conditionTags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePublished(g.id, g.status)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                          g.status === "Aktif" ? "bg-status-success" : "bg-outline-variant"
                        }`}
                        title={g.status === "Aktif" ? "Jadikan Draft" : "Publikasikan"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            g.status === "Aktif" ? "translate-x-6" : "translate-x-1"
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
                          onClick={() => handleDelete(g.id)}
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
                  <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                      search_off
                    </span>
                    Tidak ada panduan yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-outline-variant/30 text-sm">
            {paginatedGuides.length > 0 ? (
              paginatedGuides.map((g) => (
                <div key={g.id} className="p-4 space-y-3 hover:bg-surface-container-low transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-status-error/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-status-error text-[20px]">
                          play_circle
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface truncate max-w-[200px]">{g.title}</p>
                        <p className="text-[10px] text-outline truncate max-w-[200px]">
                          {g.description || "Tidak ada deskripsi"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePublished(g.id, g.status)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${
                        g.status === "Aktif" ? "bg-status-success" : "bg-outline-variant"
                      }`}
                      title={g.status === "Aktif" ? "Jadikan Draft" : "Publikasikan"}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          g.status === "Aktif" ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {g.conditionTags && g.conditionTags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10 justify-end">
                    <Link
                      href={`/admin/guides/${g.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all active:scale-[0.97]"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="inline-flex items-center p-1.5 text-status-error hover:bg-status-error/10 rounded-lg transition-all active:scale-[0.97]"
                      title="Hapus Panduan"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                  search_off
                </span>
                Tidak ada panduan yang sesuai pencarian.
              </div>
            )}
          </div>
        </div>

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest rounded-b-2xl">
            <p className="text-xs text-on-surface-variant">
              Menampilkan <span className="font-semibold text-on-surface">{startIndex + 1}</span> - <span className="font-semibold text-on-surface">{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}</span> dari <span className="font-semibold text-on-surface">{filtered.length}</span> panduan
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                Sebelumnya
              </button>
              <div className="flex items-center gap-1 px-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === page
                        ? "bg-primary text-on-primary shadow-xs font-bold"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Berikutnya
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
