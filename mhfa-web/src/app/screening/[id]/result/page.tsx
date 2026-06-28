import Link from "next/link";

export default function ScreeningResultPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-lg filled">
            health_and_safety
          </span>
        </div>
        <span className="font-heading font-semibold text-primary text-sm">
          Layanan Kesehatan Jiwa
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Result Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-status-warning/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-status-warning text-4xl">
                warning
              </span>
            </div>

            <span className="inline-block px-4 py-1.5 bg-status-warning/10 text-status-warning rounded-full text-sm font-semibold mb-3">
              Tingkat Sedang
            </span>

            <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">
              Indikasi Kecemasan Sedang
            </h1>

            <p className="text-sm text-on-surface-variant">
              Skrining pada 12 Oktober 2023, 14:30 WIB
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="font-heading font-semibold text-lg text-on-surface mb-3">
              Tentang Kondisi Anda
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed mb-4">
              Hasil skrining menunjukkan adanya tanda-tanda kecemasan pada
              tingkat sedang. Anda mungkin mengalami kekhawatiran berlebihan,
              kesulitan tidur, atau ketegangan fisik yang mengganggu aktivitas
              sehari-hari. Kondisi ini umum terjadi dan dapat ditangani dengan
              dukungan yang tepat.
            </p>
            <div className="flex items-start gap-3 bg-surface-container rounded-lg px-4 py-3">
              <span className="material-symbols-outlined text-status-info text-xl shrink-0 mt-0.5">
                info
              </span>
              <p className="text-sm text-on-surface-variant">
                Hasil ini bukan diagnosis medis. Gunakan sebagai panduan awal
                untuk mencari dukungan profesional.
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="font-heading font-semibold text-lg text-on-surface mb-3">
              Langkah Selanjutnya
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed mb-6">
              Kami menyediakan program intervensi SUFA (Sadari, Utarakan,
              Fasilitasi, Arahkan) yang terstruktur untuk membantu Anda. Program
              ini terdiri dari 3 langkah yang akan membimbing Anda mendapatkan
              dukungan yang sesuai.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/intervention/1"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98]"
              >
                Mulai Intervensi SUFA
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-5 py-3 border border-outline-variant text-on-surface-variant rounded-full text-sm font-medium hover:bg-surface-container"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
