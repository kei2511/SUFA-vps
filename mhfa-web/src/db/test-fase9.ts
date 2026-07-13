import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { user, inviteCodes, questionnaires, questions, options, resultMappings, screeningSessions, screeningAnswers, guides, contacts } from "./schema";
import { sql } from "drizzle-orm";

async function runTests() {
  console.log("=== MEMULAI PENGUJIAN DATABASE FASE 9 ===");
  try {
    const { db } = await import("./index");
    // 1. Cek Koneksi & Hitung Data
    console.log("\n1. Mengecek koneksi dan menghitung jumlah baris data...");
    
    const userCount = await db.select({ count: sql`count(*)` }).from(user);
    console.log(`- Jumlah User: ${userCount[0]?.count || 0}`);

    const inviteCount = await db.select({ count: sql`count(*)` }).from(inviteCodes);
    console.log(`- Jumlah Invite Codes: ${inviteCount[0]?.count || 0}`);

    const questCount = await db.select({ count: sql`count(*)` }).from(questionnaires);
    console.log(`- Jumlah Kuesioner: ${questCount[0]?.count || 0}`);

    const questionCount = await db.select({ count: sql`count(*)` }).from(questions);
    console.log(`- Jumlah Pertanyaan: ${questionCount[0]?.count || 0}`);

    const optionCount = await db.select({ count: sql`count(*)` }).from(options);
    console.log(`- Jumlah Opsi Jawaban: ${optionCount[0]?.count || 0}`);

    const resultMappingCount = await db.select({ count: sql`count(*)` }).from(resultMappings);
    console.log(`- Jumlah Pemetaan Hasil: ${resultMappingCount[0]?.count || 0}`);

    const sessionCount = await db.select({ count: sql`count(*)` }).from(screeningSessions);
    console.log(`- Jumlah Sesi Skrining: ${sessionCount[0]?.count || 0}`);

    const answerCount = await db.select({ count: sql`count(*)` }).from(screeningAnswers);
    console.log(`- Jumlah Jawaban Skrining: ${answerCount[0]?.count || 0}`);

    const guideCount = await db.select({ count: sql`count(*)` }).from(guides);
    console.log(`- Jumlah Panduan Edukasi: ${guideCount[0]?.count || 0}`);

    const contactCount = await db.select({ count: sql`count(*)` }).from(contacts);
    console.log(`- Jumlah Kontak Referensi: ${contactCount[0]?.count || 0}`);

    console.log("\nKoneksi berhasil dan pembacaan data sukses!");

    // 2. Simulasi CRUD Kontak Referensi (Fase 9C)
    console.log("\n2. Menguji CRUD Kontak Referensi...");
    const testContactId = `c-test-${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert
    await db.insert(contacts).values({
      id: testContactId,
      name: "Psikolog Uji Coba",
      institution: "Pusat Tes SUFA",
      specialization: "Kecemasan & Stres",
      phone: "+62 800-0000-0000",
      schedule: "09:00 - 12:00",
      scheduleDays: "Senin - Selasa",
      type: "whatsapp",
      status: "Tersedia",
    });
    console.log("-> INSERT Kontak Sukses");

    // Select
    const selectContact = await db.query.contacts.findFirst({
      where: (contacts, { eq }) => eq(contacts.id, testContactId)
    });
    console.log(`-> SELECT Kontak Sukses: ${selectContact?.name} (${selectContact?.specialization})`);

    // Update
    await db.update(contacts)
      .set({ specialization: "Klinis Dewasa" })
      .where(sql`id = ${testContactId}`);
    
    const selectUpdatedContact = await db.query.contacts.findFirst({
      where: (contacts, { eq }) => eq(contacts.id, testContactId)
    });
    console.log(`-> UPDATE Kontak Sukses: Spesialisasi diperbarui ke "${selectUpdatedContact?.specialization}"`);

    // Delete
    await db.delete(contacts).where(sql`id = ${testContactId}`);
    const selectDeletedContact = await db.query.contacts.findFirst({
      where: (contacts, { eq }) => eq(contacts.id, testContactId)
    });
    if (!selectDeletedContact) {
      console.log("-> DELETE Kontak Sukses (Kontak tidak ditemukan lagi)");
    } else {
      throw new Error("Gagal menghapus kontak");
    }

    // 3. Simulasi CRUD Kode Undangan (Fase 9C)
    console.log("\n3. Menguji CRUD Kode Undangan...");
    const testCode = `TEST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const testCodeId = `ic-test-${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert
    await db.insert(inviteCodes).values({
      id: testCodeId,
      code: testCode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 hari
      status: "Belum Digunakan",
    });
    console.log(`-> INSERT Kode Undangan Sukses: ${testCode}`);

    // Update status
    await db.update(inviteCodes)
      .set({ status: "Digunakan" })
      .where(sql`id = ${testCodeId}`);
    
    const updatedCode = await db.query.inviteCodes.findFirst({
      where: (inviteCodes, { eq }) => eq(inviteCodes.id, testCodeId)
    });
    console.log(`-> UPDATE Kode Undangan Sukses: Status saat ini "${updatedCode?.status}"`);

    // Delete
    await db.delete(inviteCodes).where(sql`id = ${testCodeId}`);
    console.log("-> DELETE Kode Undangan Sukses");

    // 4. Simulasi Pembacaan Kuesioner (Fase 9A)
    console.log("\n4. Menguji Pembacaan Kuesioner & Relasi...");
    const allQuestionnaires = await db.query.questionnaires.findMany({
      with: {
        questions: {
          with: {
            options: true
          }
        }
      }
    });
    console.log(`-> Ditemukan ${allQuestionnaires.length} Kuesioner di Database.`);
    if (allQuestionnaires.length > 0) {
      const firstQ = allQuestionnaires[0];
      console.log(`   Kuesioner Pertama: "${firstQ.title}" dengan status "${firstQ.status}"`);
      console.log(`   Jumlah pertanyaan di dalamnya: ${firstQ.questions.length}`);
      if (firstQ.questions.length > 0) {
        const firstQuest = firstQ.questions[0];
        console.log(`   Pertanyaan 1: "${firstQuest.text}"`);
        console.log(`   Opsi jawaban tersedia: ${firstQuest.options.map(o => `${o.text} (Skor: ${o.score})`).join(", ")}`);
      }
    }

    console.log("\n=== SEMUA PENGUJIAN DATABASE FASE 9 SELESAI DENGAN SUKSES! ===");
  } catch (error: any) {
    console.error("\nPENGUJIAN GAGAL DENGAN ERROR:");
    console.error(error);
    process.exit(1);
  }
}

runTests();
