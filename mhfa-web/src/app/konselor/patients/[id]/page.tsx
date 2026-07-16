"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ScreeningRecord {
  date: string;
  score: number;
  condition: string;
  color: string;
}

interface NoteRecord {
  date: string;
  counselorName: string;
  symptoms: string;
  assessment: string;
  recommendation: string;
}

interface HistoryItem {
  id: string;
  type: "screening" | "chat" | "contact";
  title: string;
  dateText: string;
  status: string;
  details: {
    score?: number;
    conditionLabel?: string;
    counselorName?: string | null;
    chatType?: string;
    contactName?: string;
    contactType?: string;
  };
}

const getInitials = (name: string) => {
  const nameInParentheses = name.match(/\(([^)]+)\)/);
  if (nameInParentheses && nameInParentheses[1]) {
    return nameInParentheses[1]
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  const cleanName = name.replace(/Anonim\s*#\d*/g, "").trim();
  if (!cleanName) {
    const numMatch = name.match(/#(\d+)/);
    return numMatch ? `A${numMatch[1].slice(0, 1)}` : "A";
  }
  return cleanName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function CounselorPatientDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const [activeTab, setActiveTab] = useState<"history" | "notes">("history");
  const [patient, setPatient] = useState<any>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch patient details
    const fetchDetails = fetch(`/api/konselor/patients/${id}`).then((res) => res.json());

    // Fetch patient unified history
    const fetchHistory = fetch(`/api/user/history/${id}`).then((res) => res.json());

    Promise.all([fetchDetails, fetchHistory])
      .then(([detailsData, historyData]) => {
        if (detailsData.patient) {
          setPatient(detailsData.patient);
        }
        if (historyData.history) {
          const mapped: HistoryItem[] = historyData.history.map((h: any) => {
            const dateText = new Date(h.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }) + " WIB";
            return {
              id: h.id,
              type: h.type,
              title: h.title,
              dateText,
              status: h.status,
              details: h.details || {}
            };
          });
          setHistoryItems(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading patient data:", err);
        setLoading(false);
      });
  }, [id]);

  const getGraphHeight = (score: number) => {
    return `${(score / 25) * 100}%`;
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "screening":
        return {
          icon: "psychology",
          color: "text-primary bg-primary/10 border-primary/20",
        };
      case "chat":
        return {
          icon: "forum",
          color: "text-status-info bg-status-info/10 border-status-info/20",
        };
      case "contact":
        return {
          icon: "contact_phone",
          color: "text-status-success bg-status-success/10 border-status-success/20",
        };
      default:
        return {
          icon: "history",
          color: "text-on-surface-variant bg-surface-container border-outline-variant",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat report hasil deteksi pasien...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-status-error mb-2">
          error
        </span>
        <p className="text-on-surface-variant">Pasien tidak ditemukan.</p>
        <Link href="/konselor/patients" className="text-primary font-bold mt-4 inline-block hover:underline">
          Kembali ke Daftar Pasien
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      <div className="flex flex-col gap-4">
        <Link
          href="/konselor/patients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Kembali ke Daftar Pasien
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
              Report Hasil Deteksi Pasien
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Informasi profil lengkap, log aktivitas skrining, dan transkrip konsultasi lampau.
            </p>
          </div>
          
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            patient.status === "Aktif"
              ? "bg-status-success/10 text-status-success"
              : patient.status === "Dirujuk"
              ? "bg-status-error/10 text-status-error"
              : "bg-surface-container text-on-surface-variant"
          }`}>
            Sesi: {patient.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                {getInitials(patient.name)}
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-on-surface">{patient.name}</h3>
                <span className="text-xs text-on-surface-variant">ID: {patient.id}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Email:</span>
                <span className="font-semibold text-on-surface">{patient.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Telepon:</span>
                <span className="font-semibold text-on-surface">{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Usia:</span>
                <span className="font-semibold text-on-surface">{patient.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tanggal Daftar:</span>
                <span className="font-semibold text-on-surface">{patient.registrationDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <h4 className="font-heading font-bold text-sm text-on-surface">Tren Skor Skrining</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Riwayat perkembangan kondisi mental</p>
            </div>

            {patient.screenings && patient.screenings.length > 0 ? (
              <div className="h-40 flex items-end justify-around border-b border-l border-outline-variant/60 pb-2 pl-3 pt-4 relative">
                <div className="absolute left-0 right-0 top-[20%] border-t border-dashed border-outline-variant/20" />
                <div className="absolute left-0 right-0 top-[50%] border-t border-dashed border-outline-variant/20" />
                <div className="absolute left-0 right-0 top-[80%] border-t border-dashed border-outline-variant/20" />

                {patient.screenings.slice(0, 5).reverse().map((scr: ScreeningRecord, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-2 z-10 w-12">
                    <div className="relative group flex flex-col items-center">
                      <span className="bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-0.5 rounded absolute -top-7 opacity-95 font-bold whitespace-nowrap">
                        Skor: {scr.score}
                      </span>
                      <div
                        style={{ height: getGraphHeight(scr.score) }}
                        className="w-4 bg-primary hover:bg-primary-container rounded-t transition-all duration-500"
                      />
                    </div>
                    <span className="text-[9px] text-on-surface-variant text-center whitespace-nowrap">
                      {scr.date.split(" ")[0]} {scr.date.split(" ")[1]?.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-outline-variant rounded-xl text-xs text-on-surface-variant">
                Belum ada data skrining completed.
              </div>
            )}
            
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant border-t border-outline-variant/20 pt-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-primary rounded" /> Skor Skrining</span>
              <span>Skor Max: 25</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm h-[560px]">
          <div className="flex bg-surface-container border-b border-outline-variant shrink-0 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 min-w-[160px] sm:min-w-0 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                activeTab === "history"
                  ? "border-primary text-primary bg-surface-container-lowest"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Riwayat Aktivitas Lengkap
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 min-w-[160px] sm:min-w-0 py-3 text-center text-xs font-bold border-b-2 transition-all ${
                activeTab === "notes"
                  ? "border-primary text-primary bg-surface-container-lowest"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Catatan Konseling Internal
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "history" && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-dim">
                {historyItems.length === 0 ? (
                  <div className="text-center py-10 text-xs text-on-surface-variant">
                    Belum ada riwayat aktivitas yang tercatat.
                  </div>
                ) : (
                  historyItems.map((item) => {
                    const badgeMeta = getTimelineIcon(item.type);
                    const isRisk = item.details.conditionLabel === "Risiko Sedang" || item.details.conditionLabel === "Risiko Tinggi";

                    return (
                      <div
                        key={item.id}
                        className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-sm flex items-start gap-3"
                      >
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${badgeMeta.color}`}>
                          <span className="material-symbols-outlined text-lg">{badgeMeta.icon}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-on-surface">{item.title}</span>
                            <span className="text-[10px] text-on-surface-variant font-semibold">{item.dateText}</span>
                          </div>
                          
                          {item.type === "screening" && (
                            <p className="text-xs text-on-surface-variant">
                              Mendapatkan hasil <strong className={isRisk ? "text-status-error" : "text-status-success"}>{item.details.conditionLabel}</strong> dengan skor total <strong>{item.details.score}</strong>.
                            </p>
                          )}

                          {item.type === "chat" && (
                            <p className="text-xs text-on-surface-variant">
                              Melakukan sesi obrolan {item.details.chatType === "first_aid" ? "P3K Psikologis" : "Konseling Curhat"} bersama konselor {item.details.counselorName ? <strong>{item.details.counselorName}</strong> : <span className="italic text-outline">tidak diketahui</span>}. Status: <strong>{item.status}</strong>.
                            </p>
                          )}

                          {item.type === "contact" && (
                            <p className="text-xs text-on-surface-variant">
                              Menghubungi layanan profesional: <strong>{item.details.contactName}</strong> ({item.details.contactType}).
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-dim">
                {patient.notes && patient.notes.length > 0 ? (
                  patient.notes.map((note: NoteRecord, idx: number) => (
                    <div
                      key={idx}
                      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3 shadow-sm"
                    >
                      <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">event</span>
                          Sesi Tanggal: {note.date}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          Oleh: {note.counselorName}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-on-surface block mb-0.5">Keluhan Utama:</span>
                          <p className="text-on-surface-variant bg-surface-container-low p-2 rounded leading-relaxed">
                            {note.symptoms}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface block mb-0.5">Asesmen Klinis:</span>
                          <p className="text-on-surface-variant bg-surface-container-low p-2 rounded leading-relaxed">
                            {note.assessment}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface block mb-0.5">Rekomendasi Tindak Lanjut:</span>
                          <p className="text-on-surface-variant bg-surface-container-low p-2 rounded leading-relaxed">
                            {note.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-on-surface-variant">
                    Belum ada catatan konseling yang dibuat.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
