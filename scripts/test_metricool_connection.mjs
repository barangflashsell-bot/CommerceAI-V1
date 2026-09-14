import { metricoolClient } from "../src/lib/integrations/metricool/client.ts";

async function runTest() {
  console.log("==================================================");
  console.log("TEST 1: METRICOOL CONNECTION & ACCOUNT RESOLUTION");
  console.log("==================================================");

  // 1. Verify Target Account
  const target = metricoolClient.getTargetAccount();
  console.log(`[PASS] Target account configured: "${target}"`);
  if (target !== "onesecond.id3") {
    throw new Error(`Target account mismatch: expected "onesecond.id3", got "${target}"`);
  }

  // 2. Test Connection Status
  const status = await metricoolClient.getConnectionStatus();
  console.log("[PASS] Connection status retrieved:", {
    accountName: status.accountName,
    role: status.role,
    statusLabel: status.statusLabel,
    isMock: status.isMock,
  });

  if (status.accountName !== "onesecond.id3") {
    throw new Error(`Expected accountName "onesecond.id3", got "${status.accountName}"`);
  }
  if (status.role !== "ANALYTICS + PUBLISH") {
    throw new Error(`Expected role "ANALYTICS + PUBLISH", got "${status.role}"`);
  }

  // 3. Test getBrands
  const brands = await metricoolClient.getBrands();
  console.log(`[PASS] Retrieved ${brands.length} brand(s) from Metricool client`);
  if (!Array.isArray(brands) || brands.length === 0) {
    throw new Error("getBrands() should return at least one brand");
  }

  const mainBrand = brands[0];
  console.log(`[PASS] Primary Brand: ID="${mainBrand.id}", Name="${mainBrand.name}"`);

  // 4. Test Best Time to Post
  const bestTimes = await metricoolClient.getBestTimeToPost();
  console.log(`[PASS] Best time to post slots retrieved: ${bestTimes.length} slot(s)`);
  if (!Array.isArray(bestTimes) || bestTimes.length === 0) {
    throw new Error("getBestTimeToPost() should return time recommendations");
  }

  const peak = bestTimes.find((b) => b.isPeak);
  if (peak) {
    console.log(`[PASS] Prime peak identified: ${peak.hour}:00 WIB, score=${peak.score} [${peak.recommendedLabel}]`);
  }

  console.log("==================================================");
  console.log("TEST 1 RESULT: ALL METRICOOL CONNECTION CHECKS PASSED!");
  console.log("==================================================");
}

runTest().catch((err) => {
  console.error("TEST 1 FAILED:", err);
  process.exit(1);
});
