"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HistoryItem {
  id: string;
  type: "screening" | "chat" | "contact";
  title: string;
  dateText: string;
  timestamp: number;
  status: string;
  details: {
    score?: number;
    conditionLabel?: string;
    counselorName?: string | null;
    chatType?: string;
    contactName?: string;
    contactType?: string;
  };
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "screening" | "chat" | "contact">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/history/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.history) {
          const mapped: HistoryItem[] = data.history.map((h: any) => {
            const itemDate = new Date(h.date);
            const dateText = itemDate.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) + " WIB";

            return {
              id: h.id,
              type: h.type,
              title: h.title,
              dateText,
              timestamp: Math.floor(itemDate.getTime() / 1000),
              status: h.status,
              details: h.details || {},
            };
          });
          setHistoryItems(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  // Filtering
  const filtered = historyItems.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.timestamp - a.timestamp;
    }
    return a.timestamp - b.timestamp;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat riwayat aktivitas Anda...</p>
      </div>
    );
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case "screening":
        return {
          icon: "psychology",
          color: "text-primary bg-primary/10 border-primary/20",
        };
      case "chat":
        return {
          icon: "forum",
          color: "text-status-info bg-status-info/10 border-status-info/20",
        };
      case "contact":
        return {
          icon: "contact_phone",
          color: "text-status-success bg-status-success/10 border-status-success/20",
        };
      default:
        return {
          icon: "history",
          color: "text-on-surface-variant bg-surface-container border-outline-variant",
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Riwayat Aktivitas
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
            Pantau hasil skrining, sesi konseling, serta riwayat rujukan profesional kesehatan jiwa Anda.
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
            Semua Riwayat
          </button>
          <button
            onClick={() => setActiveFilter("screening")}
            className={`px-4 py-2 font-medium text-sm rounded-full whitespace-nowrap border transition-all ${
              activeFilter === "screening"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface text-on-surface-variant hover:bg-surface-container-low border-outline-variant"
            }`}
          >
            Skrining Mandiri
          </button>
          <button
            onClick={() => setActiveFilter("chat")}
            className={`px-4 py-2 font-medium text-sm rounded-full whitespace-nowrap border transition-all ${
              activeFilter === "chat"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface text-on-surface-variant hover:bg-surface-container-low border-outline-variant"
            }`}
          >
            Konseling & Curhat
          </button>
          <button
            onClick={() => setActiveFilter("contact")}
            className={`px-4 py-2 font-medium text-sm rounded-full whitespace-nowrap border transition-all ${
              activeFilter === "contact"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface text-on-surface-variant hover:bg-surface-container-low border-outline-variant"
            }`}
          >
            Kontak Profesional
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
            <p>Tidak ada riwayat aktivitas ditemukan.</p>
          </div>
        ) : (
          sorted.map((item) => {
            const badgeMeta = getItemIcon(item.type);
            const isRisk = item.details.conditionLabel === "Risiko Sedang" || item.details.conditionLabel === "Risiko Tinggi";

            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left Side: Icon badge */}
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${badgeMeta.color}`}>
                    <span className="material-symbols-outlined text-2xl">{badgeMeta.icon}</span>
                  </div>

                  {/* Center Content */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Date & Title */}
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

                    {/* Details/Badges */}
                    <div className="md:col-span-7 flex flex-col gap-1">
                      {item.type === "screening" && (
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${
                            isRisk
                              ? "bg-status-warning/10 text-status-warning border-status-warning/20"
                              : "bg-status-success/10 text-status-success border-status-success/20"
                          }`}>
                            <span className="material-symbols-outlined text-[16px] filled">
                              {isRisk ? "warning" : "check_circle"}
                            </span>
                            {item.details.conditionLabel} (Skor: {item.details.score})
                          </span>
                        </div>
                      )}

                      {item.type === "chat" && (
                        <div className="text-sm text-on-surface-variant">
                          {item.details.counselorName ? (
                            <p className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">support_agent</span>
                              Konselor: <strong>{item.details.counselorName}</strong>
                            </p>
                          ) : (
                            <p className="italic text-outline">Konselor belum bergabung</p>
                          )}
                        </div>
                      )}

                      {item.type === "contact" && (
                        <div className="text-sm text-on-surface-variant flex flex-col gap-0.5">
                          <p className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {item.details.contactName}
                          </p>
                          <span className="text-xs text-outline font-medium">
                            Melalui: {item.details.contactType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Status or Action Button */}
                <div className="pt-4 md:pt-0 md:pl-4 border-t md:border-t-0 md:border-l border-outline-variant/30 flex items-center justify-end shrink-0 gap-3">
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

                  {item.type === "screening" && item.status === "Selesai" && (
                    <Link
                      href={`/screening/${item.id}/result`}
                      className="px-4 py-1.5 border border-primary text-primary hover:bg-primary/5 rounded-full text-xs font-semibold transition-colors"
                    >
                      Hasil
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
