"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface GuideItem {
  id: string;
  title: string;
  desc: string;
  duration: string;
  category: string;
  type: string;
  status: "completed" | "active" | "locked";
  progress?: number; // percentage
  thumbnailUrl: string;
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function GuideListPage() {
  const params = useParams();
  const router = useRouter();
  const rawScreeningId = params?.screeningId;
  const screeningId = Array.isArray(rawScreeningId) ? rawScreeningId[0] : (rawScreeningId || "1");

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        const resGuides = await fetch("/api/admin/guides");
        const dataGuides = await resGuides.json();
        
        // Get completed guide IDs from localStorage
        const completedIds: string[] = JSON.parse(
          localStorage.getItem(`sufa_completed_guides_${screeningId}`) || "[]"
        );

        if (dataGuides.guides) {
          // Filter only active guides
          const activeGuides = dataGuides.guides.filter((g: any) => g.status === "Aktif");
          
          // Map to GuideItem
          const mapped: GuideItem[] = activeGuides.map((g: any) => {
            const youtubeId = getYouTubeId(g.youtubeUrl);
            const thumbnailUrl = youtubeId
              ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
              : "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=400";
            
            const category = g.conditionTags?.[0] || "Umum";

            return {
              id: g.id,
              title: g.title,
              desc: g.description || "",
              duration: "Video",
              category: category,
              type: "Panduan",
              thumbnailUrl,
            };
          });

          // Determine status sequentially (completed, active, locked)
          let foundActive = false;
          const finalizedGuides = mapped.map((g) => {
            const isCompleted = completedIds.includes(g.id);
            if (isCompleted) {
              return { ...g, status: "completed" as const };
            }
            if (!foundActive) {
              foundActive = true;
              return { ...g, status: "active" as const, progress: 0 };
            }
            return { ...g, status: "locked" as const };
          });

          setGuides(finalizedGuides);
        }
      } catch (err) {
        console.error("Error loading guides:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGuides();
  }, [screeningId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat daftar panduan...</p>
      </div>
    );
  }

  const categories = ["all", ...Array.from(new Set(guides.map((g) => g.category)))];

  const filteredGuides = guides.filter((g) => {
    if (activeCategory === "all") return true;
    return g.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center gap-3 shrink-0">
        <Link
          href={`/intervention/${screeningId}`}
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

      {/* Main Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-8 space-y-6 pb-24">
        {/* Header */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href={`/intervention/${screeningId}`} className="hover:text-primary transition-colors">
              Program Intervensi
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">Panduan Swabantu (F)</span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-on-surface">
            Daftar Panduan Video
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Berikut adalah rangkaian video panduan yang dirancang untuk membantu Anda memahami dan mengelola kondisi emosional. Silakan ikuti sesuai urutan atau pilih topik yang paling relevan dengan perasaan Anda saat ini.
          </p>
        </section>

        {/* Filter Bar */}
        <section className="flex flex-wrap items-center gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all border ${
                activeCategory === cat
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border-outline-variant/30"
              }`}
            >
              {cat === "all" ? "Semua" : cat}
            </button>
          ))}
        </section>

        {/* Video Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.length > 0 ? (
            filteredGuides.map((guide) => {
              const isLocked = guide.status === "locked";
              const isActive = guide.status === "active";
              const isCompleted = guide.status === "completed";

              return (
                <article
                  key={guide.id}
                  onClick={() => {
                    if (!isLocked) {
                      router.push(`/intervention/${screeningId}/guide/${guide.id}`);
                    }
                  }}
                  className={`bg-surface-container-lowest rounded-xl border overflow-hidden flex flex-col shadow-sm transition-all relative ${
                    isLocked
                      ? "border-outline-variant/30 opacity-60 cursor-not-allowed"
                      : "border-outline-variant/50 cursor-pointer hover:shadow-md hover:scale-[1.01]"
                  } ${isActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  {/* Thumbnail container */}
                  <div className="relative h-48 w-full bg-surface-container-high shrink-0">
                    <img
                      src={guide.thumbnailUrl}
                      alt={guide.title}
                      className={`w-full h-full object-cover ${isLocked ? "grayscale" : ""}`}
                    />
                    <div className="absolute inset-0 bg-black/10" />

                    {/* Lock Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-variant/70 backdrop-blur-sm z-10">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-1">
                          lock
                        </span>
                        <span className="text-[11px] font-semibold text-on-surface-variant">
                          Selesaikan video sebelumnya
                        </span>
                      </div>
                    )}

                    {/* Play Hover Overlay */}
                    {!isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                        <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-primary text-2xl filled">
                            play_arrow
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Duration/Type Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {guide.duration}
                    </div>

                    {/* Status Badge */}
                    {isCompleted && (
                      <div className="absolute top-3 left-3 bg-status-success text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[14px] filled">check_circle</span>
                        Selesai
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute top-3 left-3 bg-status-info text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">motion_photos_on</span>
                        Sedang Dikerjakan
                      </div>
                    )}

                    {/* Progress bar */}
                    {isActive && guide.progress !== undefined && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${guide.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                          {guide.category}
                        </span>
                        <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-[10px] font-bold">
                          {guide.type}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-base text-on-surface line-clamp-2">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2">
                        {guide.desc}
                      </p>
                    </div>

                    {!isLocked && (
                      <span className="text-xs font-bold text-primary flex items-center gap-1 mt-auto">
                        Mulai Panduan
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </span>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-2xl">
              <span className="material-symbols-outlined text-outline text-4xl block mb-2">
                menu_book
              </span>
              Belum ada panduan aktif yang tersedia.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
