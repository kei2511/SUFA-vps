"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  questionId: string;
  text: string;
  score: number;
}

interface Question {
  id: string;
  questionnaireId: string;
  text: string;
  type: string;
  order: number;
  options: Option[];
}

export default function ScreeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: questionnaireId } = use(params);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: optionId }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/screening/${questionnaireId}/questions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          setQuestions(data.questions);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        setLoading(false);
      });
  }, [questionnaireId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Memuat pertanyaan skrining...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-status-error text-5xl mb-4">
          error
        </span>
        <h2 className="font-heading font-bold text-xl text-on-surface mb-2">
          Kuesioner Tidak Ditemukan
        </h2>
        <p className="text-on-surface-variant max-w-md mb-6">
          Maaf, kuesioner tidak memiliki pertanyaan aktif saat ini. Silakan hubungi admin.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const question = questions[current];
  const selectedOptionId = answers[question.id];
  const progress = ((current + 1) / questions.length) * 100;

  const handleNext = () => {
    if (selectedOptionId !== undefined) {
      setCurrent(current + 1);
    }
  };

  const handlePrev = () => {
    setCurrent(Math.max(0, current - 1));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/screening/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionnaireId,
          answers,
        }),
      });

      const data = await res.json();
      if (data.success && data.sessionId) {
        router.push(`/screening/${data.sessionId}/result`);
      } else {
        alert(data.error || "Gagal mengirimkan jawaban.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting screening:", err);
      alert("Terjadi kesalahan koneksi.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center justify-between shrink-0">
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
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-xl">
            settings
          </span>
        </Link>
      </header>

      {/* Progress */}
      <div className="px-6 py-4 bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading font-bold text-lg text-on-surface">
              Skrining Kesehatan Mental
            </h2>
            <span className="text-sm text-on-surface-variant">
              {current + 1} dari {questions.length}
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-3xl">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8">
            <p className="font-heading font-medium text-xl leading-[30px] text-on-surface mb-8">
              {question.text}
            </p>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                  }
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
                    selectedOptionId === option.id
                      ? "border-primary bg-primary-fixed/20"
                      : "border-outline-variant hover:border-outline hover:bg-surface-container-low"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedOptionId === option.id
                        ? "border-primary bg-primary"
                        : "border-outline"
                    }`}
                  >
                    {selectedOptionId === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-base text-on-surface">{option.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 flex items-start gap-3 bg-surface-container rounded-xl px-5 py-4">
            <span className="material-symbols-outlined text-status-info text-xl shrink-0 mt-0.5">
              info
            </span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Pilih jawaban yang paling menggambarkan perasaan Anda selama dua
              minggu terakhir. Tidak ada jawaban benar atau salah.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant text-on-surface-variant rounded-full text-sm font-medium hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
            Sebelumnya
          </button>

          {current < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={selectedOptionId === undefined}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Berikutnya
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={selectedOptionId === undefined || submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? "Mengirim..." : "Selesai & Lihat Hasil"}
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
