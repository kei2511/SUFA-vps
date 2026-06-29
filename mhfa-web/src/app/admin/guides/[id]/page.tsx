"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface GuideStep {
  id: string;
  order: number;
  title: string;
  description: string;
}

export default function AdminGuideEditorPage() {
  const params = useParams();
  const router = useRouter();
  const guideId = (params?.id as string) || "new";
  const isNew = guideId === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const availableTags = ["Kecemasan", "Depresi", "Stres", "Umum"];

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/guides/${guideId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.guide) {
            setTitle(data.guide.title || "");
            setDescription(data.guide.description || "");
            setYoutubeUrl(data.guide.youtubeUrl || "");
            setSelectedTags(data.guide.conditionTags || []);
            try {
              const parsedSteps = JSON.parse(data.guide.instructions || "[]");
              setSteps(parsedSteps);
            } catch (e) {
              setSteps([]);
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading guide:", err);
          setLoading(false);
        });
    }
  }, [guideId, isNew]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addStep = () => {
    const newId = `s-${Date.now()}`;
    setSteps((prev) => [
      ...prev,
      { id: newId, order: prev.length + 1, title: "", description: "" },
    ]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, order: idx + 1 }))
    );
  };

  const updateStep = (id: string, field: "title" | "description", value: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const moveStep = (id: string, direction: "up" | "down") => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;
      const newArr = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const ytId = getYouTubeId(youtubeUrl);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Depresi":
        return "bg-status-error/10 text-status-error border-status-error/20";
      case "Kecemasan":
        return "bg-status-warning/10 text-status-warning border-status-warning/20";
      case "Stres":
        return "bg-tertiary/10 text-tertiary border-tertiary/20";
      case "Umum":
      default:
        return "bg-status-info/10 text-status-info border-status-info/20";
    }
  };

  const handleSave = async () => {
    if (!title || !youtubeUrl) {
      alert("Judul dan URL YouTube wajib diisi.");
      return;
    }

    setSaving(true);
    const payload = {
      title,
      description,
      youtubeUrl,
      conditionTags: selectedTags,
      instructions: JSON.stringify(steps),
      status: "Aktif",
    };

    try {
      const url = isNew ? "/api/admin/guides" : `/api/admin/guides/${guideId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/guides");
      } else {
        alert(data.error || "Gagal menyimpan panduan.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat data editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* Back & Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/guides"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Kembali ke Daftar Panduan
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
              {isNew ? "Buat Panduan Baru" : "Editor Panduan"}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {isNew
                ? "Tambahkan konten video edukasi dan langkah-langkah panduan baru."
                : `Mengedit: ${title}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Video */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">info</span>
              Informasi Panduan
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Judul</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Teknik Pernapasan Kotak"
                className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan isi panduan secara singkat..."
                rows={3}
                className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Tag Kondisi Relevan</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? getTagColor(tag) + " border-current"
                          : "text-on-surface-variant border-outline-variant hover:bg-surface-container"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[12px] mr-0.5 align-middle">check</span>
                      )}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* YouTube Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-status-error">play_circle</span>
              Video YouTube
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">URL Video</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all font-mono text-xs"
              />
            </div>

            {/* Video Preview */}
            {ytId ? (
              <div className="rounded-xl overflow-hidden border border-outline-variant/30 aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="Video Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container aspect-video flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl text-outline mb-1">
                  video_library
                </span>
                <p className="text-xs">Masukkan URL YouTube untuk pratinjau</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Steps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">list_alt</span>
              Langkah-langkah Instruksi ({steps.length} langkah)
            </h3>
            <button
              onClick={addStep}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Tambah Langkah
            </button>
          </div>

          {steps.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">
                format_list_numbered
              </span>
              <p className="font-semibold text-on-surface mb-1">Belum ada langkah</p>
              <p className="text-xs">
                Klik &quot;Tambah Langkah&quot; untuk menambahkan instruksi panduan.
              </p>
            </div>
          ) : (
            steps.map((step) => (
              <div
                key={step.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Step Number & Reorder */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => moveStep(step.id, "up")}
                      disabled={step.order === 1}
                      className="p-0.5 text-outline hover:text-primary disabled:opacity-30 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">keyboard_arrow_up</span>
                    </button>
                    <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                      {step.order}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveStep(step.id, "down")}
                      disabled={step.order === steps.length}
                      className="p-0.5 text-outline hover:text-primary disabled:opacity-30 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
                    </button>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(step.id, "title", e.target.value)}
                      placeholder="Judul langkah..."
                      className="w-full px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(step.id, "description", e.target.value)}
                      placeholder="Deskripsi langkah secara detail..."
                      rows={2}
                      className="w-full px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all resize-none"
                    />
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="p-1.5 text-status-error hover:bg-status-error/10 rounded-lg transition-all shrink-0"
                    title="Hapus Langkah"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Preview Summary */}
          {steps.length > 0 && (
            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/30 space-y-3">
              <h4 className="text-xs font-semibold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">preview</span>
                Pratinjau Alur Langkah
              </h4>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 whitespace-nowrap shrink-0">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                        {step.order}
                      </span>
                      <span className="text-[11px] text-on-surface font-medium max-w-[120px] truncate">
                        {step.title || "..."}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <span className="material-symbols-outlined text-outline text-[14px] shrink-0">
                        arrow_forward
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
