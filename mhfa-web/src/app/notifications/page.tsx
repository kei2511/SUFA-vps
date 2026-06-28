"use client";

import { useState } from "react";

interface NotificationItem {
  id: number;
  type: "chat" | "assignment" | "event" | "notice";
  title: string;
  sender: string;
  timeText: string;
  content: string;
  isUnread: boolean;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      type: "chat",
      title: "Pesan Baru dari Dr. Sarah",
      sender: "Dr. Sarah Wijaya",
      timeText: "2 mnt lalu",
      content: "Selamat pagi. Hasil evaluasi awal Anda sudah saya tinjau. Ada beberapa poin yang ingin saya diskusikan pada sesi konsultasi kita besok. Apakah Anda punya waktu luang jam 10 pagi?",
      isUnread: true,
    },
    {
      id: 2,
      type: "assignment",
      title: "Hasil Skrining GAD-7 Tersedia",
      sender: "Sistem MHFA",
      timeText: "1 jam lalu",
      content: "Skrining tingkat kecemasan yang Anda lakukan pada tanggal 12 Oktober telah dianalisis. Silakan lihat laporan lengkapnya untuk memahami kondisi Anda dan rekomendasi langkah selanjutnya.",
      isUnread: true,
    },
    {
      id: 3,
      type: "event",
      title: "Pengingat Jadwal Konsultasi",
      sender: "Sistem MHFA",
      timeText: "Kemarin, 08:00",
      content: "Anda memiliki jadwal konsultasi dengan Psikolog Budi Santoso hari ini pukul 14:00 WIB.",
      isUnread: false,
    },
    {
      id: 4,
      type: "notice",
      title: "Pembaruan Sistem Kebijakan Privasi",
      sender: "Tim MHFA",
      timeText: "10 Okt 2023",
      content: "Kami telah memperbarui Kebijakan Privasi dan Ketentuan Layanan untuk lebih melindungi data medis Anda sesuai dengan regulasi MHFA terbaru. Silakan tinjau perubahan tersebut.",
      isUnread: false,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isUnread: false }))
    );
  };

  const toggleReadStatus = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: !n.isUnread } : n))
    );
  };

  const filtered = notifications.filter(
    (n) => activeTab === "all" || n.isUnread
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between border-b border-outline-variant pb-2">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Notifikasi
          </h1>
          {/* Tabs */}
          <div className="flex gap-6 mt-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`font-heading font-medium text-sm border-b-2 pb-2 px-1 transition-all ${
                activeTab === "all"
                  ? "text-primary border-primary"
                  : "text-on-surface-variant border-transparent hover:text-on-surface"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`font-heading font-medium text-sm border-b-2 pb-2 px-1 transition-all ${
                activeTab === "unread"
                  ? "text-primary border-primary"
                  : "text-on-surface-variant border-transparent hover:text-on-surface"
              }`}
            >
              Belum Dibaca
            </button>
          </div>
        </div>
        <button
          onClick={markAllRead}
          className="text-sm font-semibold text-primary hover:bg-primary/5 px-4 py-2 rounded-full transition-colors mb-2"
        >
          Tandai Semua Dibaca
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-10 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">
              notifications_off
            </span>
            <p>Tidak ada notifikasi.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleReadStatus(item.id)}
              className={`relative bg-surface-container-lowest rounded-xl p-4 flex gap-4 items-start shadow-sm border transition-colors cursor-pointer ${
                item.isUnread
                  ? "border-primary/50 hover:bg-surface-container-low/30"
                  : "border-outline-variant/50 hover:bg-surface-container-low/20 opacity-80"
              }`}
            >
              {item.isUnread && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full" />
              )}

              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                  item.type === "chat"
                    ? "bg-secondary-container text-on-secondary-container"
                    : item.type === "assignment"
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : item.type === "event"
                    ? "bg-primary-fixed text-primary"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined filled text-2xl">
                  {item.type === "chat"
                    ? "chat_bubble"
                    : item.type === "assignment"
                    ? "assignment"
                    : item.type === "event"
                    ? "event"
                    : "notifications"}
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex justify-between items-baseline gap-4 mb-1">
                  <h3 className="font-heading font-semibold text-base text-on-surface truncate">
                    {item.title}
                  </h3>
                  <span className="text-xs font-semibold text-primary shrink-0">
                    {item.timeText}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                  {item.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
