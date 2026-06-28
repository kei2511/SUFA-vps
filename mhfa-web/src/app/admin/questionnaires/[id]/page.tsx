"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface QuestionOption {
  id: string;
  text: string;
  score: number;
}

interface Question {
  id: string;
  order: number;
  text: string;
  type: "single" | "multi";
  options: QuestionOption[];
}

interface ScoreRange {
  id: string;
  label: string;
  min: number;
  max: number;
  color: "success" | "info" | "warning" | "error";
}

export default function AdminQuestionnaireEditorPage() {
  const params = useParams();
  const qId = (params?.id as string) || "srq-20";
  const isNew = qId === "new";

  const [title, setTitle] = useState(isNew ? "" : "Self-Reporting Questionnaire (SRQ-20)");
  const [code, setCode] = useState(isNew ? "" : "SRQ-20");
  const [description, setDescription] = useState(
    isNew ? "" : "Instrumen skrining gangguan jiwa umum (20 pertanyaan Ya/Tidak) yang dikembangkan oleh WHO."
  );
  const [category, setCategory] = useState<"Umum" | "Depresi" | "Kecemasan" | "Stres">(
    isNew ? "Umum" : "Umum"
  );

  const [questions, setQuestions] = useState<Question[]>(
    isNew
      ? []
      : [
          {
            id: "q1",
            order: 1,
            text: "Apakah Anda sering menderita sakit kepala?",
            type: "single",
            options: [
              { id: "q1-y", text: "Ya", score: 1 },
              { id: "q1-n", text: "Tidak", score: 0 },
            ],
          },
          {
            id: "q2",
            order: 2,
            text: "Apakah Anda kehilangan nafsu makan?",
            type: "single",
            options: [
              { id: "q2-y", text: "Ya", score: 1 },
              { id: "q2-n", text: "Tidak", score: 0 },
            ],
          },
          {
            id: "q3",
            order: 3,
            text: "Apakah Anda sulit tidur?",
            type: "single",
            options: [
              { id: "q3-y", text: "Ya", score: 1 },
              { id: "q3-n", text: "Tidak", score: 0 },
            ],
          },
          {
            id: "q4",
            order: 4,
            text: "Apakah Anda mudah merasa takut?",
            type: "single",
            options: [
              { id: "q4-y", text: "Ya", score: 1 },
              { id: "q4-n", text: "Tidak", score: 0 },
            ],
          },
          {
            id: "q5",
            order: 5,
            text: "Apakah tangan Anda gemetar?",
            type: "single",
            options: [
              { id: "q5-y", text: "Ya", score: 1 },
              { id: "q5-n", text: "Tidak", score: 0 },
            ],
          },
        ]
  );

  const [scoreRanges, setScoreRanges] = useState<ScoreRange[]>(
    isNew
      ? [
          { id: "sr-1", label: "Normal", min: 0, max: 5, color: "success" },
          { id: "sr-2", label: "Ringan", min: 6, max: 10, color: "info" },
          { id: "sr-3", label: "Sedang", min: 11, max: 15, color: "warning" },
          { id: "sr-4", label: "Berat", min: 16, max: 20, color: "error" },
        ]
      : [
          { id: "sr-1", label: "Normal", min: 0, max: 5, color: "success" },
          { id: "sr-2", label: "Gangguan Ringan", min: 6, max: 10, color: "info" },
          { id: "sr-3", label: "Gangguan Sedang", min: 11, max: 15, color: "warning" },
          { id: "sr-4", label: "Gangguan Berat", min: 16, max: 20, color: "error" },
        ]
  );

  const [activeSection, setActiveSection] = useState<"info" | "questions" | "scoring">("info");

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const addQuestion = () => {
    const newId = `q-${Date.now()}`;
    const newOrder = questions.length + 1;
    setQuestions((prev) => [
      ...prev,
      {
        id: newId,
        order: newOrder,
        text: "",
        type: "single",
        options: [
          { id: `${newId}-a`, text: "Ya", score: 1 },
          { id: `${newId}-b`, text: "Tidak", score: 0 },
        ],
      },
    ]);
    setEditingQuestionId(newId);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) =>
      prev
        .filter((q) => q.id !== id)
        .map((q, idx) => ({ ...q, order: idx + 1 }))
    );
    if (editingQuestionId === id) setEditingQuestionId(null);
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text } : q))
    );
  };

  const updateQuestionType = (id: string, type: "single" | "multi") => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, type } : q))
    );
  };

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: [
            ...q.options,
            { id: `${questionId}-${Date.now()}`, text: "", score: 0 },
          ],
        };
      })
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return { ...q, options: q.options.filter((o) => o.id !== optionId) };
      })
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    field: "text" | "score",
    value: string | number
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) =>
            o.id === optionId ? { ...o, [field]: value } : o
          ),
        };
      })
    );
  };

  const addScoreRange = () => {
    setScoreRanges((prev) => [
      ...prev,
      { id: `sr-${Date.now()}`, label: "", min: 0, max: 0, color: "info" },
    ]);
  };

  const removeScoreRange = (id: string) => {
    setScoreRanges((prev) => prev.filter((sr) => sr.id !== id));
  };

  const updateScoreRange = (
    id: string,
    field: keyof ScoreRange,
    value: string | number
  ) => {
    setScoreRanges((prev) =>
      prev.map((sr) => (sr.id === id ? { ...sr, [field]: value } : sr))
    );
  };

  const getColorBadge = (color: ScoreRange["color"]) => {
    switch (color) {
      case "success":
        return "bg-status-success/10 text-status-success border-status-success/20";
      case "info":
        return "bg-status-info/10 text-status-info border-status-info/20";
      case "warning":
        return "bg-status-warning/10 text-status-warning border-status-warning/20";
      case "error":
        return "bg-status-error/10 text-status-error border-status-error/20";
    }
  };

  const totalMaxScore = questions.reduce((sum, q) => {
    const maxOpt = q.options.reduce((m, o) => Math.max(m, o.score), 0);
    return sum + maxOpt;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Back & Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/questionnaires"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Kembali ke Daftar Kuesioner
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
              {isNew ? "Buat Kuesioner Baru" : "Editor Kuesioner"}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {isNew
                ? "Rancang instrumen skrining baru dengan pertanyaan dan skema penilaian."
                : `Mengedit: ${code}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-5 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl text-sm font-medium hover:bg-surface-container transition-all active:scale-[0.98]">
              Pratinjau
            </button>
            <button className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {(
          [
            { key: "info", label: "Info Dasar", icon: "info" },
            { key: "questions", label: "Pertanyaan", icon: "quiz" },
            { key: "scoring", label: "Skema Skor", icon: "tune" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex-1 py-3.5 text-center text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeSection === tab.key
                ? "border-primary text-primary bg-surface-container-lowest"
                : "border-transparent text-on-surface-variant hover:text-on-surface bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Info Section */}
      {activeSection === "info" && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Nama Kuesioner</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Patient Health Questionnaire-9"
                className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Kode Instrumen</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="cth: PHQ-9"
                className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan tujuan dan cakupan kuesioner ini..."
              rows={3}
              className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">Kategori</label>
            <div className="flex items-center gap-2 flex-wrap">
              {(["Umum", "Depresi", "Kecemasan", "Stres"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    category === cat
                      ? "bg-primary text-on-primary border-primary"
                      : "text-on-surface-variant border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-status-info">info</span>
            <p>
              Skor maksimum dihitung otomatis dari bobot tertinggi tiap opsi jawaban pada semua pertanyaan.
              Skor maks saat ini:{" "}
              <span className="font-bold text-on-surface">{totalMaxScore}</span>
            </p>
          </div>
        </div>
      )}

      {/* Questions Section */}
      {activeSection === "questions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-on-surface-variant font-semibold">
              {questions.length} pertanyaan terdaftar
            </p>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Tambah Pertanyaan
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">quiz</span>
              <p className="font-semibold text-on-surface mb-1">Belum ada pertanyaan</p>
              <p className="text-xs">Klik tombol &quot;Tambah Pertanyaan&quot; untuk mulai menyusun kuesioner.</p>
            </div>
          ) : (
            questions.map((q) => {
              const isEditing = editingQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  className={`bg-surface-container-lowest border rounded-2xl shadow-sm overflow-hidden transition-all ${
                    isEditing ? "border-primary" : "border-outline-variant"
                  }`}
                >
                  {/* Question Header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-container-low/50 transition-all"
                    onClick={() =>
                      setEditingQuestionId(isEditing ? null : q.id)
                    }
                  >
                    <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {q.order}
                    </span>
                    <p className="flex-1 text-sm text-on-surface font-medium truncate">
                      {q.text || "(Pertanyaan kosong)"}
                    </p>
                    <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container px-2 py-0.5 rounded">
                      {q.type === "single" ? "Pilihan Tunggal" : "Pilihan Ganda"}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-outline transition-transform duration-200"
                      style={{ transform: isEditing ? "rotate(180deg)" : "rotate(0deg)" }}>
                      expand_more
                    </span>
                  </div>

                  {/* Question Edit Panel */}
                  {isEditing && (
                    <div className="border-t border-outline-variant/40 p-4 space-y-4 bg-surface-dim">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-on-surface">Teks Pertanyaan</label>
                        <textarea
                          value={q.text}
                          onChange={(e) => updateQuestionText(q.id, e.target.value)}
                          placeholder="Tulis pertanyaan di sini..."
                          rows={2}
                          className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-on-surface">Tipe Jawaban:</label>
                        <div className="flex items-center gap-1.5">
                          {(["single", "multi"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => updateQuestionType(q.id, t)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                q.type === t
                                  ? "bg-primary text-on-primary border-primary"
                                  : "text-on-surface-variant border-outline-variant hover:bg-surface-container"
                              }`}
                            >
                              {t === "single" ? "Pilihan Tunggal" : "Pilihan Ganda"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Options Editor */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-on-surface">Opsi Jawaban & Bobot Skor</label>
                        {q.options.map((opt, optIdx) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <span className="text-[10px] text-outline w-4 text-center font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => updateOption(q.id, opt.id, "text", e.target.value)}
                              placeholder="Teks opsi..."
                              className="flex-1 px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary transition-all"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-on-surface-variant">Skor:</span>
                              <input
                                type="number"
                                value={opt.score}
                                onChange={(e) =>
                                  updateOption(q.id, opt.id, "score", parseInt(e.target.value) || 0)
                                }
                                className="w-14 px-2 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-center font-mono focus:outline-none focus:border-primary transition-all"
                              />
                            </div>
                            {q.options.length > 2 && (
                              <button
                                onClick={() => removeOption(q.id, opt.id)}
                                className="p-1 text-status-error hover:bg-status-error/10 rounded transition-all"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(q.id)}
                          className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          Tambah Opsi
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="px-3 py-1.5 text-status-error border border-status-error/30 hover:bg-status-error/10 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Hapus Pertanyaan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Scoring Section */}
      {activeSection === "scoring" && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-heading font-bold text-sm text-on-surface">Range Kesimpulan Kondisi</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Tentukan rentang skor dan label kondisi untuk setiap tingkat keparahan.
              </p>
            </div>

            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-status-info">info</span>
              <p>
                Skor maksimum dari {questions.length} pertanyaan:{" "}
                <span className="font-bold text-on-surface">{totalMaxScore}</span>.
                Pastikan rentang skor menutupi seluruh kemungkinan nilai (0 – {totalMaxScore}).
              </p>
            </div>

            <div className="space-y-3">
              {scoreRanges.map((sr) => (
                <div
                  key={sr.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-surface-dim border border-outline-variant/30 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      sr.color === "success" ? "bg-status-success" :
                      sr.color === "info" ? "bg-status-info" :
                      sr.color === "warning" ? "bg-status-warning" :
                      "bg-status-error"
                    }`} />
                    <input
                      type="text"
                      value={sr.label}
                      onChange={(e) => updateScoreRange(sr.id, "label", e.target.value)}
                      placeholder="Label kondisi..."
                      className="flex-1 px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-on-surface-variant">Min:</span>
                    <input
                      type="number"
                      value={sr.min}
                      onChange={(e) =>
                        updateScoreRange(sr.id, "min", parseInt(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-center font-mono focus:outline-none focus:border-primary transition-all"
                    />
                    <span className="text-[10px] text-on-surface-variant">Max:</span>
                    <input
                      type="number"
                      value={sr.max}
                      onChange={(e) =>
                        updateScoreRange(sr.id, "max", parseInt(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-center font-mono focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={sr.color}
                      onChange={(e) =>
                        updateScoreRange(sr.id, "color", e.target.value)
                      }
                      className="px-2 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="success">🟢 Hijau</option>
                      <option value="info">🔵 Biru</option>
                      <option value="warning">🟡 Kuning</option>
                      <option value="error">🔴 Merah</option>
                    </select>

                    <button
                      onClick={() => removeScoreRange(sr.id)}
                      className="p-1.5 text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addScoreRange}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Tambah Range Skor
            </button>

            {/* Visual Preview */}
            <div className="border-t border-outline-variant/30 pt-4">
              <h4 className="text-xs font-semibold text-on-surface mb-3">Pratinjau Visual</h4>
              <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden">
                {scoreRanges.map((sr) => {
                  const rangeWidth = totalMaxScore > 0 ? ((sr.max - sr.min + 1) / (totalMaxScore + 1)) * 100 : 25;
                  return (
                    <div
                      key={sr.id}
                      className={`h-full flex items-center justify-center text-[9px] font-bold border ${getColorBadge(sr.color)}`}
                      style={{ width: `${rangeWidth}%`, minWidth: "40px" }}
                    >
                      {sr.label} ({sr.min}–{sr.max})
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
