# Rencana Pengerjaan Halaman & Fitur MHFA

Dokumen ini melacak rencana pengerjaan sisa halaman dan integrasi backend untuk aplikasi MHFA. Pengerjaan dibagi menjadi **7 Fase** agar progress lebih terarah dan tidak terlalu panjang di setiap iterasi.

> [!IMPORTANT]
> **Standar Responsivitas (Mobile-Friendly):** Semua halaman dan alur yang dibangun di setiap fase wajib mengutamakan desain responsif (mobile-first/mobile-friendly) dengan menggunakan navigasi adaptif (Sidebar untuk layar desktop dan Bottom Navigation Bar untuk layar mobile).

---

## 📊 Rangkuman Progress

- [x] **Fase 0: Setup & Core Demo (8 Halaman Utama)** — *Selesai*
- [x] **Fase 1: Shared Modules & Alur Dasar Pasien (6 Halaman)** — *Selesai*
- [x] **Fase 2: Detail Intervensi SUFA (F & A) (3 Halaman)** — *Selesai*
- [x] **Fase 3: Antarmuka Chat & Live Sesi (Pasien & Konselor) (3 Halaman)** — *Selesai*
- [x] **Fase 4: Riwayat Medis & Profil Pasien bagi Konselor (2 Halaman)**
- [x] **Fase 5: Manajemen Konten Skrining & Panduan (Admin) (4 Halaman)**
- [x] **Fase 6: Manajemen Kode Undangan & Pengguna (Admin) (4 Halaman)** — *Selesai*
- [ ] **Fase 7: Integrasi Supabase DB, Better Auth, & Realtime Chat**

---

## 🗓️ Rincian Tugas per Fase

### 🟦 Fase 1: Shared Modules & Alur Dasar Pasien (6 Halaman)
*Fokus pada halaman umum pendukung akun dan halaman transisi pasien.*
- [x] Halaman **Lupa Password** (`/forgot-password`): Form email + trigger pengiriman token reset.
- [x] Halaman **Atur Password Baru** (`/reset-password`): Form input kata sandi baru.
- [x] Halaman **Profil Pengguna** (`/profile`): Ubah data diri, ganti password, dan upload foto profil.
- [x] Halaman **Inbox Notifikasi** (`/notifications`): Daftar riwayat notifikasi sistem dan chat masuk.
- [x] Halaman **Mulai Skrining** (`/screening/start`): Disclaimer, petunjuk pengisian kuesioner, dan tombol mulai.
- [x] Halaman **Riwayat Skrining Pasien** (`/history`): Daftar riwayat skrining lama dengan skor dan status.

---

### 🟩 Fase 2: Detail Intervensi SUFA (F & A) (3 Halaman)
*Fokus pada penyediaan materi panduan pendampingan dan kontak rujukan eksternal.*
- [x] Halaman **Daftar Panduan (F)** (`/intervention/:screeningId/guide`): Grid materi panduan yang disaring otomatis berdasarkan kondisi hasil skrining pasien.
- [x] Halaman **Detail Panduan** (`/intervention/:screeningId/guide/:guideId`): Player YouTube embed + navigasi instruksi langkah demi langkah.
- [x] Halaman **Hubungi Profesional (A)** (`/intervention/:screeningId/contact`): Direktori kontak WA eksternal, lengkap dengan tombol direct link `wa.me`.

---

### 🟨 Fase 3: Antarmuka Chat & Live Sesi (Pasien & Konselor) (3 Halaman)
*Fokus pada pembuatan mockup UI ruang obrolan langsung (chat room) dengan visualisasi status queue, bubble chat, typing indicator, dan side-panel informasi medis.*
- [x] Halaman **Live Chat Pasien (S+U)** (`/intervention/:screeningId/chat`): Bubble chat pasien ↔ konselor, area teks, status antrean, dan tombol akhiri sesi.
- [x] Halaman **Pertolongan Pertama Pasien** (`/first-aid/:screeningId`): Ruang chat khusus pasca-SUFA (struktur UI mirip chat awal, tetapi tag konteks berbeda).
- [x] Halaman **Sesi Chat Konselor** (`/konselor/chat/:sessionId`): Panel chat, panel detail pasien di sebelah kanan (hasil skrining & riwayat), dan form input catatan internal konselor.

---

### 🟧 Fase 4: Riwayat Medis & Profil Pasien bagi Konselor (2 Halaman)
*Fokus pada rekam medis dan data historis pasien yang pernah ditangani.*
- [x] Halaman **Riwayat Pasien (Konselor)** (`/konselor/patients`): List pasien yang pernah ditangani konselor dengan fitur pencarian dan filter status.
- [x] Halaman **Detail Pasien (Konselor)** (`/konselor/patients/:id`): Profil lengkap pasien, visualisasi tren hasil skrining (skor), transkrip chat lama, dan log catatan internal konselor.

---

### 🟥 Fase 5: Manajemen Konten Skrining & Panduan (Admin) (4 Halaman)
*Fokus pada pengelolaan instrumen penilaian skrining dan konten panduan oleh Admin.*
- [x] Halaman **Daftar Kuesioner** (`/admin/questionnaires`): Daftar instrumen skrining beserta toggle status aktif.
- [x] Halaman **Editor Kuesioner** (`/admin/questionnaires/:id`): CRUD pertanyaan, tipe jawaban (single/multi-select), bobot skor per opsi jawaban, dan range kesimpulan kondisi.
- [x] Halaman **Daftar Konten Panduan (F)** (`/admin/guides`): Tabel daftar video edukasi.
- [x] Halaman **Editor Panduan** (`/admin/guides/:id`): Form input judul, deskripsi, URL YouTube, step instruksi, dan tag kondisi relevan.

---

### 🟪 Fase 6: Manajemen Kode Undangan & Pengguna (Admin) (4 Halaman)
*Fokus pada administrasi sistem, pembagian invite code untuk registrasi pasien, dan pelaporan data.*
- [x] Halaman **Manajemen Kontak WA** (`/admin/contacts`): Kelola nakes rujukan eksternal.
- [x] Halaman **Manajemen Invite Code** (`/admin/invite-codes`): Generate batch invite code, atur masa berlaku, dan lacak status penggunaan.
- [x] Halaman **Manajemen User** (`/admin/users`): Lacak semua user, reset password paksa oleh admin, ganti role, dan hapus/nonaktifkan akun.
- [x] Halaman **Laporan & Ekspor CSV** (`/admin/reports`): Filter data skrining agregat dan ekspor data ke file CSV.

---

### ⬛ Fase 7: Integrasi Supabase DB, Better Auth, & Realtime Chat
*Menghubungkan frontend mockup ke database dan state yang sesungguhnya.*
- [ ] Inisialisasi **Supabase Client** & Setup schema tabel database via **Drizzle ORM**.
- [ ] Integrasi **Better Auth** dengan database untuk validasi register (invite code check), login, dan Next.js Middleware (RBAC protection).
- [ ] Integrasi **Supabase Realtime** untuk broadcast pesan chat pasien-konselor, tracking presence (status online), dan update live queue.
- [ ] Implementasi **Client-Side Idle Timer (10 menit)** untuk auto-close sesi chat.
- [ ] Pengujian E2E flow dari registrasi hingga chat selesai.
