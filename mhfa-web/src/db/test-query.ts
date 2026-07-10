import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";

async function main() {
  try {
    const { db } = await import("./index");
    const { chatSessions } = await import("./schema");
    console.log("Querying database with DATABASE_URL:", process.env.DATABASE_URL);
    const existing = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.screeningSessionId, "1")
    });
    console.log("Query successful! Result:", existing);
    process.exit(0);
  } catch (err) {
    console.error("Query failed:", err);
    process.exit(1);
  }
}

main();
