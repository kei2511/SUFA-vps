"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface InstructionStep {
  title: string;
  desc: string[];
  tip?: string;
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawScreeningId = params?.screeningId;
  const rawGuideId = params?.guideId;
  const screeningId = Array.isArray(rawScreeningId) ? rawScreeningId[0] : (rawScreeningId || "1");
  const guideId = Array.isArray(rawGuideId) ? rawGuideId[0] : (rawGuideId || "breathing-478");

  const [guide, setGuide] = useState<any>(null);
  const [steps, setSteps] = useState<InstructionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const fetchGuideDetails = async () => {
      try {
        const res = await fetch(`/api/admin/guides/${guideId}`);
        const data = await res.json();
        if (data.guide) {
          setGuide(data.guide);
          
          try {
            const parsed = JSON.parse(data.guide.instructions || "[]");
            if (Array.isArray(parsed) && parsed.length > 0) {
              const mappedSteps: InstructionStep[] = parsed.map((s: any) => ({
                title: s.title || `Langkah ${s.order}`,
                desc: [s.description || ""],
              }));
              setSteps(mappedSteps);
            } else {
              setSteps([
                {
                  title: "Ikuti Video Panduan",
                  desc: [data.guide.description || "Tonton video di samping untuk mengikuti panduan ini."],
                }
              ]);
            }
          } catch (e) {
            console.error("Error parsing steps:", e);
            setSteps([
              {
                title: "Ikuti Video Panduan",
                desc: [data.guide.description || "Tonton video di samping untuk mengikuti panduan ini."],
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Error fetching guide detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideDetails();
  }, [guideId]);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // Mark as complete in localStorage
      try {
        const completedIds: string[] = JSON.parse(
          localStorage.getItem(`sufa_completed_guides_${screeningId}`) || "[]"
        );
        if (!completedIds.includes(guideId)) {
          completedIds.push(guideId);
          localStorage.setItem(`sufa_completed_guides_${screeningId}`, JSON.stringify(completedIds));
        }
      } catch (e) {
        console.error("Error saving completed guide to localStorage:", e);
      }
      
      // Redirect back to list
      router.push(`/intervention/${screeningId}/guide`);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat detail panduan...</p>
      </div>
    );
  }

  const currentStep = steps[currentStepIdx] || { title: "Ikuti Video Panduan", desc: ["Tonton video di samping untuk mengikuti panduan ini."] };
  const youtubeId = guide ? getYouTubeId(guide.youtubeUrl) : null;

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
            <span className="text-on-surface font-semibold">{guide?.title || "Detail Panduan"}</span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-on-surface">
            {guide?.title || "Detail Panduan"}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            {guide?.description || "Panduan langkah demi langkah untuk membantu Anda mengelola kondisi emosional Anda."}
          </p>
        </section>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video */}
          <section className="lg:col-span-7 space-y-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm relative border border-outline-variant/30">
              {youtubeId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={guide?.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white bg-surface-container-high">
                  Video tidak tersedia
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Sumber: YouTube</span>
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
                  Langkah {currentStepIdx + 1} dari {steps.length || 1}
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
