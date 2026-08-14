import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

async function main() {
  const { db } = await import("./index");
  const { user } = await import("./schema");
  const { eq, isNull, or, and } = await import("drizzle-orm");
  const { ensureCounselorCode } = await import("../lib/counselor-utils");

  console.log("=== CHECKING AND FIXING MISSING COUNSELOR CODES ===");

  const counselors = await db.query.user.findMany({
    where: eq(user.role, "Konselor"),
  });

  console.log(`Found ${counselors.length} counselors in database.`);

  let updatedCount = 0;
  for (const c of counselors) {
    if (!c.counselorCode || !c.counselorCode.trim()) {
      const newCode = await ensureCounselorCode(c.id, c.counselorCode);
      console.log(`+ Generated code '${newCode}' for Counselor '${c.name}' (${c.email})`);
      updatedCount++;
    } else {
      console.log(`✔ Counselor '${c.name}' (${c.email}) already has code '${c.counselorCode}'`);
    }
  }

  console.log(`\n🎉 Finished! Updated ${updatedCount} counselors.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
