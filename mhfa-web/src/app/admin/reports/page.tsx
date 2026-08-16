"use client";

import React, { useState, useEffect } from "react";

interface ReportStats {
  totalScreenings: number;
  totalConsultations: number;
  highRiskCases: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedCounselorId?: string | null;
  counselorCode?: string | null;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalScreenings: 0,
    totalConsultations: 0,
    highRiskCases: 0
  });
  const [loading, setLoading] = useState(true);

  // Users data for flexible selection
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [counselors, setCounselors] = useState<UserItem[]>([]);
  const [patients, setPatients] = useState<UserItem[]>([]);

  // Flexible Scope Filter
  const [scopeMode, setScopeMode] = useState<"all" | "counselor" | "custom_users">("all");
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [counselorSearch, setCounselorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");

  // Screening export form
  const [screeningStartDate, setScreeningStartDate] = useState("2026-01-01");
  const [screeningEndDate, setScreeningEndDate] = useState("2026-12-31");
  const [screeningCondition, setScreeningCondition] = useState("Semua Kondisi");
  const [anonymize, setAnonymize] = useState(false);

  useEffect(() => {
    // Fetch Stats
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
      })
      .catch((err) => console.error("Error loading stats:", err));

    // Fetch Users list for flexible counselor/konseli selection
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.users) {
          const all: UserItem[] = data.users;
          setUsersList(all);
          const cList = all.filter((u) => u.role === "Konselor");
          const pList = all.filter((u) => u.role === "Konseli");
          setCounselors(cList);
          setPatients(pList);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading users:", err);
        setLoading(false);
      });
  }, []);

  const handleQuickDatePreset = (preset: "all" | "month" | "year") => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    if (preset === "all") {
      setScreeningStartDate("2026-01-01");
      setScreeningEndDate(`${yyyy}-12-31`);
    } else if (preset === "month") {
      setScreeningStartDate(`${yyyy}-${mm}-01`);
      setScreeningEndDate(`${yyyy}-${mm}-${dd}`);
    } else if (preset === "year") {
      setScreeningStartDate(`${yyyy}-01-01`);
      setScreeningEndDate(`${yyyy}-12-31`);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filteredPatients = patients.filter((p) => {
    const q = patientSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredPatients.map((p) => p.id);
    const combined = Array.from(new Set([...selectedUserIds, ...idsToAdd]));
    setSelectedUserIds(combined);
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  const handleScreeningExport = () => {
    let url = `/api/admin/reports/export?type=screening&startDate=${screeningStartDate}&endDate=${screeningEndDate}&condition=${encodeURIComponent(screeningCondition)}&anonymize=${anonymize}`;

    if (scopeMode === "counselor") {
      url += `&counselorId=${encodeURIComponent(selectedCounselorId)}`;
    } else if (scopeMode === "custom_users" && selectedUserIds.length > 0) {
      url += `&userIds=${encodeURIComponent(selectedUserIds.join(","))}`;
    }

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
    <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-0 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
          Laporan Skrining Per Konseli
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Kelola, saring, dan ekspor data hasil skrining per konseli atau per kelompok konselor untuk analisis perkembangan kondisi kesehatan jiwa.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-muted font-medium">Total Skrining Terproses</span>
            <span className="material-symbols-outlined text-primary">assignment</span>
          </div>
          <div className="font-heading font-bold text-3xl text-on-surface">{stats.totalScreenings}</div>
          <div className="text-xs text-on-surface-variant mt-2">
            Hasil tersimpan & siap dianalisis
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
            Membutuhkan tindak lanjut konselor
          </div>
        </div>
      </div>

      {/* Screening Data Export Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]">groups</span>
            <div>
              <h2 className="font-heading font-semibold text-lg text-on-surface">
                Ekspor Hasil Skrining Per Konseli
              </h2>
              <p className="text-xs text-on-surface-variant">
                Fleksibel: Seluruh konseli, per kelompok konselor, atau konseli pilihan
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* 1. FLEXIBLE SCOPE SELECTION */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
              <span>Pilih Lingkup Konseli:</span>
              {scopeMode === "custom_users" && (
                <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {selectedUserIds.length} Konseli Dipilih
                </span>
              )}
            </label>

            <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-xl border border-outline-variant/60">
              <button
                type="button"
                onClick={() => setScopeMode("all")}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  scopeMode === "all"
                    ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm">public</span>
                Semua Konseli
              </button>

              <button
                type="button"
                onClick={() => setScopeMode("counselor")}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  scopeMode === "counselor"
                    ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm">badge</span>
                Per Kelompok
              </button>

              <button
                type="button"
                onClick={() => setScopeMode("custom_users")}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  scopeMode === "custom_users"
                    ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm">checklist</span>
                Pilih Konseli
              </button>
            </div>

            {/* Sub-controls based on scopeMode */}
            {scopeMode === "counselor" && (
              <div className="mt-3 p-3 bg-surface-container/50 border border-outline-variant rounded-xl flex flex-col gap-2 animate-fadeIn">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-medium text-on-surface-variant">Pilih Kelompok / Konselor Pendamping:</label>
                  <span className="text-[11px] text-text-muted">Diurutkan Abjad (A-Z)</span>
                </div>

                {/* Search bar for Counselor Groups */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama konselor atau kode (misal: KSL-B2)..."
                    value={counselorSearch}
                    onChange={(e) => setCounselorSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="relative">
                  <select
                    value={selectedCounselorId}
                    onChange={(e) => setSelectedCounselorId(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:border-primary outline-none transition-all text-on-surface cursor-pointer"
                  >
                    <option value="all">Semua Kelompok Konselor ({patients.length} Konseli Total)</option>
                    {counselors
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .filter((c) => {
                        const q = counselorSearch.toLowerCase();
                        return (
                          c.name.toLowerCase().includes(q) ||
                          (c.counselorCode && c.counselorCode.toLowerCase().includes(q))
                        );
                      })
                      .map((c) => {
                        const count = patients.filter((p) => p.assignedCounselorId === c.id).length;
                        return (
                          <option key={c.id} value={c.id}>
                            Kelompok: {c.name} {c.counselorCode ? `(${c.counselorCode})` : ""} — {count} Konseli
                          </option>
                        );
                      })}
                    <option value="unassigned">
                      Konseli Tanpa Konselor Pendamping ({patients.filter((p) => !p.assignedCounselorId).length} Konseli)
                    </option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                    arrow_drop_down
                  </span>
                </div>
              </div>
            )}

            {scopeMode === "custom_users" && (
              <div className="mt-3 p-3 bg-surface-container/50 border border-outline-variant rounded-xl flex flex-col gap-2 animate-fadeIn">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Cari nama / email konseli..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-[11px] text-primary hover:underline font-medium px-1.5 py-1"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-outline-variant">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-[11px] text-status-error hover:underline font-medium px-1.5 py-1"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="max-h-44 overflow-y-auto border border-outline-variant/70 rounded-lg bg-surface-container-lowest divide-y divide-outline-variant/30">
                  {filteredPatients.length === 0 ? (
                    <p className="p-3 text-xs text-on-surface-variant text-center">Tidak ada konseli ditemukan.</p>
                  ) : (
                    filteredPatients.map((p) => {
                      const isChecked = selectedUserIds.includes(p.id);
                      const assignedC = counselors.find((c) => c.id === p.assignedCounselorId);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between p-2 hover:bg-surface-container/60 cursor-pointer transition-colors ${
                            isChecked ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleUserSelection(p.id)}
                              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer accent-[var(--color-primary)]"
                            />
                            <div>
                              <p className="text-xs font-medium text-on-surface">{p.name}</p>
                              <p className="text-[10px] text-on-surface-variant">{p.email}</p>
                            </div>
                          </div>
                          {assignedC && (
                            <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                              {assignedC.name}
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. DATE RANGE & PRESETS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-on-surface-variant">Rentang Tanggal Skrining:</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDatePreset("month")}
                  className="px-2 py-0.5 text-[11px] rounded-md border border-outline-variant hover:bg-surface-container text-on-surface"
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDatePreset("year")}
                  className="px-2 py-0.5 text-[11px] rounded-md border border-outline-variant hover:bg-surface-container text-on-surface"
                >
                  Tahun Ini
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDatePreset("all")}
                  className="px-2 py-0.5 text-[11px] rounded-md border border-outline-variant hover:bg-surface-container text-on-surface"
                >
                  Semua
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-on-surface-variant">Mulai</span>
                <input
                  type="date"
                  value={screeningStartDate}
                  onChange={(e) => setScreeningStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container text-xs focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-on-surface"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-on-surface-variant">Akhir</span>
                <input
                  type="date"
                  value={screeningEndDate}
                  onChange={(e) => setScreeningEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container text-xs focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* 3. CONDITION FILTER */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Tingkat Risiko Hasil:</label>
            <div className="relative">
              <select
                value={screeningCondition}
                onChange={(e) => setScreeningCondition(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-10 rounded-xl border border-outline-variant bg-surface-container text-xs focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-on-surface cursor-pointer"
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

          {/* 4. PRIVACY OPTION */}
          <div className="bg-surface-container p-3 rounded-xl flex items-start gap-2.5 border border-outline-variant/50">
            <span className="material-symbols-outlined text-status-warning text-[18px] mt-0.5">
              privacy_tip
            </span>
            <div>
              <p className="text-xs font-semibold text-on-surface">Privasi Data Konseli</p>
              <label className="flex items-center gap-2 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymize}
                  onChange={(e) => setAnonymize(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer accent-[var(--color-primary)]"
                />
                <span className="text-[11px] text-on-surface-variant">Anonimkan Nama & Email Konseli</span>
              </label>
            </div>
          </div>

          {/* EXPORT ACTION BUTTON */}
          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/50">
            <div className="text-xs text-text-muted">
              Format: <strong className="text-on-surface">Excel CSV (UTF-8)</strong>
            </div>
            <button
              onClick={handleScreeningExport}
              disabled={scopeMode === "custom_users" && selectedUserIds.length === 0}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Unduh Laporan Skrining
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

