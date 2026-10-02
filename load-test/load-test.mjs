// Dedicated Load Testing Script for SUFA Web on VPS
// Tests 50 concurrent virtual users

const TARGET_BASE = process.env.TARGET_URL || "http://43.173.9.179:3000";
const CONCURRENCY = 50;
const TOTAL_REQUESTS = 500;

const ENDPOINTS = [
  { name: "Page: /login", path: "/login" },
  { name: "Page: /", path: "/" },
  { name: "API: /api/screening/active", path: "/api/screening/active" },
];

async function runBenchmarkForEndpoint(endpoint) {
  const url = `${TARGET_BASE}${endpoint.path}`;
  console.log(`\n======================================================`);
  console.log(`🚀 Benchmarking: ${endpoint.name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Concurrency: ${CONCURRENCY} workers | Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`======================================================`);

  const latencies = [];
  let successCount = 0;
  let errorCount = 0;
  let completedCount = 0;

  const startTime = Date.now();

  async function worker() {
    while (completedCount < TOTAL_REQUESTS) {
      completedCount++;
      const reqStart = performance.now();
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "SUFA-LoadTest-Agent/1.0",
          },
        });
        const reqEnd = performance.now();
        const duration = reqEnd - reqStart;
        latencies.push(duration);

        if (res.status >= 200 && res.status < 400) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        const reqEnd = performance.now();
        latencies.push(reqEnd - reqStart);
        errorCount++;
      }
    }
  }

  // Launch CONCURRENCY workers in parallel
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalTimeSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (latencies.length / totalTimeSec).toFixed(1);

  console.log(`\n📊 RESULTS for ${endpoint.name}:`);
  console.table({
    "Total Requests": latencies.length,
    "Successful (2xx/3xx)": successCount,
    "Errors (4xx/5xx/Fail)": errorCount,
    "Duration (sec)": `${totalTimeSec.toFixed(2)} s`,
    "Throughput (RPS)": `${rps} req/sec`,
    "Min Latency": `${min.toFixed(1)} ms`,
    "Avg Latency": `${avg.toFixed(1)} ms`,
    "Median (p50)": `${p50.toFixed(1)} ms`,
    "p90 Latency": `${p90.toFixed(1)} ms`,
    "p95 Latency": `${p95.toFixed(1)} ms`,
    "p99 Latency": `${p99.toFixed(1)} ms`,
    "Max Latency": `${max.toFixed(1)} ms`,
  });

  return {
    endpoint: endpoint.name,
    rps,
    avg: avg.toFixed(1),
    p95: p95.toFixed(1),
    successRate: `${((successCount / latencies.length) * 100).toFixed(1)}%`,
  };
}

async function main() {
  console.log("⚡ Starting SUFA VPS Performance & Load Testing");
  console.log(`📍 Target: ${TARGET_BASE}`);
  console.log(`👥 Concurrent Virtual Users: ${CONCURRENCY}`);

  const summary = [];
  for (const ep of ENDPOINTS) {
    const res = await runBenchmarkForEndpoint(ep);
    summary.push(res);
  }

  console.log("\n=======================================================");
  console.log("🏁 OVERALL LOAD TEST SUMMARY (50 Concurrent Users)");
  console.log("=======================================================");
  console.table(summary);
}

main().catch(console.error);
