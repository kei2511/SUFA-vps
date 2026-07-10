import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  try {
    const { db } = await import("./index");
    const { screeningSessions, user } = await import("./schema");

    console.log("Listing all users:");
    const allUsers = await db.select().from(user);
    console.log(allUsers.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));

    console.log("\nListing all screening sessions:");
    const allSessions = await db.select().from(screeningSessions);
    console.log(allSessions);

    process.exit(0);
  } catch (err) {
    console.error("Failed to list sessions:", err);
    process.exit(1);
  }
}

main();
