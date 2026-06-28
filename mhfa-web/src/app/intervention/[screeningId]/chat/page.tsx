"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Message {
  id: string;
  sender: "patient" | "counselor";
  text: string;
  timestamp: string;
}

export default function PatientChatPage() {
  const params = useParams();
  const router = useRouter();
  const screeningId = params?.screeningId || "1";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "counselor",
      text: "Halo, saya dr. Sarah Wijaya. Saya di sini untuk mendengarkan cerita Anda dengan aman dan rahasia. Apa yang sedang Anda rasakan saat ini?",
      timestamp: "19:54",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [queueNumber, setQueueNumber] = useState(2);
  const [isConnected, setIsConnected] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate queue count down
  useEffect(() => {
    if (isConnected) return;
    const interval = setInterval(() => {
      setQueueNumber((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsConnected(true);
          return 0;
        }
        return prev - 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isConnected]);

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

    // Simulate counselor reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const counselorReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "counselor",
        text: "Terima kasih sudah membagikan perasaan Anda. Sangat wajar untuk merasa cemas di situasi saat ini. Mari kita coba tarik napas perlahan, dan ceritakan lebih lanjut apa yang biasanya membuat perasaan ini muncul.",
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, counselorReply]);
    }, 2500);
  };

  const handleEndSession = () => {
    router.push(`/intervention/${screeningId}`);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center space-y-6 shadow-sm">
          {/* Waiting Animation */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <span className="material-symbols-outlined text-primary text-4xl filled">
              forum
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-bold text-xl text-on-surface">
              Menghubungkan ke Konselor
            </h1>
            <p className="text-sm text-on-surface-variant">
              Mohon tunggu sebentar, sistem sedang mencarikan konselor pendamping yang tersedia untuk Anda.
            </p>
          </div>

          {/* Queue Status Box */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <span className="text-xs text-primary font-medium block">
              Posisi Antrean Anda
            </span>
            <span className="font-heading font-bold text-3xl text-primary mt-1 block">
              No. {queueNumber}
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-1">
              Est. Waktu Tunggu: ~2 menit
            </span>
          </div>

          <Link
            href={`/intervention/${screeningId}`}
            className="inline-block text-xs font-semibold text-status-error hover:underline pt-2"
          >
            Batalkan Permintaan & Kembali
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col h-screen overflow-hidden">
      {/* Chat Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl filled">
                support_agent
              </span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-status-success border-2 border-surface-container-lowest" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-sm text-on-surface leading-tight">
              dr. Sarah Wijaya
            </h2>
            <span className="text-xs text-status-success font-medium flex items-center gap-1">
              Konselor Aktif
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowEndConfirm(true)}
          className="px-3.5 py-1.5 border border-status-error/30 text-status-error hover:bg-status-error/5 rounded-full text-xs font-semibold transition-all active:scale-[0.98]"
        >
          Akhiri Sesi
        </button>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-dim">
        <div className="max-w-md mx-auto space-y-4">
          {/* Info Banner */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-3 text-center text-[11px] text-on-surface-variant space-y-1">
            <p className="font-medium text-primary flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              Enkripsi Ujung-ke-Ujung
            </p>
            <p>
              Percakapan ini bersifat rahasia dan hanya dapat diakses oleh Anda dan konselor demi kenyamanan bersama.
            </p>
          </div>

          {messages.map((msg) => {
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

      {/* End Session Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-on-surface">
              Akhiri Sesi Konseling?
            </h3>
            <p className="text-sm text-on-surface-variant">
              Apakah Anda yakin ingin menyelesaikan obrolan ini? Anda akan diarahkan kembali ke halaman langkah intervensi.
            </p>
            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-full"
              >
                Batal
              </button>
              <button
                onClick={handleEndSession}
                className="px-5 py-2 text-sm font-semibold text-white bg-status-error hover:bg-status-error/90 rounded-full shadow-sm"
              >
                Ya, Selesaikan Sesi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
