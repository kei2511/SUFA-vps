# 🧪 Prompt Testing E2E — MHFA Web Application

**URL Production:** https://mhfa-six.vercel.app/
**Tujuan:** Melakukan pengujian menyeluruh (End-to-End) terhadap seluruh fitur aplikasi MHFA menggunakan ketiga peran pengguna: **Pasien**, **Konselor**, dan **Admin**.

---

## 📋 Kredensial Login Demo

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Pasien   | `pasien@email.com`     | *(bebas)*      |
| Konselor | `konselor@email.com`   | *(bebas)*      |
| Admin    | `admin@email.com`      | *(bebas)*      |

---

## 🔹 BAGIAN 1: Halaman Publik (Tanpa Login)

### 1.1 Halaman Login (`/login`)
- [ ] Buka https://mhfa-six.vercel.app/login
- [ ] Pastikan logo MHFA (shield medis) dan judul "Masuk ke Akun" muncul dengan benar
- [ ] Pastikan teks "Layanan Kesehatan Jiwa MHFA" tampil (BUKAN Kemenkes)
- [ ] Uji toggle show/hide password (ikon mata)
- [ ] Klik link "Lupa kata sandi?" → pastikan diarahkan ke `/forgot-password`
- [ ] Klik link "Daftar sekarang" → pastikan diarahkan ke `/register`
- [ ] Masukkan email sembarangan + password → pastikan muncul pesan error demo
- [ ] Masukkan `admin@email.com` + password bebas → pastikan diarahkan ke `/admin/dashboard`

### 1.2 Halaman Registrasi (`/register`)
- [ ] Buka https://mhfa-six.vercel.app/register
- [ ] Pastikan form memiliki field: Kode Undangan, Nama Lengkap, Nomor Telepon, Email, Tanggal Lahir, Password, Konfirmasi Password
- [ ] Coba isi semua field dan klik "Daftar" → pastikan ada animasi loading
- [ ] Klik link "Sudah punya akun? Masuk" → pastikan diarahkan ke `/login`

### 1.3 Halaman Lupa Password (`/forgot-password`)
- [ ] Buka https://mhfa-six.vercel.app/forgot-password
- [ ] Pastikan form input email muncul
- [ ] Isi email dan klik submit → pastikan ada respons/loading

### 1.4 Halaman Reset Password (`/reset-password`)
- [ ] Buka https://mhfa-six.vercel.app/reset-password
- [ ] Pastikan form password baru + konfirmasi muncul

---

## 🔹 BAGIAN 2: Role PASIEN (`pasien@email.com`)

### 2.1 Login sebagai Pasien
- [ ] Buka `/login` → masukkan `pasien@email.com` → klik Masuk
- [ ] Pastikan diarahkan ke `/dashboard`

### 2.2 Dashboard Pasien (`/dashboard`)
- [ ] Pastikan tampilan dashboard pasien muncul (ucapan selamat datang, statistik ringkasan)
- [ ] Pastikan Bottom Navigation (mobile) atau Sidebar (desktop) tampil dengan menu: Dashboard, Skrining, Riwayat, Notifikasi, Profil
- [ ] Klik setiap menu navigasi → pastikan berpindah halaman dengan benar

### 2.3 Mulai Skrining (`/screening/start`)
- [ ] Navigasi ke halaman Mulai Skrining
- [ ] Pastikan halaman pengantar skrining muncul dengan tombol "Mulai Skrining"
- [ ] Klik "Mulai Skrining" → pastikan diarahkan ke halaman kuesioner

### 2.4 Kuesioner Skrining (`/screening/1`)
- [ ] Pastikan pertanyaan skrining muncul (minimal 3 pertanyaan)
- [ ] Pilih jawaban untuk pertanyaan pertama → klik "Berikutnya"
- [ ] Pilih jawaban untuk pertanyaan kedua → klik "Berikutnya"
- [ ] Pilih jawaban untuk pertanyaan ketiga → klik "Selesai & Lihat Hasil"
- [ ] Pastikan navigasi pertanyaan (progress bar/counter) berfungsi
- [ ] Pastikan tombol "Sebelumnya" bisa kembali ke pertanyaan sebelumnya

### 2.5 Hasil Skrining (`/screening/1/result`)
- [ ] Pastikan halaman hasil skrining muncul dengan skor/kategori
- [ ] Pastikan ada rekomendasi tindakan (misalnya: Mulai Intervensi SUFA)
- [ ] Klik tombol "Mulai Intervensi SUFA" → pastikan diarahkan ke halaman intervensi

### 2.6 Halaman Intervensi (`/intervention/1`)
- [ ] Pastikan halaman intervensi utama tampil dengan opsi: Chat Konseling, Panduan Edukasi, Kontak Profesional
- [ ] Pastikan riwayat sesi chat (jika ada) ditampilkan

### 2.7 Chat Konseling (`/intervention/1/chat`)
- [ ] Buka halaman chat konseling
- [ ] Pastikan area chat muncul dengan input pesan di bagian bawah
- [ ] Ketik pesan tes → klik kirim → pastikan pesan muncul di area chat
- [ ] Klik tombol "Akhiri Sesi" di bagian atas
- [ ] Pastikan muncul modal konfirmasi "Ya, Selesaikan Sesi"
- [ ] Klik konfirmasi → pastikan sesi berakhir

