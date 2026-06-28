import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Dashboard Admin
          </h1>
          <p className="text-lg text-on-surface-variant mt-1">
            Pantau aktivitas dan interaksi pengguna secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-container">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Bulan Ini
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98]">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Unduh Laporan
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
              Sesi Konsultasi
            </p>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface mt-2">3,892</p>
          <p className="text-xs text-status-success mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +8% bulan ini
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">group</span>
              Pengguna Aktif
            </p>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface mt-2">8,105</p>
          <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
            Stabil
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">star</span>
              Panduan Populer
            </p>
          </div>
          <p className="font-heading font-bold text-lg text-on-surface mt-2">
            Manajemen Stres
          </p>
          <p className="text-xs text-status-info mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            4,200 kunjungan
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Line Chart Placeholder */}
        <div className="col-span-3 bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg text-on-surface">
              Tren Skrining (Bulan Terakhir)
            </h2>
            <button className="p-1 rounded hover:bg-surface-container">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">more_vert</span>
            </button>
          </div>
          {/* Chart Placeholder */}
          <div className="h-48 bg-gradient-to-b from-primary/5 to-surface-container rounded-lg flex items-end justify-center px-4 pb-4 border border-outline-variant/30">
            <div className="flex items-end gap-2 w-full">
              {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/20 rounded-t"
                    style={{ height: `${h}%` }}
                  >
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: "60%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2 text-center">
            Visualisasi Grafik Garis
          </p>
        </div>

        {/* Donut Chart */}
        <div className="col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <h2 className="font-heading font-semibold text-lg text-on-surface mb-4">
            Distribusi Hasil Skrining
          </h2>

          {/* Donut Chart Placeholder */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E9E9" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#0288D1" strokeWidth="3.5" strokeDasharray="43.8 97.4" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#FBC02D" strokeWidth="3.5" strokeDasharray="34.1 97.4" strokeDashoffset="-43.8" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#D32F2F" strokeWidth="3.5" strokeDasharray="19.5 97.4" strokeDashoffset="-77.9" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading font-bold text-lg text-on-surface">100%</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-info" />
                Ringan
              </span>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-warning" />
                Sedang
              </span>
              <span className="font-medium">35%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-error" />
                Berat
              </span>
              <span className="font-medium">20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-on-surface">
            Aktivitas Skrining Terbaru
          </h2>
          <Link href="/admin/reports" className="text-sm font-medium text-primary">
            Lihat Semua
          </Link>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="pb-3 text-sm font-medium text-on-surface-variant">Waktu</th>
              <th className="pb-3 text-sm font-medium text-on-surface-variant">Jenis Skrining</th>
              <th className="pb-3 text-sm font-medium text-on-surface-variant">Hasil Indikasi</th>
              <th className="pb-3 text-sm font-medium text-on-surface-variant text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { time: "Hari ini, 10:45", type: "SRQ-20", result: "Ringan", color: "status-success" },
              { time: "Hari ini, 09:30", type: "PHQ-9", result: "Sedang", color: "status-warning" },
              { time: "Kemarin, 16:20", type: "GAD-7", result: "Berat", color: "status-error" },
              { time: "Kemarin, 14:15", type: "SRQ-20", result: "Ringan", color: "status-success" },
            ].map((row, idx) => (
              <tr key={idx} className="border-b border-outline-variant/50">
                <td className="py-4 text-on-surface">{row.time}</td>
                <td className="py-4 text-on-surface">{row.type}</td>
                <td className="py-4">
                  <span className={`inline-block px-2.5 py-1 bg-${row.color}/10 text-${row.color} rounded-full text-xs font-medium`}>
                    {row.result}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="p-1 rounded hover:bg-surface-container">
                    <span className="material-symbols-outlined text-on-surface-variant text-xl">chevron_right</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
