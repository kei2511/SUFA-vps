"use client";

import React, { useState, useEffect } from "react";

interface InviteCode {
  id: string;
  code: string;
  role: "Konselor" | "Admin";
  createdAt: string;
  expiresAt: string;
  status: "Belum Digunakan" | "Digunakan" | "Kedaluwarsa";
  usedBy: string | null;
}

export default function AdminInviteCodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [showModal, setShowModal] = useState(false);
  const [codeCount, setCodeCount] = useState(10);
  const [expiry, setExpiry] = useState("7");
  const [codeRole, setCodeRole] = useState<"Konselor" | "Admin">("Konselor");
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = () => {
    fetch("/api/admin/invite-codes")
      .then((res) => res.json())
      .then((data) => {
        if (data.inviteCodes) {
          const mapped: InviteCode[] = data.inviteCodes.map((c: any) => ({
            id: c.id,
            code: c.code,
            role: c.role || "Konselor",
            createdAt: new Date(c.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }) + " WIB",
            expiresAt: new Date(c.expiresAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            }),
            status: c.status,
            usedBy: c.usedBy
          }));
          setCodes(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading codes:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const getStatusStyle = (status: InviteCode["status"]) => {
    switch (status) {
      case "Belum Digunakan":
        return "bg-status-success/10 text-status-success border-status-success/20";
      case "Digunakan":
        return "bg-surface-variant text-on-surface-variant border-outline-variant";
      case "Kedaluwarsa":
        return "bg-status-error/10 text-status-error border-status-error/20";
    }
  };

  const getStatusIcon = (status: InviteCode["status"]) => {
    switch (status) {
      case "Belum Digunakan":
        return null;
      case "Digunakan":
        return "check";
      case "Kedaluwarsa":
        return "error";
    }
  };

  const filtered = codes.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.usedBy && c.usedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "Semua" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCodes = codes.length;
  const unusedCodes = codes.filter((c) => c.status === "Belum Digunakan").length;
  const usedCodes = codes.filter((c) => c.status === "Digunakan").length;
  const expiredCodes = codes.filter((c) => c.status === "Kedaluwarsa").length;

  const handleGenerate = async () => {
    try {
      const res = await fetch("/api/admin/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeCount, expiryDays: expiry, role: codeRole })
      });
      const data = await res.json();
      if (data.success) {
        fetchCodes();
        setShowModal(false);
      } else {
        alert(data.error || "Gagal membuat kode.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat kode undangan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Manajemen Kode Undangan
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola kode undangan untuk Konselor & Admin. Kode bersifat unik dan sekali pakai.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 w-fit active:scale-[0.98] shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Generate Kode Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">tag</span>
            Total Kode
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{totalCodes}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 w-12 h-12 bg-status-success/5 rounded-bl-full" />
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 relative z-10 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-status-success">check_circle</span>
            Belum Digunakan
          </div>
          <p className="font-heading font-bold text-2xl text-status-success relative z-10">{unusedCodes}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">group</span>
            Sudah Digunakan
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{usedCodes}</p>
        </div>
        <div className="bg-surface-container-lowest border border-status-error/20 rounded-xl p-4 bg-status-error/[0.02] shadow-sm">
          <div className="flex items-center gap-2 text-status-error text-xs mb-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Kedaluwarsa
          </div>
          <p className="font-heading font-bold text-2xl text-status-error">{expiredCodes}</p>
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
            placeholder="Cari kode atau pengguna..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(["Semua", "Belum Digunakan", "Digunakan", "Kedaluwarsa"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                <th className="px-6 py-4">Kode Undangan</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4">Batas Kedaluwarsa</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Digunakan Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-all group">
                    <td className="px-6 py-4">
                      <div
                        className={`inline-block px-3 py-1 rounded-md border font-mono font-bold text-sm tracking-widest ${
                          c.status === "Belum Digunakan"
                            ? "bg-surface-container-low border-outline-variant/30 text-on-surface"
                            : c.status === "Digunakan"
                            ? "bg-surface-variant/30 border-transparent text-on-surface-variant line-through decoration-outline-variant"
                            : "bg-surface-variant/30 border-transparent text-on-surface-variant"
                        }`}
                      >
                        {c.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.role === "Admin"
                          ? "bg-status-error/10 text-status-error border-status-error/20"
                          : "bg-status-info/10 text-status-info border-status-info/20"
                      }`}>
                        <span className="material-symbols-outlined text-[12px] filled">
                          {c.role === "Admin" ? "admin_panel_settings" : "support_agent"}
                        </span>
                        {c.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{c.createdAt}</td>
                    <td className={`px-6 py-4 ${c.status === "Kedaluwarsa" ? "text-status-error" : "text-on-surface-variant"}`}>
                      {c.expiresAt}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(c.status)}`}
                      >
                        {getStatusIcon(c.status) && (
                          <span className="material-symbols-outlined text-[14px]">
                            {getStatusIcon(c.status)}
                          </span>
                        )}
                        {c.status === "Belum Digunakan" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                        )}
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.usedBy ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold">
                            {c.usedBy
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="text-on-surface">{c.usedBy}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                      search_off
                    </span>
                    Tidak ada kode yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          {/* Modal Content */}
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md border border-outline-variant overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">qr_code</span>
                </div>
                <h2 className="font-heading font-semibold text-lg text-on-surface">
                  Buat Kode Baru
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Jumlah Kode <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
                    pin
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={codeCount}
                    onChange={(e) => setCodeCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-on-surface"
                  />
                </div>
                <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Maksimal 100 kode per pembuatan.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Masa Berlaku <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
                    calendar_month
                  </span>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-on-surface appearance-none cursor-pointer"
                  >
                    <option value="7">7 Hari (Standar)</option>
                    <option value="14">14 Hari</option>
                    <option value="30">30 Hari</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Role yang Diberikan <span className="text-status-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Konselor", "Admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCodeRole(r)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        codeRole === r
                          ? r === "Admin"
                            ? "bg-status-error/10 border-status-error text-status-error"
                            : "bg-status-info/10 border-status-info text-status-info"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg filled">
                        {r === "Admin" ? "admin_panel_settings" : "support_agent"}
                      </span>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/50">
                <p className="text-xs text-text-muted mb-1">Format Kode yang akan dihasilkan:</p>
                <div className="font-mono font-bold text-lg text-on-surface tracking-widest">
                  MHFA-XXXX
                </div>
                <p className="text-xs text-text-muted mt-1">Role: <strong>{codeRole}</strong></p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface font-medium text-sm hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Generate Kode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
