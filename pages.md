# Deskripsi Detail Halaman — Aplikasi Web MHFA
### Kementerian Kesehatan Republik Indonesia

---

**Total Halaman:** 30
**Versi Dokumen:** 1.0
**Tanggal:** Juni 2026

---

## Daftar Isi

- [A. Shared (6 halaman)](#a-shared)
- [B. Pasien (11 halaman)](#b-pasien)
- [C. Konselor (4 halaman)](#c-konselor)
- [D. Admin (9 halaman)](#d-admin)

---

## A. SHARED

Halaman-halaman ini dapat diakses oleh semua role sebelum atau sesudah login.

---

### A1. Halaman Register Pasien
**Path:** `/register`
**Akses:** Publik (belum login)

#### Tujuan
Memungkinkan calon pasien melakukan self-registration menggunakan invite code yang telah diberikan oleh Admin. Halaman ini adalah titik masuk pertama bagi pasien baru ke dalam sistem.

#### Layout & Komponen
- **Header:** Logo aplikasi + nama aplikasi di pojok kiri atas; tidak ada navigasi
- **Card utama (center):** Form registrasi dua kolom (desktop) / satu kolom (mobile) dengan field:
  1. Nama Lengkap (text input)
  2. Email (email input)
  3. Nomor Telepon (text input, format Indonesia)
  4. Tanggal Lahir (date picker)
  5. Invite Code (text input, uppercase auto-format)
  6. Password (password input + toggle show/hide)
  7. Konfirmasi Password (password input + toggle show/hide)
- **Tombol "Daftar":** Full-width, primary color, di bawah form
- **Link "Sudah punya akun? Masuk":** Di bawah tombol, redirect ke `/login`
- **Footer:** Versi aplikasi + copyright Kemenkes

#### Interaksi Pengguna
- User mengisi semua field lalu klik "Daftar"
- Sistem memvalidasi invite code ke server secara async saat field invite code kehilangan fokus (onBlur) — menampilkan indikator loading kecil di samping field
- Jika invite code valid, muncul checkmark hijau di samping field
- Jika invite code tidak valid/expired, muncul pesan error merah di samping field segera
- Submit form melakukan validasi lengkap sebelum request ke server

#### Validasi
- Nama Lengkap: wajib, min 3 karakter, max 100 karakter
- Email: wajib, format email valid, belum terdaftar di sistem
- Nomor Telepon: wajib, format Indonesia (08xx atau +628xx), 10–15 digit
- Tanggal Lahir: wajib, tidak boleh masa depan, min usia 10 tahun
- Invite Code: wajib, harus valid dan belum terpakai
- Password: wajib, min 8 karakter, harus mengandung huruf dan angka
- Konfirmasi Password: wajib, harus sama dengan Password

#### State
- **Default:** Form kosong, semua field enabled
- **Loading (submit):** Tombol "Daftar" berubah menjadi spinner + teks "Mendaftar...", semua field disabled
- **Error (field):** Border field berubah merah + pesan error di bawah field
- **Error (server):** Alert banner merah di atas form (contoh: "Email sudah terdaftar")
- **Success:** Redirect otomatis ke `/login` dengan toast sukses "Akun berhasil dibuat. Silakan masuk."

#### Navigasi
- Submit sukses → `/login`
- Klik "Sudah punya akun?" → `/login`

---

### A2. Halaman Login
**Path:** `/login`
**Akses:** Publik (belum login); user yang sudah login di-redirect ke dashboard masing-masing

#### Tujuan
Autentikasi semua role (Pasien, Konselor, Admin Konten, Super Admin) ke dalam sistem. Setelah login berhasil, sistem mendeteksi role dan mengarahkan ke halaman yang sesuai.

#### Layout & Komponen
- **Header:** Logo + nama aplikasi, tanpa navigasi
- **Card utama (center):** Form login dengan:
  1. Email (email input)
  2. Password (password input + toggle show/hide)
- **Tombol "Masuk":** Full-width, primary color
- **Link "Lupa kata sandi?":** Di bawah field Password, redirect ke `/forgot-password`
- **Link "Belum punya akun? Daftar":** Di bawah tombol, redirect ke `/register`
- **Footer:** Versi aplikasi + copyright Kemenkes

#### Interaksi Pengguna
- User mengisi email + password lalu klik "Masuk"
- Sistem memvalidasi credentials, mengambil role user dari database
- Redirect berdasarkan role:
  - Pasien → `/dashboard`
  - Konselor → `/konselor/dashboard`
  - Admin Konten → `/admin/dashboard`
  - Super Admin → `/admin/dashboard`

#### Validasi
- Email: wajib, format email valid
- Password: wajib, tidak ada batasan karakter (validasi dilakukan server-side)

#### State
- **Default:** Form kosong
- **Loading:** Tombol berubah menjadi spinner + "Masuk...", field disabled
- **Error:** Alert banner merah "Email atau kata sandi salah" (tidak menyebutkan mana yang salah, untuk keamanan)
- **Error (akun nonaktif):** Alert banner merah "Akun Anda telah dinonaktifkan. Hubungi admin."
- **Success:** Redirect ke dashboard role

#### Navigasi
- Login sukses → `/dashboard` (Pasien) / `/konselor/dashboard` (Konselor) / `/admin/dashboard` (Admin)
- "Lupa kata sandi?" → `/forgot-password`
- "Belum punya akun?" → `/register`

---

### A3. Halaman Lupa Password
**Path:** `/forgot-password`
**Akses:** Publik (belum login)

#### Tujuan
Memungkinkan user yang lupa password untuk meminta tautan reset password yang dikirim ke email terdaftar.

#### Layout & Komponen
- **Header:** Logo + nama aplikasi
- **Card utama (center):**
  - Judul "Lupa Kata Sandi"
  - Teks instruksi singkat: "Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi."
  - Field Email (email input)
  - Tombol "Kirim Tautan Reset"
- **Link "Kembali ke halaman masuk"** → `/login`

#### Interaksi Pengguna
- User memasukkan email lalu klik "Kirim Tautan Reset"
- Sistem selalu menampilkan pesan sukses yang sama, terlepas dari apakah email terdaftar atau tidak (untuk keamanan — mencegah email enumeration)
- Email berisi tautan unik yang valid selama 1 jam

#### Validasi
- Email: wajib, format email valid

#### State
- **Default:** Form kosong
- **Loading:** Tombol berubah spinner
- **Success (selalu ditampilkan):** Halaman berubah menampilkan pesan "Jika email tersebut terdaftar, tautan reset kata sandi telah dikirim. Periksa kotak masuk Anda." + link kembali ke login

#### Navigasi
- "Kembali ke halaman masuk" → `/login`
- Setelah submit → tetap di halaman ini dengan pesan sukses

---

### A4. Halaman Reset Password
**Path:** `/reset-password?token=[token]`
**Akses:** Publik (diakses via tautan di email); token divalidasi saat halaman dimuat

#### Tujuan
Memungkinkan user mengatur password baru menggunakan token yang dikirim via email. Token bersifat sekali pakai dan expired dalam 1 jam.

#### Layout & Komponen
- **Header:** Logo + nama aplikasi
- **Card utama (center):**
  - Judul "Atur Kata Sandi Baru"
  - Field Password Baru (password input + toggle)
  - Field Konfirmasi Password Baru (password input + toggle)
  - Tombol "Simpan Kata Sandi Baru"

#### Interaksi Pengguna
- Saat halaman dimuat, sistem memvalidasi token dari URL parameter
- Jika token tidak valid/expired, tampilkan state error sebelum form dimuat
- Jika token valid, form ditampilkan
- Setelah submit sukses, token dihapus dari database (tidak bisa dipakai lagi)

#### Validasi
- Password Baru: wajib, min 8 karakter, harus mengandung huruf dan angka
- Konfirmasi Password: wajib, harus sama dengan Password Baru
- Token: divalidasi saat halaman load (server-side)

#### State
- **Loading (page load):** Spinner saat validasi token
- **Error (token invalid):** Pesan "Tautan tidak valid atau sudah kedaluwarsa." + tombol "Minta tautan baru" → `/forgot-password`
- **Default:** Form aktif
- **Loading (submit):** Tombol berubah spinner
- **Success:** Pesan "Kata sandi berhasil diubah." + tombol "Masuk sekarang" → `/login`

#### Navigasi
- Token invalid → tombol ke `/forgot-password`
- Submit sukses → `/login`

---

### A5. Halaman Profil
**Path:** `/profile`
**Akses:** Semua role (login required); setiap user hanya melihat & mengedit profil diri sendiri

#### Tujuan
Memungkinkan user melihat dan memperbarui data profil pribadi serta mengganti password. Konten halaman sama untuk semua role, hanya badge role yang berbeda.

#### Layout & Komponen
- **Sidebar/Navbar:** Navigasi utama sesuai role (tetap tampil)
- **Section 1 — Informasi Profil:**
  - Avatar placeholder (inisial nama dalam lingkaran berwarna)
  - Badge role (Pasien / Konselor / Admin / Super Admin)
  - Form edit:
    - Nama Lengkap (text input)
    - Email (text input, read-only — tidak bisa diubah)
    - Nomor Telepon (text input)
    - Tanggal Lahir (date picker, hanya Pasien)
  - Tombol "Simpan Perubahan"
- **Section 2 — Ganti Kata Sandi:**
  - Field Password Saat Ini
  - Field Password Baru
  - Field Konfirmasi Password Baru
  - Tombol "Ganti Kata Sandi"
- **Section 3 — Informasi Akun (read-only):**
  - Tanggal bergabung
  - Role

#### Interaksi Pengguna
- Setiap section memiliki tombol simpan sendiri (tidak satu tombol untuk semua)
- Perubahan data profil dan ganti password adalah request terpisah
- Setelah sukses, muncul toast notifikasi di pojok kanan atas

#### Validasi
- Nama Lengkap: wajib, min 3 karakter
- Nomor Telepon: format Indonesia
- Password Saat Ini: wajib jika mengisi section ganti password
- Password Baru: min 8 karakter, huruf + angka
- Konfirmasi Password: harus sama dengan Password Baru

#### State
- **Default:** Field terisi data existing, dapat diedit
- **Loading (submit):** Tombol berubah spinner, field disabled
- **Error:** Toast merah + pesan error di bawah field yang bermasalah
- **Success:** Toast hijau "Perubahan berhasil disimpan"

---

### A6. Halaman Notifikasi
**Path:** `/notifications`
**Akses:** Semua role (login required)

#### Tujuan
Menampilkan semua notifikasi in-app yang diterima user, baik yang sudah dibaca maupun belum. Notifikasi real-time masuk via WebSocket.

#### Layout & Komponen
- **Sidebar/Navbar:** Navigasi utama; icon lonceng di navbar menampilkan badge jumlah notifikasi belum dibaca
- **Header halaman:**
  - Judul "Notifikasi"
  - Tombol "Tandai Semua Dibaca"
  - Filter tab: Semua | Belum Dibaca
- **Daftar Notifikasi:** List item per notifikasi, berisi:
  - Icon tipe notifikasi (chat, skrining, sistem, dll.)
  - Teks notifikasi (contoh: "Konselor telah menerima sesi curhat Anda")
  - Timestamp relatif (contoh: "3 menit lalu")
  - Indicator titik biru untuk notifikasi belum dibaca
  - Background lebih terang untuk notif belum dibaca
- **Klik notifikasi:** Menandai sebagai dibaca + redirect ke halaman terkait (jika ada)

#### Tipe Notifikasi per Role
- **Pasien:** Konselor menerima sesi curhat, sesi chat ditutup, pengingat melanjutkan SUFA
- **Konselor:** Pasien baru masuk antrian, pasien membatalkan antrian
- **Admin:** — (tidak ada notifikasi operasional untuk Admin di v1)

#### State
- **Loading:** Skeleton list saat fetching
- **Empty (semua):** Ilustrasi + teks "Belum ada notifikasi"
- **Empty (belum dibaca):** Teks "Semua notifikasi sudah dibaca"
- **Error:** Pesan error + tombol retry

---

## B. PASIEN

---

### B1. Halaman Dashboard Pasien
**Path:** `/dashboard`
**Akses:** Pasien (login required)

#### Tujuan
Halaman utama pasien setelah login. Menampilkan status terkini dari sesi aktif dan memberikan akses cepat ke aksi utama. Berfungsi sebagai pusat kendali bagi pasien untuk memantau perjalanan intervensi mereka.

#### Layout & Komponen
- **Navbar atas:** Logo, nama user (greeting "Halo, [Nama]"), icon notifikasi, link profil
- **Section 1 — Sesi Aktif (kondisional):**
  - Ditampilkan hanya jika ada sesi skrining yang sedang berjalan (belum selesai SUFA/PP)
  - Card berisi: kondisi hasil skrining, tanggal skrining, step SUFA terakhir yang sedang berjalan, tombol "Lanjutkan"
  - Jika tidak ada sesi aktif: card CTA "Mulai Skrining Baru" dengan deskripsi singkat
- **Section 2 — Progress SUFA (kondisional):**
  - Ditampilkan jika sesi aktif sudah melewati skrining
  - Stepper visual 3 langkah: Curhat (S+U) → Panduan (F) → Kontak CP (A)
  - Setiap step menampilkan status: Selesai ✅ / Aktif 🔵 / Terkunci 🔒
- **Section 3 — Riwayat Singkat:**
  - Tabel/list 3 sesi skrining terakhir: tanggal, kondisi, status (Selesai / Dalam Proses)
  - Link "Lihat semua riwayat" → `/history`
- **Section 4 — Tombol Aksi:**
  - Tombol "Mulai Skrining Baru" (jika tidak ada sesi aktif)
  - Tombol "Lanjutkan Sesi" (jika ada sesi aktif)

#### State
- **Pertama kali login (belum pernah skrining):** Hanya tampilkan Section 4 dengan CTA "Mulai Skrining Pertama Anda" + ilustrasi welcome
- **Ada sesi aktif:** Section 1 & 2 tampil
- **Semua sesi selesai:** Section 3 + CTA "Mulai Skrining Baru"

---

### B2. Halaman Mulai Skrining
**Path:** `/screening/start`
**Akses:** Pasien (login required)

#### Tujuan
Halaman pengantar sebelum kuesioner dimulai. Memberikan informasi konteks kepada pasien tentang apa yang akan dilakukan, perkiraan durasi, dan instruksi pengisian. Setelah mengkonfirmasi, sesi skrining baru dibuat di database dan pasien diarahkan ke kuesioner.

#### Layout & Komponen
- **Navbar:** Navigasi pasien
- **Card utama (center):**
  - Judul "Skrining Kesehatan Mental"
  - Deskripsi singkat: tujuan skrining, pentingnya kejujuran dalam menjawab
  - Info perkiraan waktu (contoh: "Perkiraan waktu: 10–15 menit")
  - Info jumlah pertanyaan (diambil dari kuesioner aktif)
  - Catatan: "Jawaban Anda bersifat rahasia dan hanya dapat diakses oleh konselor yang menangani Anda"
  - Catatan: "Anda dapat menyimpan progress dan melanjutkan kapan saja"
  - Tombol "Mulai Skrining" (primary)
  - Tombol "Kembali ke Dashboard" (secondary/ghost)

#### Interaksi Pengguna
- Klik "Mulai Skrining" → sistem membuat sesi skrining baru di database → redirect ke `/screening/:newId`
- Jika ada sesi yang belum selesai, tampilkan modal konfirmasi: "Anda memiliki sesi skrining yang belum selesai. Lanjutkan sesi tersebut atau mulai baru?" dengan dua tombol pilihan

---

### B3. Halaman Skrining (Kuesioner)
**Path:** `/screening/:id`
**Akses:** Pasien (login required); hanya bisa akses sesi milik diri sendiri

#### Tujuan
Halaman utama pengisian kuesioner multi-step. Setiap pertanyaan ditampilkan satu per satu dengan navigasi prev/next. Jawaban disimpan otomatis ke database setiap kali pasien berpindah pertanyaan.

#### Layout & Komponen
- **Header halaman (sticky):**
  - Nama kuesioner
  - Progress bar horizontal menunjukkan persentase selesai (contoh: "7 dari 20 pertanyaan")
  - Nomor pertanyaan saat ini (contoh: "Pertanyaan 7 dari 20")
  - Tombol "Simpan & Keluar" di kanan atas (menyimpan progress dan kembali ke dashboard)
- **Area Pertanyaan (center):**
  - Teks pertanyaan (font lebih besar, prominent)
  - Pilihan jawaban: list tombol/card yang bisa diklik; setiap opsi berisi teks jawaban
  - Opsi yang dipilih berubah tampilan (background berwarna, border tebal)
- **Footer navigasi:**
  - Tombol "Sebelumnya" (disabled di pertanyaan pertama)
  - Tombol "Berikutnya" (disabled jika belum memilih jawaban)
  - Di pertanyaan terakhir, tombol "Berikutnya" berubah menjadi "Selesai & Lihat Hasil"
- **Modal Konfirmasi Submit:** Sebelum submit final, muncul modal "Anda yakin ingin mengirimkan jawaban? Jawaban tidak dapat diubah setelah dikirim." dengan tombol "Ya, Kirim" dan "Batal"

#### Interaksi Pengguna
- Klik opsi jawaban → opsi terpilih (visual), tombol "Berikutnya" aktif
- Klik "Berikutnya" → simpan jawaban ke database → tampilkan pertanyaan berikutnya (animasi slide)
- Klik "Sebelumnya" → kembali ke pertanyaan sebelumnya (jawaban tetap tersimpan)
- Klik "Simpan & Keluar" → simpan progress → redirect ke `/dashboard`
- Klik "Selesai & Lihat Hasil" → modal konfirmasi → submit → redirect ke `/screening/:id/result`

#### State
- **Loading pertama:** Skeleton saat memuat kuesioner
- **Normal:** Pertanyaan tampil dengan animasi transisi
- **Submitting:** Spinner overlay saat submit final
- **Error (gagal simpan):** Toast peringatan "Gagal menyimpan jawaban. Coba lagi." dengan tombol retry; jawaban tetap tersimpan di local state

#### Catatan Teknis
- Jawaban disimpan ke database setiap pindah pertanyaan (bukan hanya di akhir)
- Jika user reload halaman, sesi dilanjutkan dari pertanyaan terakhir yang dijawab

---

### B4. Halaman Hasil Skrining
**Path:** `/screening/:id/result`
**Akses:** Pasien (login required); hanya bisa akses hasil milik diri sendiri

#### Tujuan
Menampilkan hasil skrining berupa kesimpulan kondisi, level urgensi, dan penjelasan singkat. Ini adalah halaman pivotal yang menghubungkan pasien ke alur intervensi SUFA.

#### Layout & Komponen
- **Navbar:** Navigasi pasien
- **Section 1 — Hasil Utama:**
  - Ilustrasi/ikon yang sesuai dengan level urgensi (warna berbeda: hijau/kuning/merah)
  - Label level urgensi besar (contoh: "Tingkat Sedang")
  - Nama kondisi (contoh: "Indikasi Kecemasan Sedang")
  - Tanggal & waktu skrining
- **Section 2 — Penjelasan:**
  - Teks penjelasan kondisi (dikonfigurasi Admin per kategori kondisi)
  - Teks ini bersifat informatif dan non-judgmental, tidak bersifat diagnosis klinis
  - Disclaimer: "Hasil ini bukan diagnosis medis. Gunakan sebagai panduan awal untuk mencari dukungan."
- **Section 3 — Langkah Selanjutnya:**
  - Penjelasan singkat tentang intervensi SUFA
  - Tombol CTA "Mulai Intervensi SUFA" (primary, prominent)
  - Tombol "Kembali ke Dashboard" (secondary)
- **Footer:** Link ke halaman riwayat

#### State
- **Loading:** Skeleton saat menghitung skor dan memuat hasil
- **Error:** Pesan error jika hasil tidak bisa dimuat + tombol retry

#### Navigasi
- Tombol "Mulai Intervensi SUFA" → `/intervention/:screeningId`
- Tombol "Kembali ke Dashboard" → `/dashboard`

---

### B5. Halaman Hub SUFA
**Path:** `/intervention/:screeningId`
**Akses:** Pasien (login required); hanya bisa akses intervensi untuk sesi skrining milik sendiri

#### Tujuan
Halaman pusat yang menampilkan tiga step intervensi SUFA dengan progress tracker visual. Berfungsi sebagai peta jalan bagi pasien untuk melihat langkah mana yang sudah selesai, sedang aktif, dan masih terkunci.

#### Layout & Komponen
- **Navbar:** Navigasi pasien
- **Header halaman:**
  - Judul "Intervensi SUFA"
  - Ringkasan kondisi dari hasil skrining (nama kondisi + level urgensi, read-only)
- **Stepper Visual (prominent, center):**
  - Step 1: "Curhat (S+U)" — ikon chat
  - Step 2: "Panduan Pendampingan (F)" — ikon video/panduan
  - Step 3: "Hubungi Profesional (A)" — ikon kontak/telepon
  - Setiap step menampilkan: nomor, nama, deskripsi singkat satu kalimat, status (Selesai ✅ / Aktif 🔵 / Terkunci 🔒)
  - Garis penghubung antar step berubah warna saat step sebelumnya selesai
- **Card Step Aktif (di bawah stepper):**
  - Menampilkan detail singkat tentang step yang sedang aktif
  - Tombol "Mulai [nama step]" atau "Lanjutkan [nama step]"
- **Card Step Selesai (collapsible):**
  - Menampilkan ringkasan singkat step yang sudah selesai (tanggal selesai, dll.)

#### Interaksi Pengguna
- Pasien hanya bisa mengklik step yang aktif atau step yang sudah selesai (untuk review)
- Step terkunci tampil disabled (tidak bisa diklik, muncul tooltip "Selesaikan langkah sebelumnya terlebih dahulu")
- Setelah ketiga step selesai, muncul banner sukses dan tombol "Lanjut ke Pertolongan Pertama"

#### State
- **Step 1 aktif:** Hanya tombol Step 1 enabled
- **Step 1 selesai, Step 2 aktif:** Step 1 tampil completed, Step 2 aktif
- **Semua selesai:** Banner "Semua langkah SUFA selesai!" + tombol Pertolongan Pertama

---

### B6. Halaman Curhat — Step 1 (S+U)
**Path:** `/intervention/:screeningId/chat`
**Akses:** Pasien (login required)

#### Tujuan
Halaman live chat antara pasien dan konselor untuk menjalankan step S (Sadari) dan U (Utarakan) dari protokol SUFA. Pasien dapat mencurahkan perasaan dan kondisinya, sementara konselor mendengarkan dan merespons secara empatik.

#### Layout & Komponen
- **Header chat:**
  - Tombol "← Kembali ke SUFA" di kiri (hanya jika sesi belum dimulai atau sudah selesai)
  - Nama "Sesi Curhat" + nama konselor (jika sudah terhubung)
  - Status koneksi: "Menunggu konselor..." / "Terhubung dengan [Nama Konselor]" / "Sesi selesai"
- **Area Chat (main, scrollable):**
  - Pesan konselor: bubble kiri, background abu muda
  - Pesan pasien: bubble kanan, background warna primer muda
  - Timestamp di bawah setiap pesan
  - Tanggal pemisah (contoh: "Hari ini") jika sesi melewati tengah malam
  - Pesan sistem (center, abu): "Konselor [Nama] telah bergabung", "Sesi dimulai", "Sesi selesai"
- **Antrian (kondisional — sebelum konselor tersedia):**
  - Placeholder menggantikan area chat
  - Animasi loading / ilustrasi menunggu
  - Teks "Sedang mencari konselor yang tersedia..."
  - Estimasi waktu tunggu (jika bisa dihitung)
  - Tombol "Batalkan & Kembali"
- **Input Area (di bawah, sticky):**
  - Text area satu baris (expandable saat mengetik)
  - Tombol kirim (icon panah) — disabled saat input kosong
  - Disabled saat status "Menunggu konselor" atau "Sesi selesai"
- **Tombol "Selesai Curhat":** Muncul hanya saat sesi aktif, di header kanan; klik memunculkan modal konfirmasi

#### Interaksi Pengguna
- Pasien tiba di halaman → sistem memasukkan pasien ke antrian → status "Menunggu konselor"
- Konselor menerima → status berubah "Terhubung" → area chat aktif
- Pesan real-time via WebSocket
- Klik "Selesai Curhat" → modal "Yakin ingin mengakhiri sesi?" → konfirmasi → sesi ditutup → Step 1 ditandai selesai → redirect ke Hub SUFA dengan Step 2 terbuka

#### State
- **Menunggu antrian:** Placeholder antrian tampil, input disabled
- **Chat aktif:** Area chat penuh, input enabled
- **Konselor mengetik:** Indikator "Konselor sedang mengetik..." di atas input
- **Sesi selesai:** Area chat scrollable (read-only), input disabled, banner "Sesi telah selesai"
- **Koneksi terputus:** Banner kuning "Koneksi terputus. Mencoba menghubungkan ulang..."

---

### B7. Halaman Daftar Panduan — Step 2 (F)
**Path:** `/intervention/:screeningId/guide`
**Akses:** Pasien (login required); hanya bisa diakses setelah Step 1 selesai

#### Tujuan
Menampilkan daftar panduan pendampingan yang relevan dengan kondisi pasien, berdasarkan tag kondisi yang dikonfigurasi Admin. Pasien memilih satu panduan untuk diikuti.

#### Layout & Komponen
- **Header halaman:**
  - Tombol "← Kembali ke SUFA"
  - Judul "Panduan Pendampingan (F)"
  - Deskripsi singkat: "Pilih salah satu panduan di bawah ini untuk membantu Anda mengelola kondisi saat ini."
- **Filter/tab (opsional):** Jika ada banyak panduan, bisa ada filter berdasarkan kategori
- **Grid/List Panduan:**
  - Setiap card panduan: thumbnail YouTube (dari URL), judul, deskripsi singkat, estimasi durasi, tag kondisi
  - Badge "Selesai" hijau pada panduan yang sudah pernah diselesaikan
  - Badge "Sedang Dikerjakan" pada panduan yang sedang diikuti
- **Catatan:** "Selesaikan minimal satu panduan untuk melanjutkan ke langkah berikutnya."

#### Interaksi Pengguna
- Klik card panduan → navigate ke `/intervention/:screeningId/guide/:guideId`
- Setelah minimal satu panduan ditandai selesai → tombol "Lanjut ke Langkah Berikutnya" muncul di bawah
- Pasien boleh kembali dan membaca panduan lain (tidak mengubah progress)

#### State
- **Loading:** Skeleton cards
- **Empty:** Teks "Tidak ada panduan yang tersedia saat ini." (fallback jika Admin belum upload)
- **Ada panduan selesai:** Tombol "Lanjut ke Langkah 3" muncul

---

### B8. Halaman Detail Panduan
**Path:** `/intervention/:screeningId/guide/:guideId`
**Akses:** Pasien (login required)

#### Tujuan
Menampilkan konten panduan lengkap: video YouTube yang dapat diputar dan instruksi langkah-demi-langkah di bawahnya. Pasien mengikuti panduan secara mandiri dan menandai selesai setelah mengikutinya.

#### Layout & Komponen
- **Header:**
  - Tombol "← Kembali ke Daftar Panduan"
  - Judul panduan
  - Badge kondisi yang relevan
- **Section 1 — Video (sticky di desktop, atas di mobile):**
  - YouTube iframe embed (responsive, 16:9)
  - Judul video
- **Section 2 — Instruksi Langkah:**
  - Progress langkah: "Langkah 2 dari 5"
  - Tombol "← Sebelumnya" dan "Berikutnya →"
  - Area teks instruksi langkah aktif (font cukup besar, line-height lega)
  - Opsional: nomor langkah ditampilkan sebagai bullet besar
- **Section 3 — Tombol Selesai:**
  - Hanya muncul di langkah terakhir
  - Tombol "Tandai Selesai & Kembali" (primary)
  - Muncul setelah user mencapai langkah terakhir
- **Sidebar (desktop only):** Daftar semua langkah sebagai outline navigasi; langkah yang sudah dilewati ditandai

#### Interaksi Pengguna
- User menonton video (bebas, tidak ada tracking apakah video benar-benar ditonton)
- Navigasi langkah bebas (prev/next)
- Di langkah terakhir, klik "Tandai Selesai" → panduan ditandai selesai → redirect ke daftar panduan
- Progress langkah tersimpan per sesi (jika user kembali ke halaman, mulai dari langkah terakhir)

#### State
- **Loading:** Skeleton untuk video + teks
- **Error (YouTube gagal load):** Teks "Video tidak dapat dimuat. Pastikan koneksi internet Anda aktif." + tombol retry

---

### B9. Halaman Hubungi Profesional — Step 3 (A)
**Path:** `/intervention/:screeningId/contact`
**Akses:** Pasien (login required); hanya bisa diakses setelah Step 2 selesai

#### Tujuan
Menampilkan daftar kontak tenaga kesehatan/profesional mental yang dapat dihubungi pasien melalui WhatsApp. Ini adalah langkah Arahkan (A) dalam protokol SUFA — mengarahkan pasien ke bantuan profesional.

#### Layout & Komponen
- **Header halaman:**
  - Tombol "← Kembali ke SUFA"
  - Judul "Hubungi Profesional (A)"
  - Deskripsi: "Berikut adalah kontak tenaga kesehatan yang dapat Anda hubungi untuk mendapatkan bantuan lebih lanjut."
- **Daftar Kontak (cards):** Setiap card berisi:
  - Nama / Institusi
  - Spesialisasi (contoh: Psikolog Klinis, Konselor Sekolah, Psikiater)
  - Nomor WhatsApp (ditampilkan dalam format readable: 0812-xxxx-xxxx)
  - Jam operasional
  - Catatan singkat (opsional, contoh: "Khusus untuk siswa SMP-SMA")
  - Tombol "Hubungi via WhatsApp" → membuka `https://wa.me/[nomor]` di tab baru
- **Section bawah:**
  - Teks: "Setelah menghubungi salah satu kontak di atas, klik tombol di bawah untuk melanjutkan."
  - Tombol "Saya Sudah Menghubungi / Lanjutkan" (primary)
  - Catatan: "Tombol ini tidak memverifikasi apakah Anda sudah benar-benar menghubungi. Harap bertindak dengan jujur."

#### Interaksi Pengguna
- Klik "Hubungi via WhatsApp" → tab baru terbuka dengan WhatsApp Web/App; halaman tetap terbuka
- Klik "Saya Sudah Menghubungi / Lanjutkan" → Step 3 ditandai selesai → redirect ke Hub SUFA (semua step selesai) → banner sukses + tombol "Lanjut ke Pertolongan Pertama"

#### State
- **Loading:** Skeleton cards
- **Empty:** Teks "Belum ada kontak yang tersedia. Hubungi sekolah atau puskesmas terdekat." (fallback)

---

### B10. Halaman Pertolongan Pertama
**Path:** `/first-aid/:screeningId`
**Akses:** Pasien (login required); hanya bisa diakses setelah ketiga step SUFA selesai

#### Tujuan
Sesi live chat lanjutan dengan konselor setelah menyelesaikan seluruh tahap SUFA. Berfungsi sebagai monitoring awal untuk memantau kondisi pasien pasca-intervensi dan memberikan dukungan tambahan jika diperlukan.

#### Layout & Komponen
Layout identik dengan halaman Curhat (B6), dengan perbedaan berikut:
- **Label sesi:** "Pertolongan Pertama" (bukan "Curhat") — ditampilkan di header
- **Konteks tambahan di panel konselor (sisi konselor):** ringkasan seluruh perjalanan SUFA yang telah dilalui pasien (tanggal, step selesai, panduan yang diikuti)
- **Pesan selamat datang otomatis (sistem):** "Selamat! Anda telah menyelesaikan seluruh langkah SUFA. Sesi ini adalah tindak lanjut untuk memastikan Anda baik-baik saja."

#### Interaksi Pengguna
Identik dengan Curhat (B6):
- Masuk antrian → tunggu konselor → chat aktif → pasien atau konselor menutup sesi
- Setelah sesi selesai, pasien di-redirect ke Dashboard dengan pesan "Sesi selesai. Terima kasih sudah berani mencari bantuan."

---

### B11. Halaman Riwayat Skrining
**Path:** `/history`
**Akses:** Pasien (login required)

#### Tujuan
Menampilkan daftar semua sesi skrining yang pernah dilakukan pasien, baik yang selesai maupun yang masih dalam proses, untuk keperluan tracking historis.

#### Layout & Komponen
- **Header halaman:** Judul "Riwayat Skrining"
- **Filter/Sort:**
  - Filter: Semua | Selesai | Dalam Proses
  - Sort: Terbaru / Terlama
- **Tabel/List Riwayat:** Setiap baris berisi:
  - Nomor urut
  - Tanggal & waktu skrining
  - Kondisi hasil (label + warna level urgensi)
  - Status (Selesai / Dalam Proses — SUFA / Dalam Proses — PP / Belum Mulai SUFA)
  - Tombol "Lihat Detail" → `/screening/:id/result`
  - Tombol "Lanjutkan" (hanya jika status "Dalam Proses") → halaman yang relevan
- **Pagination:** Jika lebih dari 10 entri

#### State
- **Loading:** Skeleton table
- **Empty:** Ilustrasi + teks "Anda belum pernah melakukan skrining." + tombol "Mulai Skrining"

---

## C. KONSELOR

---

### C1. Halaman Dashboard Konselor
**Path:** `/konselor/dashboard`
**Akses:** Konselor (login required)

#### Tujuan
Pusat kendali utama konselor. Menampilkan toggle ketersediaan, daftar antrian pasien yang menunggu, sesi aktif, dan ringkasan statistik harian. Halaman ini diupdate secara real-time via WebSocket.

#### Layout & Komponen
- **Navbar:** Logo, nama konselor, icon notifikasi, link profil, tombol logout
- **Section 1 — Status Ketersediaan (prominent, di atas):**
  - Toggle besar: **Online** / **Sibuk** / **Offline**
  - Warna indikator: hijau / kuning / abu
  - Teks status: "Anda sedang Online — menerima pasien baru"
  - Peringatan saat akan offline jika ada sesi aktif: modal konfirmasi "Anda masih memiliki sesi aktif. Yakin ingin offline?"
- **Section 2 — Antrian (real-time):**
  - Judul "Menunggu Konselor" + badge jumlah
  - List pasien menunggu: nama pasien, kondisi dari skrining, waktu mulai menunggu, tombol "Terima"
  - Urutan: first-come-first-served (berdasarkan waktu masuk antrian)
  - Hanya tampil jika status konselor = Online
  - Jika Sibuk/Offline: banner "Anda tidak menerima pasien baru saat ini"
- **Section 3 — Sesi Aktif:**
  - List sesi chat yang sedang berlangsung
  - Setiap item: nama pasien, label tipe sesi (Curhat / PP), durasi sesi berjalan, tombol "Buka Chat"
- **Section 4 — Statistik Hari Ini (read-only):**
  - Jumlah sesi diselesaikan hari ini
  - Rata-rata durasi sesi
  - Jumlah pasien ditangani

#### Interaksi Pengguna
- Toggle status → update real-time ke server; pasien di antrian langsung diarahkan ke konselor online lain jika ada
- Klik "Terima" di antrian → sesi chat dibuat → redirect ke `/konselor/chat/:sessionId`
- Klik "Buka Chat" di sesi aktif → redirect ke `/konselor/chat/:sessionId`
- Notifikasi in-app muncul saat ada pasien baru masuk antrian (meski konselor sedang di halaman lain)

#### State
- **Online, tidak ada antrian:** Section 2 kosong dengan teks "Tidak ada pasien menunggu"
- **Online, ada antrian:** List antrian tampil dengan animasi slide-in saat pasien baru masuk
- **Offline:** Section 2 tidak tampil / disabled

---

### C2. Halaman Sesi Chat Konselor
**Path:** `/konselor/chat/:sessionId`
**Akses:** Konselor (login required); hanya bisa akses sesi yang ditugaskan ke konselor tersebut

#### Tujuan
Antarmuka utama konselor untuk berkomunikasi dengan pasien secara real-time. Dilengkapi dengan panel informasi pasien agar konselor dapat memberikan respons yang kontekstual berdasarkan riwayat dan hasil skrining pasien.

#### Layout & Komponen
- **Layout dua kolom (desktop):**

  **Kolom Kiri — Area Chat (70%):**
  - Header: nama pasien, label tipe sesi (Curhat / Pertolongan Pertama), durasi sesi berjalan, tombol "Tutup Sesi"
  - Area pesan: scrollable, bubble chat sama seperti sisi pasien
  - Indikator "Pasien sedang mengetik..."
  - Input area: textarea + tombol kirim
  - Pesan sistem: "Sesi dimulai", "Pasien keluar chat", dll.

  **Kolom Kanan — Panel Pasien (30%):**
  - Tab 1: **Profil** — nama, usia, tanggal bergabung
  - Tab 2: **Hasil Skrining** — kondisi, level urgensi, tanggal skrining, skor (jika relevan)
  - Tab 3: **Riwayat** — daftar sesi sebelumnya dengan pasien ini (tanggal, tipe, catatan singkat)
  - Tab 4: **Catatan Sesi Ini** — textarea untuk catatan internal konselor (tidak terlihat pasien); auto-save

- **Mobile layout:** Panel pasien collapsible (drawer dari kanan)

#### Interaksi Pengguna
- Kirim pesan → WebSocket → muncul di sisi pasien secara real-time
- Catatan internal: auto-save setiap 30 detik + saat konselor menutup tab
- Klik "Tutup Sesi" → modal konfirmasi "Yakin ingin menutup sesi? Pasien akan diberitahu bahwa sesi telah selesai." → konfirmasi → sesi ditutup → pasien diarahkan ke Hub SUFA (step SUFA ditandai selesai) → konselor di-redirect ke `/konselor/dashboard`

#### State
- **Loading:** Skeleton untuk chat + panel pasien
- **Pasien terputus:** Banner kuning "Pasien kehilangan koneksi. Menunggu reconnect..."
- **Pasien menutup sesi:** Banner info "Pasien telah mengakhiri sesi." + tombol "Kembali ke Dashboard"
- **Koneksi konselor terputus:** Banner error "Koneksi terputus. Mencoba menghubungkan kembali..."

---

### C3. Halaman Riwayat Pasien (Konselor)
**Path:** `/konselor/patients`
**Akses:** Konselor (login required); hanya melihat pasien yang pernah ditangani sendiri

#### Tujuan
Menampilkan daftar semua pasien yang pernah ditangani oleh konselor yang sedang login, untuk keperluan pemantauan dan referensi historis.

#### Layout & Komponen
- **Header:** Judul "Riwayat Pasien Saya"
- **Search bar:** Cari berdasarkan nama pasien
- **Filter:** Semua | Pernah Curhat | Pernah PP
- **Tabel Pasien:**
  - Nama pasien
  - Tanggal sesi terakhir
  - Tipe sesi terakhir (Curhat / PP)
  - Kondisi skrining terkait
  - Jumlah total sesi bersama konselor ini
  - Tombol "Lihat Detail" → `/konselor/patients/:id`
- **Pagination:** Jika lebih dari 20 entri

#### State
- **Loading:** Skeleton tabel
- **Empty:** Teks "Anda belum menangani pasien manapun."

---

### C4. Halaman Detail Pasien (Konselor)
**Path:** `/konselor/patients/:id`
**Akses:** Konselor (login required); hanya pasien yang pernah ditangani konselor tersebut

#### Tujuan
Menampilkan riwayat lengkap satu pasien: data profil, semua hasil skrining, semua sesi chat yang pernah dilakukan bersama konselor ini, beserta catatan internal.

#### Layout & Komponen
- **Header:** Tombol "← Kembali ke Riwayat Pasien", nama pasien, badge status akun
- **Section 1 — Profil Pasien (read-only):**
  - Nama, usia, tanggal bergabung
- **Section 2 — Riwayat Skrining:**
  - List semua sesi skrining: tanggal, kondisi, level urgensi, status (accordion expandable)
- **Section 3 — Riwayat Sesi Chat:**
  - List semua sesi chat dengan konselor ini: tanggal, tipe (Curhat/PP), durasi, status
  - Klik sesi → expandable area menampilkan transkrip chat (read-only) + catatan internal konselor untuk sesi tersebut
- **Section 4 — Catatan Umum:**
  - Textarea untuk catatan umum tentang pasien ini (terpisah dari catatan per sesi)
  - Tombol "Simpan Catatan"

---

## D. ADMIN

---

### D1. Halaman Dashboard Admin
**Path:** `/admin/dashboard`
**Akses:** Admin Konten & Super Admin (login required)

#### Tujuan
Memberikan gambaran umum penggunaan aplikasi melalui statistik dan grafik. Membantu Admin memantau aktivitas skrining, intervensi, dan penggunaan panduan.

#### Layout & Komponen
- **Navbar Admin:** Logo, navigasi ke semua modul admin, nama user, logout
- **Section 1 — Kartu Statistik Utama (grid 4 kolom):**
  - Total skrining dilakukan (semua waktu)
  - Total sesi chat (Curhat + PP)
  - Total pengguna aktif (pasien yang pernah login dalam 30 hari)
  - Panduan paling banyak diselesaikan (nama panduan + jumlah)
- **Section 2 — Grafik Tren:**
  - Grafik garis: jumlah skrining per hari/minggu/bulan (filter periode)
  - Grafik pie/donut: distribusi kondisi hasil skrining (Ringan / Sedang / Berat)
- **Section 3 — Tabel Aktivitas Terbaru:**
  - 10 sesi skrining terbaru: nama pasien (disamarkan / inisial), tanggal, kondisi
- **Filter periode:** Dropdown (7 hari / 30 hari / 3 bulan / semua waktu)

---

### D2. Halaman Daftar Kuesioner
**Path:** `/admin/questionnaires`
**Akses:** Admin Konten & Super Admin

#### Tujuan
Menampilkan daftar semua kuesioner yang ada di sistem dan memungkinkan Admin membuat kuesioner baru atau mengelola yang ada.

#### Layout & Komponen
- **Header:** Judul "Kuesioner", tombol "Buat Kuesioner Baru" (primary, pojok kanan)
- **Tabel Kuesioner:**
  - Nama kuesioner
  - Jumlah pertanyaan
  - Status: badge Aktif (hijau) / Nonaktif (abu)
  - Tanggal dibuat / diperbarui
  - Jumlah kali digunakan (berapa sesi skrining menggunakan kuesioner ini)
  - Aksi: tombol "Edit" → `/admin/questionnaires/:id`, tombol "Aktifkan" / "Nonaktifkan", tombol "Hapus" (dengan konfirmasi)
- **Info:** Banner informasi "Hanya satu kuesioner yang dapat aktif dalam satu waktu. Mengaktifkan kuesioner baru akan menonaktifkan yang sebelumnya."

#### Interaksi Pengguna
- Klik "Buat Kuesioner Baru" → sistem membuat kuesioner baru (draft) → redirect ke `/admin/questionnaires/:newId`
- Klik "Aktifkan" → modal konfirmasi jika ada kuesioner aktif lain
- Klik "Hapus" → modal konfirmasi (kuesioner yang pernah digunakan tidak bisa dihapus, hanya dinonaktifkan)

---

### D3. Halaman Edit Kuesioner
**Path:** `/admin/questionnaires/:id`
**Akses:** Admin Konten & Super Admin

#### Tujuan
Editor lengkap untuk membuat dan mengelola kuesioner: metadata kuesioner, daftar pertanyaan beserta pilihan jawaban dan bobot skor, serta konfigurasi scoring/kesimpulan. Ini adalah halaman terkompleks di sisi Admin.

#### Layout & Komponen
- **Header:** Tombol "← Kembali", nama kuesioner (editable inline), badge status, tombol "Preview", tombol "Simpan"
- **Tab/Section navigasi:**

  **Tab 1 — Informasi Umum:**
  - Field Nama Kuesioner
  - Field Deskripsi (textarea)
  - Toggle Status Aktif/Nonaktif

  **Tab 2 — Pertanyaan:**
  - Toolbar: tombol "Tambah Pertanyaan"
  - List pertanyaan (drag-and-drop untuk reorder via handle di kiri):
    - Setiap item pertanyaan (collapsible/expandable):
      - Nomor urut (otomatis)
      - Field teks pertanyaan (textarea)
      - Section pilihan jawaban:
        - Daftar pilihan yang ada: teks pilihan | field bobot skor (angka) | tombol hapus pilihan
        - Tombol "+ Tambah Pilihan" (tidak ada batas hardcode — bisa 2, 3, 4, 5, dst.)
      - Tombol "Hapus Pertanyaan" (dengan konfirmasi)
  - Nilai skor yang digunakan di semua pilihan jawaban divalidasi harus berupa angka

  **Tab 3 — Konfigurasi Scoring:**
  - Deskripsi: "Tentukan rentang skor untuk setiap kategori kondisi."
  - Daftar kategori (yang bisa ditambah/hapus bebas):
    - Setiap baris: Nama Kategori | Skor Minimum | Skor Maksimum | Teks Penjelasan (textarea)
    - Tombol "Hapus" per baris
    - Tombol "+ Tambah Kategori"
  - Validasi: range tidak boleh overlap, harus mencakup seluruh kemungkinan skor

#### Interaksi Pengguna
- Auto-save draft setiap perubahan (debounce 2 detik) + indicator "Disimpan" / "Menyimpan..."
- Tombol "Preview" → modal/panel kanan yang menampilkan simulasi tampilan kuesioner seperti yang akan dilihat pasien
- Drag-and-drop pertanyaan untuk mengurutkan ulang
- Menghapus pertanyaan atau pilihan selalu meminta konfirmasi modal

#### State
- **Auto-save berhasil:** Indicator kecil "Disimpan ✓" di header
- **Auto-save gagal:** Indicator "Gagal menyimpan — Coba lagi" + tombol manual save
- **Kuesioner sedang aktif:** Banner peringatan "Kuesioner ini sedang aktif. Perubahan akan langsung berpengaruh pada skrining baru."

---

### D4. Halaman Daftar Konten Panduan
**Path:** `/admin/guides`
**Akses:** Admin Konten & Super Admin

#### Tujuan
Menampilkan semua panduan pendampingan yang tersedia di sistem, memungkinkan Admin mengelola daftar panduan termasuk urutan tampil.

#### Layout & Komponen
- **Header:** Judul "Konten Panduan (F)", tombol "Tambah Panduan Baru"
- **List panduan (drag-and-drop untuk reorder):**
  - Setiap item: handle drag, thumbnail YouTube (dari URL), judul, tag kondisi, status (Aktif/Nonaktif), tombol "Edit", tombol "Nonaktifkan"/"Aktifkan", tombol "Hapus"
- **Info:** "Urutan panduan ini menentukan urutan tampil di halaman pasien. Seret untuk mengubah urutan."

#### State
- **Empty:** Teks "Belum ada panduan. Tambahkan panduan pertama." + tombol CTA

---

### D5. Halaman Edit Panduan
**Path:** `/admin/guides/:id`
**Akses:** Admin Konten & Super Admin

#### Tujuan
Editor untuk membuat atau mengedit konten satu panduan: URL YouTube, tag kondisi, dan instruksi langkah-demi-langkah.

#### Layout & Komponen
- **Header:** Tombol "← Kembali", judul panduan (editable inline), tombol "Preview", tombol "Simpan"
- **Section 1 — Informasi Umum:**
  - Field Judul Panduan
  - Field Deskripsi Singkat (textarea, ditampilkan di card daftar panduan)
  - Field Tag Kondisi (multi-select atau input tag bebas; digunakan untuk filter panduan per kondisi pasien)
  - Toggle Status Aktif/Nonaktif
- **Section 2 — Video:**
  - Field URL YouTube (text input)
  - Preview thumbnail otomatis setelah URL valid diisi (fetch thumbnail dari YouTube)
  - Validasi: harus URL YouTube yang valid (`youtube.com/watch?v=` atau `youtu.be/`)
- **Section 3 — Langkah Instruksi:**
  - Toolbar: tombol "Tambah Langkah"
  - List langkah (drag-and-drop untuk reorder):
    - Setiap langkah: nomor urut, textarea teks instruksi, tombol hapus
    - Tombol "+ Tambah Langkah" di bawah list
- **Preview (modal/panel):** Simulasi tampilan panduan seperti yang dilihat pasien: video embed + instruksi per langkah

#### Interaksi Pengguna
- Auto-save draft (debounce)
- Drag-and-drop langkah untuk reorder
- Preview menampilkan render akhir

---

### D6. Halaman Kontak Profesional
**Path:** `/admin/contacts`
**Akses:** Admin Konten & Super Admin

#### Tujuan
Mengelola daftar kontak tenaga kesehatan profesional yang ditampilkan kepada pasien di Step 3 (A) intervensi SUFA.

#### Layout & Komponen
- **Header:** Judul "Kontak Profesional (A)", tombol "Tambah Kontak"
- **List kontak (drag-and-drop untuk reorder urutan tampil):**
  - Setiap item (card/baris): nama/institusi, spesialisasi, nomor WA, jam operasional, status, tombol "Edit", "Hapus"
- **Modal Tambah/Edit Kontak:**
  - Field: Nama / Institusi, Spesialisasi, Nomor WhatsApp, Jam Operasional, Catatan Singkat (opsional), Toggle Aktif
  - Validasi nomor WA: format Indonesia (+62 atau 08xx)
  - Preview: "Tombol WA yang akan muncul di pasien: wa.me/[nomor]"

#### State
- **Empty:** Teks "Belum ada kontak. Tambahkan kontak pertama." + tombol CTA
- **Hapus:** Modal konfirmasi "Kontak ini akan dihapus dan tidak lagi tampil ke pasien."

---

### D7. Halaman Manajemen Invite Code
**Path:** `/admin/invite-codes`
**Akses:** Super Admin only

#### Tujuan
Memungkinkan Super Admin membuat, memantau, dan menonaktifkan invite code yang digunakan untuk registrasi pasien baru. Setiap invite code bersifat single-use.

#### Layout & Komponen
- **Header:** Judul "Invite Code", tombol "Generate Invite Code"
- **Modal Generate:**
  - Field Jumlah Kode (angka, min 1 max 100)
  - Field Masa Berlaku (date picker: tanggal expire)
  - Tombol "Generate"
  - Setelah generate: tampilkan daftar kode yang baru dibuat + tombol "Salin Semua" + tombol "Unduh sebagai CSV"
- **Tabel Invite Code:**
  - Filter: Semua | Belum Terpakai | Sudah Terpakai | Expired | Dinonaktifkan
  - Kolom: Kode, Tanggal Dibuat, Tanggal Expire, Status, Dipakai Oleh (nama pasien jika sudah terpakai), Aksi (Nonaktifkan)
  - Kode yang sudah terpakai: badge "Terpakai" + nama pasien yang menggunakannya + tanggal pemakaian
  - Kode expired: badge "Expired" otomatis berdasarkan tanggal
- **Bulk action:** Checkbox multi-select + tombol "Nonaktifkan yang Dipilih"

#### State
- **Generate loading:** Spinner di dalam modal
- **Tabel empty:** Teks "Belum ada invite code."

---

### D8. Halaman Manajemen User
**Path:** `/admin/users`
**Akses:** Super Admin only

#### Tujuan
Menampilkan dan mengelola seluruh akun pengguna dalam sistem, termasuk kemampuan mengubah role, menonaktifkan akun, dan melihat aktivitas user.

#### Layout & Komponen
- **Header:** Judul "Manajemen User"
- **Search & Filter:**
  - Search bar: cari berdasarkan nama atau email
  - Filter role: Semua | Pasien | Konselor | Admin Konten | Super Admin
  - Filter status: Semua | Aktif | Nonaktif
- **Tabel User:**
  - Nama, Email, Role (badge berwarna), Status (Aktif/Nonaktif), Tanggal Bergabung, Login Terakhir
  - Aksi per baris: dropdown "..." berisi:
    - "Edit Profil" → modal edit (nama, nomor telepon, role)
    - "Reset Password" → kirim email reset password
    - "Nonaktifkan Akun" → modal konfirmasi
    - "Aktifkan Akun" (jika sedang nonaktif)
- **Modal Edit User:**
  - Field Nama, Nomor Telepon, Role (dropdown), Status
  - Email tidak dapat diubah
  - Tombol Simpan
- **Pagination:** 20 per halaman

#### State
- **Loading:** Skeleton tabel
- **Empty (setelah filter):** Teks "Tidak ada user yang cocok dengan filter."
- **Reset password:** Toast "Email reset password telah dikirim ke [email]"

---

### D9. Halaman Laporan
**Path:** `/admin/reports`
**Akses:** Admin Konten & Super Admin

#### Tujuan
Memungkinkan Admin mengekspor data skrining dan statistik sesi chat dalam format CSV untuk keperluan pelaporan Kemenkes.

#### Layout & Komponen
- **Header:** Judul "Laporan & Export"
- **Section 1 — Export Data Skrining:**
  - Deskripsi: "Export data hasil skrining pasien dalam periode tertentu."
  - Filter: Tanggal mulai & tanggal akhir (date range picker)
  - Filter kondisi: Semua / pilih kondisi tertentu (multi-select)
  - Preview jumlah data: "Terdapat [X] sesi skrining dalam rentang ini."
  - Tombol "Export CSV — Data Skrining"
  - Kolom yang diexport: ID sesi, tanggal, kondisi, level urgensi, skor total (tanpa nama pasien — anonimisasi default)
  - Toggle "Sertakan nama pasien" (dengan peringatan privasi)
- **Section 2 — Export Statistik Sesi Chat:**
  - Deskripsi: "Export statistik sesi Curhat dan Pertolongan Pertama."
  - Filter: Tanggal mulai & akhir, filter tipe sesi (Curhat / PP / Semua)
  - Preview jumlah data
  - Tombol "Export CSV — Statistik Chat"
  - Kolom yang diexport: ID sesi, tanggal, tipe, durasi, nama konselor (bukan nama pasien)
- **Section 3 — Laporan Ringkasan:**
  - Tampilan statistik agregat sesuai filter (sama seperti dashboard tapi dengan filter lebih fleksibel)
  - Tidak bisa diexport (hanya ditampilkan di layar)

#### Interaksi Pengguna
- Set filter → preview count diupdate otomatis
- Klik "Export CSV" → file CSV langsung diunduh browser
- Klik dengan toggle "Sertakan nama pasien" aktif → modal peringatan privasi harus dikonfirmasi sebelum export

#### State
- **Loading export:** Tombol berubah spinner + teks "Menyiapkan file..."
- **Export berhasil:** Download otomatis + toast "File berhasil diunduh"
- **Tidak ada data:** Preview count 0, tombol Export disabled + teks "Tidak ada data untuk filter ini"

---

*Dokumen ini adalah deskripsi fungsional halaman dan menjadi referensi untuk desain UI dan development.*
*Versi 1.0 — Juni 2026*