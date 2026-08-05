"use client";

import React, { useState, useEffect } from "react";

interface ReportStats {
  totalScreenings: number;
  totalConsultations: number;
  highRiskCases: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalScreenings: 0,
    totalConsultations: 0,
    highRiskCases: 0
  });
  const [loading, setLoading] = useState(true);

  // Screening export form
  const [screeningStartDate, setScreeningStartDate] = useState("2026-06-01");
  const [screeningEndDate, setScreeningEndDate] = useState("2026-06-30");
  const [screeningCondition, setScreeningCondition] = useState("Semua Kondisi");
  const [anonymize, setAnonymize] = useState(true);

  // Chat export form
  const [chatStartMonth, setChatStartMonth] = useState("2026-06");
  const [chatEndMonth, setChatEndMonth] = useState("2026-06");
  const [sessionType, setSessionType] = useState("Semua Sesi");

  useEffect(() => {
    fetch("/api/admin/reports/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setStats({
            totalScreenings: data.totalScreenings,
            totalConsultations: data.totalConsultations,
            highRiskCases: data.highRiskCases
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        setLoading(false);
      });
  }, []);

  const handleScreeningExport = () => {
    const url = `/api/admin/reports/export?type=screening&startDate=${screeningStartDate}&endDate=${screeningEndDate}&condition=${encodeURIComponent(screeningCondition)}&anonymize=${anonymize}`;
    window.open(url, "_blank");
  };

  const handleChatExport = () => {
    // Construct year-month strings
    const start = `${chatStartMonth}-01`;
    const end = `${chatEndMonth}-28`; // Safe approximation of end of month
    const url = `/api/admin/reports/export?type=chat&startDate=${start}&endDate=${end}&sessionType=${encodeURIComponent(sessionType)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat laporan admin...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
          Laporan & Ekspor Data
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Kelola, saring, dan unduh laporan aktivitas layanan kesehatan jiwa untuk analisis lebih lanjut.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-muted font-medium">Total Skrining</span>
            <span className="material-symbols-outlined text-primary">assignment</span>
          </div>
          <div className="font-heading font-bold text-3xl text-on-surface">{stats.totalScreenings}</div>
          <div className="text-xs text-on-surface-variant mt-2">
            Hasil tersimpan di database
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-muted font-medium">Konsultasi Selesai</span>
            <span className="material-symbols-outlined text-secondary">forum</span>
          </div>
          <div className="font-heading font-bold text-3xl text-on-surface">{stats.totalConsultations}</div>
          <div className="text-xs text-on-surface-variant mt-2">
            Konsultasi terlayani
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-muted font-medium">Kasus Risiko Tinggi</span>
            <span className="material-symbols-outlined text-status-error">warning</span>
          </div>
          <div className="font-heading font-bold text-3xl text-on-surface">{stats.highRiskCases}</div>
          <div className="text-xs text-on-surface-variant mt-2">
            Membutuhkan perhatian segera
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screening Data Export */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-4">
            <span className="material-symbols-outlined text-primary text-[28px]">analytics</span>
            <h2 className="font-heading font-semibold text-lg text-on-surface">
              Ekspor Data Skrining
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant">Tanggal Mulai</label>
                <input
                  type="date"
                  value={screeningStartDate}
                  onChange={(e) => setScreeningStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-on-surface"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant">Tanggal Akhir</label>
                <input
                  type="date"
                  value={screeningEndDate}
                  onChange={(e) => setScreeningEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-on-surface"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Kondisi / Filter Hasil</label>
              <div className="relative">
                <select
                  value={screeningCondition}
                  onChange={(e) => setScreeningCondition(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-10 rounded-xl border border-outline-variant bg-surface-container text-sm focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-on-surface cursor-pointer"
                >
                  <option>Semua Kondisi</option>
                  <option>Risiko Tinggi (Depresi/Anxiety)</option>
                  <option>Risiko Sedang</option>
                  <option>Risiko Rendah</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Privacy Warning */}
            <div className="bg-surface-container p-4 rounded-xl flex items-start gap-3 border border-outline-variant/50">
              <span className="material-symbols-outlined text-status-warning mt-0.5">
                privacy_tip
              </span>
              <div>
                <p className="text-xs font-semibold text-on-surface mb-1">Peringatan Privasi Data</p>
                <p className="text-xs text-on-surface-variant">
                  Data yang diekspor mengandung informasi medis sensitif. Harap pastikan kepatuhan terhadap pedoman perlindungan data konseli.
                </p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymize}
                    onChange={(e) => setAnonymize(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer accent-[var(--color-primary)]"
                  />
                  <span className="text-xs font-medium text-on-surface">Anonimkan Nama Konseli</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/50">
              <div className="text-xs text-text-muted">
                Status: <strong className="text-on-surface">Siap diekspor</strong>
              </div>
              <button
                onClick={handleScreeningExport}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 active:scale-[0.98] shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Ekspor CSV
              </button>
            </div>
          </div>
        </div>

        {/* Chat Statistics Export */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
          <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-4">
            <span className="material-symbols-outlined text-secondary text-[28px]">question_answer</span>
            <h2 className="font-heading font-semibold text-lg text-on-surface">
              Statistik Konsultasi
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant">Bulan Mulai</label>
                <input
                  type="month"
                  value={chatStartMonth}
                  onChange={(e) => setChatStartMonth(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm focus:border-secondary focus:bg-surface-container-lowest outline-none transition-all text-on-surface"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant">Bulan Akhir</label>
                <input
                  type="month"
                  value={chatEndMonth}
                  onChange={(e) => setChatEndMonth(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm focus:border-secondary focus:bg-surface-container-lowest outline-none transition-all text-on-surface"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Jenis Sesi</label>
              <div className="relative">
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-10 rounded-xl border border-outline-variant bg-surface-container text-sm focus:border-secondary focus:bg-surface-container-lowest outline-none transition-all text-on-surface cursor-pointer"
                >
                  <option>Semua Sesi</option>
                  <option>Chat Teks</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                  arrow_drop_down
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/50 mt-auto">
              <div className="text-xs text-text-muted">
                Status: <strong className="text-on-surface">Siap diekspor</strong>
              </div>
              <button
                onClick={handleChatExport}
                className="bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-all flex items-center gap-2 active:scale-[0.98] shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">table_view</span>
                Ekspor CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
