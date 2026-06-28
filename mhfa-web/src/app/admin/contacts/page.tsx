"use client";

import React, { useState } from "react";

interface Contact {
  id: string;
  name: string;
  institution: string;
  specialization: string;
  phone: string;
  schedule: string;
  scheduleDays: string;
  status: "Tersedia" | "Sibuk" | "Tidak Aktif";
  type: "whatsapp" | "hotline";
}

export default function AdminContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "c1",
      name: "Dr. Andi Setiawan, Sp.KJ",
      institution: "Klinik Sehat Mental",
      specialization: "Psikiater Klinis",
      phone: "+62 812-3456-7890",
      schedule: "08:00 - 16:00",
      scheduleDays: "Senin - Jumat",
      status: "Tersedia",
      type: "whatsapp",
    },
    {
      id: "c2",
      name: "Budi Pratama, M.Psi",
      institution: "Puskesmas Kebayoran",
      specialization: "Psikolog Anak",
      phone: "+62 856-7890-1234",
      schedule: "09:00 - 15:00",
      scheduleDays: "Senin - Kamis",
      status: "Sibuk",
      type: "whatsapp",
    },
    {
      id: "c3",
      name: "Dr. Sarah Anindita, M.Psi",
      institution: "RS Jiwa Dr. Soeharto Heerdjan",
      specialization: "Psikolog Klinis Dewasa",
      phone: "+62 821-9876-5432",
      schedule: "10:00 - 18:00",
      scheduleDays: "Selasa - Sabtu",
      status: "Tersedia",
      type: "whatsapp",
    },
    {
      id: "c4",
      name: "Layanan Darurat 119",
      institution: "MHFA",
      specialization: "Krisis Suisidal",
      phone: "119 ext. 8",
      schedule: "24 Jam",
      scheduleDays: "Setiap Hari",
      status: "Tersedia",
      type: "hotline",
    },
    {
      id: "c5",
      name: "Into The Light Indonesia",
      institution: "Komunitas Pencegahan Bunuh Diri",
      specialization: "Konseling Krisis",
      phone: "+62 811-1500-454",
      schedule: "09:00 - 21:00",
      scheduleDays: "Senin - Minggu",
      status: "Tersedia",
      type: "whatsapp",
    },
  ]);

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "Tersedia":
        return "bg-status-success/10 text-status-success";
      case "Sibuk":
        return "bg-status-warning/10 text-status-warning";
      case "Tidak Aktif":
        return "bg-surface-variant text-on-surface-variant";
    }
  };

  const getStatusDot = (status: Contact["status"]) => {
    switch (status) {
      case "Tersedia":
        return "bg-status-success";
      case "Sibuk":
        return "bg-status-warning";
      case "Tidak Aktif":
        return "bg-outline";
    }
  };

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextStatus: Record<Contact["status"], Contact["status"]> = {
          Tersedia: "Sibuk",
          Sibuk: "Tidak Aktif",
          "Tidak Aktif": "Tersedia",
        };
        return { ...c, status: nextStatus[c.status] };
      })
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Manajemen Kontak Profesional
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola daftar psikolog, psikiater, dan layanan krisis darurat.
          </p>
        </div>
        <button className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 w-fit active:scale-[0.98] shadow-sm">
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Kontak
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">contacts</span>
            Total Kontak
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{contacts.length}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Tersedia
          </div>
          <p className="font-heading font-bold text-2xl text-status-success">
            {contacts.filter((c) => c.status === "Tersedia").length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Sibuk
          </div>
          <p className="font-heading font-bold text-2xl text-status-warning">
            {contacts.filter((c) => c.status === "Sibuk").length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">emergency</span>
            Hotline
          </div>
          <p className="font-heading font-bold text-2xl text-status-error">
            {contacts.filter((c) => c.type === "hotline").length}
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
            placeholder="Cari nama atau spesialisasi..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(["Semua", "Tersedia", "Sibuk", "Tidak Aktif"] as const).map((s) => (
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
                <th className="px-6 py-4">Nama / Institusi</th>
                <th className="px-6 py-4">Spesialisasi</th>
                <th className="px-6 py-4">Jam Operasional</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.type === "hotline" ? (
                          <div className="w-9 h-9 rounded-lg bg-status-error/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-status-error text-[18px]">
                              emergency
                            </span>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-xs">
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface truncate max-w-[240px]">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-outline">{c.institution}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                        {c.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface text-sm">{c.schedule}</div>
                      <div className="text-[10px] text-text-muted">{c.scheduleDays}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(c.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)} cursor-pointer transition-all hover:opacity-80`}
                        title="Klik untuk mengubah status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(c.status)}`} />
                        {c.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all active:scale-[0.97]"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center p-1.5 text-status-error hover:bg-status-error/10 rounded-lg transition-all active:scale-[0.97]"
                          title="Hapus Kontak"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                      search_off
                    </span>
                    Tidak ada kontak yang sesuai pencarian.
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
