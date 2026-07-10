"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface ProfessionalContact {
  id: string;
  name: string;
  institution: string;
  specialization: string;
  phone: string;
  schedule: string;
  scheduleDays: string;
  status: string;
  type: "whatsapp" | "hotline";
}

const fallbackContacts: ProfessionalContact[] = [
  {
    id: "fb-1",
    name: "Dr. Sarah Anindita, M.Psi",
    institution: "MHFA Clinic",
    specialization: "Psikolog Klinis",
    phone: "+62 812-3456-7890",
    schedule: "09:00 - 17:00",
    scheduleDays: "Senin - Jumat",
    status: "Tersedia",
    type: "whatsapp",
  },
  {
    id: "fb-2",
    name: "dr. Budi Santoso, Sp.KJ",
    institution: "MHFA Hospital",
    specialization: "Psikiater",
    phone: "+62 856-7890-1234",
    schedule: "10:00 - 18:00",
    scheduleDays: "Selasa - Sabtu",
    status: "Tersedia",
    type: "whatsapp",
  },
  {
    id: "fb-3",
    name: "Pusat Bantuan Darurat",
    institution: "Kementerian Kesehatan",
    specialization: "Layanan 24 Jam",
    phone: "119 ext. 8",
    schedule: "Untuk kondisi krisis dan mendesak",
    scheduleDays: "Setiap Hari",
    status: "Tersedia",
    type: "hotline",
  },
];

export default function ProfessionalDirectoryPage() {
  const params = useParams();
  const router = useRouter();
  const screeningId = params?.screeningId || "1";

  const [contacts, setContacts] = useState<ProfessionalContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((res) => res.json())
      .then((data) => {
        if (data.contacts && data.contacts.length > 0) {
          setContacts(data.contacts);
        } else {
          setContacts(fallbackContacts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contacts:", err);
        setContacts(fallbackContacts);
        setLoading(false);
      });
  }, []);

  const handleContactClick = async (contact: ProfessionalContact) => {
    try {
      await fetch("/api/professional-contact/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: contact.id.startsWith("fb-") ? null : contact.id,
          name: contact.name,
          type: contact.type,
        }),
      });
    } catch (err) {
      console.error("Failed to log contact click:", err);
    }
  };

  const handleComplete = async () => {
    // Log a general action for "Saya Sudah Menghubungi"
    try {
      await fetch("/api/professional-contact/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: null,
          name: "Saya Sudah Menghubungi (General Action)",
          type: "general",
        }),
      });
    } catch (err) {
      console.error("Failed to log general contact action:", err);
    }
    router.push("/dashboard");
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-on-surface-variant">Memuat daftar profesional...</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className={`bg-surface-container-lowest rounded-xl border p-5 flex flex-col gap-4 shadow-sm transition-all hover:scale-[1.01] ${
                  contact.type === "hotline" ? "border-status-error/40" : "border-outline-variant/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border shrink-0 ${
                    contact.type === "hotline" 
                      ? "bg-status-error/10 border-status-error/20 text-status-error" 
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {contact.type === "hotline" ? "call" : "chat"}
                    </span>
                  </div>
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
                      {contact.specialization} - {contact.institution}
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span className="text-xs">{contact.scheduleDays}, {contact.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {contact.type === "whatsapp" ? (
                  <a
                    href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleContactClick(contact)}
                    className="w-full bg-status-success hover:bg-status-success/90 text-on-primary py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px] filled">chat</span>
                    Hubungi via WhatsApp
                  </a>
                ) : (
                  <a
                    href={`tel:${contact.phone}`}
                    onClick={() => handleContactClick(contact)}
                    className="w-full bg-status-error hover:bg-status-error/95 text-on-error py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px] filled">call</span>
                    Telepon Hotline
                  </a>
                )}
              </div>
            ))
          )}
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
