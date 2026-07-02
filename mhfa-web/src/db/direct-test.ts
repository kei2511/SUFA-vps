import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import postgres from "postgres";

async function main() {
  const directUrl = "postgresql://postgres.mqjgejhhtrrcykgeqzho:keisyariq25@db.mqjgejhhtrrcykgeqzho.supabase.co:5432/postgres";
  console.log("Mencoba koneksi langsung ke port 5432...");
  const client = postgres(directUrl, { ssl: "require" });
  try {
    const res = await client`SELECT NOW()`;
    console.log("Koneksi Langsung Sukses! Waktu DB:", res[0].now);
  } catch (err) {
    console.error("Koneksi Langsung Gagal:", err);
  } finally {
    await client.end();
  }
}

main();
