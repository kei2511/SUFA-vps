"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Message {
  id: string;
  sender: "patient" | "counselor" | "system";
  text: string;
  timestamp: string;
}

export default function FirstAidChatPage() {
  const params = useParams();
  const router = useRouter();
  const screeningId = params?.screeningId || "1";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-1",
      sender: "system",
      text: "Anda masuk ke Ruang Pertolongan Pertama. Ini adalah ruang penanganan darurat kecemasan dan kepanikan.",
      timestamp: "19:54",
    },
    {
      id: "1",
      sender: "counselor",
      text: "Halo, saya dr. Sarah Wijaya dari Tim MHFA. Saya melihat Anda memerlukan pertolongan pertama pasca-skrining. Tenang, Anda aman di sini. Mari kita kendalikan kepanikan ini bersama-sama.",
      timestamp: "19:54",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "techniques" | "numbers">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "patient",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate counselor urgent relief reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const counselorReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "counselor",
        text: "Terima kasih sudah merespons. Mari lakukan teknik pernapasan kotak (box breathing) singkat: Tarik napas 4 detik, tahan 4 detik, hembuskan 4 detik, tahan 4 detik. Lakukan ini 3 kali. Apakah Anda ingin dipandu lebih lanjut?",
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, counselorReply]);
    }, 2000);
  };

  const handleExitFirstAid = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-status-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-status-error text-xl filled">
                emergency_share
              </span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-status-success border-2 border-surface-container-lowest" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-sm text-on-surface leading-tight flex items-center gap-1.5">
              dr. Sarah Wijaya
              <span className="px-1.5 py-0.5 bg-status-error/10 text-status-error text-[10px] font-bold rounded">
                Darurat (MHFA)
              </span>
            </h2>
            <span className="text-xs text-status-success font-medium flex items-center gap-1">
              Konselor Siaga
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowExitConfirm(true)}
          className="px-3.5 py-1.5 border border-outline-variant text-on-surface-variant hover:bg-surface-container rounded-full text-xs font-semibold transition-all active:scale-[0.98]"
        >
          Keluar
        </button>
      </header>

      {/* Tabs for emergency panel */}
      <div className="bg-surface-container-lowest border-b border-outline-variant flex items-center shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition-all ${
            activeTab === "chat"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant"
          }`}
        >
          Konseling Sesi
        </button>
        <button
          onClick={() => setActiveTab("techniques")}
          className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition-all ${
            activeTab === "techniques"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant"
          }`}
        >
          Teknik Tenang
        </button>
        <button
          onClick={() => setActiveTab("numbers")}
          className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition-all ${
            activeTab === "numbers"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant"
          }`}
        >
          Nomor Darurat
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-surface-dim">
        {activeTab === "chat" && (
          <>
            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="max-w-md mx-auto space-y-4">
                {messages.map((msg) => {
                  if (msg.sender === "system") {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="bg-status-error/5 text-status-error border border-status-error/15 rounded-xl px-4 py-2 text-xs font-medium max-w-sm text-center">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }
                  
                  const isPatient = msg.sender === "patient";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isPatient ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isPatient
                            ? "bg-primary text-on-primary rounded-tr-none"
                            : "bg-surface-container-lowest text-on-surface border border-outline-variant/40 rounded-tl-none"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <span
                          className={`text-[9px] block text-right mt-1.5 ${
                            isPatient ? "text-on-primary/70" : "text-on-surface-variant/70"
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
                    <div className="bg-surface-container-lowest text-on-surface border border-outline-variant/40 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Message Area */}
            <footer className="bg-surface-container-lowest border-t border-outline-variant px-4 py-3 shrink-0">
              <form
                onSubmit={handleSendMessage}
                className="max-w-md mx-auto flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tulis pesan Anda..."
                  className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container disabled:bg-surface-container-high disabled:text-outline transition-all shrink-0 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg filled">send</span>
                </button>
              </form>
            </footer>
          </>
        )}

        {activeTab === "techniques" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-md mx-auto">
            <h3 className="font-heading font-bold text-lg text-on-surface">
              Teknik Relaksasi Mandiri
            </h3>
            
            <div className="space-y-4">
              {/* Box Breathing */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">
                      reorder
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-on-surface">
                      Box Breathing (4-4-4-4)
                    </h4>
                    <span className="text-xs text-on-surface-variant">Lama latihan: 2-3 Menit</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Lakukan pernapasan dalam 4 fase: Hirup napas selama 4 detik, tahan 4 detik, hembuskan perlahan 4 detik, dan tahan kosong selama 4 detik. Ulangi siklus ini.
                </p>
                <button
                  onClick={() => {
                    const sysMsg: Message = {
                      id: Date.now().toString(),
                      sender: "system",
                      text: "Sistem: Latihan Box Breathing dimulai. Tarik napas 1.. 2.. 3.. 4.. Tahan 1.. 2.. 3.. 4.. Hembuskan 1.. 2.. 3.. 4.. Tahan kosong 1.. 2.. 3.. 4.. Ulangi.",
                      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                    };
                    setMessages((prev) => [...prev, sysMsg]);
                    setActiveTab("chat");
                  }}
                  className="w-full py-2 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/15 hover:bg-primary/10 transition-all"
                >
                  Mulai Latihan via Chat
                </button>
              </div>

              {/* Grounding Technique */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">
                      spatial_tracking
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-on-surface">
                      Teknik Grounding 5-4-3-2-1
                    </h4>
                    <span className="text-xs text-on-surface-variant">Kembali ke realita</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Sebutkan: 5 benda di sekitar Anda, 4 hal yang dapat disentuh, 3 suara yang terdengar, 2 bau yang dicium, dan 1 hal menyenangkan tentang diri Anda.
                </p>
                <button
                  onClick={() => {
                    const sysMsg: Message = {
                      id: Date.now().toString(),
                      sender: "system",
                      text: "Sistem: Mari gunakan indera Anda untuk grounding. Tuliskan 5 benda yang Anda lihat di sekitar Anda saat ini di ruang chat.",
                      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                    };
                    setMessages((prev) => [...prev, sysMsg]);
                    setActiveTab("chat");
                  }}
                  className="w-full py-2 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/15 hover:bg-primary/10 transition-all"
                >
                  Mulai Grounding via Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "numbers" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-md mx-auto w-full">
            <h3 className="font-heading font-bold text-lg text-on-surface">
              Nomor Darurat & Rujukan
            </h3>

            <div className="space-y-3">
              {/* Hotline MHFA */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <h4 className="font-heading font-semibold text-xs text-on-surface">
                    Layanan SEJIWA (MHFA)
                  </h4>
                  <p className="text-xs text-on-surface-variant">Hotline Konseling Psikologi Nasional</p>
                  <span className="inline-block font-heading font-bold text-primary text-sm">119 (Ext. 8)</span>
                </div>
                <a
                  href="tel:119"
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg filled">call</span>
                </a>
              </div>

              {/* Into The Light */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <h4 className="font-heading font-semibold text-xs text-on-surface">
                    Into The Light Indonesia
                  </h4>
                  <p className="text-xs text-on-surface-variant">Informasi Kesehatan Jiwa & Pencegahan Bunuh Diri</p>
                  <span className="inline-block font-heading font-semibold text-on-surface-variant text-xs">Melalui formulir rujukan di web</span>
                </div>
                <a
                  href="https://www.intothelightid.org"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-on-surface">
              Keluar Dari Ruang Darurat?
            </h3>
            <p className="text-sm text-on-surface-variant">
              Apakah Anda yakin keadaan Anda sudah lebih baik dan ingin keluar dari ruang pertolongan pertama ini?
            </p>
            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-full"
              >
                Batal
              </button>
              <button
                onClick={handleExitFirstAid}
                className="px-5 py-2 text-sm font-semibold text-white bg-status-error hover:bg-status-error/90 rounded-full shadow-sm"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
