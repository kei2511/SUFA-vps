"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QueueItem {
  id: string;
  name: string;
  condition: string;
  waitTime: string;
  initial: string;
}

interface ActiveSession {
  id: string;
  name: string;
  type: string;
  time: string;
  icon: string;
}

interface Stats {
  completedToday: number;
  totalHandled: number;
  avgDuration: number;
}

export default function KonselorDashboard() {
  const router = useRouter();
  const [status, setStatus] = useState<"online" | "sibuk" | "offline">("online");
  const [counselorName, setCounselorName] = useState("Sarah");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [stats, setStats] = useState<Stats>({ completedToday: 0, totalHandled: 0, avgDuration: 0 });
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchDashboardData = () => {
    fetch("/api/konselor/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.queue) {
          setQueue(data.queue);
          setActiveSessions(data.activeSessions);
          setStats(data.stats);
          setCounselorName(data.counselorName);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll queue every 10 seconds for real-time responsiveness
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptSession = async (sessionId: string) => {
    if (acceptingId) return;
    setAcceptingId(sessionId);

    try {
      const res = await fetch("/api/konselor/session/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/konselor/chat/${sessionId}`);
      } else {
        alert(data.error || "Gagal menerima sesi.");
        setAcceptingId(null);
      }
    } catch (err) {
      console.error("Error accepting session:", err);
      alert("Terjadi kesalahan koneksi.");
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat dasbor konselor...</p>
      </div>
    );
  }

  // Greeting based on time of day
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Selamat Pagi";
    if (hrs < 17) return "Selamat Siang";
    return "Selamat Malam";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            {getGreeting()}, {counselorName}
          </h1>
          <p className="text-lg text-on-surface-variant mt-1">
            Berikut adalah ringkasan aktivitas sesi Anda hari ini.
          </p>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center bg-surface-container-lowest rounded-full border border-outline-variant p-1 gap-1 w-fit">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface-variant">Sesi Selesai Hari Ini</p>
            <span className="material-symbols-outlined text-status-success text-xl">task_alt</span>
          </div>
          <p className="font-heading font-bold text-3xl text-primary mt-2">{stats.completedToday}</p>
          <p className="text-xs text-on-surface-variant mt-1">Status: Terkini</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface-variant">Rata-rata Durasi Sesi</p>
            <span className="material-symbols-outlined text-on-surface-variant text-xl">timer</span>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface mt-2">
            {stats.avgDuration} <span className="text-lg font-normal text-on-surface-variant">mnt</span>
          </p>
          <p className="text-xs text-on-surface-variant mt-1">Sesuai standar layanan</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface-variant">Total Pasien Ditangani</p>
            <span className="material-symbols-outlined text-on-surface-variant text-xl">group</span>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface mt-2">{stats.totalHandled}</p>
          <p className="text-xs text-on-surface-variant mt-1">Berdasarkan data riwayat</p>
        </div>
      </div>

      {/* Queue and Active Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Queue */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-heading font-bold text-lg text-on-surface">
              Antrean Masuk
            </h2>
            <span className="w-6 h-6 rounded-full bg-status-error text-white text-xs font-bold flex items-center justify-center animate-pulse">
              {queue.length}
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-3xl mb-2 text-outline">forum</span>
              <p className="text-sm">Belum ada pasien baru dalam antrean chat saat ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex items-center gap-4 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {patient.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-on-surface">
                      {patient.name}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mt-1 ${
                      patient.condition.includes("Tinggi")
                        ? "bg-status-error/10 text-status-error"
                        : patient.condition.includes("Sedang")
                        ? "bg-status-warning/10 text-status-warning"
                        : "bg-surface-container text-on-surface-variant"
                    }`}>
                      {patient.condition}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {patient.waitTime}
                  </div>
                  <button
                    onClick={() => handleAcceptSession(patient.id)}
                    disabled={acceptingId !== null}
                    className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    {acceptingId === patient.id ? "Memproses..." : "Terima Sesi"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface mb-4">
            Sesi Aktif Anda
          </h2>

          {activeSessions.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-3xl mb-2 text-outline">support_agent</span>
              <p className="text-sm">Tidak ada sesi chat yang sedang berjalan aktif saat ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex items-center gap-4 shadow-sm"
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
                  <div className="flex items-center gap-1 text-xs text-primary font-medium shrink-0">
                    <span className="material-symbols-outlined text-[14px]">
                      {session.icon}
                    </span>
                    {session.time}
                  </div>
                  <Link
                    href={`/konselor/chat/${session.id}`}
                    className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-full text-xs font-semibold hover:bg-surface-container shrink-0"
                  >
                    Buka Chat
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
