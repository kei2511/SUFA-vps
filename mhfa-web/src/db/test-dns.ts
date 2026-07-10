import dns from "dns";

dns.resolve4("aws-1-ap-southeast-1.pooler.supabase.com", (err, addresses) => {
  if (err) console.error("IPv4 error:", err);
  else console.log("IPv4 addresses:", addresses);
});

dns.resolve6("aws-1-ap-southeast-1.pooler.supabase.com", (err, addresses) => {
  if (err) console.error("IPv6 error:", err);
  else console.log("IPv6 addresses:", addresses);
});
