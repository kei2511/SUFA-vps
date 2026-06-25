# Product Requirements Document (PRD)
## Aplikasi Web MHFA – Sistem Skrining & Intervensi Kesehatan Mental
### Kementerian Kesehatan Republik Indonesia

---

**Versi:** 0.5
**Tanggal:** 25 Juni 2026
**Status:** Untuk Review

---

## Changelog

| Versi | Perubahan |
|-------|-----------|
| 0.5 | **Arsitektur direvisi:** deploy ke Vercel (serverless) + Supabase (DB + Realtime). Socket.io diganti Supabase Realtime untuk live chat. Email via Resend. ORM tetap Drizzle. Auth tetap Better Auth. Auto-timeout chat diimplementasi client-side. |
| 0.4 | Clarifikasi: 1 sesi skrining aktif per pasien, timeout chat 10 menit, bobot scoring per pertanyaan, notif chat masuk saja, fallback konselor offline, data ownership platform, format jawaban single/multi select per soal, riwayat chat permanen |
| 0.3 | Urutan SUFA dikoreksi ikut modul (S+U → F → A), notifikasi = in-app only, kuesioner eksplisit fleksibel, alursingkat.pdf tidak dipakai sebagai referensi urutan |
| 0.2 | Update registrasi pasien (invite code), panduan F = YouTube embed only, step A = WhatsApp eksternal only, Pertolongan Pertama = live chat, open questions diperbarui |
| 0.1 | Draft awal |

---

## 1. Product Overview

Aplikasi web berbasis MHFA (Mental Health First Aid) yang memungkinkan tenaga kesehatan dan konselor terlatih untuk melakukan skrining kesehatan mental pada pasien/remaja, mengidentifikasi masalah, dan memberikan intervensi terstruktur menggunakan protokol SUFA — semuanya dalam satu platform terpadu.

Klien: Kemenkes RI / Poltekkes Tanjung Karang

---

## 2. Tujuan Produk

- Mendigitalisasi alur skrining kesehatan mental yang selama ini dilakukan manual
- Memberikan intervensi terstruktur berbasis protokol SUFA secara online
- Memfasilitasi koneksi pasien dengan konselor untuk sesi curhat terstruktur
- Menyediakan panduan pendampingan (relaksasi, coping strategy, dll.) berbasis video YouTube interaktif
- Memudahkan rujukan ke tenaga kesehatan profesional via WhatsApp
- Memberikan data dan laporan agregat untuk keperluan Kemenkes

---

## 3. User Roles & Permissions

### 3.1 Ringkasan Role

| Role | Deskripsi |
|------|-----------|
| **Pasien** | Pengguna yang menjalani skrining dan menerima intervensi |
| **Konselor** | Tenaga MHFA terlatih yang menerima sesi curhat dari pasien |
| **Admin Konten** | Mengelola kuesioner skrining dan konten panduan |
| **Super Admin** | Mengelola seluruh user, role, invite code, dan konfigurasi sistem |

> **Asumsi:** Role Admin Konten dan Super Admin bisa digabung menjadi satu role "Admin" untuk tahap awal, kecuali ada kebutuhan segregasi tugas yang spesifik.

### 3.2 Detail Permissions per Role

| Fitur | Pasien | Konselor | Admin Konten | Super Admin |
|-------|--------|----------|--------------|-------------|
| Self-register dengan invite code | ✅ | ❌ | ❌ | ❌ |
| Akses skrining | ✅ | ❌ | ❌ | ❌ |
| Lihat hasil skrining diri sendiri | ✅ | ❌ | ❌ | ❌ |
| Lihat hasil skrining pasien | ❌ | ✅ | ❌ | ✅ |
| Akses curhat (pasien) | ✅ | ❌ | ❌ | ❌ |
| Terima & balas curhat | ❌ | ✅ | ❌ | ✅ |
| Akses panduan (F) | ✅ | ❌ | ❌ | ❌ |
| Lihat kontak profesional (A) | ✅ | ❌ | ❌ | ❌ |
| Akses Pertolongan Pertama (live chat) | ✅ | ❌ | ❌ | ❌ |
| CRUD kuesioner | ❌ | ❌ | ✅ | ✅ |
| CRUD konten panduan | ❌ | ❌ | ✅ | ✅ |
| CRUD kontak profesional | ❌ | ❌ | ✅ | ✅ |
| Generate & kelola invite code | ❌ | ❌ | ❌ | ✅ |
| CRUD user & role | ❌ | ❌ | ❌ | ✅ |
| Lihat laporan & statistik | ❌ | Terbatas | ❌ | ✅ |

