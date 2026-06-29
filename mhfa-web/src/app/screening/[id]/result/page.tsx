"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface SessionData {
  session: {
    id: string;
    score: number;
    conditionLabel: string;
    completedAt: string;
  };
  description: string;
}

export default function ScreeningResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/screening/results/${sessionId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.session) {
          setData(resData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching screening results:", err);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat hasil skrining...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-status-error text-5xl mb-4">
          error
        </span>
        <h2 className="font-heading font-bold text-xl text-on-surface mb-2">
          Hasil Tidak Ditemukan
        </h2>
        <p className="text-on-surface-variant max-w-md mb-6">
          Maaf, hasil skrining tidak dapat ditemukan atau Anda tidak memiliki akses ke data ini.
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

  const { session, description } = data;
  const isHighRisk = session.conditionLabel === "Risiko Tinggi";
  const isMediumRisk = session.conditionLabel === "Risiko Sedang";

  let statusColorClass = "bg-status-success/10 text-status-success";
  let iconName = "check_circle";
  let iconColorClass = "text-status-success";

  if (isHighRisk) {
    statusColorClass = "bg-status-error/10 text-status-error";
    iconName = "dangerous";
    iconColorClass = "text-status-error";
  } else if (isMediumRisk) {
    statusColorClass = "bg-status-warning/10 text-status-warning";
    iconName = "warning";
    iconColorClass = "text-status-warning";
  }

  const formattedDate = new Date(session.completedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

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
            <div className={`w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4`}>
              <span className={`material-symbols-outlined ${iconColorClass} text-4xl`}>
                {iconName}
              </span>
            </div>

            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3 ${statusColorClass}`}>
              {session.conditionLabel}
            </span>

            <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">
              Skor Skrining Anda: {session.score}
            </h1>

            <p className="text-sm text-on-surface-variant">
              Skrining pada {formattedDate}
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="font-heading font-semibold text-lg text-on-surface mb-3">
              Tentang Kondisi Anda
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed mb-4">
              {description}
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
              ini terdiri dari langkah-langkah yang akan membimbing Anda mendapatkan
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
