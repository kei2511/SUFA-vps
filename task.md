# Rencana Pengerjaan Halaman & Fitur MHFA

Dokumen ini melacak rencana pengerjaan sisa halaman dan integrasi backend untuk aplikasi MHFA. Pengerjaan dibagi menjadi **12 Fase** agar progress lebih terarah dan tidak terlalu panjang di setiap iterasi.

> [!IMPORTANT]
> **Standar Responsivitas (Mobile-Friendly):** Semua halaman dan alur yang dibangun di setiap fase wajib mengutamakan desain responsif (mobile-first/mobile-friendly) dengan menggunakan navigasi adaptif (Sidebar untuk layar desktop dan Bottom Navigation Bar untuk layar mobile).

---

## 📊 Rangkuman Progress

- [x] **Fase 0: Setup & Core Demo (8 Halaman Utama)** — *Selesai*
- [x] **Fase 1: Shared Modules & Alur Dasar Pasien (6 Halaman)** — *Selesai*
- [x] **Fase 2: Detail Intervensi SUFA (F & A) (3 Halaman)** — *Selesai*
- [x] **Fase 3: Antarmuka Chat & Live Sesi (Pasien & Konselor) (3 Halaman)** — *Selesai*
- [x] **Fase 4: Riwayat Medis & Profil Pasien bagi Konselor (2 Halaman)** — *Selesai*
- [x] **Fase 5: Manajemen Konten Skrining & Panduan (Admin) (4 Halaman)** — *Selesai*
- [x] **Fase 6: Manajemen Kode Undangan & Pengguna (Admin) (4 Halaman)** — *Selesai*
- [x] **Fase 7: Integrasi Supabase DB, Better Auth, & Realtime Chat** — *Selesai*
- [x] **Fase 8: Autentikasi Live (Login, Register, Profil)** — *Selesai*
- [ ] **Fase 9: Persistensi Data (Skrining, Admin CRUD, Riwayat)** — *~5 jam*
- [ ] **Fase 10: Chat Realtime & Notifikasi Live** — *~3-4 jam*
- [ ] **Fase 11: Fitur Baru (Janji Temu & Pusat Bantuan)** — *~3 jam*
- [ ] **Fase 12: Production Hardening & Deployment Final** — *~2 jam*

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
- [x] Inisialisasi **Supabase Client** & Setup schema tabel database via **Drizzle ORM**.
- [x] Integrasi **Better Auth** dengan database untuk validasi register (invite code check), login, dan Next.js Middleware (RBAC protection).
- [x] Integrasi **Supabase Realtime** untuk broadcast pesan chat pasien-konselor, tracking presence (status online), dan update live queue.
- [x] Implementasi **Client-Side Idle Timer (10 menit)** untuk auto-close sesi chat.
- [x] Pengujian E2E flow dari registrasi hingga chat selesai.

---

### 🔵 Fase 8: Autentikasi Live (Login, Register, Profil) — *Selesai*
*Mengganti semua mock `setTimeout` pada halaman autentikasi dengan panggilan API Better Auth yang nyata ke database Supabase.*
- [x] **Login Live**: Ganti `setTimeout` + redirect manual di `/login` → panggil `authClient.signIn.email()` dari Better Auth, set session cookie, redirect berdasarkan role dari DB.
- [x] **Register Live**: Ganti `setTimeout` di `/register` → panggil `authClient.signUp.email()`, validasi invite code terhadap tabel `invite_codes` di DB, simpan user baru ke tabel `user`.
- [x] **Profil Live**: Hubungkan `/profile` ke tabel `user` → load data profil dari DB saat halaman dibuka, simpan perubahan (nama, telepon, dll.) via server action/API route.
- [x] **Lupa & Reset Password**: Hubungkan `/forgot-password` dan `/reset-password` ke Better Auth `forgetPassword` & `resetPassword` flow.
- [x] **Proxy/Middleware Ketat**: Aktifkan kembali proteksi redirect di `src/proxy.ts` setelah login live berfungsi — hanya user dengan session cookie valid yang bisa masuk ke dashboard.
- [x] **Dynamic Layout**: Ubah layout admin/konselor/dashboard agar membaca `userName`, `userEmail`, dan `role` dari session/cookie (bukan hardcoded).

---

### 🟠 Fase 9: Persistensi Data (Skrining, Admin CRUD, Riwayat) — *~5 jam*
*Menghubungkan semua operasi CRUD frontend ke tabel database Supabase via API routes / server actions.*

#### 9A. Skrining & Hasil (~1.5 jam)
- [ ] **Kuesioner dari DB**: Load daftar pertanyaan + opsi jawaban dari tabel `questionnaires`, `questions`, `question_options` saat pasien memulai skrining.
- [ ] **Simpan Jawaban**: Insert jawaban pasien ke tabel `screening_answers` dan hitung skor total.
- [ ] **Simpan Hasil Skrining**: Insert hasil akhir (skor, kategori, rekomendasi) ke tabel `screenings`.
- [ ] **Halaman Hasil dari DB**: Load hasil skrining dari DB di `/screening/:id/result` (bukan hardcoded).

#### 9B. Riwayat & Dashboard (~1 jam)
- [ ] **Riwayat Pasien**: Query tabel `screenings` berdasarkan `userId` untuk menampilkan daftar riwayat skrining di `/history`.
- [ ] **Dashboard Pasien**: Tampilkan statistik ringkasan (jumlah skrining, skor terakhir, sesi chat aktif) dari data DB.
- [ ] **Dashboard Konselor**: Query jumlah pasien yang ditangani, sesi aktif, dan statistik dari DB.
- [ ] **Dashboard Admin**: Query aggregate (total user, total skrining, distribusi role, dll.) dari DB.

