# Redesain Live Chat MHFA (Multi-Sesi & Chat Persisten) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah alur live chat menjadi ruang obrolan yang langsung aktif tanpa antrean tunggu, persisten (bisa diakses dan dikirimi pesan kembali meskipun status selesai), serta terikat ke setiap sesi skrining intervensi (multi-session).

**Architecture:** Modifikasi skema database Drizzle dengan menambahkan relasi `screening_session_id` ke tabel `chat_sessions`. Ubah logika status agar langsung aktif (`active`) ketika chat dimulai, dan ubah halaman chat pasien serta konselor agar tetap mengaktifkan input pesan meskipun status sesi sudah selesai (`completed`).

**Tech Stack:** Next.js 16 (App Router), Drizzle ORM, PostgreSQL (Supabase), Supabase Realtime (WebSockets)

## Global Constraints

- Lakukan verifikasi tipe data menggunakan `npx tsc --noEmit` di direktori `mhfa-web` setelah setiap task selesai.
- Pertahankan semua penamaan variabel dan struktur modular yang sudah ada.
- Gunakan skema database PostgreSQL lama dengan mengupdate skema Drizzle dan melakukan `push` via Drizzle Kit.

---

### Task 1: Modifikasi Skema Database & Migrasi

**Files:**
- Modify: `mhfa-web/src/db/schema.ts:135-155`

**Interfaces:**
- Produces: Kolom baru `screeningSessionId` pada tabel `chatSessions`.

- [ ] **Step 1: Tambahkan kolom screeningSessionId di schema.ts**

Buka `mhfa-web/src/db/schema.ts` dan tambahkan kolom relasi `screeningSessionId` ke `chatSessions`.

```typescript
export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  counselorId: text("counselor_id").references(() => user.id),
  // Tambahkan relasi ke sesi skrining
  screeningSessionId: text("screening_session_id").references(() => screeningSessions.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // curhat | first_aid
  status: text("status").default("waiting").notNull(), // waiting | active | completed
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});
```

- [ ] **Step 2: Jalankan migrasi skema database**

Jalankan command Drizzle Kit push untuk mengupdate skema di database.
Run: `npx drizzle-kit push` di direktori `mhfa-web`
Expected output: Sukses melakukan push perubahan skema database tanpa ada error.

- [ ] **Step 3: Verifikasi tipe data**

Run: `npx tsc --noEmit` di direktori `mhfa-web`
Expected: PASS (tidak ada error kompilasi TypeScript)

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.ts
git commit -m "db: add screeningSessionId column to chatSessions table"
```

---

### Task 2: Update API Routes (Backend)

**Files:**
- Modify: `mhfa-web/src/app/api/chat/session/start/route.ts`
- Modify: `mhfa-web/src/app/api/chat/session/active/route.ts`
- Modify: `mhfa-web/src/app/api/konselor/dashboard/route.ts`
- Modify: `mhfa-web/src/app/api/konselor/session/accept/route.ts`

**Interfaces:**
- Consumes: `screeningSessionId` dari query string atau request body.
- Produces: Chat session baru dengan status `"active"` secara langsung.

- [ ] **Step 1: Update API Start Session (`/api/chat/session/start`)**

Buka `mhfa-web/src/app/api/chat/session/start/route.ts` dan ubah isi method `POST` agar menyimpan `screeningSessionId`, memeriksa kecocokan sesi chat lama dengan `screeningSessionId`, serta menginisiasi status ke `"active"` secara default.

```typescript
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { screeningId, type } = await request.json(); // screeningId di sini adalah ID dari screening_sessions
    if (!screeningId || !type) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Periksa jika ada sesi yang sudah berjalan dengan screeningSessionId ini
    const existing = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.screeningSessionId, screeningId)
    });
    if (existing) {
      return NextResponse.json({ success: true, session: existing });
    }

    // Insert sesi chat baru dengan status 'active' (langsung aktif)
    const newSessionId = randomUUID();
    await db.insert(chatSessions).values({
      id: newSessionId,
      patientId: session.user.id,
      screeningSessionId: screeningId,
      type,
      status: "active",
      startedAt: new Date()
    });

    const newSession = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, newSessionId)
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Update API Active Session (`/api/chat/session/active`)**

Buka `mhfa-web/src/app/api/chat/session/active/route.ts` dan ubah isinya agar mendukung pengecekan berbasis `screeningSessionId` jika disediakan.

