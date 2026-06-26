# Spesifikasi Desain: Riwayat & Detail Pasien (Fase 4)
**Tanggal**: 26 Juni 2026  
**Status**: Disetujui  

## 1. Pendahuluan
Dokumen ini mendefinisikan rancangan antarmuka dan logika untuk **Fase 4: Riwayat Medis & Profil Pasien bagi Konselor**. Fitur ini dirancang untuk memudahkan konselor meninjau kembali data historis pasien yang pernah atau sedang mereka tangani.

## 2. Struktur Halaman & Routing
1. `/konselor/patients`: Daftar pasien (Riwayat Pasien).
2. `/konselor/patients/[id]`: Halaman detail rekam medis pasien tunggal.

## 3. Detail Desain Antarmuka

### A. Daftar Pasien (`/konselor/patients`)
*   **Komponen Kontrol**:
    *   Input pencarian untuk mencocokkan Nama atau ID Pasien.
    *   Filter status cepat berbentuk Pill ("Semua", "Aktif", "Selesai", "Dirujuk").
*   **Struktur Tabel**:
    *   Nama Pasien & ID (Dilengkapi inisial avatar sirkular).
    *   Usia & Jenis Kelamin.
    *   Tanggal Skrining Terakhir.
    *   Kesimpulan Kondisi (Badge warna-warni berdasarkan skor).
    *   Status Sesi (Pill penanda).
    *   Aksi: Link navigasi ke Detail Rekam Medis.

### B. Detail Pasien (`/konselor/patients/[id]`)
*   **Informasi Profil**:
    *   Data demografis dasar: Jenis Kelamin, Usia, Kode Undangan pendaftaran, Tanggal bergabung.
*   **Visualisasi Tren Skrining**:
    *   Grafik batang/garis menggunakan pure SVG/CSS responsif.
    *   Menampilkan fluktuasi skor kuesioner dari skrining pertama hingga terakhir.
*   **Log Sesi Obrolan & Catatan (Tabbed Layout)**:
    *   **Tab Transkrip Chat**:
        *   Sidebar daftar tanggal sesi di sebelah kiri.
        *   Panel obrolan di sebelah kanan yang menampilkan pesan historis.
    *   **Tab Catatan Konseling**:
        *   Daftar kartu ringkasan medis per tanggal (Keluhan, Asesmen, Rekomendasi).

## 4. Keamanan & Privasi
*   Data pasien yang ditampilkan pada mockup disesuaikan dengan data input apa adanya (realistis).
*   Pada integrasi backend sesungguhnya (Fase 7), data ini hanya dapat diakses oleh pengguna dengan role `counselor` atau `admin` melalui middleware pengamanan rute.
