"use client";

import Link from "next/link";
import { useState } from "react";

const questions = [
  {
    text: "Dalam 2 minggu terakhir, seberapa sering Anda merasa kurang minat atau kesenangan dalam melakukan berbagai hal?",
    options: ["Tidak pernah sama sekali", "Beberapa hari", "Lebih dari separuh waktu", "Hampir setiap hari"],
  },
  {
    text: "Dalam 2 minggu terakhir, seberapa sering Anda merasa sedih, tertekan, atau putus asa?",
    options: ["Tidak pernah sama sekali", "Beberapa hari", "Lebih dari separuh waktu", "Hampir setiap hari"],
  },
  {
    text: "Dalam 2 minggu terakhir, seberapa sering Anda mengalami kesulitan untuk tidur, tetap tidur, atau terlalu banyak tidur?",
    options: ["Tidak pernah sama sekali", "Beberapa hari", "Lebih dari separuh waktu", "Hampir setiap hari"],
  },
];

export default function ScreeningPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const total = 20; // simulated total

  const question = questions[current] || questions[0];
  const selected = answers[current];
  const progress = ((current + 1) / total) * 100;

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
              {current + 1} dari {total}
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
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [current]: idx }))
                  }
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
                    selected === idx
                      ? "border-primary bg-primary-fixed/20"
                      : "border-outline-variant hover:border-outline hover:bg-surface-container-low"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected === idx
                        ? "border-primary bg-primary"
                        : "border-outline"
                    }`}
                  >
                    {selected === idx && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-base text-on-surface">{option}</span>
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
            onClick={() => setCurrent(Math.max(0, current - 1))}
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
              onClick={() => {
                if (selected !== undefined) setCurrent(current + 1);
              }}
              disabled={selected === undefined}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Berikutnya
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          ) : (
            <Link
              href="/screening/1/result"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98]"
            >
              Selesai & Lihat Hasil
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
