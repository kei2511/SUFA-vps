# Design Specification: Permanent Async Chat System

## Overview
Transform the chat system from session-bound temporary chats into **Permanent Async Chat Rooms**. This allows counselees (*konseli*) to send messages at any time—even when their counselor is offline—and allows counselors to receive and respond to messages asynchronously (similar to WhatsApp / Line).

## Key Requirements & Behavior

1. **Permanent Room per Konseli-Counselor Pair:**
   - Every Konseli assigned to a counselor has 1 persistent `chatSession` in `active` status.
   - Konseli can open `/chat` at any time, view past messages, and send new messages without being blocked by counselor online status.

2. **Unassigned Konseli Onboarding Flow:**
   - Unassigned konseli can also send messages anytime.
   - Their session appears under **"Antrean Masuk"** in the dashboard of all active counselors.
   - When a counselor clicks **"Terima Sesi"**, the system:
     a) Sets `chatSessions.counselorId` to the accepting counselor.
     b) Sets `user.assignedCounselorId` to the accepting counselor, permanently pairing them for future chats.

3. **Status Indicator for Konseli:**
   - Header in the chat interface displays the counselor's current status:
     - 🟢 **Online**: Counselor is currently active.
     - ⚪ **Offline**: *"Konselor sedang offline. Pesan Anda akan dibalas saat konselor kembali bertugas."*

4. **Counselor Dashboard Integration:**
   - **Antrean Masuk**: Shows unassigned incoming messages.
   - **Sesi Aktif Anda**: Shows all ongoing permanent chat rooms for the counselor's assigned konseli.
   - **Daftar Pasien**: Shows all assigned konseli with direct access to open their chat.

## API & Database Layer Changes

1. **`POST /api/chat/session/start`**:
   - If an active session already exists for the user, return it.
   - Otherwise, create a new active session. If `user.assignedCounselorId` exists, populate `chatSessions.counselorId` automatically.

2. **`POST /api/konselor/session/accept`**:
   - Updates `chatSessions.counselorId` to the logged-in counselor.
   - Updates `user.assignedCounselorId` for the patient to ensure permanent pairing.

3. **`GET /api/konselor/dashboard`**:
   - Fetches unassigned sessions for `queue`.
   - Fetches all sessions assigned to the counselor for `activeSessions`.

4. **`GET /api/chat/session/status`**:
   - Returns session metadata, counselor details, and counselor availability status.
