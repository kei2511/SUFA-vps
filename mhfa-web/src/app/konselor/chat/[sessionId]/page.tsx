"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { authClient } from "@/lib/auth-client";

interface Message {
  id: string;
  sender: "patient" | "counselor" | "system";
  text: string;
  timestamp: string;
}

interface ScreeningHistoryItem {
  id: string;
  score: number;
  conditionLabel: string;
  completedAt: string;
}

interface PatientDetail {
  name: string;
  dob: string;
  phone: string;
  screenings: ScreeningHistoryItem[];
}

export default function CounselorChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.sessionId as string) || "1";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [status, setStatus] = useState<string>("loading"); // loading, active, completed
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [counselorNotes, setCounselorNotes] = useState({
    symptoms: "",
    assessment: "",
    recommendation: "",
  });

  const [showSaveNoteToast, setShowSaveNoteToast] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Close right panel on mobile view by default
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowRightPanel(false);
    }
  }, []);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Load user session
  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res?.data?.user && (res.data.user as any).role === "Konselor") {
        setCurrentUser(res.data.user);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  // Load session data, messages, patient profile, and saved notes
  useEffect(() => {
    if (!currentUser) return;

    const loadSessionData = async () => {
      try {
        // Fetch session status & details
        const statusRes = await fetch(`/api/chat/session/status?sessionId=${sessionId}`);
        const statusData = await statusRes.json();
        if (statusData.error) {
          router.push("/konselor/dashboard");
          return;
        }

        setStatus(statusData.status);
        if (statusData.patientDetail) {
          setPatientDetail(statusData.patientDetail);
        }
        if (statusData.savedNotes) {
          setCounselorNotes(statusData.savedNotes);
        }

        // Fetch messages
        const msgRes = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
        const msgData = await msgRes.json();
        if (msgData.messages) {
          const formatted = msgData.messages.map((m: any) => ({
            id: m.id,
            sender: m.senderId === currentUser.id ? "counselor" : "patient",
            text: m.text,
            timestamp: new Date(m.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit"
            })
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Error loading counselor session details:", err);
      }
    };

    loadSessionData();
  }, [currentUser, sessionId, router]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionId || (status !== "active" && status !== "completed")) return;

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
              sender: "patient",
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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const originalText = inputText.trim();
    setInputText("");

    // Optimistic message update
    const tempId = Date.now().toString();
    const optimisticMsg: Message = {
      id: tempId,
      sender: "counselor",
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
      console.error("Error sending counselor message:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { isTyping: e.target.value.length > 0 }
      });
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotes(true);
    try {
      const res = await fetch("/api/chat/counselor/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          symptoms: counselorNotes.symptoms,
          assessment: counselorNotes.assessment,
          recommendation: counselorNotes.recommendation
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowSaveNoteToast(true);
        setTimeout(() => setShowSaveNoteToast(false), 3000);
      }
    } catch (err) {
      console.error("Error saving notes:", err);
    } finally {
      setIsSavingNotes(false);
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
      router.push("/konselor/dashboard");
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Menghubungkan ke ruang chat...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-120px)] md:h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 md:gap-6 relative overflow-hidden">
      {/* Toast Alert */}
      {showSaveNoteToast && (
        <div className="absolute top-4 right-4 bg-status-success text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 z-50 animate-bounce">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Catatan konselor berhasil disimpan!
        </div>
      )}

      {/* Left Area: Chat Console */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm h-full w-full">
        {/* Chat Console Header */}
        <header className="px-4 md:px-5 py-3 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs md:text-sm shrink-0">
              {patientDetail?.name?.charAt(0).toUpperCase() || "P"}
            </div>
            <div className="truncate">
              <h3 className="font-heading font-semibold text-xs md:text-sm text-on-surface truncate">
                {patientDetail?.name || "Konseli Anonim"}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === "active" ? "bg-status-success" : "bg-outline"}`} />
                <span className="text-[10px] text-on-surface-variant font-medium truncate">
                  {status === "active" ? "Sesi Aktif" : "Sesi Selesai"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                showRightPanel
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
              title="Toggle Panel Detail & Catatan"
            >
              <span className="material-symbols-outlined text-lg md:text-xl">
                {showRightPanel ? "view_sidebar" : "menu_open"}
              </span>
            </button>
            {status === "active" && (
              <button
                onClick={() => setShowEndSessionModal(true)}
                className="px-2.5 md:px-4 py-1.5 md:py-2 bg-status-error text-white text-[11px] md:text-xs font-semibold rounded-lg hover:bg-status-error/90 active:scale-95 transition-all whitespace-nowrap"
              >
                Selesaikan<span className="hidden sm:inline"> Sesi</span>
              </button>
            )}
          </div>
        </header>

        {/* Chat Console Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-dim">
          {status === "completed" && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center text-xs text-primary font-semibold">
              Sesi curhat telah diselesaikan oleh konseli. Anda tetap dapat membalas chat ini untuk memberikan tindak lanjut.
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              Mulai percakapan dengan menyapa konseli.
            </div>
          ) : (
            messages.map((msg) => {
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
            })
          )}

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
              onChange={handleInputChange}
              placeholder="Tulis pesan konseling..."
              className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              disabled={status === "loading"}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || status === "loading"}
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container disabled:bg-surface-container-high disabled:text-outline transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-lg filled">send</span>
            </button>
          </form>
        </footer>
      </div>

      {/* Right Area: Detail Konseli & Catatan Konselor */}
      {showRightPanel && (
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40"
            onClick={() => setShowRightPanel(false)}
          />

          <div className="fixed md:relative inset-y-0 right-0 z-50 md:z-auto w-[90vw] max-w-sm md:w-[360px] flex flex-col gap-4 md:gap-6 shrink-0 h-full overflow-y-auto bg-surface md:bg-transparent p-4 md:p-0 shadow-2xl md:shadow-none border-l md:border-l-0 border-outline-variant">
            {/* Mobile Drawer Header */}
            <div className="flex md:hidden items-center justify-between border-b border-outline-variant pb-2 px-1">
              <h4 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
                Detail & Catatan Konseling
              </h4>
              <button
                onClick={() => setShowRightPanel(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
                aria-label="Tutup panel"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Detail Konseli Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
              <h4 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">patient_list</span>
                Profil & Skrining Konseli
              </h4>

              <div className="space-y-3 text-xs border-b border-outline-variant pb-4">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Nama:</span>
                  <span className="font-semibold text-on-surface">{patientDetail?.name || "Konseli Anonim"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tanggal Lahir:</span>
                  <span className="font-semibold text-on-surface">{patientDetail?.dob || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Telepon:</span>
                  <span className="font-semibold text-on-surface">{patientDetail?.phone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Skor Terakhir:</span>
                  <span className="font-bold text-primary">
                    {patientDetail?.screenings?.[0]?.score ?? "-"} ({patientDetail?.screenings?.[0]?.conditionLabel || "N/A"})
                  </span>
                </div>
              </div>

              {/* Riwayat Test */}
              <div className="space-y-2">
                <span className="text-xs text-on-surface-variant font-medium block">Riwayat Skrining</span>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {!patientDetail?.screenings || patientDetail.screenings.length === 0 ? (
                    <p className="text-xs text-on-surface-variant">Tidak ada riwayat skrining.</p>
                  ) : (
                    patientDetail.screenings.map((hist) => (
                      <div key={hist.id} className="bg-surface-dim rounded-lg p-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-on-surface">{hist.conditionLabel}</p>
                          <p className="text-[10px] text-on-surface-variant">{hist.completedAt}</p>
                        </div>
                        <span className="font-bold text-primary">Skor: {hist.score}</span>
                      </div>
                    ))
                  )}
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
                      rows={3}
                      value={counselorNotes.symptoms}
                      onChange={(e) => setCounselorNotes({ ...counselorNotes, symptoms: e.target.value })}
                      className="w-full p-2 bg-surface-container border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-surface-container-lowest resize-none"
                      placeholder="Tulis keluhan utama konseli..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                      Asesmen Klinis
                    </label>
                    <textarea
                      rows={3}
                      value={counselorNotes.assessment}
                      onChange={(e) => setCounselorNotes({ ...counselorNotes, assessment: e.target.value })}
                      className="w-full p-2 bg-surface-container border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-surface-container-lowest resize-none"
                      placeholder="Tulis hasil analisis / diagnosis awal..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                      Rencana Tindak Lanjut
                    </label>
                    <textarea
                      rows={3}
                      value={counselorNotes.recommendation}
                      onChange={(e) => setCounselorNotes({ ...counselorNotes, recommendation: e.target.value })}
                      className="w-full p-2 bg-surface-container border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-surface-container-lowest resize-none"
                      placeholder="Tulis instruksi / rujukan jika ada..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingNotes}
                  className="w-full py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] mt-4"
                >
                  {isSavingNotes ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* End Session Confirmation Modal */}
      {showEndSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-on-surface">
              Selesaikan Sesi Konseling?
            </h3>
            <p className="text-sm text-on-surface-variant">
              Pastikan Anda sudah menyimpan catatan konseling internal konseli sebelum menyelesaikan sesi chat ini.
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
