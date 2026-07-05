"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  status: string;
}

export default function StartScreeningPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/screening/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.questionnaires && data.questionnaires.length > 0) {
          setQuestionnaires(data.questionnaires);
          setSelectedId(data.questionnaires[0].id);
        }
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching questionnaires:", err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat kuesioner...</p>
      </div>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-status-error text-5xl mb-4">
          error
        </span>
        <h2 className="font-heading font-bold text-xl text-on-surface mb-2">
          Tidak Ada Kuesioner
        </h2>
        <p className="text-on-surface-variant max-w-md mb-6">
          Maaf, belum ada kuesioner skrining yang tersedia saat ini. Silakan hubungi admin.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg filled">
              health_and_safety
            </span>
          </div>
          <span className="font-heading font-semibold text-primary text-sm">
            Layanan Kesehatan Jiwa
          </span>
        </div>
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-xl">
            settings
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl space-y-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-on-surface-variant flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-base">home</span>
              Dashboard
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-medium">Skrining Kesehatan Mental</span>
          </nav>

          {/* Intro Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Visual Area */}
            <div className="md:w-1/3 bg-surface-container-low p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-outline-variant relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-4 relative z-10">
                <span className="material-symbols-outlined text-4xl text-on-primary-container filled">
                  psychology
                </span>
              </div>
              <h2 className="font-heading font-bold text-xl text-on-surface relative z-10">
                Skrining Kesehatan Mental
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 relative z-10">
                Deteksi Dini & Evaluasi Berkala
              </p>
            </div>

            {/* Content Area */}
            <div className="md:w-2/3 p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-6 text-on-surface-variant text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                      timer
                    </span>
                    <span>10-15 Menit</span>
                  </div>
                  <div className="flex items-center gap-2 text-status-success font-medium">
                    <span className="material-symbols-outlined text-lg filled">
                      verified_user
                    </span>
                    <span>Data Terlindungi</span>
                  </div>
                </div>

                {/* Questionnaire Selection */}
                <section>
                  <h3 className="font-heading font-semibold text-lg text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                      assignment
                    </span>
                    Pilih Jenis Skrining
                  </h3>
                  <div className="space-y-3">
                    {questionnaires.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => setSelectedId(q.id)}
                        className={`w-full flex items-start gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
                          selectedId === q.id
                            ? "border-primary bg-primary-fixed/20"
                            : "border-outline-variant hover:border-outline hover:bg-surface-container-low"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedId === q.id
                              ? "border-primary bg-primary"
                              : "border-outline"
                          }`}
                        >
                          {selectedId === q.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{q.title}</p>
                          {q.description && (
                            <p className="text-sm text-on-surface-variant mt-1">{q.description}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-heading font-semibold text-lg text-on-surface mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                      info
                    </span>
                    Tujuan Skrining
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Skrining ini bertujuan untuk membantu Anda mengenali kondisi emosional dan mental Anda saat ini. Hasilnya bukan merupakan diagnosis medis, melainkan langkah awal untuk menentukan apakah Anda memerlukan dukungan lebih lanjut.
                  </p>
                </section>

                <section>
                  <h3 className="font-heading font-semibold text-lg text-on-surface mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                      list_alt
                    </span>
                    Instruksi Pengisian
                  </h3>
                  <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 filled">
                        check_circle
                      </span>
                      <span>
                        Jawablah setiap pertanyaan sejujur mungkin berdasarkan perasaan Anda dalam <strong>2 minggu terakhir</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 filled">
                        check_circle
                      </span>
                      <span>Tidak ada jawaban benar atau salah.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 filled">
                        check_circle
                      </span>
                      <span>Pastikan Anda berada di tempat yang tenang agar dapat fokus.</span>
                    </li>
                  </ul>
                </section>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center gap-4 justify-end">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-primary text-primary font-medium text-sm hover:bg-surface-container-low transition-colors order-2 sm:order-1 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    arrow_back
                  </span>
                  Kembali ke Dashboard
                </Link>
                <Link
                  href={`/screening/${selectedId}`}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary text-on-primary font-medium text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm order-1 sm:order-2 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Mulai Skrining
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Privacy Disclaimer */}
          <div className="flex justify-center items-center gap-3 opacity-70">
            <span className="material-symbols-outlined text-text-muted text-lg">
              shield
            </span>
            <p className="text-xs text-text-muted text-center max-w-md">
              Sistem ini diselenggarakan secara resmi oleh MHFA. Semua data dijaga kerahasiaannya sesuai regulasi privasi data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
