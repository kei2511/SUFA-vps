import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { screeningSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function PatientDashboard() {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");
  const hostHeader = requestHeaders.get("host") || requestHeaders.get("x-forwarded-host");
  
  console.log("[DEBUG DASHBOARD PAGE] Host:", hostHeader);
  console.log("[DEBUG DASHBOARD PAGE] Cookie present:", !!cookieHeader);
  if (cookieHeader) {
    console.log("[DEBUG DASHBOARD PAGE] Cookie value keys:", cookieHeader.split(";").map(c => c.split("=")[0].trim()));
  }

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  console.log("[DEBUG DASHBOARD PAGE] Session found:", !!session);

  if (!session) {
    redirect("/login");
  }

  const userName = session.user.name || "Pengguna MHFA";

  // Query screening sessions from DB
  const sessions = await db.query.screeningSessions.findMany({
    where: eq(screeningSessions.userId, session.user.id),
    orderBy: [desc(screeningSessions.completedAt)],
  });

  const latestSession = sessions[0];
  const hasSessions = sessions.length > 0;

  // Format date helper
  const formatDateText = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Determine active SUFA steps
  const isRisk = latestSession && (latestSession.conditionLabel === "Risiko Sedang" || latestSession.conditionLabel === "Risiko Tinggi");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Halo, {userName}
          </h1>
          <p className="text-lg text-on-surface-variant mt-1">
            Bagaimana perasaan Anda hari ini? Kami siap membantu.
          </p>
        </div>
        <Link
          href="/screening/start"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] shrink-0 font-sans shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Mulai Skrining Baru
        </Link>
      </div>

      {/* Active Session Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-surface-container rounded-full opacity-50" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-fixed text-primary rounded-full mb-3">
              Sesi Aktif
            </span>
            <h2 className="font-heading font-bold text-xl text-on-surface">
              {!hasSessions
                ? "Mulai Skrining Kesehatan Mental"
                : !isRisk
                ? "Kondisi Mental Anda Stabil"
                : "Skrining Lanjutan (SUFA)"}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {!hasSessions
                ? "Anda belum pernah melakukan skrining."
                : `Sesi terakhir: ${formatDateText(new Date(latestSession.completedAt || latestSession.startedAt))}`}
            </p>
          </div>
          {!hasSessions ? (
            <Link
              href="/screening/start"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container active:scale-[0.98]"
            >
              Mulai Sekarang
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          ) : isRisk ? (
            <Link
              href="/intervention/1"
              className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-on-primary active:scale-[0.98] transition-colors"
            >
              Lanjutkan SUFA
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          ) : (
            <Link
              href="/screening/start"
              className="flex items-center gap-2 px-5 py-2.5 border border-outline text-on-surface-variant rounded-full text-sm font-medium hover:bg-surface-container active:scale-[0.98]"
            >
              Skrining Ulang
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </Link>
          )}
        </div>

        <hr className="my-5 border-outline-variant" />

        {/* SUFA Progress Stepper */}
        <div>
          <p className="text-sm font-medium text-on-surface-variant mb-4">
            Progres Langkah Intervensi:
          </p>
          <div className="flex items-center justify-center gap-0">
            {/* Step 1 - S+U */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                hasSessions ? "bg-status-success text-white" : "bg-primary text-on-primary"
              }`}>
                {hasSessions ? <span className="material-symbols-outlined text-xl">check</span> : "S"}
              </div>
              <p className={`text-xs font-semibold mt-2 text-center max-w-[100px] ${
                hasSessions ? "text-status-success" : "text-primary"
              }`}>
                Screening &<br />Understanding (S+U)
              </p>
            </div>

            {/* Connector 1 */}
            <div className={`w-24 h-1 rounded-full mx-2 -mt-6 ${
              hasSessions && isRisk ? "bg-status-success" : "bg-outline-variant"
            }`} />

            {/* Step 2 - F */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                !hasSessions
                  ? "bg-surface-container-high text-outline border-outline-variant"
                  : isRisk
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-status-success text-white border-status-success"
              }`}>
                {hasSessions && !isRisk ? <span className="material-symbols-outlined text-xl">check</span> : "F"}
              </div>
              <p className={`text-xs font-semibold mt-2 text-center max-w-[100px] ${
                !hasSessions ? "text-outline" : isRisk ? "text-primary" : "text-status-success"
              }`}>
                First Aid (F)
              </p>
            </div>

            {/* Connector 2 */}
            <div className="w-24 h-1 bg-outline-variant rounded-full mx-2 -mt-6" />

            {/* Step 3 - A */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-surface-container-high text-outline flex items-center justify-center font-bold text-sm border border-outline-variant">
                A
              </div>
              <p className="text-xs text-outline font-semibold mt-2 text-center max-w-[100px]">
                Action &<br />Assistance (A)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Screening History */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-on-surface">
            Riwayat Skrining Terakhir
          </h2>
          <Link
            href="/history"
            className="text-sm font-semibold text-primary hover:text-primary-container flex items-center gap-1"
          >
            Lihat Semua
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {!hasSessions ? (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">history</span>
              <p>Belum ada riwayat skrining.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="pb-3 text-sm font-medium text-on-surface-variant">
                    Tanggal
                  </th>
                  <th className="pb-3 text-sm font-medium text-on-surface-variant">
                    Jenis Skrining
                  </th>
                  <th className="pb-3 text-sm font-medium text-on-surface-variant">
                    Hasil Indikasi
                  </th>
                  <th className="pb-3 text-sm font-medium text-on-surface-variant">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sessions.slice(0, 3).map((sess) => {
                  const isSessRisk = sess.conditionLabel === "Risiko Sedang" || sess.conditionLabel === "Risiko Tinggi";
                  return (
                    <tr key={sess.id} className="border-b border-outline-variant/50 last:border-b-0">
                      <td className="py-4 text-on-surface">
                        {formatDateText(new Date(sess.completedAt || sess.startedAt))}
                      </td>
                      <td className="py-4 text-on-surface">
                        Skrining Kesehatan Mental
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isSessRisk ? "bg-status-warning/10 text-status-warning" : "bg-status-success/10 text-status-success"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSessRisk ? "bg-status-warning" : "bg-status-success"}`} />
                          {sess.conditionLabel}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/screening/${sess.id}/result`}
                          className="text-primary hover:underline font-semibold"
                        >
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
