"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteStatus, setInviteStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState("");
  const [inviteId, setInviteId] = useState("");
  const [assignedCounselorId, setAssignedCounselorId] = useState<string | null>(null);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Check URL parameter ?code=...
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
      validateCode(codeFromUrl);
    }
  }, [searchParams]);

  const validateCode = async (codeVal: string) => {
    const val = codeVal.trim();
    if (!val) {
      setInviteStatus("idle");
      setInviteId("");
      setAssignedCounselorId(null);
      setDetectedRole(null);
      setInviteError("");
      setInviteSuccessMsg("");
      return;
    }
    setInviteStatus("checking");
    setInviteError("");
    setInviteSuccessMsg("");

    try {
      const res = await fetch("/api/invite-code/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: val }),
      });
      const json = await res.json();

      if (json.valid) {
        setInviteStatus("valid");
        setInviteId(json.inviteId || "");
        setAssignedCounselorId(json.counselorId || null);
        setDetectedRole(json.role || "Konseli");
        if (json.message) {
          setInviteSuccessMsg(json.message);
        }
      } else {
        setInviteStatus("invalid");
        setInviteError(json.error || "Kode undangan tidak valid.");
        setDetectedRole(null);
        setAssignedCounselorId(null);
      }
    } catch {
      setInviteStatus("invalid");
      setInviteError("Gagal memvalidasi kode. Periksa koneksi internet.");
      setDetectedRole(null);
      setAssignedCounselorId(null);
    }
  };

  const handleInviteBlur = () => {
    validateCode(inviteCode);
  };

  // Determine the role that will be assigned
  const assignedRole = detectedRole || "Konseli";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // If invite code is filled but not validated yet
    if (inviteCode.trim() && inviteStatus !== "valid") {
      setErrorMsg("Kode undangan belum tervalidasi. Klik di luar kolom kode untuk memvalidasi.");
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Kata sandi minimal 8 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
        dob: dob,
      } as any);

      if (error) {
        setErrorMsg(error.message || "Gagal mendaftar. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      if (data) {
        // If invite code or counselor referral code was used, mark it and assign role / counselor
        if ((inviteId || assignedCounselorId) && inviteStatus === "valid") {
          await fetch("/api/invite-code/use", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inviteId: inviteId || null,
              userId: data.user?.id,
              assignedCounselorId: assignedCounselorId || null,
            }),
          });
        }

        // Redirect based on assigned role
        if (assignedRole === "Admin") {
          router.push("/admin");
        } else if (assignedRole === "Konselor") {
          router.push("/konselor/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const getRoleBadge = () => {
    switch (assignedRole) {
      case "Admin":
        return {
          icon: "admin_panel_settings",
          label: "Admin",
          style: "bg-status-error/10 text-status-error border-status-error/20",
        };
      case "Konselor":
        return {
          icon: "support_agent",
          label: "Konselor",
          style: "bg-status-info/10 text-status-info border-status-info/20",
        };
      default:
        return {
          icon: "person",
          label: "Konseli",
          style: "bg-status-success/10 text-status-success border-status-success/20",
        };
    }
  };

  const badge = getRoleBadge();

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
            Layanan Kesehatan Jiwa SUFA
          </p>
        </div>

        {/* Role Badge */}
        <div className="flex items-center justify-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.style}`}
          >
            <span className="material-symbols-outlined text-sm filled">{badge.icon}</span>
            Mendaftar sebagai: {badge.label}
          </span>
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

          {/* Invite Code (Optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface" htmlFor="invite">
              Kode Rujukan / Undangan{" "}
              <span className="text-xs text-on-surface-variant font-normal">
                (opsional — Kode Konselor / Role Khusus)
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">
                vpn_key
              </span>
              <input
                className="w-full pl-10 pr-10 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base text-on-surface placeholder:text-outline-variant uppercase tracking-wider font-semibold"
                id="invite"
                placeholder="Masukkan Kode Konselor / Kode Undangan"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
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
                {inviteError || "Kode undangan tidak valid atau sudah digunakan."}
              </p>
            )}
            {inviteStatus === "valid" && (
              <div className="text-xs text-status-success mt-0.5 flex flex-col gap-0.5">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span>
                  {inviteSuccessMsg || `Kode valid — Anda akan didaftarkan sebagai ${detectedRole}`}
                </span>
                {assignedCounselorId && (
                  <span className="text-primary font-medium pl-5">
                    ✓ Otomatis terhubung ke kelompok Konselor ini.
                  </span>
                )}
              </div>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={dob}
                onChange={(e) => setDob(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                Daftar sebagai {assignedRole}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-on-surface-variant">Memuat...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
