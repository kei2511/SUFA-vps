import Link from "next/link";

export default function SUFAHubPage() {
  const steps = [
    {
      number: 1,
      label: "Curhat (S+U)",
      desc: "Sadari kondisi Anda dan utarakan perasaan kepada konselor terlatih melalui sesi chat.",
      icon: "chat",
      status: "completed" as const,
      href: "/intervention/1/chat",
    },
    {
      number: 2,
      label: "Panduan Pendampingan (F)",
      desc: "Ikuti panduan relaksasi dan coping strategy melalui video dan instruksi langkah demi langkah.",
      icon: "menu_book",
      status: "active" as const,
      href: "/intervention/1/guide",
    },
    {
      number: 3,
      label: "Hubungi Profesional (A)",
      desc: "Arahkan langkah Anda dengan menghubungi tenaga kesehatan profesional via WhatsApp.",
      icon: "contact_phone",
      status: "locked" as const,
      href: "#",
    },
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-warning/10 text-status-warning rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-status-warning" />
              Kecemasan Sedang
            </span>
            <span className="text-sm text-on-surface-variant">
              Skrining: 12 Oktober 2023
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
                  className={`absolute left-7 top-[72px] w-0.5 h-8 ${
                    step.status === "completed"
                      ? "bg-status-success"
                      : "bg-outline-variant"
                  }`}
                />
              )}

              <div
                className={`bg-surface-container-lowest rounded-xl border p-6 flex items-start gap-5 ${
                  step.status === "locked"
                    ? "border-outline-variant/50 opacity-60"
                    : step.status === "active"
                    ? "border-primary shadow-sm"
                    : "border-outline-variant"
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                    step.status === "completed"
                      ? "bg-status-success text-white"
                      : step.status === "active"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-outline border border-outline-variant"
                  }`}
                >
                  {step.status === "completed" ? (
                    <span className="material-symbols-outlined text-2xl">
                      check
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-2xl">
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 mt-4 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98]"
                    >
                      Mulai Panduan
                      <span className="material-symbols-outlined text-[20px]">
                        arrow_forward
                      </span>
                    </Link>
                  )}

                  {step.status === "completed" && (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-2 px-4 py-2 mt-4 border border-outline-variant text-on-surface-variant rounded-full text-sm font-medium hover:bg-surface-container"
                    >
                      Lihat Kembali
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
