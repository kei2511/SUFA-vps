# Rencana Implementasi Chat Realtime & Notifikasi Live (Fase 10)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengaktifkan komunikasi real-time antara pasien dan konselor menggunakan Supabase Realtime broadcast channels, serta mengimplementasikan log notifikasi live dan penyimpanan catatan konseling.

**Architecture:** Frontend Next.js client-side page rendering yang terintegrasi dengan database Supabase via API Routes (Next.js server-side) dan langganan real-time (Supabase Realtime) di sisi client untuk pesan chat, indikator mengetik, status antrean, dan notifikasi.

**Tech Stack:** Next.js, Better Auth, Drizzle ORM, Supabase JS Client.

## Global Constraints
* Wajib mobile-friendly (mobile-first layout).
* Gunakan token warna "Serene Trust" (surface-container-lowest, primary, on-surface, dll.).
* Gunakan ikon Google Material Symbols Outlined (`material-symbols-outlined`).
* Hindari penyebutan Kemenkes/Kementerian Kesehatan. Gunakan "Layanan Kesehatan Jiwa MHFA".

---

### Task 1: Migrasi Skema Tabel Notifications

**Files:**
- Modify: `mhfa-web/src/db/schema.ts`

**Interfaces:**
- Produces: Tabel `notifications` baru di PostgreSQL.

- [ ] **Step 1: Modifikasi `mhfa-web/src/db/schema.ts` untuk menambahkan tabel `notifications`**

