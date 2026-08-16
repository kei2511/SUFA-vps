# Permanent Async Chat System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the chat system into a permanent, async messaging system (like WhatsApp) where counselees can send messages anytime and counselors handle unassigned and assigned chats asynchronously.

**Architecture:** Update session creation to re-use persistent active sessions per counselee, update session accept logic to assign `assignedCounselorId` on the user, and update counselor dashboard/chat status to display counselor online/offline status and unassigned queue correctly.

**Tech Stack:** Next.js 15 (App Router), Drizzle ORM, PostgreSQL, TypeScript, Tailwind CSS.

## Global Constraints
- Naming conventions: Use `assignedCounselorId` for linking user to counselor.
- Keep backward compatibility with existing `chatSessions` table structure.

---

### Task 1: Update Chat Session Start API for Persistent Active Session

**Files:**
- Modify: `src/app/api/chat/session/start/route.ts`

- [ ] **Step 1: Check existing active session logic and update to auto-link assigned counselor**

Update `src/app/api/chat/session/start/route.ts`:
```ts
import { db } from "@/db";
import { chatSessions, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, isNull } from "drizzle-orm";
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

    const patientId = session.user.id;
    let { screeningId, type } = await request.json();
    if (!type) type = "curhat";
    if (screeningId === "direct") screeningId = null;

    // Check if an active session already exists for this patient
    const existing = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.patientId, patientId),
        eq(chatSessions.status, "active")
      )
    });

    if (existing) {
      return NextResponse.json({ success: true, session: existing });
    }

    // Fetch patient db user to check if assigned to a counselor
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, patientId)
    });

    const newSessionId = randomUUID();
    await db.insert(chatSessions).values({
      id: newSessionId,
      patientId,
      counselorId: dbUser?.assignedCounselorId || null,
      screeningSessionId: screeningId || null,
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

- [ ] **Step 2: Commit Task 1 changes**

```bash
git add src/app/api/chat/session/start/route.ts
git commit -m "feat(chat): reuse active persistent session and auto-link assigned counselor"
```

---

### Task 2: Update Session Accept API to Persist Counselor Assignment

**Files:**
- Modify: `src/app/api/konselor/session/accept/route.ts`

- [ ] **Step 1: Update session accept endpoint to update `user.assignedCounselorId`**

Update `src/app/api/konselor/session/accept/route.ts`:
```ts
import { db } from "@/db";
import { chatSessions, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Konselor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const targetSession = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.id, sessionId),
        eq(chatSessions.status, "active"),
        isNull(chatSessions.counselorId)
      )
    });

    if (!targetSession) {
      return NextResponse.json({ error: "Sesi tidak ditemukan atau sudah diterima." }, { status: 404 });
    }

    const patientUser = await db.query.user.findFirst({
      where: eq(user.id, targetSession.patientId)
    });

    if (patientUser?.assignedCounselorId && patientUser.assignedCounselorId !== session.user.id) {
      return NextResponse.json({ error: "Sesi antrean ini khusus untuk konselor pendamping konseli tersebut." }, { status: 403 });
    }

    // Assign session to this counselor
    const result = await db.update(chatSessions)
      .set({
        counselorId: session.user.id,
        startedAt: new Date()
      })
      .where(and(
        eq(chatSessions.id, sessionId),
        eq(chatSessions.status, "active"),
        isNull(chatSessions.counselorId)
      ))
      .returning();

    // Permanently link patient to this counselor if unassigned
    if (!patientUser?.assignedCounselorId) {
      await db.update(user)
        .set({ assignedCounselorId: session.user.id })
        .where(eq(user.id, targetSession.patientId));
    }

    return NextResponse.json({ success: true, session: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit Task 2 changes**

```bash
git add src/app/api/konselor/session/accept/route.ts
git commit -m "feat(konselor): auto-assign user to counselor on accepting unassigned session"
```

---

### Task 3: Update Counselor Dashboard & Session Status APIs for Online/Offline and Permanent Sessions

**Files:**
- Modify: `src/app/api/konselor/dashboard/route.ts`
- Modify: `src/app/api/chat/session/status/route.ts`

- [ ] **Step 1: Update `/api/chat/session/status/route.ts` to return counselor status**

In `src/app/api/chat/session/status/route.ts`:
Ensure `counselorStatus` is returned so counselees know if their counselor is currently active or offline.

- [ ] **Step 2: Commit Task 3 changes**

```bash
git add src/app/api/konselor/dashboard/route.ts src/app/api/chat/session/status/route.ts
git commit -m "feat(chat): expose counselor availability status in session status endpoint"
```

---

### Task 4: Verify and Test End-to-End Chat Flow

- [ ] **Step 1: Build the app to verify no type or compilation errors**

Run: `npm run build`
Expected: Success with no errors.

- [ ] **Step 2: Commit Task 4 changes**

```bash
git add .
git commit -m "test: verify build and permanent chat implementation"
```
