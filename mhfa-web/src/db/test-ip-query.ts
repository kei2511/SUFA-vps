import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chatSessions } from "./schema";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const ipConnectionString = "postgresql://postgres.mqjgejhhtrrcykgeqzho:keisyariq25@13.213.241.248:5432/postgres";

async function main() {
  try {
    console.log("Connecting directly to IP connection string...");
    const client = postgres(ipConnectionString, { prepare: false, ssl: "require" });
    const db = drizzle(client, { schema });
    console.log("Querying database...");
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