---

## 4. Core User Flow

```
[Register dengan Invite Code]  ──atau──  [Login]
            │
            ▼
    [Dashboard Pasien]
            │
            ▼
    [Skrining – Kuesioner Multi-step]
            │
            ▼
    [Hasil Skrining – Kesimpulan Masalah / Kondisi]
            │
            ▼
    [Intervensi SUFA – Urutan Locked]
            │
            ├── Step 1: S + U ──► [Curhat – Live Chat dengan Konselor]
            │                           │ selesai / tutup sesi
            │                           ▼
            ├── Step 2: F ─────► [Panduan Pendampingan – YouTube + Instruksi]
            │                           │ selesai panduan
            │                           ▼
            └── Step 3: A ─────► [Hubungi Profesional – Kontak WhatsApp]
                                        │ konfirmasi sudah lihat
                                        ▼
                              [Pertolongan Pertama – Live Chat]
                                        │
                                        ▼
                              [Selesai / Dashboard Pasien]
```

**Urutan SUFA:** Mengikuti protokol dari `Modul_MHFA.pdf` (bukan alursingkat.pdf):
1. **S + U** — Curhat (Sadari kondisi, lalu Utarakan kepedulian via live chat)
2. **F** — Panduan (Fasilitasi dukungan emosional via video YouTube + instruksi)
3. **A** — Kontak CP (Arahkan ke bantuan profesional via WhatsApp)

Setiap step harus diselesaikan sebelum step berikutnya terbuka (locked sequential).

---

## 5. Feature Breakdown

### 5.1 Autentikasi

**Registrasi Pasien (Invite Code)**
- Pasien self-register di halaman `/register` menggunakan invite code yang digenerate oleh Super Admin
- Field registrasi: nama lengkap, email, nomor telepon, tanggal lahir, invite code, password
- Invite code divalidasi saat submit — jika valid, akun dibuat dengan role Pasien
- Setiap invite code hanya bisa dipakai sekali (single-use) dan punya masa berlaku (expire date dikonfigurasi Admin)
- Setelah registrasi berhasil, pasien langsung login

**Login (Semua Role)**
- Login dengan email + password
- Role-based redirect setelah login:
  - Pasien → `/dashboard`
  - Konselor → `/konselor/dashboard`
  - Admin → `/admin/dashboard`
- Session management (auto-logout setelah idle, durasi TBD)
- Reset password via email

---

### 5.2 Fitur Pasien

#### 5.2.1 Skrining (Kuesioner)

- Kuesioner multi-step dengan navigasi prev/next per pertanyaan
- Format jawaban: pilihan ganda (single select atau multiple select — dikonfigurasi per pertanyaan oleh Admin)
- Progress bar menampilkan persentase selesai
- Jawaban tersimpan otomatis — sesi bisa dilanjutkan jika terputus
- Tidak bisa mengubah jawaban setelah submit akhir
- Konfirmasi sebelum submit terakhir
- **Satu pasien hanya bisa memiliki satu sesi skrining aktif dalam satu waktu**
- Riwayat sesi skrining sebelumnya tersimpan (longitudinal)

#### 5.2.2 Hasil Skrining

- Tampilan hasil:
  - Kesimpulan kondisi / masalah yang teridentifikasi
  - Level urgensi (ringan / sedang / berat — berdasarkan scoring otomatis)
  - Penjelasan singkat tentang kondisi tersebut (teks statis yang dikonfigurasi Admin per kategori kondisi)
- Tombol CTA "Mulai Intervensi SUFA"
- Hasil tersimpan di riwayat pasien

> **Clarifikasi:** Scoring otomatis rule-based. Admin menginput bobot skor untuk setiap pilihan jawaban pada setiap pertanyaan saat membuat kuesioner. Total skor = jumlah semua bobot jawaban yang dipilih. Range skor → label kondisi + penjelasan dikonfigurasi oleh Admin.

#### 5.2.3 Intervensi SUFA (Locked Sequential)

Tiga step berurutan mengikuti protokol SUFA dari modul. Step berikutnya terkunci sampai step sebelumnya ditandai selesai.

---

**Step 1 — Curhat (S + U) : Live Chat**

