"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    setTimeout(() => {
      setIsLoading(false);
      if (email.toLowerCase().trim() === "error@email.com") {
        setStatus("error");
      } else {
        setStatus("success");
      }
    }, 1500);
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary-fixed opacity-[0.15] blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-secondary-fixed opacity-[0.15] blur-3xl" />
      </div>

      <main className="w-full max-w-[440px] z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-2xl text-primary flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[32px] filled">
              health_and_safety
            </span>
            Layanan Kesehatan Jiwa
          </h1>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-3xl filled">
                lock_reset
              </span>
            </div>
            <h2 className="font-heading font-semibold text-xl text-on-surface mb-2">
              Lupa Kata Sandi
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "success" && (
              <div className="bg-status-success/10 text-status-success text-sm rounded-lg p-4 flex items-start gap-2">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">
                  check_circle
                </span>
                <p>Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa folder inbox atau spam.</p>
              </div>
            )}

            {status === "error" && (
              <div className="bg-status-error/10 text-status-error text-sm rounded-lg p-4 flex items-start gap-2">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">
                  error
                </span>
                <p>Email tidak terdaftar dalam sistem kami. Coba lagi atau hubungi admin.</p>
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-on-surface"
                htmlFor="email"
              >
                Alamat Email
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                  mail
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"
                  id="email"
                  placeholder="nama@email.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || status === "success"}
                />
              </div>
            </div>

            {/* Action */}
            {status === "success" ? (
              <Link
                href="/reset-password"
                className="w-full py-3 mt-2 bg-primary text-on-primary rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98]"
              >
                Atur Sandi Baru (Demo)
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </Link>
            ) : (
              <button
                className="w-full py-3 mt-2 bg-primary text-on-primary rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[20px]">
                      progress_activity
                    </span>
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Tautan Reset
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-container p-2 rounded-lg hover:bg-surface-container"
            href="/login"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Kembali ke Halaman Masuk
          </Link>
        </div>
      </main>
    </div>
  );
}
