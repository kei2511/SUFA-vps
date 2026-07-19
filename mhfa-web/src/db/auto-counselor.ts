import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

async function main() {
  const { db } = await import("./index");
  const { chatSessions, chatMessages, user } = await import("./schema");
  const { eq } = await import("drizzle-orm");

  console.log("=== AUTO COUNSELOR STARTING ===");

  // Find counselor user
  const counselor = await db.query.user.findFirst({
    where: eq(user.email, "konselor@email.com")
  });
  if (!counselor) {
    console.error("Counselor user not found!");
    process.exit(1);
  }
  const counselorId = counselor.id;
  console.log("Counselor ID found:", counselorId);

  // Poll loop
  while (true) {
    try {
      // 1. Find waiting sessions
      const waitingSessions = await db.select().from(chatSessions).where(eq(chatSessions.status, "waiting"));
      for (const sess of waitingSessions) {
        console.log(`Accepting waiting session: ${sess.id}`);
        
        // Update session to active and assign counselor
        await db.update(chatSessions)
          .set({ status: "active", counselorId: counselorId })
          .where(eq(chatSessions.id, sess.id));

        // Insert first message
        const now = new Date();
        await db.insert(chatMessages).values({
          id: `msg-${Date.now()}-1`,
          sessionId: sess.id,
          senderId: counselorId,
          text: "Halo! Saya Konselor SUFA. Ada yang bisa saya bantu hari ini?",
          createdAt: now
        });
        console.log(`Accepted and sent intro message for session: ${sess.id}`);
      }

      // 2. Find active sessions to auto-reply or auto-complete
      const activeSessions = await db.select().from(chatSessions).where(eq(chatSessions.status, "active"));
      for (const sess of activeSessions) {
        // Find messages in this session
        const messages = await db.select().from(chatMessages)
          .where(eq(chatMessages.sessionId, sess.id))
          .orderBy(chatMessages.createdAt);

        const patientMessages = messages.filter(m => m.senderId !== counselorId);
        const counselorMessages = messages.filter(m => m.senderId === counselorId);

        // If patient has sent a message that hasn't been replied to yet
        if (patientMessages.length > counselorMessages.length - 1) {
          // Wait 2 seconds before replying (simulate typing)
          await new Promise(r => setTimeout(r, 2000));
          console.log(`Replying to patient in session: ${sess.id}`);
          
          let replyText = "Terima kasih telah berbagi. Saya di sini untuk mendengarkan dan mendukung Anda.";
          if (counselorMessages.length === 1) {
            replyText = "Saya memahami kekhawatiran Anda. Silakan ikuti langkah-langkah di panduan intervensi (Langkah 2) setelah sesi ini untuk strategi coping yang lebih mendalam.";
          } else if (counselorMessages.length === 2) {
            replyText = "Baik, saya akan menyelesaikan sesi obrolan kita saat ini agar Anda bisa langsung mencoba panduan coping di dashboard Anda. Tetap sehat dan semangat!";
          }

          const now = new Date();
          await db.insert(chatMessages).values({
            id: `msg-${Date.now()}-${counselorMessages.length + 1}`,
            sessionId: sess.id,
            senderId: counselorId,
            text: replyText,
            createdAt: now
          });

          // If this was our 3rd counselor message, complete the session after 3 seconds
          if (counselorMessages.length === 2) {
            await new Promise(r => setTimeout(r, 3000));
            console.log(`Completing session: ${sess.id}`);
            await db.update(chatSessions)
              .set({ status: "completed", endedAt: new Date() })
              .where(eq(chatSessions.id, sess.id));
          }
        }
      }
    } catch (err) {
      console.error("Error in auto-counselor loop:", err);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

main().catch(console.error);