- Pasien menekan tombol "Mulai Curhat" untuk masuk antrian
- Sistem menampilkan status: "Sedang mencari konselor..." dengan estimasi waktu tunggu
- **Jika tidak ada konselor online:** tampilkan pesan fallback "Tidak ada konselor tersedia saat ini. Silakan coba lagi nanti atau hubungi kontak darurat."
- Setelah konselor menerima, tampilan chat real-time terbuka (Supabase Realtime — channel-based)
- Konselor dapat melihat ringkasan hasil skrining pasien di panel samping
- Fitur chat: teks saja (v1), timestamp per pesan
- **Auto-timeout:** Jika tidak ada aktivitas selama 10 menit, sistem menampilkan peringatan (client-side timer). Jika tetap idle, client mengirim request penutupan sesi ke API.
- Pasien dapat mengakhiri sesi dengan tombol "Selesai Curhat"
- Riwayat chat tersimpan permanen, dapat dilihat kembali oleh pasien dan konselor
- Setelah sesi ditutup, Step 1 ditandai ✅ dan Step 2 terbuka

---

**Step 2 — Panduan Pendampingan (F) : YouTube + Instruksi**

- Menampilkan daftar panduan yang relevan dengan kondisi pasien (berdasarkan tag kondisi yang dikonfigurasi Admin)
- Pasien memilih satu panduan untuk diikuti
- Tampilan per panduan:
  - Judul & deskripsi singkat
  - Player YouTube embed (iframe)
  - Teks instruksi per langkah di bawah video (navigasi prev/next step)
- Tombol "Selesai" di akhir panduan → Step 2 ditandai ✅ dan Step 3 terbuka
- Pasien bisa kembali dan melihat panduan lain di daftar (opsional, tidak memblokir progress)

---

**Step 3 — Hubungi Profesional (A) : Kontak WhatsApp**

- Menampilkan daftar kontak profesional kesehatan mental yang dikurasi Admin
- Per kontak: nama/institusi, spesialisasi, nomor WhatsApp, jam operasional, catatan singkat
- Tombol utama: "Hubungi via WhatsApp" → redirect ke `https://wa.me/[nomor]` di tab baru (tidak ada validasi nomor)
- Tidak ada komunikasi in-app dengan nakes; sepenuhnya eksternal via WhatsApp
- Tombol "Sudah Menghubungi / Lanjutkan" untuk konfirmasi dan membuka tahap Pertolongan Pertama

---

#### 5.2.4 Pertolongan Pertama

- Diakses setelah ketiga step SUFA selesai
- Mekanisme identik dengan Curhat (Step 1): live chat real-time dengan konselor
- Perbedaan: konteks sesi ditandai sebagai "Pertolongan Pertama" (bukan curhat awal)
- Konselor dapat melihat: hasil skrining + ringkasan sesi SUFA yang sudah dilalui
- Konselor yang menangani bisa sama atau berbeda dengan konselor di Step 1 (bergantung antrian)
- **Auto-timeout:** Jika tidak ada aktivitas selama 10 menit, sistem menampilkan peringatan (client-side timer). Jika tetap idle, client mengirim request penutupan sesi ke API.
- Riwayat chat tersimpan permanen

#### 5.2.5 Dashboard Pasien

- Ringkasan sesi skrining terakhir (kondisi, tanggal)
- Status progress SUFA sesi aktif (step berapa yang sudah selesai)
- Riwayat semua sesi skrining sebelumnya
- Shortcut "Mulai Skrining Baru"
- Shortcut ke sesi chat aktif (jika ada)

---

### 5.3 Fitur Konselor

#### 5.3.1 Dashboard Konselor

- Toggle ketersediaan: **Online** / **Sibuk** / **Offline**
  - Hanya konselor Online yang menerima antrian baru
- Panel antrian: daftar pasien yang menunggu (urutan: pertama masuk, pertama dilayani)
- Panel sesi aktif: daftar chat yang sedang berlangsung
- Riwayat sesi selesai (hari ini & historis)
- **Fallback:** Jika pasien menunggu > 15 menit tanpa konselor online, sistem menampilkan opsi: "Tunggu lebih lama" atau "Kembali ke dashboard sementara"

#### 5.3.2 Sesi Chat

- Antarmuka chat real-time
- Panel kanan: profil pasien, hasil skrining terakhir, riwayat sesi sebelumnya, label sesi (Curhat / Pertolongan Pertama)
- Konselor dapat menambah catatan internal per sesi (tidak terlihat oleh pasien)
- Tombol "Tutup Sesi" + konfirmasi
- Konselor tidak bisa memulai sesi secara aktif — hanya menerima dari antrian

#### 5.3.3 Riwayat Pasien