```typescript
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const screeningSessionId = searchParams.get("screeningSessionId");

    let currentSession = null;
    let hasCompleted = false;

    if (screeningSessionId) {
      const chatSess = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.screeningSessionId, screeningSessionId)
      });
      if (chatSess) {
        if (chatSess.status === "active") {
          currentSession = chatSess;
        } else if (chatSess.status === "completed") {
          hasCompleted = true;
        }
      }
    } else {
      // Fallback
      const chatSess = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.patientId, session.user.id),
          inArray(chatSessions.status, ["waiting", "active"])
        ),
        orderBy: [desc(chatSessions.startedAt)]
      });
      currentSession = chatSess || null;

      const completedSession = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.patientId, session.user.id),
          eq(chatSessions.status, "completed")
        )
      });
      hasCompleted = !!completedSession;
    }

    return NextResponse.json({
      session: currentSession || null,
      hasCompleted
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Update API Dashboard Konselor (`/api/konselor/dashboard`)**

Buka `mhfa-web/src/app/api/konselor/dashboard/route.ts` dan ubah baris 20-24 untuk mengambil antrean masuk (queue) dari chat aktif yang belum diassign konselor (`counselorId` is null). Import `isNull` dari `drizzle-orm` di baris 5.

```typescript
// Tambahkan isNull di baris import
import { eq, and, desc, sql, isNull } from "drizzle-orm";

// Ganti query queueList (baris 21-24) dengan:
    const queueList = await db.query.chatSessions.findMany({
      where: and(
        eq(chatSessions.status, "active"),
        isNull(chatSessions.counselorId)
      ),
      orderBy: [desc(chatSessions.startedAt)]
    });
```

- [ ] **Step 4: Update API Terima Sesi (`/api/konselor/session/accept`)**

Buka `mhfa-web/src/app/api/konselor/session/accept/route.ts` dan sesuaikan kriteria pencarian status agar memfilter chat berstatus `"active"` dengan `counselorId` bernilai `null`. Import `isNull` dari `drizzle-orm`.

```typescript
// Tambahkan isNull di import
import { eq, and, isNull } from "drizzle-orm";

// Ubah query update (baris 25-35) dengan:
    const result = await db.update(chatSessions)
      .set({
        counselorId: session.user.id,
        startedAt: new Date() // Tandai waktu mulai konseling
      })
      .where(and(
        eq(chatSessions.id, sessionId),
        eq(chatSessions.status, "active"),
        isNull(chatSessions.counselorId)
      ))
      .returning();
```

- [ ] **Step 5: Verifikasi tipe data**

Run: `npx tsc --noEmit` di direktori `mhfa-web`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/api/chat/session/start/route.ts src/app/api/chat/session/active/route.ts src/app/api/konselor/dashboard/route.ts src/app/api/konselor/session/accept/route.ts
git commit -m "api: refactor chat APIs for instant-active sessions and direct dashboard assignment"
```

---

### Task 3: Update Halaman Chat Pasien & Hub Intervensi

**Files:**
- Modify: `mhfa-web/src/app/intervention/[screeningId]/page.tsx:60-67`
- Modify: `mhfa-web/src/app/intervention/[screeningId]/chat/page.tsx`

- [ ] **Step 1: Kirim screeningSessionId ke API Active Session di Hub Page**

Buka `mhfa-web/src/app/intervention/[screeningId]/page.tsx` dan ubah fetch di baris 63 untuk mengirimkan `screeningSessionId` via query param:

```typescript
        // 2. Fetch Chat Session Active Status
        const resChat = await fetch(`/api/chat/session/active?screeningSessionId=${screeningId}`);
        const dataChat = await resChat.json();
```

- [ ] **Step 2: Update Inisialisasi Chat Pasien**

Buka `mhfa-web/src/app/intervention/[screeningId]/chat/page.tsx` dan perbarui query fetch active session (baris 51) agar juga mengirimkan `screeningSessionId`:

```typescript
        // Cek jika ada sesi aktif
        const activeRes = await fetch(`/api/chat/session/active?screeningSessionId=${screeningId}`);
        const activeData = await activeRes.json();
```

- [ ] **Step 3: Perbaiki Realtime Subscription di Sisi Pasien**

Ubah batasan status untuk realtime channel di sisi pasien (baris 120-121) agar tetap aktif saat status `"completed"` sehingga pesan susulan tetap dikirim/diterima secara realtime.

```typescript
  // Supabase Realtime Channel subscription
  useEffect(() => {
    if (!sessionId || (status !== "active" && status !== "completed")) return;
```

- [ ] **Step 4: Hapus Logika Idle Timer**

