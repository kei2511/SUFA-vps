# Spesifikasi Desain: Redesain Live Chat MHFA menjadi Sesi Persisten (Multi-Sesi)

Dokumen ini merancang perubahan alur *live chat* pada aplikasi MHFA agar berfungsi sebagai ruang obrolan langsung (tanpa layar antrean tunggu) yang selalu aktif dan persisten, namun tetap terikat pada sesi skrining/intervensi pengguna saat ini (Opsi B).

---

## 1. Perubahan Skema Database (Drizzle ORM)

Kita akan memodifikasi skema tabel `chat_sessions` di `src/db/schema.ts` dengan menambahkan kolom relasi ke tabel `screening_sessions`.

```typescript
export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  counselorId: text("counselor_id").references(() => user.id),
  // Kolom baru untuk mengaitkan chat dengan sesi skrining/intervensi tertentu
  screeningSessionId: text("screening_session_id").references(() => screeningSessions.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // curhat | first_aid
  status: text("status").default("active").notNull(), // waiting | active | completed
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});
```

---

## 2. Daur Hidup Sesi Chat & Aturan Bisnis

* **Pembuatan Sesi:** Saat pasien mengklik "Mulai Curhat" pada halaman Hub Intervensi, sistem akan membuat sesi chat baru dengan status `"active"` secara langsung (bukan `"waiting"`).
* **Penugasan Konselor:** Awalnya `counselorId` bernilai `null`. Sesi ini akan muncul di dasbor semua konselor aktif dalam kolom "Antrean Masuk". Konselor pertama yang mengklik "Terima Sesi" akan ditetapkan sebagai `counselorId` untuk sesi tersebut.
* **Tidak Ada Timeout Otomatis:** Sistem *idle timeout* 10 menit akan dinonaktifkan sepenuhnya.
* **Penyelesaian Sesi:** Pasien dapat menandai sesi chat selesai dengan mengklik tombol **"Selesai Curhat & Lanjut"** di halaman chat pasien. Tindakan ini mengubah status sesi menjadi `"completed"`.
* **Persistensi Riwayat & Pengiriman Pesan:** Baik pasien maupun konselor tetap dapat melihat riwayat dan **mengirim pesan baru** meskipun status sesi chat sudah `"completed"`. Status `"completed"` hanya berfungsi sebagai penanda logis bahwa Langkah 1 (Curhat) telah selesai sehingga Langkah 2 & 3 di Hub Intervensi dapat terbuka.

---

## 3. Perubahan API Routes (Backend)

### A. `GET /api/chat/session/active`
* **Query Parameter:** `screeningSessionId`
* **Perilaku Baru:** 
  * Mencari sesi chat berdasarkan `screeningSessionId` tersebut.
  * Mengembalikan sesi chat jika ditemukan.
  * Menetapkan `hasCompleted: true` jika sesi chat tersebut berstatus `"completed"`.

### B. `POST /api/chat/session/start`
* **Request Body:** `{ screeningSessionId, type }`
* **Perilaku Baru:**
  * Memeriksa apakah sudah ada sesi chat untuk `screeningSessionId`. Jika ada, kembalikan sesi tersebut.
  * Jika belum ada, buat sesi baru dengan `status: "active"` (bukan `"waiting"`) dan `screeningSessionId` diset ke ID skrining tersebut.

### C. `GET /api/konselor/dashboard`
* **Perilaku Baru:**
  * **Queue (Antrean Masuk):** Mengambil sesi chat aktif (`status: "active"`) yang belum memiliki konselor pendamping (`counselorId` is `null`).
  * **Active Sessions:** Mengambil sesi chat aktif yang sedang ditangani oleh konselor yang sedang masuk (`counselorId` matches logged-in counselor ID).

### D. `POST /api/konselor/session/accept`
* **Perilaku Baru:**
  * Memperbarui `counselorId` sesi chat dengan ID konselor yang menerimanya. Status tetap `"active"`.

---

## 4. Perubahan UI/UX (Frontend)

### A. Halaman Chat Pasien (`/intervention/[screeningId]/chat/page.tsx`)
1. **Hapus Halaman Tunggu:** Hapus render kondisional untuk status `"waiting"`. Halaman langsung memuat antarmuka chat.
2. **Generic Header:** Tampilkan nama "Konselor Pendamping" dengan status "Menunggu Respons" jika `counselorId` masih `null`.
3. **Tombol Selesai:** Tambahkan tombol `"Selesai Curhat & Lanjut"` pada header chat. Jika ditekan, panggil `/api/chat/session/end` untuk mengubah status menjadi `"completed"`, lalu arahkan kembali ke `/intervention/[screeningId]`.
4. **Input Tetap Aktif:** Modifikasi logika render agar input chat tidak dinonaktifkan ketika status bernilai `"completed"`.
5. **Banner Status Selesai:** Tampilkan banner informasi jika status sesi adalah `"completed"`.

### B. Halaman Chat Konselor (`/konselor/chat/[sessionId]/page.tsx`)
1. **Input Tetap Aktif:** Hilangkan penonaktifan input chat saat `status === "completed"`.
2. **Informasi Sesi Selesai:** Tampilkan pemberitahuan bahwa pasien sudah menyelesaikan sesi curhat, tetapi pesan tetap dapat dikirim untuk tindak lanjut.
3. **Catatan Sesi:** Tetap ijinkan pengisian dan penyimpanan catatan sesi konselor.

---

## 5. Rencana Pengujian (Verifikasi)

1. **Uji Migrasi:** Menjalankan `npx drizzle-kit push` untuk memverifikasi perubahan skema berhasil diterapkan pada database lama.
2. **Uji Alur Pasien:** Pasien memulai chat, langsung masuk ke ruang chat (tanpa antrean), mengirim pesan pertama kali.
3. **Uji Alur Konselor:** Konselor melihat chat masuk di dasbor, mengklik "Terima Sesi", lalu membalas chat.
4. **Uji Penyelesaian:** Pasien mengklik "Selesai Curhat & Lanjut", kembali ke Hub Intervensi, dan Langkah 2 & 3 terbuka.
5. **Uji Akses Riwayat:** Pasien mengklik "Lihat Kembali" dari Hub Intervensi, melihat riwayat chat, dan masih bisa mengirim pesan.
