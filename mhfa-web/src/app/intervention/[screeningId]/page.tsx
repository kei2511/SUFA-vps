"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface StepItem {
  number: number;
  label: string;
  desc: string;
  icon: string;
  status: "locked" | "active" | "completed";
  href: string;
  badgeText?: string;
  btnText?: string;
}

export default function SUFAHubPage() {
  const params = useParams();
  const router = useRouter();
  const screeningId = (params?.screeningId as string) || "1";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [screeningDate, setScreeningDate] = useState<string>("");
  const [conditionLabel, setConditionLabel] = useState<string>("Skrining");
  const [loading, setLoading] = useState(true);

  // States for step status
  const [chatSession, setChatSession] = useState<any>(null);
  const [hasCompletedChat, setHasCompletedChat] = useState(false);

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res?.data?.user) {
        setCurrentUser(res.data.user);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    const loadHubData = async () => {
      try {
        // 1. Fetch Screening Results
        const resResult = await fetch(`/api/screening/results/${screeningId}`);
        const dataResult = await resResult.json();
        if (dataResult.session) {
          setConditionLabel(dataResult.session.conditionLabel);
          setScreeningDate(
            new Date(dataResult.session.completedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })
          );
        }

        // 2. Fetch Chat Session Active Status
        const resChat = await fetch(`/api/chat/session/active?screeningSessionId=${screeningId}`);
        const dataChat = await resChat.json();
        setChatSession(dataChat.session);
        setHasCompletedChat(dataChat.hasCompleted);

      } catch (err) {
        console.error("Error loading SUFA Hub details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHubData();
  }, [currentUser, screeningId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat halaman intervensi...</p>
      </div>
    );
  }

  // Determine Step 1 (Curhat) status and properties
  let step1Status: "active" | "completed" = "active";
  let step1Badge = undefined;
  let step1BtnText = "Mulai Curhat";

  if (chatSession) {
    step1Status = "active";
    if (chatSession.status === "waiting") {
      step1Badge = "Menunggu Konselor";
      step1BtnText = "Lihat Antrean";
    } else if (chatSession.status === "active") {
      step1Badge = "Obrolan Aktif";
      step1BtnText = "Lanjutkan Chat";
    }
  } else if (hasCompletedChat) {
    step1Status = "completed";
    step1BtnText = "Lihat Kembali";
  }

  // Determine Step 2 & 3 status
  const step2Status: "locked" | "active" | "completed" = hasCompletedChat ? "active" : "locked";
  const step3Status: "locked" | "active" = hasCompletedChat ? "active" : "locked";

  const steps: StepItem[] = [
    {
      number: 1,
      label: "Curhat (S+U)",
      desc: "Sadari kondisi Anda dan utarakan perasaan kepada konselor terlatih melalui sesi chat.",
      icon: "chat",
      status: step1Status,
      href: `/intervention/${screeningId}/chat`,
      badgeText: step1Badge,
      btnText: step1BtnText
    },
    {
      number: 2,
      label: "Panduan Pendampingan (F)",
      desc: "Ikuti panduan relaksasi dan coping strategy melalui video dan instruksi langkah demi langkah.",
      icon: "menu_book",
      status: step2Status,
      href: `/intervention/${screeningId}/guide`,
      btnText: "Mulai Panduan"
    },
    {
      number: 3,
      label: "Hubungi Profesional (A)",
      desc: "Arahkan langkah Anda dengan menghubungi tenaga kesehatan profesional via WhatsApp.",
      icon: "contact_phone",
      status: step3Status,
      href: `/intervention/${screeningId}/contact`,
      btnText: "Hubungi"
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center gap-3 shrink-0">
        <Link href="/dashboard" className="p-1 rounded-lg hover:bg-surface-container">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">
            arrow_back
          </span>
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

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">
            Intervensi SUFA
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              conditionLabel.includes("Tinggi")
                ? "bg-status-error/10 text-status-error"
                : conditionLabel.includes("Sedang")
                ? "bg-status-warning/10 text-status-warning"
                : "bg-status-success/10 text-status-success"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                conditionLabel.includes("Tinggi")
                  ? "bg-status-error"
                  : conditionLabel.includes("Sedang")
                  ? "bg-status-warning"
                  : "bg-status-success"
              }`} />
              {conditionLabel}
            </span>
            <span className="text-sm text-on-surface-variant">
              Skrining: {screeningDate}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-[35px] sm:left-[51px] top-[56px] sm:top-[80px] bottom-[-32px] sm:bottom-[-40px] w-0.5 ${
                    step.status === "completed"
                      ? "bg-status-success"
                      : "bg-outline-variant"
                  }`}
                />
              )}

              <div
                className={`bg-surface-container-lowest rounded-xl border p-4 sm:p-6 flex items-start gap-4 sm:gap-5 ${
                  step.status === "locked"
                    ? "border-outline-variant/50 opacity-60"
                    : step.status === "active"
                    ? "border-primary shadow-sm"
                    : "border-outline-variant"
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 ${
                    step.status === "completed"
                      ? "bg-status-success text-white"
                      : step.status === "active"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-outline border border-outline-variant"
                  }`}
                >
                  {step.status === "completed" ? (
                    <span className="material-symbols-outlined text-xl sm:text-2xl">
                      check
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-xl sm:text-2xl">
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-on-surface-variant">
                      Langkah {step.number}
                    </span>
                    {step.status === "completed" && (
                      <span className="text-xs font-medium text-status-success">
                        ✅ Selesai
                      </span>
                    )}
                    {step.status === "active" && (
                      <span className="inline-block px-2 py-0.5 bg-primary-fixed text-primary rounded text-xs font-medium">
                        Aktif
                      </span>
                    )}
                    {step.status === "locked" && (
                      <span className="text-xs text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          lock
                        </span>
                        Terkunci
                      </span>
                    )}
                    {step.badgeText && (
                      <span className="inline-block px-2 py-0.5 bg-status-warning/10 text-status-warning rounded text-xs font-medium animate-pulse">
                        {step.badgeText}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-on-surface">
                    {step.label}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {step.desc}
                  </p>

                  {step.status === "active" && (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-2 px-5 py-2.5 mt-4 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all"
                    >
                      {step.btnText}
                      <span className="material-symbols-outlined text-[20px]">
                        arrow_forward
                      </span>
                    </Link>
                  )}

                  {step.status === "completed" && (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-2 px-4 py-2 mt-4 border border-outline-variant text-on-surface-variant rounded-full text-sm font-medium hover:bg-surface-container transition-all"
                    >
                      {step.btnText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
