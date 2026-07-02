# Panduan Alur Pengujian (Testing Use Case) MHFA

Dokumen ini memandu Anda melakukan pengujian skenario ujung-ke-ujung (end-to-end testing) untuk masing-masing peran (**Pasien**, **Konselor**, dan **Admin**).

---

## 🧑‍⚕️ 1. Alur Peran: Pasien (Patient Flow)

Fokus pengujian alur pasien adalah melakukan skrining mandiri, masuk ke dalam antrean konseling, berinteraksi secara realtime, dan mengakses panduan pendampingan (SUFA).

### Langkah Pengujian:
1. **Pendaftaran & Login**:
   * Buka halaman `/register` untuk mendaftarkan akun baru, atau `/login` jika sudah memiliki akun dengan role **Pasien**.
2. **Memulai Skrining**:
   * Masuk ke dashboard, lalu klik tombol **"Mulai Skrining Baru"** (diarahkan ke `/screening/start`).
   * Isi kuesioner skrining kesehatan mental hingga selesai dan klik **"Kirim Hasil"**.
   * Anda akan diarahkan ke halaman hasil (`/screening/[id]/result`) yang menampilkan skor, kondisi (misal: "Kecemasan Sedang"), serta rekomendasi intervensi.
3. **Mengakses Hub Intervensi SUFA**:
   * Dari halaman hasil, klik **"Mulai Intervensi"** (diarahkan ke `/intervention/[screeningId]`).
   * Di halaman ini, **Langkah 1: Curhat (S+U)** akan berstatus **Aktif**, sedangkan Langkah 2 dan Langkah 3 berstatus **Terkunci**.
4. **Masuk ke Sesi Chat (Antrean)**:
   * Klik tombol **"Mulai Curhat"** pada Langkah 1.
   * Karena belum ada konselor yang mengambil sesi, Anda akan masuk ke halaman antrean (`/intervention/[screeningId]/chat`).
   * Sistem menampilkan status **"Menunggu Konselor"** beserta estimasi waktu tunggu dan indikator animasi antrean.
5. **Melakukan Chat Real-Time**:
   * Setelah konselor menerima sesi Anda (lihat alur Konselor di bawah), tampilan antrean pasien otomatis berubah menjadi **Ruang Obrolan Aktif**.
   * Kirim beberapa pesan teks. Ketikkan pesan untuk memicu indikator "sedang mengetik" (*typing indicator*) di sisi konselor.
   * Pasien menerima pesan balasan secara instan melalui Supabase Realtime channel.
6. **Mengakses Langkah Selanjutnya (Langkah 2 & 3)**:
   * Setelah sesi chat diakhiri oleh konselor atau pasien sendiri, status sesi berubah menjadi `completed`.
   * Kembali ke halaman Hub Intervensi (`/intervention/[screeningId]`).
   * Langkah 1 sekarang berstatus **Selesai (Centang Hijau)**, dan **Langkah 2: Panduan Pendampingan (F)** kini telah **Terbuka (Aktif)** untuk diakses.

---

## 👩‍⚕️ 2. Alur Peran: Konselor (Counselor Flow)

Fokus pengujian alur konselor adalah menerima antrean pasien secara real-time, melakukan percakapan interaktif, melihat profil klinis pasien, dan menyimpan catatan klinis sesi.

### Langkah Pengujian:
1. **Login sebagai Konselor**:
   * Masuk menggunakan akun ber-role **Konselor** di `/login`.
2. **Dashboard Konselor**:
   * Di halaman `/konselor/dashboard`, konselor akan melihat panel **"Antrean Konseling Masuk"** yang ter-update secara real-time saat pasien memulai sesi curhat.
3. **Menerima Sesi**:
   * Pilih salah satu pasien di daftar antrean, lalu klik tombol **"Terima Sesi"**.
   * Konselor otomatis diarahkan ke ruang chat khusus konselor (`/konselor/chat/[sessionId]`).
4. **Interaksi Chat & Profil Klinis**:
   * Kirim pesan balasan ke pasien. Pesan dikirimkan instan tanpa reload halaman.
   * Perhatikan panel kanan yang menampilkan **"Profil & Skrining Pasien"**: informasi nama, tanggal lahir, kontak, skor skrining terakhir, beserta riwayat skrining lama terintegrasi di sini.
5. **Menulis Catatan Sesi Internal**:
   * Di panel kanan bagian bawah, isi formulir **"Catatan Sesi Internal"** (Keluhan Utama, Asesmen Klinis, Rencana Tindak Lanjut).
   * Klik tombol **"Simpan Catatan"**. Notifikasi sukses akan muncul di pojok kanan atas, menegaskan catatan berhasil disimpan ke database.
6. **Menyelesaikan Sesi**:
   * Klik tombol **"Selesaikan Sesi"** di header ruang chat.
   * Konfirmasi pada modal pop-up yang muncul. Status sesi akan diperbarui di DB dan pasien akan terputus dari chat secara tertib.

---

## ⚙️ 3. Alur Peran: Administrator (Admin Flow)

Fokus pengujian alur administrator adalah mengelola user, membuat kode undangan baru, mengelola konten kuesioner/panduan, serta memantau statistik & laporan global.

### Langkah Pengujian:
1. **Login sebagai Admin**:
   * Masuk menggunakan kredensial akun **Administrator** di `/login`.
2. **Dashboard Admin**:
   * Di halaman `/admin/dashboard`, pantau metrik aggregate (Total Pengguna, Total Skrining, Grafik tren mingguan).
3. **Manajemen Pengguna (`/admin/users`)**:
   * Lihat daftar seluruh pengguna terdaftar.
   * Ubah role pengguna tertentu (misal: mempromosikan Pasien menjadi Konselor) atau nonaktifkan status aktif pengguna.
4. **Manajemen Kode Undangan (`/admin/invite-codes`)**:
   * Masukkan kode unik baru (misal: `KONSELOR-2026`) beserta perannya (Konselor/Admin) untuk membatasi pendaftaran pihak internal.
   * Pantau kode mana saja yang masih aktif atau sudah terpakai oleh pendaftar baru.
5. **Manajemen Konten Kuesioner & Panduan (`/admin/questionnaires` & `/admin/guides`)**:
   * Edit pertanyaan kuesioner skrining, rentang skor klasifikasi kecemasan, atau buat materi panduan video coping strategy baru.
6. **Ekspor Laporan (`/admin/reports`)**:
   * Buka halaman laporan dan klik **"Ekspor CSV"** untuk mengunduh rekapitulasi data demografi dan hasil skrining secara nyata dalam format `.csv`.
