import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  try {
    const { db } = await import("./index");
    const { chatSessions } = await import("./schema");

    console.log("Listing all chat sessions:");
    const allChatSessions = await db.select().from(chatSessions);
    console.log(allChatSessions);

    process.exit(0);
  } catch (err) {
    console.error("Failed to list chat sessions:", err);
    process.exit(1);
  }
}

main();
