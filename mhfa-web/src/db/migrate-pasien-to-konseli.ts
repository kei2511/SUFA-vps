import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

async function main() {
  const { db } = await import("./index");
  const { sql } = await import("drizzle-orm");

  console.log("=== MIGRATING ROLE 'Pasien' TO 'Konseli' IN DATABASE ===");

  try {
    const result = await db.execute(sql`UPDATE "user" SET role = 'Konseli' WHERE role = 'Pasien'`);
    console.log("Migration executed successfully:", result);
  } catch (error) {
    console.error("Error migrating roles:", error);
  } finally {
    process.exit(0);
  }
}

main();