Tambahkan kode ini ke bagian bawah berkas sebelum relations atau di bagian tabel business logic:
```typescript
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default("notice").notNull(), // chat | assignment | event | notice
  sender: text("sender").default("Sistem MHFA").notNull(),
  isUnread: boolean("is_unread").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Lakukan sinkronisasi skema ke database**

Jalankan perintah berikut di folder `mhfa-web`:
Run: `npx drizzle-kit push`
Expected: Output menampilkan modifikasi tabel `notifications` berhasil dibuat di database remote Supabase.

- [ ] **Step 3: Jalankan pemeriksaan compile aplikasi**

Run: `npm run build`
Expected: Build sukses tanpa error kompilasi.

- [ ] **Step 4: Commit perubahan**

```bash
git add src/db/schema.ts
git commit -m "feat: add notifications table schema and migrate"
```

---

### Task 2: Pembuatan API Routes untuk Chat, Antrean, dan Catatan Konselor

**Files:**
- Create: `mhfa-web/src/app/api/chat/session/active/route.ts`
- Create: `mhfa-web/src/app/api/chat/session/start/route.ts`
- Create: `mhfa-web/src/app/api/chat/session/status/route.ts`
- Create: `mhfa-web/src/app/api/chat/session/end/route.ts`
- Create: `mhfa-web/src/app/api/chat/messages/route.ts`
- Create: `mhfa-web/src/app/api/chat/counselor/notes/route.ts`

**Interfaces:**
- Produces: API endpoints `/api/chat/*` untuk mengelola state chat dan data presensi sesi.

- [ ] **Step 1: Buat endpoint GET `/api/chat/session/active` untuk memeriksa sesi aktif pasien**

Buat berkas `mhfa-web/src/app/api/chat/session/active/route.ts`:
```typescript
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, or, inArray, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentSession = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.patientId, session.user.id),
        inArray(chatSessions.status, ["waiting", "active"])
      ),
      orderBy: [desc(chatSessions.startedAt)]
    });
    return NextResponse.json({ session: currentSession || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Buat endpoint POST `/api/chat/session/start` untuk inisiasi antrean chat pasien**

Buat berkas `mhfa-web/src/app/api/chat/session/start/route.ts`:
```typescript
import { db } from "@/db";
import { chatSessions, screeningSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray } from "drizzle-orm";
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
    const { screeningId, type } = await request.json(); // type: "curhat" | "first_aid"
    if (!screeningId || !type) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Periksa jika ada sesi yang sudah berjalan/menunggu
    const existing = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.patientId, session.user.id),
        inArray(chatSessions.status, ["waiting", "active"])
      )
    });
    if (existing) {
      return NextResponse.json({ success: true, session: existing });
    }

    // Insert sesi chat baru dengan status waiting
    const newSessionId = randomUUID();
    await db.insert(chatSessions).values({
      id: newSessionId,
      patientId: session.user.id,
      type,
      status: "waiting",
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

- [ ] **Step 3: Buat endpoint GET `/api/chat/session/status` untuk posisi antrean**

Buat berkas `mhfa-web/src/app/api/chat/session/status/route.ts`:
```typescript
import { db } from "@/db";
import { chatSessions, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, asc } from "drizzle-orm";
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
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const currentSession = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, sessionId)
    });
    if (!currentSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Hitung posisi antrean jika status waiting
    let queuePosition = 0;
    if (currentSession.status === "waiting") {
      const waitingList = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.status, "waiting"))
        .orderBy(asc(chatSessions.startedAt));
      
      const idx = waitingList.findIndex(s => s.id === sessionId);
      queuePosition = idx !== -1 ? idx + 1 : 1;
    }

    let counselorName = null;
    if (currentSession.counselorId) {
      const counselor = await db.query.user.findFirst({
        where: eq(user.id, currentSession.counselorId)
      });
      counselorName = counselor?.name || "Konselor MHFA";
    }

    return NextResponse.json({
      status: currentSession.status,
      queuePosition,
      counselorName,
      session: currentSession
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Buat endpoint POST `/api/chat/session/end` untuk menutup sesi**

Buat berkas `mhfa-web/src/app/api/chat/session/end/route.ts`:
```typescript
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    await db.update(chatSessions)
      .set({
        status: "completed",
        endedAt: new Date()
      })
      .where(eq(chatSessions.id, sessionId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 5: Buat endpoint GET/POST `/api/chat/messages` untuk list & kirim pesan**

Buat berkas `mhfa-web/src/app/api/chat/messages/route.ts`:
```typescript
import { db } from "@/db";
import { chatMessages, chatSessions, user, notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET messages
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.sessionId, sessionId),
      orderBy: [asc(chatMessages.createdAt)]
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST message
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { sessionId, text } = await request.json();
    if (!sessionId || !text) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const messageId = randomUUID();
    await db.insert(chatMessages).values({
      id: messageId,
      sessionId,
      senderId: session.user.id,
      text,
      createdAt: new Date()
    });

    // Cari receiver untuk dikirimkan notifikasi di DB
    const chatSess = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, sessionId)
    });

    if (chatSess) {
      const receiverId = session.user.role === "Pasien" ? chatSess.counselorId : chatSess.patientId;
      if (receiverId) {
        // Insert notification
        await db.insert(notifications).values({
          id: randomUUID(),
          userId: receiverId,
          title: session.user.role === "Pasien" ? "Pesan baru dari Pasien" : `Pesan baru dari ${session.user.name}`,
          content: text.length > 60 ? text.substring(0, 60) + "..." : text,
          type: "chat",
          sender: session.user.name,
          isUnread: true,
          createdAt: new Date()
        });
      }
    }

    const savedMsg = await db.query.chatMessages.findFirst({
      where: eq(chatMessages.id, messageId)
    });

    return NextResponse.json({ success: true, message: savedMsg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 6: Buat endpoint POST `/api/chat/counselor/notes` untuk menyimpan catatan internal**

Buat berkas `mhfa-web/src/app/api/chat/counselor/notes/route.ts`:
```typescript
import { db } from "@/db";
import { counselorNotes } from "@/db/schema";
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
    if (!session || !session.user || session.user.role !== "Konselor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { sessionId, symptoms, assessment, recommendation } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const notePayload = JSON.stringify({ symptoms, assessment, recommendation });

    // Check if notes already exist for this session
    const existing = await db.query.counselorNotes.findFirst({
      where: eq(counselorNotes.sessionId, sessionId)
    });

    if (existing) {
      await db.update(counselorNotes)
        .set({ note: notePayload })
        .where(eq(counselorNotes.id, existing.id));
    } else {
      await db.insert(counselorNotes).values({
        id: randomUUID(),
        sessionId,
        counselorId: session.user.id,
        note: notePayload,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 7: Jalankan compile check untuk memverifikasi API routes baru**

Run: `npm run build`
Expected: build sukses tanpa error kompilasi.

- [ ] **Step 8: Commit perubahan**

```bash
git add src/app/api/chat
git commit -m "feat: implement chat session and message API endpoints"
```

---

### Task 3: Integrasi Chat Pasien (Realtime & Presensi)

**Files:**
- Modify: `mhfa-web/src/app/intervention/[screeningId]/chat/page.tsx`

**Interfaces:**
- Consumes: `/api/chat/session/active`, `/api/chat/session/start`, `/api/chat/session/status`, `/api/chat/messages`, `/api/chat/session/end`
- Consumes: Supabase Realtime (from `@/lib/supabase`)

- [ ] **Step 1: Modifikasi halaman `/intervention/[screeningId]/chat/page.tsx` untuk mengimplementasikan alur antrean dinamis dan Supabase Realtime**

Ganti seluruh isi file `mhfa-web/src/app/intervention/[screeningId]/chat/page.tsx` dengan kode baru yang terintegrasi Supabase Realtime & broadcast events (detail terlampir di rencana sebelumnya).

- [ ] **Step 2: Jalankan compile check untuk memverifikasi perubahan**

Run: `npm run build`
Expected: build sukses tanpa error kompilasi.

- [ ] **Step 3: Commit perubahan**

```bash
git add src/app/intervention/[screeningId]/chat/page.tsx
git commit -m "feat: integrate live chat and real-time queues for patient"
```

---

### Task 4: Integrasi Chat Konselor & Penyimpanan Catatan

**Files:**
- Modify: `mhfa-web/src/app/konselor/chat/[sessionId]/page.tsx`

**Interfaces:**
- Consumes: `/api/chat/messages`, `/api/chat/counselor/notes`, `/api/chat/session/end`, `/api/chat/session/status`
- Consumes: Supabase Realtime (from `@/lib/supabase`)

- [ ] **Step 1: Modifikasi halaman `/konselor/chat/[sessionId]/page.tsx` untuk mengimplementasikan Supabase Realtime, data dinamis pasien, dan form catatan internal**

Ganti seluruh isi file `mhfa-web/src/app/konselor/chat/[sessionId]/page.tsx` dengan kode baru yang terintegrasi Supabase Realtime & Form Internal (detail terlampir di rencana sebelumnya).

- [ ] **Step 2: Jalankan compile check untuk memverifikasi perubahan**

Run: `npm run build`
Expected: build sukses tanpa error kompilasi.

- [ ] **Step 3: Commit perubahan**

```bash
git add src/app/konselor/chat/[sessionId]/page.tsx
git commit -m "feat: integrate real-time counselor chat console and patient records"
```

---

### Task 5: Hub Intervensi SUFA Dinamis & Antrean Selesai

**Files:**
- Modify: `mhfa-web/src/app/intervention/[screeningId]/page.tsx`

**Interfaces:**
- Consumes: `/api/chat/session/active`

- [ ] **Step 1: Modifikasi `mhfa-web/src/app/intervention/[screeningId]/page.tsx` untuk mengambil status intervensi real-time dari database**

Modifikasi file agar status "Curhat (S+U)" terhubung ke database. Langkah "Panduan (F)" dan "Hubungi Profesional (A)" akan otomatis tidak terkunci (unlocked) hanya ketika status chat session adalah "completed" (selesai).

- [ ] **Step 2: Jalankan compile check untuk memverifikasi perubahan**

Run: `npm run build`
Expected: build sukses tanpa error kompilasi.

- [ ] **Step 3: Commit perubahan**

```bash
git add src/app/intervention/[screeningId]/page.tsx
git commit -m "feat: make SUFA Hub steps dynamically unlock based on chat session status"
```

---

### Task 6: Halaman Notifikasi Live & Penandaan Dibaca

**Files:**
- Create: `mhfa-web/src/app/api/notifications/route.ts`
- Modify: `mhfa-web/src/app/notifications/page.tsx`

**Interfaces:**
- Produces: API `/api/notifications` untuk interaksi data notifikasi.
- Produces: UI notifikasi dengan realtime refresh dan toggle dibaca.

- [ ] **Step 1: Buat API Route untuk notifikasi di `mhfa-web/src/app/api/notifications/route.ts`**

Implementasikan route GET (fetch all user notifications) dan POST (mark single read or mark all read).

- [ ] **Step 2: Modifikasi `mhfa-web/src/app/notifications/page.tsx` untuk memuat data live dari database**

Ubah state statis dari halaman notifications ke dynamic fetch dengan interval polling dan trigger POST request ke `/api/notifications` untuk menandai pesan sudah dibaca.

- [ ] **Step 3: Jalankan compile check untuk memverifikasi perubahan**

Run: `npm run build`
Expected: build sukses tanpa error kompilasi.

- [ ] **Step 4: Commit perubahan**

```bash
git add src/app/api/notifications/route.ts src/app/notifications/page.tsx
git commit -m "feat: implement notifications API and integrate dynamic notifications listing"
```
