# Panduan Lengkap Deploy SUFA di VPS Menggunakan Coolify

Panduan ini dirancang untuk mendepoloy aplikasi **SUFA (MHFA Web)** bersama **PostgreSQL lokal** di VPS Anda menggunakan **Coolify**, dengan akses langsung via **IP VPS dan port (HTTP)** tanpa perlu domain terlebih dahulu.

---

## 🏗️ Arsitektur Deployment

- **Next.js 16 (App Router & Standalone Mode)**: Berjalan di dalam container `sufa-web`.
- **PostgreSQL 16**: Berjalan di dalam container `sufa-postgres` dengan persistent volume (`postgres_data`).
- **Database Init Otomatis**: Skrip `docker/postgres/init.sql` akan otomatis dieksekusi saat container database pertama kali dibuat:
  - Membuat seluruh tabel (`user`, `session`, `account`, `questionnaires`, `questions`, `options`, `screening_sessions`, `chat_sessions`, dll).
  - Mengisi kuesioner awal (**PHQ-9**, **GAD-7**, dan **MMYS-Combined**).
  - Mengisi kode undangan awal (**ADMIN2026**, **KONSELOR2026**, **SUFA2026**).
  - Mengisi kontak darurat kesehatan mental awal (Sejiwa Kemenkes 119, LISA Helpline, dll).

---

## 1. Persiapan VPS (Jika Coolify Belum Terpasang)

Jika VPS Anda (Ubuntu 22.04 / 24.04 atau Debian 12) masih baru dan belum memiliki Coolify:

1. **SSH ke VPS Anda**:
   ```bash
   ssh root@IP_VPS_ANDA
   ```

2. **Jalankan Instalasi Resmi Coolify (1 baris)**:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

3. **Pastikan Port Firewall Terbuka**:
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 3000/tcp
   ufw allow 8000/tcp
   ufw reload
   ```

4. **Buka Dashboard Coolify**:
   Buka browser Anda dan akses:
   `http://IP_VPS_ANDA:8000`
   Ikuti langkah awal untuk membuat akun admin Coolify Anda.

---

## 2. Langkah Deploy SUFA di Coolify

### Langkah 1: Buat Resource Baru di Coolify
1. Di Dashboard Coolify, masuk ke menu **Projects** → pilih **Default** (atau buat project baru).
2. Klik tombol **+ New** → Pilih **Public Repository** (atau **Private Repository** jika repo bersifat private).
3. Masukkan URL repository GitHub Anda:
   `https://github.com/kei2511/SUFA-vps`
   (Branch: `main`)

### Langkah 2: Pilih Build Pack "Docker Compose"
1. Coolify akan mendeteksi tipe project. Pilih **Docker Compose**.
2. Coolify akan membaca file [docker-compose.yml](file:///d:/sandbox/sandbox/SUFA-vps/docker-compose.yml) yang sudah tersedia di root repository.

### Langkah 3: Konfigurasi Environment Variables di Coolify
Di halaman resource Coolify, klik tab **Environment Variables**, lalu tambahkan variabel berikut:

```ini
# Ganti IP_VPS_ANDA dengan alamat IP VPS publik Anda (tanpa garis miring / di akhir)
POSTGRES_USER=sufa_user
POSTGRES_PASSWORD=sufa_password_rahasia_123
POSTGRES_DB=sufa_db

BETTER_AUTH_SECRET=zR8k2PzL9fJ4mB7wY2qX8vN1cT5oP3uK
BETTER_AUTH_URL=http://IP_VPS_ANDA:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://IP_VPS_ANDA:3000

# PENTING: Karena belum menggunakan domain HTTPS, set ke false agar session cookie berfungsi di HTTP
USE_SECURE_COOKIES=false

APP_PORT=3000
NODE_ENV=production
```

> ⚠️ **Catatan Penting**: Pastikan pada `BETTER_AUTH_URL` dan `NEXT_PUBLIC_BETTER_AUTH_URL` Anda menuliskan IP publik VPS Anda lengkap dengan port `:3000`, misalnya `http://103.187.147.20:3000`.

### Langkah 4: Klik "Deploy"
1. Klik tombol **Deploy** di pojok kanan atas Coolify.
2. Coolify akan:
   - Mengunduh PostgreSQL 16 image.
   - Menjalankan migrasi & seeding otomatis dari `docker/postgres/init.sql`.
   - Melakukan build Docker multi-stage Next.js standalone.
   - Menjalankan container `sufa-postgres` dan `sufa-web`.
3. Tunggu hingga log build berstatus **Healthy / Running**.

---

## 3. Cara Mengakses & Membuat Akun Pertama

Setelah status container **Running**:

Buka browser Anda dan akses:
`http://IP_VPS_ANDA:3000`

### Opsi A: Generate Otomatis Akun Demo (Rekomendasi Tercepat)
Kunjungi URL berikut satu kali di browser Anda:
```
http://IP_VPS_ANDA:3000/api/admin/seed-demo-users
```
Sistem akan otomatis membuat 3 akun siap pakai:
- **Admin**: `admin@sufa.id` (Password: `password123`)
- **Konselor**: `konselor@sufa.id` (Password: `password123`)
- **Konseli (Pasien)**: `pasien@sufa.id` (Password: `password123`)

Setelah itu Anda bisa langsung login di `http://IP_VPS_ANDA:3000/login`.

---

### Opsi B: Mendaftar Sendiri via Halaman Register
1. Buka `http://IP_VPS_ANDA:3000/register`
2. **Untuk membuat Akun Admin**:
   - Masukkan Kode Undangan: `ADMIN2026`
   - Isi Nama, Email, dan Password Anda.
   - Akun Anda otomatis memiliki hak akses **Admin** (`/admin`).
3. **Untuk membuat Akun Konselor**:
   - Masukkan Kode Undangan: `KONSELOR2026` atau `SUFA2026`
   - Akun otomatis menjadi **Konselor** (`/konselor/dashboard`).
4. **Untuk Pasien / Konseli Umum**:
   - Kosongkan Kode Undangan dan daftar seperti biasa.

---

## 4. Tips & Troubleshooting

1. **Gagal Login / Session Terputus (Cookie issue)**:
   - Pastikan `USE_SECURE_COOKIES=false` pada environment variables jika mengakses via HTTP IP. Jika diset `true`, browser modern akan menolak menyimpan cookie session pada protokol non-HTTPS.
   - Pastikan `BETTER_AUTH_URL` sama persis dengan URL yang Anda buka di address bar browser.

2. **Cek Log Database / Web di Coolify**:
   - Di dashboard Coolify, klik tab **Logs** atau klik tombol **Terminal** pada service `web` atau `postgres` untuk melihat proses realtime atau debugging.

3. **Cara Menghubungkan Domain di Masa Depan (HTTPS)**:
   Jika suatu saat Anda sudah membeli domain (misalnya `sufa.domainanda.com`):
   - Arahkan DNS Record A domain ke IP VPS Anda.
   - Di Coolify, tambahkan domain Anda pada setting aplikasi (Coolify akan otomatis mengaktifkan SSL HTTPS gratis via Let's Encrypt).
   - Update environment variables:
     - `BETTER_AUTH_URL=https://sufa.domainanda.com`
     - `NEXT_PUBLIC_BETTER_AUTH_URL=https://sufa.domainanda.com`
     - `USE_SECURE_COOKIES=true`
   - Klik **Redeploy**.
