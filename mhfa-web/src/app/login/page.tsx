"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (session?.user) {
      const role = (session.user as Record<string, any>).role || "Pasien";
      if (role === "Admin") {
        router.push("/admin/dashboard");
      } else if (role === "Konselor") {
        router.push("/konselor/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Email atau kata sandi salah.");
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Role is already in the response from Better Auth
        const role = (data.user as Record<string, unknown>).role || "Pasien";

        // Redirect based on role using router for faster client-side navigation
        if (role === "Admin") {
          router.push("/admin/dashboard");
        } else if (role === "Konselor") {
          router.push("/konselor/dashboard");
        } else {
          router.push("/dashboard");
        }
        // Refresh to ensure server components get fresh session
        router.refresh();
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-secondary-container rounded-full mix-blend-multiply blur-3xl opacity-30" />
      </div>

      {/* Login Card */}
      <main className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 sm:p-10 z-10 flex flex-col gap-6 relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-2 border border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-primary filled">
              health_and_safety
            </span>
          </div>
          <h1 className="font-heading font-semibold text-2xl text-on-surface">
            Masuk ke Akun
          </h1>
          <p className="text-base text-on-surface-variant">
            Layanan Kesehatan Jiwa MHFA
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-status-error/10 text-status-error text-sm rounded-lg p-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Email */}
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
                placeholder="contoh@email.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-on-surface"
              htmlFor="password"
            >
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                lock
              </span>
              <input
                className="w-full pl-10 pr-12 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant"
                id="password"
                placeholder="Masukkan kata sandi Anda"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                className="absolute right-3 p-1 rounded hover:bg-surface-container text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mt-1">
            <Link
              className="text-sm font-medium text-primary hover:text-primary-container focus:outline-none focus:underline"
              href="/forgot-password"
            >
              Lupa kata sandi?
            </Link>
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
                Masuk...
              </>
            ) : (
              <>
                Masuk
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-outline-variant" />
          <span className="flex-shrink-0 mx-4 text-xs text-outline">Atau</span>
          <div className="flex-grow border-t border-outline-variant" />
        </div>

        {/* Footer */}
        <div className="text-center text-base text-on-surface-variant">
          Belum punya akun?{" "}
          <Link
            className="font-semibold text-primary hover:text-primary-container focus:outline-none focus:underline"
            href="/register"
          >
            Daftar sekarang
          </Link>
        </div>
      </main>
    </div>
  );
}