### 2.8 Panduan Edukasi (`/intervention/1/guide`)
- [ ] Buka halaman perpustakaan panduan edukasi
- [ ] Pastikan ada daftar panduan/artikel/video
- [ ] Uji filter kategori (contoh: klik "Kecemasan", "Stres", dll.)
- [ ] Klik salah satu panduan → pastikan halaman detail terbuka

### 2.9 Detail Panduan (`/intervention/1/guide/breathing-478`)
- [ ] Pastikan konten panduan (misalnya teknik pernapasan 4-7-8) muncul
- [ ] Klik tombol "Selanjutnya" → pastikan berpindah ke langkah berikutnya
- [ ] Klik tombol "Sebelumnya" → pastikan kembali ke langkah sebelumnya

### 2.10 Kontak Profesional (`/intervention/1/contact`)
- [ ] Pastikan daftar kontak profesional/RS/klinik muncul
- [ ] Pastikan ada tombol WhatsApp/telepon untuk menghubungi

### 2.11 Riwayat (`/history`)
- [ ] Buka halaman riwayat
- [ ] Pastikan daftar riwayat skrining dan sesi konseling muncul

### 2.12 Notifikasi (`/notifications`)
- [ ] Buka halaman notifikasi
- [ ] Pastikan daftar notifikasi (atau pesan kosong) muncul

### 2.13 Profil (`/profile`)
- [ ] Buka halaman profil
- [ ] Pastikan data profil pengguna ditampilkan (nama, email, dll.)

---

## 🔹 BAGIAN 3: Role KONSELOR (`konselor@email.com`)

### 3.1 Login sebagai Konselor
- [ ] Buka `/login` → masukkan `konselor@email.com` → klik Masuk
- [ ] Pastikan diarahkan ke `/konselor/dashboard`

### 3.2 Dashboard Konselor (`/konselor/dashboard`)
- [ ] Pastikan tampilan dashboard konselor muncul (statistik pasien, sesi aktif, grafik)
- [ ] Pastikan Sidebar (desktop) atau Bottom Nav (mobile) menampilkan menu: Dashboard, Daftar Pasien, Chat Aktif
- [ ] Pastikan kartu statistik menampilkan angka (Total Pasien, Sesi Aktif, dll.)

### 3.3 Daftar Pasien (`/konselor/patients`)
- [ ] Buka halaman daftar pasien
- [ ] Pastikan tabel/daftar pasien muncul dengan kolom: Nama, Status, Skor Terakhir, Tanggal
- [ ] Uji fitur pencarian (cari nama pasien)
- [ ] Klik salah satu pasien → pastikan diarahkan ke halaman detail pasien

### 3.4 Detail Pasien (`/konselor/patients/[id]`)
- [ ] Pastikan halaman detail pasien muncul dengan:
  - Informasi profil pasien
  - Riwayat skrining (grafik tren skor)
  - Riwayat sesi konseling
  - Catatan konselor (notes)
- [ ] Uji fitur tambah catatan/note jika tersedia
- [ ] Klik tombol kembali → pastikan kembali ke daftar pasien

### 3.5 Chat Aktif Konselor (`/konselor/chat/[sessionId]`)
- [ ] Buka halaman chat aktif dari dashboard atau daftar pasien
- [ ] Pastikan area chat konselor muncul (mirip chat pasien tapi dari sisi konselor)
- [ ] Ketik pesan → kirim → pastikan pesan muncul
- [ ] Uji tombol akhiri sesi

---

## 🔹 BAGIAN 4: Role ADMIN (`admin@email.com`)

### 4.1 Login sebagai Admin
- [ ] Buka `/login` → masukkan `admin@email.com` → klik Masuk
- [ ] Pastikan diarahkan ke `/admin/dashboard`

### 4.2 Dashboard Admin (`/admin/dashboard`)
- [ ] Pastikan dashboard admin muncul dengan statistik sistem keseluruhan
- [ ] Pastikan Sidebar menampilkan menu: Dashboard, Pengguna, Kode Undangan, Kuesioner, Panduan Edukasi, Kontak Referensi, Laporan
- [ ] Pastikan kartu statistik (Total Pengguna, Total Skrining, dll.) tampil

### 4.3 Manajemen Pengguna (`/admin/users`)
- [ ] Buka halaman manajemen pengguna
- [ ] Pastikan tabel pengguna muncul (Nama, Email, Peran, Status, Tanggal Bergabung, Login Terakhir)
- [ ] Uji filter berdasarkan Peran (Pasien, Konselor, Admin)
- [ ] Uji filter berdasarkan Status (Aktif, Nonaktif)
- [ ] Uji fitur pencarian (cari nama/email)
- [ ] Klik tombol menu (titik tiga) pada salah satu user → pastikan dropdown muncul (Edit, Reset Password, Nonaktifkan)
- [ ] Klik "Nonaktifkan" → pastikan status user berubah menjadi "Nonaktif"
- [ ] Klik "Aktifkan" kembali → pastikan status kembali "Aktif"