- Daftar semua pasien yang pernah ditangani
- Per pasien: riwayat sesi (tanggal, tipe, durasi), hasil skrining, catatan internal konselor

---

### 5.4 Fitur Admin

#### 5.4.1 Dashboard Admin

- Statistik: total skrining, distribusi kondisi, jumlah sesi chat, panduan paling banyak diakses
- Grafik tren per periode (minggu/bulan)

#### 5.4.2 Manajemen Kuesioner

- CRUD kuesioner: judul, deskripsi, status (aktif/nonaktif)
- CRUD pertanyaan per kuesioner — sepenuhnya fleksibel:
  - Teks pertanyaan
  - **Tipe jawaban:** Single select atau multiple select (radio button vs checkbox)
  - Jumlah pilihan jawaban bebas (tidak hardcode — bisa 2, 3, 4, 5, atau lebih)
  - **Teks per pilihan + bobot skor masing-masing** (dikonfigurasi bebas per pilihan — misal: pilihan A = 0 poin, pilihan B = 2 poin, dst.)
  - Urutan tampil pertanyaan (drag-and-drop)
- Konfigurasi scoring: range skor → label kondisi + teks penjelasan (contoh: 0–5 = "Ringan", 6–10 = "Sedang"); jumlah kategori kondisi juga fleksibel
- Preview kuesioner sebelum diaktifkan

> **Clarifikasi:** Total skor = sum bobot semua jawaban yang dipilih. Admin input bobot per pilihan jawaban saat membuat soal.

> **Asumsi:** Hanya satu kuesioner yang aktif dalam satu waktu.

#### 5.4.3 Manajemen Konten Panduan (F)

- CRUD panduan: judul, deskripsi singkat, tag kondisi (untuk filter per pasien), status aktif/nonaktif
- Per panduan: input URL YouTube + teks instruksi per langkah (plain text atau rich text sederhana)
- Urutan panduan (drag-and-drop)
- Preview panduan

> **Dikonfirmasi:** Media panduan = YouTube embed URL only. Tidak ada upload video file.

#### 5.4.4 Manajemen Kontak Profesional (A)

- CRUD kontak: nama/institusi, spesialisasi, nomor WhatsApp, jam operasional, catatan singkat
- Status aktif/nonaktif, urutan tampil

> **Dikonfirmasi:** Kontak hanya berupa nomor WhatsApp eksternal. Tidak ada akun in-app untuk nakes.

#### 5.4.5 Manajemen Invite Code (Super Admin)

- Generate invite code: satu per satu atau batch (jumlah sekaligus)
- Konfigurasi per batch: expire date, kuota pakai (default: single-use)
- Lihat status tiap kode: belum dipakai / sudah dipakai (+ siapa yang pakai, kapan)
- Nonaktifkan / hapus kode yang belum terpakai

#### 5.4.6 Manajemen User (Super Admin)

- Lihat daftar semua user + role + status aktif
- Edit user: ubah data profil, reset password, nonaktifkan akun
- Hapus user (soft delete)
- Filter & search user

#### 5.4.7 Laporan

- Export data skrining (filter: tanggal, kondisi)
- Export statistik sesi chat
- Format: CSV

---

## 6. Page Inventory

### 6.1 Shared (Semua Role)

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Register Pasien | `/register` | Form self-register + validasi invite code |
| Login | `/login` | Form login + role-based redirect |
| Lupa Password | `/forgot-password` | Request reset via email |
| Reset Password | `/reset-password` | Form set password baru |
| Profil | `/profile` | Edit data diri, ganti password |
| Notifikasi | `/notifications` | Inbox notifikasi in-app |

### 6.2 Pasien

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Dashboard | `/dashboard` | Overview status sesi aktif & riwayat |
| Mulai Skrining | `/screening/start` | Intro + konfirmasi sebelum mulai |
| Skrining | `/screening/:id` | Kuesioner multi-step |
| Hasil Skrining | `/screening/:id/result` | Tampilan hasil & tombol mulai SUFA |
| Hub SUFA | `/intervention/:screeningId` | Tracker 3 step SUFA dengan status per step |
| Step 1 – Curhat | `/intervention/:screeningId/chat` | Live chat dengan konselor (S+U) |
| Step 2 – Panduan | `/intervention/:screeningId/guide` | Daftar panduan relevan (F) |
| Detail Panduan | `/intervention/:screeningId/guide/:guideId` | Player YouTube + instruksi per langkah |
| Step 3 – Kontak | `/intervention/:screeningId/contact` | Daftar kontak WA profesional (A) |
| Pertolongan Pertama | `/first-aid/:screeningId` | Live chat monitoring pasca-SUFA |
| Riwayat Skrining | `/history` | List semua sesi skrining lama |

