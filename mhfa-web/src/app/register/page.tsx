"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setInviteStatus("checking");
    setTimeout(() => {
      setInviteStatus(val.length >= 6 ? "valid" : "invalid");
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-container rounded-full mix-blend-multiply blur-3xl opacity-30" />
      </div>

      {/* Register Card */}
      <main className="w-full max-w-[520px] bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 sm:p-10 z-10 flex flex-col gap-6 relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-2 border border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-primary filled">
              health_and_safety
            </span>
          </div>
          <h1 className="font-heading font-semibold text-2xl text-on-surface">
            Daftar Akun Baru
          </h1>
          <p className="text-base text-on-surface-variant">
            Layanan Kesehatan Jiwa MHFA
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Invite Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface" htmlFor="invite">
              Kode Undangan
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                vpn_key
              </span>
              <input
                className="w-full pl-10 pr-10 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant uppercase tracking-wider font-semibold"
                id="invite"
                placeholder="XXXXXX"
                required
                onBlur={handleInviteBlur}
              />
              {inviteStatus === "checking" && (
                <span className="absolute right-3 animate-spin material-symbols-outlined text-outline text-xl">
                  progress_activity
                </span>
              )}
              {inviteStatus === "valid" && (
                <span className="absolute right-3 material-symbols-outlined text-status-success text-xl">
                  check_circle
                </span>
              )}
              {inviteStatus === "invalid" && (
                <span className="absolute right-3 material-symbols-outlined text-status-error text-xl">
                  error
                </span>
              )}
            </div>
            {inviteStatus === "invalid" && (
              <p className="text-xs text-status-error mt-0.5">
                Kode undangan tidak valid atau sudah digunakan.
              </p>
            )}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface" htmlFor="name">
                Nama Lengkap
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                  person
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface" htmlFor="phone">
                Nomor Telepon
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                  phone
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"
                  id="phone"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface" htmlFor="email">
              Alamat Email
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                mail
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"
                id="email"
                placeholder="contoh@email.com"
                required
                type="email"
              />
            </div>
          </div>

          {/* Tanggal Lahir */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface" htmlFor="dob">
              Tanggal Lahir
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                calendar_today
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"
                id="dob"
                required
                type="date"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface" htmlFor="password">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"
                  id="password"
                  placeholder="Min. 8 karakter"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  className="absolute right-3 p-1 rounded hover:bg-surface-container text-outline"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface" htmlFor="confirm">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"
                  id="confirm"
                  placeholder="Ulangi kata sandi"
                  required
                  type={showConfirm ? "text" : "password"}
                />
                <button
                  className="absolute right-3 p-1 rounded hover:bg-surface-container text-outline"
                  onClick={() => setShowConfirm(!showConfirm)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirm ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
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
                Mendaftar...
              </>
            ) : (
              <>
                Daftar
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-base text-on-surface-variant">
          Sudah punya akun?{" "}
          <Link
            className="font-semibold text-primary hover:text-primary-container focus:outline-none focus:underline"
            href="/login"
          >
            Masuk
          </Link>
        </div>
      </main>
    </div>
  );
}
