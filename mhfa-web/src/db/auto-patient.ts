import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

async function main() {
  const { db } = await import("./index");
  const { chatSessions, chatMessages, user, screeningSessions, questionnaires } = await import("./schema");
  const { eq, and } = await import("drizzle-orm");

  console.log("=== AUTO PATIENT STARTING ===");

  // Find patient user
  const patient = await db.query.user.findFirst({
    where: eq(user.email, "pasien@email.com")
  });
  if (!patient) {
    console.error("Patient user not found!");
    process.exit(1);
  }
  const patientId = patient.id;
  console.log("Patient ID found:", patientId);

  // Find questionnaire
  const quest = await db.query.questionnaires.findFirst({
    where: eq(questionnaires.status, "Aktif")
  });
  if (!quest) {
    console.error("Active questionnaire not found!");
    process.exit(1);
  }
  const questionnaireId = quest.id;

  // Clean up any existing active/waiting chat sessions for this patient
  await db.update(chatSessions)
    .set({ status: "completed", endedAt: new Date() })
    .where(and(eq(chatSessions.patientId, patientId), eq(chatSessions.status, "waiting")));
  
  await db.update(chatSessions)
    .set({ status: "completed", endedAt: new Date() })
    .where(and(eq(chatSessions.patientId, patientId), eq(chatSessions.status, "active")));

  // Create a mock screening session if one doesn't exist
  let screenSession = await db.query.screeningSessions.findFirst({
    where: and(eq(screeningSessions.userId, patientId), eq(screeningSessions.status, "completed")),
    orderBy: screeningSessions.completedAt
  });

  if (!screenSession) {
    console.log("Creating new screening session for patient...");
    const screenSessionId = `screen-${Date.now()}`;
    await db.insert(screeningSessions).values({
      id: screenSessionId,
      userId: patientId,
      questionnaireId: questionnaireId,
      score: 15,
      conditionLabel: "Kecemasan Sedang",
      status: "completed",
      completedAt: new Date(),
      startedAt: new Date()
    });
    screenSession = { id: screenSessionId } as any;
  }

  // Create waiting chat session
  const sessionId = `chat-${Date.now()}`;
  await db.insert(chatSessions).values({
    id: sessionId,
    patientId: patientId,
    screeningSessionId: screenSession!.id,
    type: "curhat",
    status: "waiting",
    startedAt: new Date()
  });

  console.log(`Created waiting chat session: ${sessionId} for patient ${patient.name}`);

  // Loop to listen and reply to counselor
  let introSent = false;
  let replyCount = 0;

  while (true) {
    try {
      const sess = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, sessionId)
      });

      if (!sess) {
        console.error("Chat session vanished!");
        break;
      }

      if (sess.status === "completed") {
        console.log("Session completed by counselor. Exiting.");
        break;
      }

      if (sess.status === "active") {
        const messages = await db.select().from(chatMessages)
          .where(eq(chatMessages.sessionId, sessionId))
          .orderBy(chatMessages.createdAt);

        const patientMessages = messages.filter(m => m.senderId === patientId);
        const counselorMessages = messages.filter(m => m.senderId !== patientId);

        // Send patient intro if counselor has joined and patient hasn't said anything yet
        if (counselorMessages.length > 0 && !introSent) {
          await new Promise(r => setTimeout(r, 2000));
          console.log("Patient: Sending intro message");
          await db.insert(chatMessages).values({
            id: `msg-${Date.now()}-pat-1`,
            sessionId: sessionId,
            senderId: patientId,
            text: "Halo Konselor. Saya merasa sangat cemas akhir-akhir ini karena tekanan pekerjaan dan sulit tidur.",
            createdAt: new Date()
          });
          introSent = true;
        }

        // Reply to counselor if they send new messages
        if (counselorMessages.length > patientMessages.length) {
          await new Promise(r => setTimeout(r, 3500)); // simulate typing delay
          console.log("Patient: Replying to counselor");
          let replyText = "Saya sudah mencoba istirahat, tapi pikiran saya sulit tenang saat malam hari.";
          if (replyCount === 1) {
            replyText = "Baik, saya akan coba ikuti panduannya setelah sesi ini. Terima kasih banyak atas dukungannya.";
          }
          await db.insert(chatMessages).values({
            id: `msg-${Date.now()}-pat-${replyCount + 2}`,
            sessionId: sessionId,
            senderId: patientId,
            text: replyText,
            createdAt: new Date()
          });
          replyCount++;
        }
      }
    } catch (err) {
      console.error("Error in auto-patient loop:", err);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

main().catch(console.error);
