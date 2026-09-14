import { syncTikTokAnalytics } from "../src/lib/integrations/metricool/sync.ts";
import { prisma } from "../src/lib/prisma.ts";

async function runTest() {
  console.log("==================================================");
  console.log("TEST 3: DUPLICATE PREVENTION ON SYNC");
  console.log("==================================================");

  // 1. Get initial count of performance metrics
  const countBefore = await prisma.performanceMetric.count();
  console.log(`[INFO] Current performance metric rows in DB: ${countBefore}`);

  // 2. First Sync Run
  console.log("Executing First Sync Run...");
  const run1 = await syncTikTokAnalytics({ lookbackDays: 30 });
  const countAfterRun1 = await prisma.performanceMetric.count();
  console.log(`[PASS] Run 1 result: Created=${run1.createdCount}, Updated=${run1.updatedCount}. DB Count=${countAfterRun1}`);

  // 3. Second Sync Run with identical source data
  console.log("Executing Second Sync Run (Idempotency / Duplicate Check)...");
  const run2 = await syncTikTokAnalytics({ lookbackDays: 30 });
  const countAfterRun2 = await prisma.performanceMetric.count();
  console.log(`[PASS] Run 2 result: Created=${run2.createdCount}, Updated=${run2.updatedCount}. DB Count=${countAfterRun2}`);

  // 4. Strict Validation: Run 2 must NOT create duplicates!
  if (run2.createdCount > 0) {
    throw new Error(`Duplicate prevention FAILED: Run 2 created ${run2.createdCount} new rows instead of updating existing!`);
  }

  if (countAfterRun1 !== countAfterRun2) {
    throw new Error(`Row count changed between sync runs: ${countAfterRun1} -> ${countAfterRun2}. Duplicate rows were inserted!`);
  }

  console.log(`[PASS] Verified strict duplicate prevention: Total DB rows remained exactly ${countAfterRun2}, Run 2 correctly updated ${run2.updatedCount} rows.`);

  console.log("==================================================");
  console.log("TEST 3 RESULT: DUPLICATE PREVENTION VERIFIED PASS!");
  console.log("==================================================");
}

runTest().catch((err) => {
  console.error("TEST 3 FAILED:", err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
