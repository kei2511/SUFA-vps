import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

async function main() {
  const { db } = await import("./index");
  const { user } = await import("./schema");
  const { auth } = await import("../lib/auth");
  const { sql } = await import("drizzle-orm");

  console.log("=== RESETTING AND SEEDING DEMO USERS ===");

  const targetEmails = [
    "pasien@email.com",
    "konselor@email.com",
    "admin@email.com",
    "pasien.test@mhfa.go.id",
    "konselor@mhfa.go.id",
    "admin@mhfa.go.id"
  ];

  try {
    console.log("Cleaning up foreign key references...");

    // Update invite_codes referencing users to delete
    await db.execute(sql`
      UPDATE invite_codes 
      SET used_by_user_id = NULL, status = 'Belum Digunakan'
      WHERE used_by_user_id IN (
        SELECT id FROM "user" WHERE email IN (${sql.join(targetEmails.map(email => sql`${email}`), sql`, `)})
      )
    `);
    console.log("- Cleared invite_codes references");

    // Delete chat_messages referencing users to delete
    await db.execute(sql`
      DELETE FROM chat_messages 
      WHERE sender_id IN (
        SELECT id FROM "user" WHERE email IN (${sql.join(targetEmails.map(email => sql`${email}`), sql`, `)})
      )
    `);
    console.log("- Deleted chat_messages references");

    // Delete counselor_notes referencing users to delete
    await db.execute(sql`
      DELETE FROM counselor_notes 
      WHERE counselor_id IN (
        SELECT id FROM "user" WHERE email IN (${sql.join(targetEmails.map(email => sql`${email}`), sql`, `)})
      )
    `);
    console.log("- Deleted counselor_notes references");

    // Delete chat_sessions referencing users to delete
    await db.execute(sql`
      DELETE FROM chat_sessions 
      WHERE patient_id IN (
        SELECT id FROM "user" WHERE email IN (${sql.join(targetEmails.map(email => sql`${email}`), sql`, `)})
      ) OR counselor_id IN (
        SELECT id FROM "user" WHERE email IN (${sql.join(targetEmails.map(email => sql`${email}`), sql`, `)})
      )
    `);
    console.log("- Deleted chat_sessions references");

    // Delete screening_sessions referencing users to delete
    await db.execute(sql`
      DELETE FROM screening_sessions 
      WHERE user_id IN (
        SELECT id FROM "user" WHERE email IN (${sql.join(targetEmails.map(email => sql`${email}`), sql`, `)})
      )
    `);
    console.log("- Deleted screening_sessions references");

    // Delete users
    console.log("Deleting existing test users from database...");
    for (const email of targetEmails) {
      await db.execute(sql`DELETE FROM "user" WHERE email = ${email}`);
    }
    console.log("Existing users deleted.");

    // Create new users via Better Auth API
    console.log("Creating new users with password 'password123'...");

    // 1. Patient: pasien@email.com / pasien.test@mhfa.go.id
    await auth.api.signUpEmail({
      body: {
        email: "pasien@email.com",
        password: "password123",
        name: "Pasien Test",
        role: "Pasien",
        status: "Aktif",
        phone: "+6281234567890",
        dob: "1995-05-15",
      }
    } as any);
    console.log("- Created pasien@email.com");

    await auth.api.signUpEmail({
      body: {
        email: "pasien.test@mhfa.go.id",
        password: "password123",
        name: "Pasien Test MHFA",
        role: "Pasien",
        status: "Aktif",
        phone: "+6281234567890",
        dob: "1995-05-15",
      }
    } as any);
    console.log("- Created pasien.test@mhfa.go.id");

    // 2. Counselor: konselor@email.com / konselor@mhfa.go.id
    await auth.api.signUpEmail({
      body: {
        email: "konselor@email.com",
        password: "password123",
        name: "Konselor MHFA",
        role: "Konselor",
        status: "Aktif",
        phone: "+6281234567891",
        dob: "1988-08-18",
      }
    } as any);
    console.log("- Created konselor@email.com");

    await auth.api.signUpEmail({
      body: {
        email: "konselor@mhfa.go.id",
        password: "password123",
        name: "Konselor Utama",
        role: "Konselor",
        status: "Aktif",
        phone: "+6281234567891",
        dob: "1988-08-18",
      }
    } as any);
    console.log("- Created konselor@mhfa.go.id");

    // 3. Admin: admin@email.com / admin@mhfa.go.id
    await auth.api.signUpEmail({
      body: {
        email: "admin@email.com",
        password: "password123",
        name: "Super Admin",
        role: "Admin",
        status: "Aktif",
        phone: "+6281234567892",
        dob: "1985-01-01",
      }
    } as any);
    console.log("- Created admin@email.com");

    await auth.api.signUpEmail({
      body: {
        email: "admin@mhfa.go.id",
        password: "password123",
        name: "Super Admin MHFA",
        role: "Admin",
        status: "Aktif",
        phone: "+6281234567892",
        dob: "1985-01-01",
      }
    } as any);
    console.log("- Created admin@mhfa.go.id");

    // Update their roles to be correct in user table since signUpEmail defaults to "Pasien"
    console.log("Updating roles in 'user' table...");
    await db.execute(sql`UPDATE "user" SET role = 'Konselor' WHERE email IN ('konselor@email.com', 'konselor@mhfa.go.id')`);
    await db.execute(sql`UPDATE "user" SET role = 'Admin' WHERE email IN ('admin@email.com', 'admin@mhfa.go.id')`);
    console.log("- Roles updated successfully!");

    console.log("=== RESET COMPLETED SUCCESSFULLY ===");
  } catch (error: any) {
    console.error("Error during reset:", error);
  } finally {
    process.exit(0);
  }
}

main();
