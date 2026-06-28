"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("Ahmad Fauzi");
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [infoStatus, setInfoStatus] = useState<"idle" | "success">("idle");
  const [passStatus, setPassStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoStatus("success");
    setTimeout(() => setInfoStatus("idle"), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus("idle");
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

    setPassStatus("success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPassStatus("idle"), 3000);
  };

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
                  AF
                </div>
                <button className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-2 shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                </button>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-heading font-semibold text-lg text-on-surface">
                    Ahmad Fauzi
                  </h3>
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">
                    Pasien
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">
                  ahmad.fauzi@email.com
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
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
                  type="submit"
                >
                  Simpan Perubahan
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
                  className="border border-primary text-primary px-6 py-2.5 rounded-full text-sm font-medium hover:bg-surface-container-low transition-all active:scale-[0.98]"
                  type="submit"
                >
                  Perbarui Kata Sandi
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
                  3273 1234 5678 9012
                </span>
              </div>
              <div className="flex flex-col py-3 border-b border-outline-variant last:border-0">
                <span className="text-xs text-on-surface-variant mb-1">
                  Tanggal Bergabung
                </span>
                <span className="text-sm text-on-surface font-semibold">
                  15 Agustus 2023
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
        </div>
      </div>
    </div>
  );
}