### 6.3 Konselor

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Dashboard Konselor | `/konselor/dashboard` | Toggle status + antrian + sesi aktif |
| Sesi Chat | `/konselor/chat/:sessionId` | Antarmuka chat + panel profil pasien |
| Riwayat Pasien | `/konselor/patients` | Daftar pasien yang pernah ditangani |
| Detail Pasien | `/konselor/patients/:id` | Riwayat lengkap satu pasien |

### 6.4 Admin

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Dashboard Admin | `/admin/dashboard` | Statistik & overview |
| Kuesioner | `/admin/questionnaires` | Daftar kuesioner |
| Edit Kuesioner | `/admin/questionnaires/:id` | Editor kuesioner + pertanyaan + scoring |
| Konten Panduan | `/admin/guides` | Daftar konten panduan |
| Edit Panduan | `/admin/guides/:id` | Input YouTube URL + instruksi langkah |
| Kontak Profesional | `/admin/contacts` | Daftar & manajemen kontak WA |
| Invite Code | `/admin/invite-codes` | Generate & monitor invite code |
| Manajemen User | `/admin/users` | Daftar & manajemen user |
| Laporan | `/admin/reports` | Filter & export CSV |

---

## 7. Technical Requirements (Final Stack)

### Fullstack Framework
- **Framework:** Next.js 15+ (App Router) — fullstack (frontend + API Routes)
- **Deployment:** Vercel (serverless, auto-scaling, zero-config deployment)
- **Runtime:** Node.js serverless functions (Vercel) — bukan custom server

### Database & Real-time
- **Database:** Supabase PostgreSQL (managed, free tier 500 MB)
- **ORM:** Drizzle ORM (type-safe, lightweight, serverless-friendly)
- **Real-time Chat:** Supabase Realtime (channel-based Broadcast + Presence API)
  - **Broadcast:** Untuk pengiriman/penerimaan pesan chat secara real-time
  - **Presence:** Untuk status online/sibuk/offline konselor dan indikator "sedang mengetik"
  - **Postgres Changes:** Untuk notifikasi antrian pasien baru ke konselor
- **Row Level Security (RLS):** Diaktifkan untuk keamanan data pasien per-row

### Auth
- **Auth System:** Better Auth (open-source, self-hosted, gratis tanpa limit MAU)
- **RBAC:** Role-based access control (Pasien, Konselor, Admin Konten, Super Admin)
- **Invite Code:** Custom logic di API Route untuk registrasi pasien

### Frontend
- **Styling:** Tailwind CSS v4 (utility-first, responsive)
- **UI Library:** shadcn/ui (accessibility-first, customisable)
- **Mobile Responsiveness:** Semua antarmuka, layout (menggunakan sidebar di desktop dan bottom navigation bar di mobile), dan form wajib sepenuhnya responsif, dinamis, dan ramah untuk pengguna perangkat mobile (mobile-friendly).
- **Charting:** Recharts (untuk dashboard Admin — statistik & grafik)
- **Typography:** Plus Jakarta Sans (headings) + Inter (body)
- **Icons:** Material Symbols Outlined

### Email
- **Service:** Resend (HTTP-based, serverless-friendly, free 100 email/hari)
- **Fungsi:** Khusus untuk reset password — bukan untuk notifikasi

### DevOps & Infra
- **Hosting:** Vercel (frontend + API + serverless functions)
- **Database Hosting:** Supabase (PostgreSQL + Realtime + RLS)
- **CI/CD:** Vercel Git Integration (auto-deploy dari GitHub)
- **Cron Jobs:** Vercel Cron (untuk auto-expire invite codes, jika dibutuhkan)

### Arsitektur Deployment

