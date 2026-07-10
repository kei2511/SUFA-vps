import net from "net";

const targets = [
  { host: "aws-1-ap-southeast-1.pooler.supabase.com", port: 5432 },
  { host: "aws-1-ap-southeast-1.pooler.supabase.com", port: 6543 },
  { host: "db.mqjgejhhtrrcykgeqzho.supabase.co", port: 5432 },
  { host: "db.mqjgejhhtrrcykgeqzho.supabase.co", port: 6543 }
];

async function check(host: string, port: number) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    socket.on("connect", () => {
      console.log(`Successfully connected to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });
    socket.on("error", (err) => {
      console.log(`Failed to connect to ${host}:${port} - Error: ${err.message}`);
      socket.destroy();
      resolve(false);
    });
    socket.on("timeout", () => {
      console.log(`Timeout connecting to ${host}:${port}`);
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  for (const t of targets) {
    await check(t.host, t.port);
  }
}

main();
