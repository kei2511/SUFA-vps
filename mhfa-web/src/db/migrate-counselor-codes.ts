import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

function generateCounselorCode(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `KSL-${randomSuffix}`;
}

async function main() {
  const { db } = await import("./index");
  const { sql } = await import("drizzle-orm");

  console.log("=== MIGRATING COUNSELOR CODES & COLUMNS IN DATABASE ===");

  try {
    // 1. Ensure columns exist
    console.log("1. Adding columns if not exist...");
    await db.execute(sql`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS counselor_code TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS assigned_counselor_id TEXT REFERENCES "user"(id);
    `);
    console.log("Columns added successfully.");

    // 2. Fetch all counselor users
    console.log("2. Generating simple KSL-[NUMBER] counselor_code for all Counselors...");
    const counselors = await db.execute(sql`
      SELECT id, name, counselor_code FROM "user" WHERE role = 'Konselor'
    `);

    const rows = (counselors as any).rows || counselors;
    for (const counselor of rows) {
      // Force update to clean KSL-XXXX format if it has old multi-segment pattern or is missing
      if (!counselor.counselor_code || counselor.counselor_code.split("-").length > 2) {
        const code = generateCounselorCode();
        await db.execute(sql`
          UPDATE "user" SET counselor_code = ${code} WHERE id = ${counselor.id}
        `);
        console.log(`- Assigned ${code} to counselor "${counselor.name}" (${counselor.id})`);
      } else {
        console.log(`- Counselor "${counselor.name}" already has code: ${counselor.counselor_code}`);
      }
    }

    console.log("=== MIGRATION COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    process.exit(0);
  }
}

main();
