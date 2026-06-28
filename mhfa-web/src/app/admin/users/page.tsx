"use client";

import React, { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Pasien" | "Konselor" | "Admin";
  status: "Aktif" | "Nonaktif";
  joinedAt: string;
  lastLogin: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Semua Peran");
  const [statusFilter, setStatusFilter] = useState<string>("Semua Status");

  const [users, setUsers] = useState<User[]>([
    {
      id: "u1",
      name: "Ahmad Jhoni",
      email: "ahmad.j@email.com",
      role: "Pasien",
      status: "Aktif",
      joinedAt: "12 Okt 2025",
      lastLogin: "Hari ini, 09:41",
    },
    {
      id: "u2",
      name: "Dr. Sarah Wijaya",
      email: "sarah.w@klinik.id",
      role: "Konselor",
      status: "Aktif",
      joinedAt: "05 Sep 2025",
      lastLogin: "Kemarin, 16:30",
    },
    {
      id: "u3",
      name: "Budi Wibowo",
      email: "budi.w@email.com",
      role: "Pasien",
      status: "Nonaktif",
      joinedAt: "20 Agu 2025",
      lastLogin: "15 Sep 2025",
    },
    {
      id: "u4",
      name: "Admin MHFA",
      email: "admin@mhfa.go.id",
      role: "Admin",
      status: "Aktif",
      joinedAt: "01 Jan 2025",
      lastLogin: "Hari ini, 08:00",
    },
    {
      id: "u5",
      name: "Dewi Lestari, M.Psi",
      email: "dewi.l@rs-jiwa.id",
      role: "Konselor",
      status: "Aktif",
      joinedAt: "15 Jul 2025",
      lastLogin: "Hari ini, 10:22",
    },
    {
      id: "u6",
      name: "Rina Susanti",
      email: "rina.s@email.com",
      role: "Pasien",
      status: "Aktif",
      joinedAt: "28 Nov 2025",
      lastLogin: "2 hari lalu",
    },
  ]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getRoleStyle = (role: User["role"]) => {
    switch (role) {
      case "Admin":
        return "bg-tertiary/10 text-tertiary border-tertiary/20";
      case "Konselor":
        return "bg-primary/10 text-primary border-primary/20";
      case "Pasien":
      default:
        return "bg-surface-container-high text-on-surface-variant border-outline-variant";
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "Semua Peran" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "Semua Status" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Aktif" ? "Nonaktif" : "Aktif" }
          : u
      )
    );
    setOpenMenuId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola data pasien, konselor, dan administrator sistem.
          </p>
        </div>
        <button className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 w-fit active:scale-[0.98] shadow-sm">
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">group</span>
            Total Pengguna
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{users.length}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">person</span>
            Pasien
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">
            {users.filter((u) => u.role === "Pasien").length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">medical_services</span>
            Konselor
          </div>
          <p className="font-heading font-bold text-2xl text-primary">
            {users.filter((u) => u.role === "Konselor").length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">toggle_on</span>
            Aktif
          </div>
          <p className="font-heading font-bold text-2xl text-status-success">
            {users.filter((u) => u.status === "Aktif").length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, email, atau NIK..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative min-w-[140px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer text-on-surface"
            >
              <option>Semua Peran</option>
              <option>Pasien</option>
              <option>Konselor</option>
              <option>Admin</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              arrow_drop_down
            </span>
          </div>
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer text-on-surface"
            >
              <option>Semua Status</option>
              <option>Aktif</option>
              <option>Nonaktif</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              arrow_drop_down
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                <th className="px-6 py-4">Nama & Email</th>
                <th className="px-6 py-4">Peran</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Tanggal Bergabung</th>
                <th className="px-6 py-4">Login Terakhir</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            u.role === "Konselor"
                              ? "bg-secondary-container text-on-secondary-container"
                              : u.role === "Admin"
                              ? "bg-tertiary/10 text-tertiary"
                              : u.status === "Nonaktif"
                              ? "bg-surface-container-high text-outline"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface truncate max-w-[200px]">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleStyle(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.status === "Aktif"
                            ? "bg-status-success/10 text-status-success border border-status-success/20"
                            : "bg-surface-variant text-on-surface-variant border border-outline-variant"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === "Aktif" ? "bg-status-success" : "bg-outline"
                          }`}
                        />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{u.joinedAt}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{u.lastLogin}</td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        className="p-2 text-outline hover:text-primary rounded-full hover:bg-primary/5 transition-colors"
                        onClick={() =>
                          setOpenMenuId(openMenuId === u.id ? null : u.id)
                        }
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {openMenuId === u.id && (
                        <div className="absolute right-8 top-12 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1 z-10">
                          <button className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Edit Profil
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                            Reset Password
                          </button>
                          <div className="border-t border-outline-variant my-1" />
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className="w-full text-left px-4 py-2 text-sm text-status-error hover:bg-status-error/5 flex items-center gap-2 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {u.status === "Aktif" ? "block" : "check_circle"}
                            </span>
                            {u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </div>
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
                    Tidak ada pengguna yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-surface-container-lowest border-t border-outline-variant px-6 py-4 flex items-center justify-between text-sm text-on-surface-variant">
          <span>
            Menampilkan 1 hingga {filtered.length} dari {users.length} pengguna
          </span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
              Sebelumnya
            </button>
            <button className="px-3 py-1.5 border border-primary bg-primary/10 text-primary rounded-lg font-medium">
              1
            </button>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
