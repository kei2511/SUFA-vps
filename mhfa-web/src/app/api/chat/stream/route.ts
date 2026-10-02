import { chatEmitter } from "@/lib/chat-events";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(": connected\n\n"));

      const onMessage = (payload: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: message\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // Stream might be closed
        }
      };

      const onTyping = (payload: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: typing\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {}
      };

      const onStatus = (payload: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: status_changed\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {}
      };

      chatEmitter.on(`message:${sessionId}`, onMessage);
      chatEmitter.on(`typing:${sessionId}`, onTyping);
      chatEmitter.on(`status:${sessionId}`, onStatus);

      // Keep-alive heartbeat every 15s
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        chatEmitter.off(`message:${sessionId}`, onMessage);
        chatEmitter.off(`typing:${sessionId}`, onTyping);
        chatEmitter.off(`status:${sessionId}`, onStatus);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
