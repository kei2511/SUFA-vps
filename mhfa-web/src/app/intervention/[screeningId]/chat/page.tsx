"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authClient } from "@/lib/auth-client";

interface Message {
  id: string;
  sender: "patient" | "counselor" | "system";
  text: string;
  timestamp: string;
}

export default function PatientChatPage() {
  const params = useParams();
  const router = useRouter();
  const screeningId = (params?.screeningId as string) || "1";
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("loading"); // loading, waiting, active, completed
  const [counselorName, setCounselorName] = useState<string>("Konselor");
  const [queueNumber, setQueueNumber] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Load user session
  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res?.data?.user) {
        setCurrentUser(res.data.user);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  // Start or fetch active session
  useEffect(() => {
    if (!currentUser) return;

    const initChat = async () => {
      try {
        // Cek jika ada sesi aktif
        const activeRes = await fetch("/api/chat/session/active");
        const activeData = await activeRes.json();

        let currentSess = activeData.session;
        if (!currentSess) {
          // Jika tidak ada, start sesi baru (curhat teks default)
          const startRes = await fetch("/api/chat/session/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ screeningId, type: "curhat" })
          });
          const startData = await startRes.json();
          currentSess = startData.session;
        }

        if (currentSess) {
          setSessionId(currentSess.id);
          setStatus(currentSess.status);
          
          // Load existing messages
          const msgRes = await fetch(`/api/chat/messages?sessionId=${currentSess.id}`);
          const msgData = await msgRes.json();
          if (msgData.messages) {
            const formatted = msgData.messages.map((m: any) => ({
              id: m.id,
              sender: m.senderId === currentUser.id ? "patient" : "counselor",
              text: m.text,
              timestamp: new Date(m.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
              })
            }));
            setMessages(formatted);
          }
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
      }
    };

    initChat();
  }, [currentUser, screeningId]);

  // Poll status when in queue
  useEffect(() => {
    if (!sessionId || status !== "waiting") return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/chat/session/status?sessionId=${sessionId}`);
        const data = await res.json();
        if (data) {
          setStatus(data.status);
          setQueueNumber(data.queuePosition);
          if (data.counselorName) {
            setCounselorName(data.counselorName);
          }
        }
      } catch (err) {
        console.error("Error polling queue status:", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [sessionId, status]);

  // Supabase Realtime Channel subscription
  useEffect(() => {
    if (!sessionId || status !== "active") return;

    const channel = supabase.channel(`chat-session-${sessionId}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "message" }, (payload: any) => {
        const payloadMsg = payload.payload;
        setMessages((prev) => {
          if (prev.some((m) => m.id === payloadMsg.id)) return prev;
          return [
            ...prev,
            {
              id: payloadMsg.id,
              sender: "counselor",
              text: payloadMsg.text,
              timestamp: new Date(payloadMsg.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
              })
            }
          ];
        });
      })
      .on("broadcast", { event: "typing" }, (payload: any) => {
        setIsTyping(payload.payload.isTyping);
      })
      .on("broadcast", { event: "status_changed" }, (payload: any) => {
        setStatus(payload.payload.status);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId, status]);

  // Idle Timer (Auto-close after 10 mins of inactivity)
  const idleTimeoutRef = useRef<any>(null);
  const resetIdleTimer = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (status !== "active") return;

    idleTimeoutRef.current = setTimeout(() => {
      handleEndSession();
    }, 10 * 60 * 1000); // 10 menit
  };

  useEffect(() => {
    resetIdleTimer();
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
    };
  }, [status]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const originalText = inputText.trim();
    setInputText("");
    resetIdleTimer();

    // Optimistic message update
    const tempId = Date.now().toString();
    const optimisticMsg: Message = {
      id: tempId,
      sender: "patient",
      text: originalText,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, text: originalText })
      });
      const data = await res.json();
      if (data.success && data.message) {
        // Replace temp optimistic message with actual DB saved message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: data.message.id } : m))
        );
        // Broadcast through Supabase Realtime
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "message",
            payload: data.message
          });
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Broadcast typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    resetIdleTimer();

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { isTyping: e.target.value.length > 0 }
      });
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    try {
      await fetch("/api/chat/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "status_changed",
          payload: { status: "completed" }
        });
      }
      setStatus("completed");
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Menghubungkan layanan...</p>
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <span className="material-symbols-outlined text-primary text-4xl filled animate-bounce">
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

          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <span className="text-xs text-primary font-medium block">
              Posisi Antrean Anda
            </span>
            <span className="font-heading font-bold text-3xl text-primary mt-1 block">
              No. {queueNumber}
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-1">
              Est. Waktu Tunggu: ~{queueNumber * 2} menit
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

  if (status === "completed") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center space-y-6 shadow-sm animate-fade-in">
          <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto text-status-success">
            <span className="material-symbols-outlined text-3xl">task_alt</span>
          </div>
          <div className="space-y-2">
            <h1 className="font-heading font-bold text-xl text-on-surface">
              Sesi Konseling Selesai
            </h1>
            <p className="text-sm text-on-surface-variant">
              Terima kasih telah berbagi cerita dengan konselor kami. Anda dapat mengakses kembali langkah-langkah intervensi berikutnya sekarang.
            </p>
          </div>
          <Link
            href={`/intervention/${screeningId}`}
            className="w-full inline-block py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
          >
            Kembali ke Hub Intervensi
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
              {counselorName}
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
            onChange={handleInputChange}
            placeholder="Tulis pesan Anda..."
            className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
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