```
┌─────────────────────────────────┐
│         VERCEL (Serverless)     │
│  ┌───────────────────────────┐  │
│  │   Next.js App Router      │  │
│  │  • SSR Pages (30 halaman) │  │
│  │  • API Routes (REST)      │  │
│  │  • Better Auth            │  │
│  │  • Middleware (RBAC)      │  │
│  └───────────────────────────┘  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│       SUPABASE (Free Tier)      │
│  ┌────────┐ ┌────────────────┐  │
│  │  PgSQL │ │   Realtime     │  │
│  │  (DB)  │ │  (Chat/Queue)  │  │
│  └────────┘ └────────────────┘  │
│  ┌────────────────────────────┐ │
│  │  Row Level Security (RLS)  │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

### Why This Stack?
- **Serverless & Free:** Vercel + Supabase free tier = $0/bulan untuk MVP
- **No Server Maintenance:** Tidak perlu VPS, PM2, atau manage server sendiri
- **Scalable:** Auto-scaling serverless — dari 10 hingga 10.000+ concurrent users
- **Type-safe:** TypeScript di seluruh stack (Drizzle ORM + Next.js + Better Auth)
- **Real-time Ready:** Supabase Realtime menggantikan Socket.io tanpa custom WebSocket server
- **WCAG Compliant:** shadcn/ui + React accessibility patterns
- **Secure:** RLS di database level + Better Auth RBAC di application level

### Catatan Teknis Penting
- **Vercel Serverless Timeout:** API Routes max 10 detik (Hobby) / 60 detik (Pro). Export CSV besar menggunakan streaming response.
- **Supabase Free Tier:** Database di-pause setelah 1 minggu inaktif. Untuk production, gunakan Pro plan ($25/bulan).
- **Auto-timeout Chat:** Diimplementasi **client-side** (bukan server timer). Client mengirim event penutupan sesi ke API setelah 10 menit idle.
- **Antrian FCFS:** Diimplementasi via query database (`ORDER BY created_at ASC LIMIT 1`) saat konselor menerima pasien.
- **Invite Code Expiry:** Validasi expiry dilakukan saat pasien submit registrasi (lazy evaluation), bukan via cron job.

---

## 8. Asumsi

1. Pasien self-register menggunakan invite code single-use yang digenerate Super Admin
2. Scoring kuesioner otomatis rule-based; tidak ada review manual dokter
3. Hanya satu kuesioner aktif dalam satu waktu
4. **Satu pasien hanya bisa memiliki satu sesi skrining aktif dalam satu waktu**
5. Urutan intervensi SUFA mengikuti protokol `Modul_MHFA.pdf`: **Curhat (S+U) → Panduan (F) → Kontak CP (A)** — locked sequential; `alursingkat.pdf` tidak dipakai sebagai referensi urutan
6. Konten panduan (F) = YouTube embed + teks instruksi; tidak ada upload video
7. Step A = daftar kontak WhatsApp eksternal; nakes tidak punya akun di aplikasi; **tidak ada validasi nomor WA**
8. Pertolongan Pertama = live chat dengan konselor (mekanisme sama dengan Step 1 Curhat)
9. Antrian curhat: first-come-first-served ke konselor yang berstatus Online
10. **Fallback: jika tidak ada konselor online, tampilkan pesan error dengan opsi coba lagi**
11. Konselor tidak dapat mengakses modul Admin, dan sebaliknya
12. Notifikasi = in-app only (real-time via Supabase Realtime Postgres Changes); **hanya untuk chat masuk**; tidak ada email atau WhatsApp notification
13. **Format jawaban kuesioner:** Single select atau multiple select per pertanyaan (dikonfigurasi Admin)
14. **Bobot scoring:** Admin input bobot per pilihan jawaban saat membuat soal; total skor = sum semua bobot jawaban terpilih
15. **Auto-timeout chat:** 10 menit idle → peringatan (client-side timer) → client mengirim request penutupan sesi ke API jika tetap idle
16. **Riwayat chat:** Tersimpan permanen, tidak bisa di-export atau di-delete oleh user
17. **Data ownership:** Platform (belum ada SOP keamanan data dari Kemenkes)

---

## 9. Open Questions

| # | Pertanyaan | Dampak |
|---|-----------|--------|
| 1 | Apakah ada lebih dari satu tipe kuesioner (misal berbeda per kelompok usia atau kondisi)? | Kompleksitas manajemen kuesioner |
| 2 | Bahasa antarmuka: Indonesia saja, atau perlu dukungan bahasa daerah? | i18n scope |
| 3 | SLA antrian konselor — berapa lama maksimal pasien menunggu sebelum diarahkan ke opsi lain? | UX antrian + logic fallback |

---

## 10. Out of Scope (v1)

- Fitur telemedicine / video call
- Integrasi dengan sistem rekam medis elektronik (RME/EMR)
- Mobile native app (iOS/Android)
- AI/chatbot sebagai pengganti konselor manusia
- Upload video file ke server
- Notifikasi email / WhatsApp
- Pembayaran / billing

---

*v0.5 — Arsitektur direvisi: Vercel (serverless) + Supabase (DB + Realtime). 25 Juni 2026.*