Hapus seluruh `useEffect` untuk `Idle Timer` di baris 158-180 (mulai dari `const idleTimeoutRef = useRef<any>(null);` sampai `}, [status]);`) karena timer ini tidak diperlukan lagi. Hapus juga pemanggilan `resetIdleTimer()` di `handleSendMessage`, `handleInputChange`.

- [ ] **Step 5: Ganti Modal / Halaman Selesai Chat**

Ubah render kondisional `if (status === "completed")` di baris 321-345 agar dihapus/diabaikan, sehingga pasien tetap melihat chat window meskipun statusnya selesai.

Sebaliknya, ubah elemen tombol di header chat (baris 370-375) agar merender tombol **"Kembali"** jika sudah selesai, dan tombol **"Selesai Curhat & Lanjut"** jika masih aktif:

```typescript
        {status === "completed" ? (
          <Link
            href={`/intervention/${screeningId}`}
            className="px-4 py-1.5 border border-outline text-on-surface-variant hover:bg-surface-container rounded-full text-xs font-semibold transition-all active:scale-[0.98]"
          >
            Kembali ke Hub
          </Link>
        ) : (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="px-4 py-1.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-full text-xs font-semibold transition-all active:scale-[0.98]"
          >
            Selesai Curhat & Lanjut
          </button>
        )}
```

Tambahkan info banner di atas daftar chat jika `status === "completed"`. Di baris 380, tambahkan kode ini di atas list message:

```typescript
          {status === "completed" && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center text-xs text-primary font-semibold">
              Sesi curhat telah diselesaikan. Anda tetap dapat mengirim pesan tambahan.
            </div>
          )}
```

Perbarui logika disabled pada input pesan (baris 440-446) agar tidak terkunci saat `"completed"`, melainkan hanya terkunci saat `"loading"`:

```typescript
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Tulis pesan Anda..."
            className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || status === "loading"}
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container disabled:bg-surface-container-high disabled:text-outline transition-all shrink-0 active:scale-95"
          >
```

- [ ] **Step 6: Update Logika handleEndSession Pasien**

Ubah method `handleEndSession` agar mengalihkan pasien ke hub intervensi secara langsung setelah status diubah di DB:

```typescript
  const handleEndSession = async () => {
    if (!sessionId) return;
    try {
      await fetch("/api/chat/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "status_changed",
          payload: { status: "completed" }
        });
      }
      setStatus("completed");
      router.push(`/intervention/${screeningId}`);
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };
```

- [ ] **Step 7: Verifikasi tipe data**

Run: `npx tsc --noEmit` di direktori `mhfa-web`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/app/intervention/[screeningId]/page.tsx src/app/intervention/[screeningId]/chat/page.tsx
git commit -m "feat: redesign patient chat flow with direct access, persistent history, and manual end button"
```

---

### Task 4: Update Halaman Chat Konselor

**Files:**
- Modify: `mhfa-web/src/app/konselor/chat/[sessionId]/page.tsx`

- [ ] **Step 1: Perbaiki Realtime Subscription Konselor**

Buka `mhfa-web/src/app/konselor/chat/[sessionId]/page.tsx` dan ubah baris 114 agar tetap melakukan sinkronisasi WebSocket pada status `"completed"`:

```typescript
  // Realtime subscription
  useEffect(() => {
    if (!sessionId || (status !== "active" && status !== "completed")) return;
```

- [ ] **Step 2: Aktifkan Input Konselor saat Sesi Selesai**

Perbarui form input chat di footer konselor (baris 382-400) agar tidak dinonaktifkan ketika sesi berstatus `"completed"`.

```typescript
        {/* Chat Console Input */}
        <footer className="p-4 border-t border-outline-variant bg-surface-container-lowest shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Tulis pesan konseling..."
              className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              disabled={status === "loading"}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || status === "loading"}
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container disabled:bg-surface-container-high disabled:text-outline transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-lg filled">send</span>
            </button>
          </form>
        </footer>
```

- [ ] **Step 3: Tambahkan Banner Info Selesai di Chat Konselor**

Di baris 324, tambahkan banner informasi jika statusnya sudah selesai (di atas chat list):

```typescript
          {status === "completed" && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center text-xs text-primary font-semibold">
              Sesi curhat telah diselesaikan oleh pasien. Anda tetap dapat membalas chat ini untuk memberikan tindak lanjut.
            </div>
          )}
```

- [ ] **Step 4: Verifikasi tipe data**

Run: `npx tsc --noEmit` di direktori `mhfa-web`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/konselor/chat/[sessionId]/page.tsx
git commit -m "feat: allow counselor to view and send messages in completed chat sessions"
```
