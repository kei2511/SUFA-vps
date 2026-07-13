import Link from "next/link";
import { db } from "@/db";
import { screeningSessions, user, chatSessions, guides } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "Admin") {
    redirect("/login");
  }

  // 1. Total Sesi Konsultasi (Chats)
  const totalChats = await db.select({ count: sql<number>`count(*)::int` }).from(chatSessions);
  const totalConsultations = totalChats[0]?.count || 0;

  // 2. Total Pengguna Aktif (role: Pasien)
  const totalPatients = await db.select({ count: sql<number>`count(*)::int` }).from(user).where(eq(user.role, "Pasien"));
  const activeUsersCount = totalPatients[0]?.count || 0;

  // 3. Panduan Populer (fetch first active guide)
  const firstActiveGuide = await db.query.guides.findFirst({
    where: eq(guides.status, "Aktif"),
  });
  const popularGuideTitle = firstActiveGuide?.title || "Manajemen Stres";

  // 4. Screening Results Distribution
  const distribution = await db.select({
    condition: screeningSessions.conditionLabel,
    count: sql<number>`count(*)::int`
  }).from(screeningSessions).groupBy(screeningSessions.conditionLabel);

  const totalScreenings = distribution.reduce((sum, item) => sum + item.count, 0) || 1;
  const countRendah = distribution.find(d => d.condition === "Risiko Rendah")?.count || 0;
  const countSedang = distribution.find(d => d.condition === "Risiko Sedang")?.count || 0;
  const countTinggi = distribution.find(d => d.condition === "Risiko Tinggi")?.count || 0;

  // Calculate percentages
  let pctRendah = Math.round((countRendah / totalScreenings) * 100);
  let pctSedang = Math.round((countSedang / totalScreenings) * 100);
  let pctTinggi = Math.round((countTinggi / totalScreenings) * 100);

  // Fallback to 100% total if rounded percentages don't add up to 100, only if total is greater than 0
  const totalPct = pctRendah + pctSedang + pctTinggi;
  if (totalPct > 0 && totalPct !== 100) {
    if (pctRendah >= pctSedang && pctRendah >= pctTinggi) pctRendah += (100 - totalPct);
    else if (pctSedang >= pctRendah && pctSedang >= pctTinggi) pctSedang += (100 - totalPct);
    else pctTinggi += (100 - totalPct);
  }

  // Circle circumference is 2 * PI * 15.5 ≈ 97.4
  const circ = 97.4;
  const dashRendah = (pctRendah / 100) * circ;
  const dashSedang = (pctSedang / 100) * circ;
  const dashTinggi = (pctTinggi / 100) * circ;

  const offsetRendah = 0;
  const offsetSedang = -dashRendah;
  const offsetTinggi = -(dashRendah + dashSedang);

  // 5. Recent Screening Activities (last 5)
  const recentScreenings = await db.query.screeningSessions.findMany({
    orderBy: [desc(screeningSessions.completedAt)],
    limit: 5,
  });

  const recentList = await Promise.all(
    recentScreenings.map(async (sess) => {
      const patient = await db.query.user.findFirst({
        where: eq(user.id, sess.userId),
      });

      const completedDate = new Date(sess.completedAt || sess.startedAt);
      const timeText = completedDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

      return {
        id: sess.id,
        time: timeText,
        type: "Skrining Mandiri",
        name: patient?.name || "Pasien Anonim",
        result: sess.conditionLabel,
      };
    })
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Dashboard Admin
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pantau aktivitas dan interaksi pengguna secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all shadow-sm w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Kelola Laporan
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
              Sesi Konsultasi
            </p>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface mt-2">{totalConsultations}</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Total sesi konseling di database
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[18px]">group</span>
              Pengguna Terdaftar
            </p>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface mt-2">{activeUsersCount}</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Jumlah pasien terdaftar
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[18px]">star</span>
              Panduan Edukasi
            </p>
          </div>
          <p className="font-heading font-bold text-lg text-on-surface mt-2 truncate">
            {popularGuideTitle}
          </p>
        </div>
      </div>

      {/* Menu Administrasi (Sangat berguna terutama pada tampilan mobile) */}
      <div className="space-y-3">
        <h2 className="font-heading font-semibold text-lg text-on-surface">
          Menu Administrasi
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              title: "Manajemen User",
              description: "Kelola akun & peran",
              icon: "group",
              href: "/admin/users",
              color: "text-primary bg-primary/10",
            },
            {
              title: "Kuesioner",
              description: "Atur kuesioner skrining",
              icon: "quiz",
              href: "/admin/questionnaires",
              color: "text-secondary bg-secondary/10",
            },
            {
              title: "Panduan",
              description: "Kelola konten edukasi",
              icon: "menu_book",
              href: "/admin/guides",
              color: "text-tertiary bg-tertiary/10",
            },
            {
              title: "Kontak",
              description: "Layanan rujukan medis",
              icon: "contacts",
              href: "/admin/contacts",
              color: "text-status-success bg-status-success/10",
            },
            {
              title: "Invite Code",
              description: "Kode daftar baru",
              icon: "vpn_key",
              href: "/admin/invite-codes",
              color: "text-status-warning bg-status-warning/10",
            },
            {
              title: "Laporan",
              description: "Ekspor data & laporan",
              icon: "assessment",
              href: "/admin/reports",
              color: "text-status-error bg-status-error/10",
            },
          ].map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="bg-surface-container-lowest border border-outline-variant hover:border-primary/40 rounded-xl p-4 flex flex-col items-start gap-3 shadow-sm hover:shadow transition-all active:scale-[0.98] group"
            >
              <div className={`p-2 rounded-lg ${menu.color} group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-[24px] block">
                  {menu.icon}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-semibold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                  {menu.title}
                </h3>
                <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                  {menu.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Trend Info Card */}
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg text-on-surface">
              Ringkasan Data Skrining
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Total riwayat pengisian skrining oleh pasien yang tercatat.
            </p>
          </div>
          <div className="my-8 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-primary">
              {totalScreenings === 1 && countRendah === 0 && countSedang === 0 && countTinggi === 0 ? 0 : totalScreenings}
            </span>
            <span className="text-sm font-semibold text-on-surface-variant">Sesi Skrining</span>
          </div>
          <div className="border-t border-outline-variant/50 pt-4 flex justify-between items-center text-xs text-on-surface-variant">
            <span>Status Database: Berjalan Baik</span>
            <Link href="/admin/reports" className="text-primary font-semibold hover:underline">
              Lihat Detail Laporan &rarr;
            </Link>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
          <h2 className="font-heading font-semibold text-lg text-on-surface mb-4">
            Distribusi Hasil Skrining
          </h2>

          {/* Donut Chart */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E9E9" strokeWidth="3.5" />
                {pctRendah > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--color-status-success, #2E7D32)"
                    strokeWidth="3.5"
                    strokeDasharray={`${dashRendah} ${circ}`}
                    strokeDashoffset={offsetRendah}
                    strokeLinecap="round"
                  />
                )}
                {pctSedang > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--color-status-warning, #EF6C00)"
                    strokeWidth="3.5"
                    strokeDasharray={`${dashSedang} ${circ}`}
                    strokeDashoffset={offsetSedang}
                    strokeLinecap="round"
                  />
                )}
                {pctTinggi > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--color-status-error, #C62828)"
                    strokeWidth="3.5"
                    strokeDasharray={`${dashTinggi} ${circ}`}
                    strokeDashoffset={offsetTinggi}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading font-extrabold text-2xl text-on-surface">
                  {totalScreenings === 1 && countRendah === 0 ? 0 : totalScreenings}
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Total</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-success" />
                Risiko Rendah
              </span>
              <span className="font-semibold text-on-surface">{pctRendah}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-warning" />
                Risiko Sedang
              </span>
              <span className="font-semibold text-on-surface">{pctSedang}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-error" />
                Risiko Tinggi
              </span>
              <span className="font-semibold text-on-surface">{pctTinggi}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-on-surface">
            Aktivitas Skrining Terbaru
          </h2>
          <Link href="/admin/reports" className="text-sm font-medium text-primary hover:underline">
            Lihat Semua
          </Link>
        </div>

        {recentList.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">assignment</span>
            <p>Belum ada aktivitas skrining terbaru.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="pb-3 text-sm font-medium text-on-surface-variant">Waktu</th>
                  <th className="pb-3 text-sm font-medium text-on-surface-variant">Nama Pasien</th>
                  <th className="pb-3 text-sm font-medium text-on-surface-variant">Hasil Indikasi</th>
                  <th className="pb-3 text-sm font-medium text-on-surface-variant text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentList.map((row) => {
                  const isSessRisk = row.result === "Risiko Sedang" || row.result === "Risiko Tinggi";
                  return (
                    <tr key={row.id} className="border-b border-outline-variant/50 last:border-b-0">
                      <td className="py-4 text-on-surface">{row.time}</td>
                      <td className="py-4 text-on-surface font-semibold">{row.name}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isSessRisk ? "bg-status-warning/10 text-status-warning" : "bg-status-success/10 text-status-success"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSessRisk ? "bg-status-warning" : "bg-status-success"}`} />
                          {row.result}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href={`/screening/${row.id}/result`}
                          className="inline-flex items-center justify-center p-1 rounded hover:bg-surface-container text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-outline-variant/30 text-sm">
              {recentList.map((row) => {
                const isSessRisk = row.result === "Risiko Sedang" || row.result === "Risiko Tinggi";
                return (
                  <div key={row.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">{row.name}</p>
                      <p className="text-[10px] text-outline">{row.time}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isSessRisk ? "bg-status-warning/10 text-status-warning" : "bg-status-success/10 text-status-success"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${isSessRisk ? "bg-status-warning" : "bg-status-success"}`} />
                        {row.result}
                      </span>
                      <Link
                        href={`/screening/${row.id}/result`}
                        className="inline-flex items-center justify-center p-1.5 rounded hover:bg-surface-container text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
