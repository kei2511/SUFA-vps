"use client";

import { useState } from "react";
import Link from "next/link";

export default function KonselorDashboard() {
  const [status, setStatus] = useState<"online" | "sibuk" | "offline">("online");

  const queue = [
    { id: 1, name: "Anonim #892", condition: "Depresi Berat", conditionColor: "bg-status-error/10 text-status-error", waitTime: "12 mnt", hasAvatar: true },
    { id: 2, name: "Budi S.", condition: "Cemas Sedang", conditionColor: "bg-status-warning/10 text-status-warning", waitTime: "5 mnt", initial: "B" },
    { id: 3, name: "Dina M.", condition: "Konsultasi Umum", conditionColor: "bg-surface-container text-on-surface-variant", waitTime: "2 mnt", initial: "D" },
  ];

  const activeSessions = [
    { id: 1, name: "Rina K.", type: "Intervensi Lanjutan", time: "20:45", icon: "call" },
    { id: 2, name: "Anonim #412", type: "Curhat Teks", time: "42:10", icon: "chat" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Selamat Pagi, Dr. Sarah
          </h1>
          <p className="text-lg text-on-surface-variant mt-1">
            Berikut adalah ringkasan aktivitas sesi Anda hari ini.
          </p>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center bg-surface-container-lowest rounded-full border border-outline-variant p-1 gap-1">
          {(["online", "sibuk", "offline"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                status === s
                  ? s === "online"
                    ? "bg-status-success/10 text-status-success"
                    : s === "sibuk"
                    ? "bg-status-warning/10 text-status-warning"
                    : "bg-surface-container-high text-outline"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  s === "online"
                    ? "bg-status-success"
                    : s === "sibuk"
                    ? "bg-status-warning"
                    : "bg-outline"
                }`}
              />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">Sesi Selesai Hari Ini</p>
            <span className="material-symbols-outlined text-status-success text-xl">task_alt</span>
          </div>
          <p className="font-heading font-bold text-3xl text-primary mt-2">8</p>
          <p className="text-xs text-status-success mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +2 dari kemarin
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">Rata-rata Durasi Sesi</p>
            <span className="material-symbols-outlined text-on-surface-variant text-xl">timer</span>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface mt-2">
            42 <span className="text-lg font-normal text-on-surface-variant">mnt</span>
          </p>
          <p className="text-xs text-on-surface-variant mt-1">Sesuai target waktu</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">Total Pasien Ditangani</p>
            <span className="material-symbols-outlined text-on-surface-variant text-xl">group</span>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface mt-2">124</p>
          <p className="text-xs text-on-surface-variant mt-1">Sepanjang bulan ini</p>
        </div>
      </div>

      {/* Queue and Active Sessions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Queue */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-heading font-bold text-lg text-on-surface">
              Antrean Masuk
            </h2>
            <span className="w-6 h-6 rounded-full bg-status-error text-white text-xs font-bold flex items-center justify-center">
              {queue.length}
            </span>
            <Link href="#" className="text-sm font-medium text-primary ml-auto">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {queue.map((patient) => (
              <div
                key={patient.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {patient.initial || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface">
                    {patient.name}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${patient.conditionColor}`}>
                    {patient.condition}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-on-surface-variant shrink-0">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Menunggu {patient.waitTime}
                </div>
                <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] shrink-0">
                  Terima Sesi
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface mb-4">
            Sesi Aktif
          </h2>

          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {session.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface">
                    {session.name}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {session.type}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary shrink-0">
                  <span className="material-symbols-outlined text-[14px]">
                    {session.icon}
                  </span>
                  {session.time}
                </div>
                <Link
                  href={`/konselor/chat/${session.id}`}
                  className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-container shrink-0"
                >
                  Buka Chat
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
