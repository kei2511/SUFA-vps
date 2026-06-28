"use client";

import { useState } from "react";
import Link from "next/link";

interface HistoryItem {
  id: number;
  dateText: string;
  timestamp: number; // for sorting
  title: string;
  status: "Selesai" | "Dalam Proses";
  resultText?: string;
  resultType?: "warning" | "success" | "none";
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "progress">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [historyItems] = useState<HistoryItem[]>([
    {
      id: 1,
      dateText: "12 Okt 2023, 14:20 WIB",
      timestamp: 1697116800,
      title: "Skrining Awal - Kesehatan Mental",
      status: "Selesai",
      resultText: "Indikasi Kecemasan Sedang",
      resultType: "warning",
    },
    {
      id: 2,
      dateText: "05 Sep 2023, 09:15 WIB",
      timestamp: 1693898100,
      title: "Tindak Lanjut SUFA (Sesi 1)",
      status: "Dalam Proses",
      resultType: "none",
    },
    {
      id: 3,
      dateText: "20 Agu 2023, 16:45 WIB",
      timestamp: 1692549900,
      title: "Skrining Rutin Tahunan",
      status: "Selesai",
      resultText: "Normal / Stabil",
      resultType: "success",
    },
  ]);

  // Filtering
  const filtered = historyItems.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed") return item.status === "Selesai";
    return item.status === "Dalam Proses";
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.timestamp - a.timestamp;
    }
    return a.timestamp - b.timestamp;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Riwayat Skrining
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
            Pantau perkembangan dan hasil skrining kesehatan mental Anda secara berkala.
          </p>
        </div>
        <Link
          href="/screening/start"
          className="bg-primary text-on-primary px-6 py-3 rounded-full font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 w-fit active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Mulai Skrining Baru
        </Link>
      </section>

      {/* Filters & Sorting */}
      <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 font-medium text-sm rounded-full whitespace-nowrap border transition-all ${
              activeFilter === "all"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface text-on-surface-variant hover:bg-surface-container-low border-outline-variant"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveFilter("completed")}
            className={`px-4 py-2 font-medium text-sm rounded-full whitespace-nowrap border transition-all ${
              activeFilter === "completed"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface text-on-surface-variant hover:bg-surface-container-low border-outline-variant"
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setActiveFilter("progress")}
            className={`px-4 py-2 font-medium text-sm rounded-full whitespace-nowrap border transition-all ${
              activeFilter === "progress"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface text-on-surface-variant hover:bg-surface-container-low border-outline-variant"
            }`}
          >
            Dalam Proses
          </button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
            Urutkan:
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="w-full md:w-auto border border-outline rounded-lg bg-surface text-on-surface font-medium py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>
      </section>

      {/* History List */}
      <section className="flex flex-col gap-4">
        {sorted.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-10 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">
              history
            </span>
            <p>Tidak ada riwayat skrining ditemukan.</p>
          </div>
        ) : (
          sorted.map((item) => (
            <div
              key={item.id}
              className={`bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4 ${
                item.status === "Selesai" ? "" : "border-primary/30"
              }`}
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Date & Type */}
                <div className="md:col-span-5 flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">
                      calendar_month
                    </span>
                    {item.dateText}
                  </span>
                  <span className="font-heading font-semibold text-lg text-on-surface">
                    {item.title}
                  </span>
                </div>

                {/* Result Badge */}
                <div className="md:col-span-4 flex items-center">
                  {item.status === "Selesai" ? (
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                        item.resultType === "warning"
                          ? "bg-status-warning/10 text-status-warning border-status-warning/20"
                          : "bg-status-success/10 text-status-success border-status-success/20"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] filled">
                        {item.resultType === "warning" ? "warning" : "check_circle"}
                      </span>
                      <span>{item.resultText}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-on-surface-variant italic">
                      Menunggu penyelesaian...
                    </span>
                  )}
                </div>

                {/* Status indicator */}
                <div className="md:col-span-3 flex items-center justify-start md:justify-end">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      item.status === "Selesai"
                        ? "bg-surface-container-low text-on-surface-variant border-outline-variant/30"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === "Selesai" ? "bg-status-success" : "bg-primary animate-pulse"
                      }`}
                    />
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 md:pt-0 md:pl-4 border-t md:border-t-0 md:border-l border-outline-variant/30 flex justify-end shrink-0">
                {item.status === "Selesai" ? (
                  <Link
                    href="/screening/results"
                    className="px-5 py-2 border border-primary text-primary hover:bg-primary/5 rounded-full text-sm font-semibold transition-colors w-full md:w-auto text-center"
                  >
                    Lihat Detail
                  </Link>
                ) : (
                  <Link
                    href="/screening/1"
                    className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-full text-sm font-semibold transition-all shadow-sm w-full md:w-auto text-center active:scale-[0.98]"
                  >
                    Lanjutkan
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
