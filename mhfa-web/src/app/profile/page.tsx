"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  dob: string;
  nik: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nik, setNik] = useState("");
  const [dob, setDob] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [infoStatus, setInfoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passStatus, setPassStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoErrorMsg, setInfoErrorMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setProfile(data.user);
            setFullName(data.user.name || "");
            setPhone(data.user.phone || "");
            setNik(data.user.nik || "");
            setDob(data.user.dob || "");
          }
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
    loadProfile();
  }, []);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoStatus("loading");
    setInfoErrorMsg("");

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, phone, dob, nik }),
      });

      if (res.ok) {
        setInfoStatus("success");
        if (profile) {
          setProfile({
            ...profile,
            name: fullName,
            phone,
            dob,
            nik,
          });
        }
        setTimeout(() => setInfoStatus("idle"), 3000);
      } else {
        setInfoStatus("error");
        setInfoErrorMsg("Gagal menyimpan profil.");
      }
    } catch {
      setInfoStatus("error");
      setInfoErrorMsg("Terjadi kesalahan jaringan.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus("loading");
    setErrorMsg("");

    if (newPassword.length < 8) {
      setPassStatus("error");
      setErrorMsg("Kata sandi baru harus minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassStatus("error");
      setErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setPassStatus("error");
        setErrorMsg(error.message || "Gagal memperbarui kata sandi. Periksa kata sandi saat ini.");
        return;
      }

      setPassStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassStatus("idle"), 3000);
    } catch {
      setPassStatus("error");
      setErrorMsg("Terjadi kesalahan jaringan.");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <span className="animate-spin material-symbols-outlined text-4xl text-primary">
            progress_activity
          </span>
          <p className="text-on-surface-variant text-sm font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-[32px] leading-[40px] text-on-surface">
          Pengaturan Profil
        </h1>
        <p className="text-lg text-on-surface-variant mt-1">
          Kelola informasi pribadi dan keamanan akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="font-heading font-semibold text-lg text-on-surface mb-6">
              Informasi Pribadi
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-surface-container-low shadow-sm overflow-hidden text-primary text-3xl font-bold">
                  {getInitials(profile.name)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-heading font-semibold text-lg text-on-surface">
                    {profile.name}
                  </h3>
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">
                    {profile.role}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">
                  {profile.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
              {infoStatus === "success" && (
                <div className="bg-status-success/10 text-status-success text-sm rounded-lg p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    check_circle
                  </span>
                  Profil berhasil disimpan.
                </div>
              )}

              {infoStatus === "error" && (
                <div className="bg-status-error/10 text-status-error text-sm rounded-lg p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    error
                  </span>
                  {infoErrorMsg}
                </div>
              )}

              <div>
                <label
                  className="block text-sm font-medium text-on-surface mb-2"
                  htmlFor="fullName"
                >
                  Nama Lengkap
                </label>
                <input
                  className="w-full bg-surface border border-outline rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-on-surface mb-2"
                    htmlFor="phone"
                  >
                    Nomor Telepon
                  </label>
                  <input
                    className="w-full bg-surface border border-outline rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-on-surface mb-2"
                    htmlFor="dob"
                  >
                    Tanggal Lahir
                  </label>
                  <input
                    className="w-full bg-surface border border-outline rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-on-surface mb-2"
                  htmlFor="nik"
                >
                  NIK (Nomor Induk Kependudukan)
                </label>
                <input
                  className="w-full bg-surface border border-outline rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  id="nik"
                  type="text"
                  placeholder="3273xxxxxxxxxxxx"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] disabled:opacity-60"
                  type="submit"
                  disabled={infoStatus === "loading"}
                >
                  {infoStatus === "loading" ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </section>

          {/* Change Password */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="font-heading font-semibold text-lg text-on-surface mb-6">
              Keamanan Akun
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passStatus === "success" && (
                <div className="bg-status-success/10 text-status-success text-sm rounded-lg p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    check_circle
                  </span>
                  Kata sandi berhasil diperbarui.
                </div>
              )}

              {passStatus === "error" && (
                <div className="bg-status-error/10 text-status-error text-sm rounded-lg p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    error
                  </span>
                  {errorMsg}
                </div>
              )}

              <div>
                <label
                  className="block text-sm font-medium text-on-surface mb-2"
                  htmlFor="currentPassword"
                >
                  Kata Sandi Saat Ini
                </label>
                <input
                  className="w-full bg-surface border border-outline rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-on-surface mb-2"
                    htmlFor="newPassword"
                  >
                    Kata Sandi Baru
                  </label>
                  <input
                    className="w-full bg-surface border border-outline rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-on-surface mb-2"
                    htmlFor="confirmPassword"
                  >
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    className="w-full bg-surface border border-outline rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  className="border border-primary text-primary px-6 py-2.5 rounded-full text-sm font-medium hover:bg-surface-container-low transition-all active:scale-[0.98] disabled:opacity-60"
                  type="submit"
                  disabled={passStatus === "loading"}
                >
                  {passStatus === "loading" ? "Memperbarui..." : "Perbarui Kata Sandi"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Meta */}
        <div className="space-y-6">
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="font-heading font-semibold text-lg text-on-surface mb-4">
              Detail Akun
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col py-3 border-b border-outline-variant last:border-0">
                <span className="text-xs text-on-surface-variant mb-1">
                  Nomor Induk Kependudukan (NIK)
                </span>
                <span className="text-sm text-on-surface font-semibold">
                  {profile.nik || "-"}
                </span>
              </div>
              <div className="flex flex-col py-3 border-b border-outline-variant last:border-0">
                <span className="text-xs text-on-surface-variant mb-1">
                  Tanggal Bergabung
                </span>
                <span className="text-sm text-on-surface font-semibold">
                  {formatDate(profile.createdAt)}
                </span>
              </div>
              <div className="flex flex-col py-3 border-b border-outline-variant last:border-0">
                <span className="text-xs text-on-surface-variant mb-1">
                  Status Verifikasi
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-status-success text-[20px]">
                    check_circle
                  </span>
                  <span className="text-sm text-status-success font-semibold">
                    Terverifikasi
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy info */}
          <section className="bg-primary text-on-primary rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full pointer-events-none" />
            <div className="relative z-10">
              <span className="material-symbols-outlined text-4xl mb-4 filled">
                shield_person
              </span>
              <h3 className="font-heading font-bold text-lg mb-2">
                Privasi Anda Terjaga
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                Data pribadi dan riwayat kesehatan Anda dienkripsi secara aman
                sesuai standar keamanan data MHFA.
              </p>
            </div>
          </section>

          {/* Sesi Akun / Logout */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="font-heading font-semibold text-lg text-on-surface mb-3">
              Sesi Akun
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Keluar dari akun Anda pada perangkat ini.
            </p>
            <button
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/login";
              }}
              className="w-full flex items-center justify-center gap-2 bg-status-error/10 hover:bg-status-error/20 text-status-error py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Keluar dari Akun
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
