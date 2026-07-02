import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import postgres from "postgres";

async function test() {
  const url1 = "postgresql://postgres.mqjgejhhtrrcykgeqzho:keisyariq25@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";
  const client = postgres(url1, { ssl: "require", connect_timeout: 5 });
  try {
    console.log("Querying users...");
    const users = await client`SELECT id, name, email, role, status FROM "user"`;
    console.log("Users in DB:", users);
  } catch (e: any) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}

test();
