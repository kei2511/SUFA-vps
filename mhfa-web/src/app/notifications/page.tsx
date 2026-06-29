"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  type: "chat" | "assignment" | "event" | "notice";
  title: string;
  sender: string;
  timeText: string;
  content: string;
  isUnread: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        const formatted = data.notifications.map((n: any) => {
          // Format time relative or simple string
          const createdDate = new Date(n.createdAt);
          const now = new Date();
          const diffMs = now.getTime() - createdDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHrs = Math.floor(diffMins / 60);

          let timeText = "Baru saja";
          if (diffMins > 0 && diffMins < 60) {
            timeText = `${diffMins} mnt lalu`;
          } else if (diffHrs > 0 && diffHrs < 24) {
            timeText = `${diffHrs} jam lalu`;
          } else if (diffHrs >= 24) {
            timeText = createdDate.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric"
            });
          }

          return {
            id: n.id,
            type: n.type,
            title: n.title,
            sender: n.sender,
            timeText,
            content: n.content,
            isUnread: n.isUnread
          };
        });
        setNotificationsList(formatted);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res?.data?.user) {
        fetchNotifications();
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setNotificationsList((prev) =>
          prev.map((notif) => ({ ...notif, isUnread: false }))
        );
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const toggleReadStatus = async (id: string, currentUnread: boolean) => {
    // If it's already read, we do not need to call the server to mark it read again.
    if (!currentUnread) return;

    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id })
      });
      const data = await res.json();
      if (data.success) {
        setNotificationsList((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
        );
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const filtered = notificationsList.filter(
    (n) => activeTab === "all" || n.isUnread
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat notifikasi...</p>
      </div>
    );
  }

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
              onClick={() => toggleReadStatus(item.id, item.isUnread)}
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
