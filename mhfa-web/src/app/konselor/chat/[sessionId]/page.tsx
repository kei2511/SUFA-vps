"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  sender: "patient" | "counselor" | "system";
  text: string;
  timestamp: string;
}

export default function CounselorChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId || "1";

  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-1",
      sender: "system",
      text: "Sesi dimulai. Pasien tersambung menggunakan Kode Undangan: INV-7728",
      timestamp: "19:54",
    },
    {
      id: "p-1",
      sender: "patient",
      text: "Halo dok, saya merasa sangat cemas beberapa hari ini. Dada rasanya sesak dan sulit konsentrasi saat bekerja.",
      timestamp: "19:55",
    },
    {
      id: "c-1",
      sender: "counselor",
      text: "Halo, saya dr. Sarah. Terima kasih sudah menjangkau kami. Mari kita kendalikan bersama. Apakah ada kejadian spesifik baru-baru ini yang memicu perasaan ini?",
      timestamp: "19:56",
    },
    {
      id: "p-2",
      sender: "patient",
      text: "Saya baru saja ditunjuk memimpin proyek besar minggu lalu. Sejak itu saya sulit tidur karena takut gagal.",
      timestamp: "19:58",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [counselorNotes, setCounselorNotes] = useState({
    symptoms: "Kecemasan terkait pekerjaan, insomnia ringan, palpitasi (sesak dada).",
    assessment: "Kecemasan situasional akibat beban kerja baru (proyek kepemimpinan).",
    recommendation: "Latihan pernapasan kotak (box breathing), delegasi tugas, evaluasi lanjutan 3 hari.",
  });
  const [showSaveNoteToast, setShowSaveNoteToast] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "counselor",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate patient reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const patientReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "patient",
        text: "Baik dok, saya akan coba lakukan box breathing tersebut sebelum tidur malam ini. Semoga bisa membantu menenangkan pikiran saya.",
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, patientReply]);
    }, 2000);
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveNoteToast(true);
    setTimeout(() => setShowSaveNoteToast(false), 3000);
  };

  const handleEndSession = () => {
    router.push("/konselor/dashboard");
  };

  // Mock patient data for detail panel
  const patientDetail = {
    name: "Anonim #412 (Rina K.)",
    age: "26 Tahun",
    gender: "Perempuan",
    screeningScore: 14,
    screeningResult: "Kecemasan Sedang",
    screeningDate: "26 Juni 2026",
    history: [
      { date: "12 Mei 2026", score: 8, result: "Kecemasan Ringan" },
      { date: "04 Feb 2026", score: 12, result: "Kecemasan Sedang" },
    ],
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 relative overflow-hidden">
      {/* Toast Alert */}
      {showSaveNoteToast && (
        <div className="absolute top-4 right-4 bg-status-success text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 z-50 animate-bounce">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Catatan konselor berhasil disimpan!
        </div>
      )}

      {/* Left Area: Chat Console */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {/* Chat Console Header */}
        <header className="px-5 py-3.5 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
              AK
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm text-on-surface">
                {patientDetail.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                <span className="text-[10px] text-on-surface-variant font-medium">Sesi Aktif</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
              title="Toggle Panel Detail"
            >
              <span className="material-symbols-outlined text-xl">
                {showRightPanel ? "view_sidebar" : "menu_open"}
              </span>
            </button>
            <button
              onClick={() => setShowEndSessionModal(true)}
              className="px-4 py-2 bg-status-error text-white text-xs font-semibold rounded-lg hover:bg-status-error/90 active:scale-95 transition-all"
            >
              Selesaikan Sesi
            </button>
          </div>
        </header>

        {/* Chat Console Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-dim">
          {messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-surface-container border border-outline-variant rounded-lg px-4 py-1.5 text-xs text-on-surface-variant font-medium text-center">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isCounselor = msg.sender === "counselor";
            return (
              <div
                key={msg.id}
                className={`flex ${isCounselor ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm shadow-sm ${
                    isCounselor
                      ? "bg-primary text-on-primary rounded-tr-none"
                      : "bg-surface-container-lowest text-on-surface border border-outline-variant/50 rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`text-[8px] block text-right mt-1.5 ${
                      isCounselor ? "text-on-primary/60" : "text-on-surface-variant/70"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-surface-container-lowest text-on-surface border border-outline-variant/40 rounded-xl rounded-tl-none px-4 py-2.5 flex items-center gap-1 shadow-sm">
                <span className="w-1 h-1 rounded-full bg-outline-variant animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 rounded-full bg-outline-variant animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 rounded-full bg-outline-variant animate-bounce" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Console Input */}
        <footer className="p-4 border-t border-outline-variant bg-surface-container-lowest shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan konseling..."
              className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container disabled:bg-surface-container-high disabled:text-outline transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-lg filled">send</span>
            </button>
          </form>
        </footer>
      </div>

      {/* Right Area: Detail Pasien & Catatan Konselor */}
      {showRightPanel && (
        <div className="w-full md:w-[360px] flex flex-col gap-6 shrink-0 h-full overflow-y-auto">
          {/* Detail Pasien Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">patient_list</span>
              Profil & Skrining Pasien
            </h4>

            <div className="space-y-3 text-xs border-b border-outline-variant pb-4">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Nama:</span>
                <span className="font-semibold text-on-surface">{patientDetail.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Usia / Gender:</span>
                <span className="font-semibold text-on-surface">{patientDetail.age} / {patientDetail.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Skor Skrining:</span>
                <span className="font-bold text-status-warning">{patientDetail.screeningScore} (Sedang)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tanggal Tes:</span>
                <span className="font-semibold text-on-surface">{patientDetail.screeningDate}</span>
              </div>
            </div>

            {/* Riwayat Test */}
            <div className="space-y-2">
              <span className="text-xs text-on-surface-variant font-medium block">Riwayat Skrining</span>
              <div className="space-y-2">
                {patientDetail.history.map((hist, idx) => (
                  <div key={idx} className="bg-surface-dim rounded-lg p-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-on-surface">{hist.result}</p>
                      <p className="text-[10px] text-on-surface-variant">{hist.date}</p>
                    </div>
                    <span className="font-bold text-primary">Skor: {hist.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Catatan Konselor Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm flex-1 flex flex-col">
            <h4 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
              Catatan Sesi Internal
            </h4>

            <form onSubmit={handleSaveNotes} className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                    Keluhan Utama
                  </label>
                  <textarea
                    rows={2}
                    value={counselorNotes.symptoms}
                    onChange={(e) => setCounselorNotes({ ...counselorNotes, symptoms: e.target.value })}
                    className="w-full p-2 bg-surface-container border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-surface-container-lowest resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                    Asesmen Klinis
                  </label>
                  <textarea
                    rows={2}
                    value={counselorNotes.assessment}
                    onChange={(e) => setCounselorNotes({ ...counselorNotes, assessment: e.target.value })}
                    className="w-full p-2 bg-surface-container border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-surface-container-lowest resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                    Rencana Tindak Lanjut
                  </label>
                  <textarea
                    rows={2}
                    value={counselorNotes.recommendation}
                    onChange={(e) => setCounselorNotes({ ...counselorNotes, recommendation: e.target.value })}
                    className="w-full p-2 bg-surface-container border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-surface-container-lowest resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] mt-4"
              >
                Simpan Catatan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      {showEndSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-on-surface">
              Selesaikan Sesi Konseling?
            </h3>
            <p className="text-sm text-on-surface-variant">
              Pastikan Anda sudah menyimpan catatan konseling internal pasien sebelum menyelesaikan sesi chat ini.
            </p>
            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                onClick={() => setShowEndSessionModal(false)}
                className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-full"
              >
                Batal
              </button>
              <button
                onClick={handleEndSession}
                className="px-5 py-2 text-sm font-semibold text-white bg-status-success hover:bg-status-success/90 rounded-full shadow-sm"
              >
                Ya, Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
