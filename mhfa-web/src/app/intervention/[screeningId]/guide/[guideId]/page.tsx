"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface InstructionStep {
  title: string;
  desc: string[];
  tip?: string;
}

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const screeningId = params?.screeningId || "1";
  const guideId = params?.guideId || "breathing-478";

  // Mock instruction steps
  const steps: InstructionStep[] = [
    {
      title: "Persiapan Posisi",
      desc: [
        "Temukan posisi duduk yang nyaman dengan punggung lurus, atau berbaringlah di tempat tenang.",
        "Pastikan punggung Anda lurus untuk memberikan ruang yang optimal bagi paru-paru Anda mengembang.",
      ],
      tip: "Letakkan ujung lidah Anda di langit-langit mulut, tepat di belakang gigi depan atas Anda, dan pertahankan posisi ini selama latihan.",
    },
    {
      title: "Keluarkan Udara Sepenuhnya",
      desc: [
        "Buang napas sepenuhnya melalui mulut Anda, buat suara desis (whoosh).",
        "Kosongkan paru-paru Anda dari udara kotor secara total.",
      ],
    },
    {
      title: "Tarik Napas (4 Detik)",
      desc: [
        "Tutup mulut Anda dan tarik napas pelan-pelan melalui hidung dalam hati sampai hitungan ke-4.",
        "Fokus pada rasa sejuk udara yang masuk memenuhi dada dan perut Anda.",
      ],
    },
    {
      title: "Tahan Napas (7 Detik)",
      desc: [
        "Tahan napas Anda selama 7 detik.",
        "Pertahankan ketenangan tubuh dan pikiran Anda selama jeda menahan napas ini.",
      ],
      tip: "Jika menahan napas 7 detik terlalu lama di awal, Anda bisa mempercepat tempo hitungan secara konsisten.",
    },
    {
      title: "Hembuskan Napas (8 Detik)",
      desc: [
        "Hembuskan napas sepenuhnya melalui mulut, buat suara desis (whoosh) kembali selama 8 detik.",
        "Rasakan semua beban kecemasan keluar bersama hembusan napas Anda.",
      ],
    },
  ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // Mark as complete and redirect
      router.push(`/intervention/${screeningId}`);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const currentStep = steps[currentStepIdx];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center gap-3 shrink-0">
        <Link
          href={`/intervention/${screeningId}/guide`}
          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
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
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-8 pb-24 space-y-6">
        {/* Breadcrumb & Title */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <Link href={`/intervention/${screeningId}/guide`} className="hover:text-primary transition-colors">
              Panduan Swabantu
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">Teknik Relaksasi Pernapasan 4-7-8</span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-on-surface">
            Teknik Relaksasi Pernapasan 4-7-8
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Panduan langkah demi langkah untuk membantu Anda mengelola kecemasan dan stres melalui teknik pernapasan terstruktur.
          </p>
        </section>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video */}
          <section className="lg:col-span-7 space-y-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm relative border border-outline-variant/30">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/17b_8e_e4bU"
                title="Latihan Pernapasan 4-7-8"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Durasi: 3 Menit</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Ikuti langkah demi langkah di samping
              </span>
            </div>
          </section>

          {/* Right Column: Steps & Instructions */}
          <section className="lg:col-span-5 flex flex-col min-h-[400px] justify-between bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

            <div className="space-y-6">
              {/* Stepper Header */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                  Langkah {currentStepIdx + 1} dari {steps.length}
                </span>
                <div className="flex gap-1.5">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-6 h-1 rounded-full transition-all ${
                        idx <= currentStepIdx ? "bg-primary" : "bg-outline-variant/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-4">
                <h3 className="font-heading font-semibold text-xl text-on-surface">
                  {currentStep.title}
                </h3>
                <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
                  {currentStep.desc.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Tips block */}
              {currentStep.tip && (
                <div className="bg-surface-container-low p-4 rounded-lg flex items-start gap-3 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                    info
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Tips: </strong>
                    {currentStep.tip}
                  </p>
                </div>
              )}
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="px-4 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-xs font-semibold transition-all flex items-center gap-1 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Sebelumnya
              </button>

              <button
                onClick={handleNext}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 active:scale-[0.98] shadow-sm ${
                  currentStepIdx === steps.length - 1
                    ? "bg-status-success text-white hover:opacity-90"
                    : "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container"
                }`}
              >
                {currentStepIdx === steps.length - 1 ? (
                  <>
                    Selesai Panduan
                    <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                  </>
                ) : (
                  <>
                    Selanjutnya
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
