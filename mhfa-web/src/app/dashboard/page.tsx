import Link from "next/link";

export default function PatientDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
            Halo, Nama Pengguna
          </h1>
          <p className="text-lg text-on-surface-variant mt-1">
            Bagaimana perasaan Anda hari ini? Kami siap membantu.
          </p>
        </div>
        <Link
          href="/screening/start"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] shrink-0"
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
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-fixed text-primary rounded-full mb-3">
              Sesi Aktif
            </span>
            <h2 className="font-heading font-bold text-xl text-on-surface">
              Skrining Lanjutan (SUFA)
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Sesi terakhir: 24 Jam yang lalu
            </p>
          </div>
          <Link
            href="/intervention/1"
            className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-on-primary active:scale-[0.98]"
          >
            Lanjutkan
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>

        <hr className="my-5 border-outline-variant" />

        {/* SUFA Progress Stepper */}
        <div>
          <p className="text-sm font-medium text-on-surface-variant mb-4">
            Progres Saat Ini:
          </p>
          <div className="flex items-center justify-center gap-0">
            {/* Step 1 - Completed */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-status-success text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">check</span>
              </div>
              <p className="text-xs text-status-success font-medium mt-2 text-center max-w-[100px]">
                Screening &<br />Understanding (S+U)
              </p>
            </div>

            {/* Connector */}
            <div className="w-24 h-1 bg-status-success rounded-full mx-2 -mt-6" />

            {/* Step 2 - Active */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                F
              </div>
              <p className="text-xs text-primary font-medium mt-2 text-center max-w-[100px]">
                First Aid (F)
              </p>
            </div>

            {/* Connector */}
            <div className="w-24 h-1 bg-outline-variant rounded-full mx-2 -mt-6" />

            {/* Step 3 - Locked */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-surface-container-high text-outline flex items-center justify-center font-bold text-sm border border-outline-variant">
                A
              </div>
              <p className="text-xs text-outline font-medium mt-2 text-center max-w-[100px]">
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
            className="text-sm font-medium text-primary hover:text-primary-container flex items-center gap-1"
          >
            Lihat Semua
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                  Status Rekomendasi
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-outline-variant/50">
                <td className="py-4 text-on-surface">12 Okt 2023</td>
                <td className="py-4 text-on-surface">
                  Skrining Awal (Kesehatan Mental)
                </td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-warning/10 text-status-warning rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-warning" />
                    Gejala Sedang
                  </span>
                </td>
                <td className="py-4 text-on-surface">Konsultasi Dijadwalkan</td>
              </tr>
              <tr className="border-b border-outline-variant/50">
                <td className="py-4 text-on-surface">05 Sep 2023</td>
                <td className="py-4 text-on-surface">Tindak Lanjut Evaluasi</td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-success/10 text-status-success rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                    Normal / Stabil
                  </span>
                </td>
                <td className="py-4 text-on-surface">Selesai</td>
              </tr>
              <tr>
                <td className="py-4 text-on-surface">10 Jan 2023</td>
                <td className="py-4 text-on-surface">
                  Skrining Awal (Kesehatan Mental)
                </td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-info/10 text-status-info rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-info" />
                    Pemantauan Rutin
                  </span>
                </td>
                <td className="py-4 text-on-surface">Selesai</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
