import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { counselorNotes, chatSessions, user, chatMessages } from './schema';
import { desc } from 'drizzle-orm';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const connectionStrings = [
  "postgresql://postgres.mqjgejhhtrrcykgeqzho:keisyariq25@13.213.241.248:5432/postgres",
  process.env.DATABASE_URL!,
];

async function main() {
  let client;
  let db;
  for (const connStr of connectionStrings) {
    try {
      client = postgres(connStr, { prepare: false, ssl: 'require', connect_timeout: 5 });
      db = drizzle(client, { schema });
      await client`SELECT 1`;
      console.log(`✅ Connected via: ${connStr.includes('13.213') ? 'IP direct' : 'Domain'}`);
      break;
    } catch (e) {}
  }

  if (!db || !client) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  const allUsers = await db.select().from(user);
  const notes = await db
    .select({
      noteId: counselorNotes.id,
      noteText: counselorNotes.note,
      createdAt: counselorNotes.createdAt,
      sessionId: counselorNotes.sessionId,
      counselorId: counselorNotes.counselorId,
    })
    .from(counselorNotes)
    .orderBy(desc(counselorNotes.createdAt));

  const sessions = await db.select().from(chatSessions);
  const sessionMap = new Map(sessions.map(s => [s.id, s]));
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  const detailedNotes = notes.map((n, index) => {
    const sess = sessionMap.get(n.sessionId);
    const counselor = userMap.get(n.counselorId);
    const patient = sess ? userMap.get(sess.patientId) : null;
    return {
      no: index + 1,
      noteId: n.noteId,
      createdAt: n.createdAt,
      counselorName: counselor ? counselor.name : n.counselorId,
      counselorCode: counselor ? counselor.counselorCode : '-',
      patientName: patient ? patient.name : (sess ? sess.patientId : '-'),
      patientEmail: patient ? patient.email : '-',
      note: n.noteText,
      sessionType: sess ? sess.type : '-',
      sessionStatus: sess ? sess.status : '-',
      startedAt: sess ? sess.startedAt : null,
      endedAt: sess ? sess.endedAt : null,
    };
  });

  const report = {
    summary: {
      totalUsers: allUsers.length,
      totalChatSessions: sessions.length,
      totalCounselorNotes: notes.length,
      totalSessionsWithoutNotes: sessions.length - notes.length,
    },
    notes: detailedNotes,
    allUsersSummary: allUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      counselorCode: u.counselorCode,
      assignedCounselorId: u.assignedCounselorId
    }))
  };

  const outputPath = path.resolve(__dirname, 'counselor_notes_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`Report successfully written to ${outputPath}`);
  console.log(`SUMMARY: Total Users = ${allUsers.length}, Total Sessions = ${sessions.length}, Total Notes Saved = ${notes.length}`);

  await client.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Error executing script:", err);
  process.exit(1);
});
