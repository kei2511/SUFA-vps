import dns from "dns";

dns.lookup("aws-1-ap-southeast-1.pooler.supabase.com", (err, address, family) => {
  if (err) console.error("Lookup error:", err);
  else console.log(`Lookup successful! Address: ${address}, Family: IPv${family}`);
});
