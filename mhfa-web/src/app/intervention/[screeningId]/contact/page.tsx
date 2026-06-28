"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface ProfessionalContact {
  id: number;
  name: string;
  role: string;
  phone: string;
  schedule: string;
  avatarUrl: string;
  type: "whatsapp" | "hotline";
  description?: string;
}

export default function ProfessionalDirectoryPage() {
  const params = useParams();
  const router = useRouter();
  const screeningId = params?.screeningId || "1";

  const contacts: ProfessionalContact[] = [
    {
      id: 1,
      name: "Dr. Sarah Anindita, M.Psi",
      role: "Psikolog Klinis",
      phone: "+62 812-3456-7890",
      schedule: "Senin - Jumat, 09:00 - 17:00",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      type: "whatsapp",
    },
    {
      id: 2,
      name: "dr. Budi Santoso, Sp.KJ",
      role: "Psikiater",
      phone: "+62 856-7890-1234",
      schedule: "Selasa - Sabtu, 10:00 - 18:00",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150",
      type: "whatsapp",
    },
    {
      id: 3,
      name: "Pusat Bantuan Darurat",
      role: "Layanan 24 Jam",
      phone: "119 ext. 8",
      schedule: "Untuk kondisi krisis dan mendesak",
      avatarUrl: "",
      type: "hotline",
      description: "Layanan darurat bebas pulsa MHFA.",
    },
  ];

  const handleComplete = () => {
    // Redirect to First Aid / Monitoring chat
    router.push(`/first-aid/${screeningId}`);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      <div>
        {/* Header */}
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

        {/* Top Progress/Stepper Bar */}
        <section className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-5 flex flex-col gap-3">
          <div className="max-w-xl mx-auto w-full space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
              <span>Evaluasi Diri</span>
              <span>Rekomendasi</span>
              <span className="text-primary">Tindakan</span>
            </div>
            <div className="w-full flex gap-2 h-2 rounded-full overflow-hidden">
              <div className="flex-1 bg-primary" />
              <div className="flex-1 bg-primary" />
              <div className="flex-1 bg-primary rounded-r-full" />
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Silakan pilih tenaga profesional kesehatan jiwa yang tersedia di bawah ini untuk memulai sesi konsultasi Anda.
            </p>
          </div>
        </section>

        {/* Directory Grid */}
        <main className="max-w-xl mx-auto px-6 py-8 space-y-6 pb-32">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-surface-container-lowest rounded-xl border p-5 flex flex-col gap-4 shadow-sm transition-all hover:scale-[1.01] ${
                contact.type === "hotline" ? "border-status-error/40" : "border-outline-variant/50"
              }`}
            >
              <div className="flex items-start gap-4">
                {contact.avatarUrl ? (
                  <img
                    src={contact.avatarUrl}
                    alt={contact.name}
                    className="w-14 h-14 rounded-full object-cover border border-outline-variant/40 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-status-error/10 flex items-center justify-center border border-status-error/20 text-status-error shrink-0">
                    <span className="material-symbols-outlined text-2xl">call</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-base text-on-surface leading-snug truncate">
                    {contact.name}
                  </h3>
                  <span
                    className={`inline-block text-xs font-bold mt-1 px-2 py-0.5 rounded ${
                      contact.type === "hotline"
                        ? "bg-status-error/10 text-status-error"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {contact.role}
                  </span>
                  <div className="flex items-center gap-2 mt-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="text-xs">{contact.schedule}</span>
                  </div>
                </div>
              </div>

              {contact.description && (
                <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30">
                  {contact.description}
                </p>
              )}

              {/* Action Button */}
              {contact.type === "whatsapp" ? (
                <a
                  href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-status-success hover:bg-status-success/90 text-on-primary py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px] filled">chat</span>
                  Hubungi via WhatsApp
                </a>
              ) : (
                <a
                  href={`tel:${contact.phone}`}
                  className="w-full bg-status-error hover:bg-status-error/95 text-on-error py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px] filled">call</span>
                  Telepon Hotline
                </a>
              )}
            </div>
          ))}
        </main>
      </div>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
        <div className="max-w-xl mx-auto w-full">
          <button
            onClick={handleComplete}
            className="w-full bg-primary hover:bg-primary-container hover:text-on-primary-container text-on-primary py-3.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Saya Sudah Menghubungi
            <span className="material-symbols-outlined text-[20px] filled">check_circle</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