#### 9C. Admin CRUD Live (~2.5 jam)
- [ ] **CRUD User** (`/admin/users`): Query tabel `user` untuk list, update role, toggle status aktif/nonaktif, reset password via Better Auth admin API.
- [ ] **CRUD Kode Undangan** (`/admin/invite-codes`): Insert kode baru ke tabel `invite_codes`, query daftar kode, update status (terpakai/expired).
- [ ] **CRUD Kuesioner** (`/admin/questionnaires`): Insert/update/delete pada tabel `questionnaires`, `questions`, dan `question_options`.
- [ ] **CRUD Panduan Edukasi** (`/admin/guides`): Insert/update/delete pada tabel `guides`.
- [ ] **CRUD Kontak Referensi** (`/admin/contacts`): Insert/update/delete pada tabel `contacts`.
- [ ] **Laporan & Ekspor** (`/admin/reports`): Aggregate query dari beberapa tabel + generate CSV download nyata.

---

### 🔴 Fase 10: Chat Realtime & Notifikasi Live — *~3-4 jam*
*Mengaktifkan komunikasi real-time antara pasien dan konselor menggunakan Supabase Realtime channels.*
- [ ] **Buat API Route Chat**: Endpoint untuk insert pesan ke tabel `chat_messages` dan load riwayat pesan per sesi.
- [ ] **Subscribe Realtime (Pasien)**: Di `/intervention/:screeningId/chat`, subscribe ke Supabase Realtime channel untuk menerima pesan baru secara instan.
- [ ] **Subscribe Realtime (Konselor)**: Di `/konselor/chat/:sessionId`, subscribe ke channel yang sama untuk komunikasi dua arah.
- [ ] **Typing Indicator**: Broadcast event `typing` via Supabase Realtime presence untuk menampilkan indikator "sedang mengetik...".
- [ ] **Akhiri Sesi Live**: Update status sesi di tabel `chat_sessions` menjadi `ended`, unsubscribe dari channel.
- [ ] **Antrean Pasien**: Implementasi sistem antrean (queue) — pasien masuk antrean, konselor menerima/menolak, status queue update secara realtime.
- [ ] **Notifikasi Live**: Insert notifikasi ke tabel `notifications` saat ada event penting (sesi baru, pesan masuk, hasil skrining). Query dan tampilkan di `/notifications`.
- [ ] **Catatan Konselor Live**: Simpan catatan internal konselor ke tabel `counselor_notes` dari panel chat konselor.

---

### 🟣 Fase 11: Fitur Baru (Janji Temu & Pusat Bantuan) — *~3 jam*
*Membangun halaman dan logika baru yang belum ada di fase sebelumnya.*

#### 11A. Janji Temu / Appointment (~2 jam)
- [ ] **Buat Tabel DB**: Tambah tabel `appointments` di schema Drizzle (id, patientId, counselorId, dateTime, status, notes).
- [ ] **Halaman Buat Janji Temu (Pasien)** (`/appointment/new`): Form pilih konselor, tanggal, waktu, dan catatan singkat.
- [ ] **Halaman Daftar Janji Temu (Pasien)** (`/appointment`): List janji temu mendatang dan yang sudah selesai.
- [ ] **Halaman Jadwal Konselor** (`/konselor/appointments`): Daftar janji temu yang masuk, tombol konfirmasi/tolak.
- [ ] **Admin: Kelola Janji Temu** (`/admin/appointments`): Overview seluruh jadwal dan status appointment.

#### 11B. Pusat Bantuan / Help Center (~1 jam)
- [ ] **Halaman FAQ & Bantuan** (`/help`): Daftar pertanyaan yang sering ditanyakan (accordion), panduan penggunaan aplikasi, dan kontak dukungan teknis.
- [ ] **Integrasi ke Navigasi**: Tambahkan link "Pusat Bantuan" di Sidebar dan Bottom Nav untuk semua role.

---

### ⚫ Fase 12: Production Hardening & Deployment Final — *~2 jam*
*Memastikan aplikasi siap 100% untuk penggunaan nyata di lingkungan production.*
- [ ] **Aktifkan Proxy/Middleware Ketat**: Pastikan `src/proxy.ts` mengecek session cookie secara ketat dan redirect user yang tidak login.
- [ ] **Error Handling Global**: Tambahkan halaman error kustom (`/not-found`, `/error`) dan error boundary di layout.
- [ ] **Loading States**: Pastikan semua halaman yang melakukan fetch data menampilkan skeleton/loading indicator.
- [ ] **Input Validation & Sanitization**: Validasi semua input form menggunakan Zod schema di sisi server.
- [ ] **Rate Limiting**: Tambahkan rate limit pada API routes sensitif (login, register, chat).
- [ ] **SEO & Meta Tags**: Pastikan setiap halaman memiliki title tag dan meta description yang sesuai.
- [ ] **Environment Variables**: Finalisasi semua env var di Vercel (termasuk `BETTER_AUTH_URL` yang sudah benar).
- [ ] **Build & Deploy Final**: Jalankan `npm run build` tanpa error, deploy ke Vercel, dan verifikasi semua fitur live.
- [ ] **Pengujian E2E Production**: Jalankan seluruh test case dari `e2e_testing_prompt.md` terhadap URL production.

