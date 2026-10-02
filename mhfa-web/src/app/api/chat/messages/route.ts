import { db } from "@/db";
import { chatMessages, chatSessions, user, notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { chatEmitter } from "@/lib/chat-events";

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
      const receiverId = (session.user.role === "Pasien" || session.user.role === "Konseli") ? chatSess.counselorId : chatSess.patientId;
      if (receiverId) {
        // Insert notification
        await db.insert(notifications).values({
          id: randomUUID(),
          userId: receiverId,
          title: (session.user.role === "Pasien" || session.user.role === "Konseli") ? "Pesan baru dari Konseli" : `Pesan baru dari ${session.user.name}`,
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

    if (savedMsg) {
      chatEmitter.emit(`message:${sessionId}`, savedMsg);
    }

    return NextResponse.json({ success: true, message: savedMsg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