### 4.4 Kode Undangan (`/admin/invite-codes`)
- [ ] Buka halaman kode undangan
- [ ] Pastikan daftar kode undangan muncul (kode, status, tanggal dibuat, digunakan oleh)
- [ ] Klik tombol "Generate Kode Baru" → pastikan kode baru muncul di daftar
- [ ] Uji fitur salin kode (copy to clipboard)

### 4.5 Manajemen Kuesioner (`/admin/questionnaires`)
- [ ] Buka halaman daftar kuesioner
- [ ] Pastikan daftar kuesioner skrining muncul
- [ ] Klik salah satu kuesioner → pastikan diarahkan ke halaman edit

### 4.6 Edit Kuesioner (`/admin/questionnaires/[id]`)
- [ ] Pastikan form edit kuesioner muncul (judul, deskripsi, daftar pertanyaan)
- [ ] Pastikan setiap pertanyaan memiliki opsi jawaban dengan skor
- [ ] Uji tombol "Tambah Pertanyaan" → pastikan pertanyaan baru muncul
- [ ] Uji tombol hapus pertanyaan
- [ ] Klik "Simpan" → pastikan ada notifikasi sukses

### 4.7 Panduan Edukasi (`/admin/guides`)
- [ ] Buka halaman daftar panduan edukasi
- [ ] Pastikan daftar panduan/artikel muncul
- [ ] Klik salah satu panduan → pastikan diarahkan ke halaman edit

### 4.8 Edit Panduan (`/admin/guides/[id]`)
- [ ] Pastikan form edit panduan muncul (judul, konten, kategori, media)
- [ ] Uji edit field → klik "Simpan" → pastikan ada respons sukses

### 4.9 Kontak Referensi (`/admin/contacts`)
- [ ] Buka halaman kontak referensi
- [ ] Pastikan daftar kontak profesional/RS/klinik muncul
- [ ] Uji tombol tambah kontak baru
- [ ] Uji edit dan hapus kontak

### 4.10 Laporan & Ekspor (`/admin/reports`)
- [ ] Buka halaman laporan
- [ ] Pastikan grafik/statistik sistem muncul (grafik skrining per bulan, distribusi hasil, dll.)
- [ ] Uji tombol ekspor data (CSV/PDF) jika tersedia
- [ ] Uji filter berdasarkan periode waktu

---

## 🔹 BAGIAN 5: Responsivitas & UI/UX

### 5.1 Desktop (≥1024px)
- [ ] Pastikan Sidebar navigasi tampil di sisi kiri untuk semua role
- [ ] Pastikan layout tabel dan konten menggunakan lebar penuh
- [ ] Pastikan tidak ada elemen yang terpotong atau overflow

### 5.2 Tablet (768px - 1023px)
- [ ] Resize browser ke ukuran tablet
- [ ] Pastikan layout menyesuaikan (responsive)
- [ ] Pastikan navigasi masih mudah diakses

### 5.3 Mobile (≤767px)
- [ ] Resize browser ke ukuran mobile (375px)
- [ ] Pastikan Bottom Navigation muncul di bagian bawah layar
- [ ] Pastikan Sidebar tersembunyi
- [ ] Pastikan form dan tabel bisa di-scroll secara horizontal jika diperlukan
- [ ] Pastikan teks tidak terlalu kecil untuk dibaca
- [ ] Pastikan tombol dan link mudah di-tap (ukuran cukup besar)

### 5.4 Konsistensi Branding
- [ ] Pastikan TIDAK ada referensi "Kemenkes" atau "Kementerian Kesehatan" di halaman manapun
- [ ] Pastikan logo shield medis MHFA konsisten di semua halaman
- [ ] Pastikan warna tema (teal/hijau gelap) konsisten
- [ ] Pastikan font heading dan body konsisten

---

## 🔹 BAGIAN 6: Edge Cases & Error Handling

- [ ] Buka URL yang tidak ada (misalnya `/halaman-tidak-ada`) → pastikan ada halaman 404 atau redirect
- [ ] Refresh halaman dashboard saat sudah login → pastikan halaman tetap tampil
- [ ] Buka halaman `/login` saat sudah "login" → pastikan perilaku wajar (tetap di login atau redirect ke dashboard)
- [ ] Uji klik cepat berulang pada tombol submit → pastikan tidak ada double submission
- [ ] Uji form dengan input kosong → pastikan validasi HTML5 (`required`) bekerja

---

## ✅ Checklist Ringkasan

| Kategori              | Total Test | Lulus | Gagal | Catatan |
|-----------------------|:----------:|:-----:|:-----:|---------|
| Halaman Publik        |     8      |       |       |         |
| Role Pasien           |    25      |       |       |         |
| Role Konselor         |    12      |       |       |         |
| Role Admin            |    22      |       |       |         |
| Responsivitas & UI/UX |    12      |       |       |         |
| Edge Cases            |     5      |       |       |         |
| **TOTAL**             |  **84**    |       |       |         |
