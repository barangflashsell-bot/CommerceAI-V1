import assert from "node:assert";

async function runStatusEngineTest() {
  console.log("\n=======================================================");
  console.log("TEST 2: KILL / OPTIMIZE / SCALE ENGINE (5 SCENARIOS)");
  console.log("=======================================================\n");

  const { evaluateProductStatus, calculateRevenuePer1000Views } = await import(
    "../src/lib/ai/engine/product-status.ts"
  );

  // 1. Test RPM metric calculation
  const rpm1 = calculateRevenuePer1000Views(500000, 25000); // 500,000 / 25,000 * 1000 = 20,000
  assert.strictEqual(rpm1, 20000, "RPM must equal 20,000 IDR");
  const rpmZeroViews = calculateRevenuePer1000Views(100000, 0);
  assert.strictEqual(rpmZeroViews, 0, "RPM with 0 views must be 0");
  console.log("✔ Affiliate RPM metric (RevenuePer1000Views) verified.");

  // SCENARIO 0: DISCOVERED (0 records)
  const res0 = evaluateProductStatus({
    productId: "prod-0",
    productName: "Produk Baru",
    views: 0,
    clicks: 0,
    orders: 0,
    revenue: 0,
    sampleCount: 0,
  });
  console.log("\nScenario 0 (0 Records):", res0.status, "->", res0.recommendation);
  assert.strictEqual(res0.status, "DISCOVERED");
  assert.strictEqual(res0.recommendation, "TEST THIS PRODUCT");
  assert.strictEqual(res0.dataSource, "AI ESTIMATE");

  // SCENARIO GUARDRAIL: INSUFFICIENT DATA (< 5 records)
  const resGuard = evaluateProductStatus({
    productId: "prod-guard",
    productName: "Produk 2 Video",
    views: 2000,
    clicks: 120,
    orders: 8,
    revenue: 160000,
    sampleCount: 2, // Less than 5!
  });
  console.log("Scenario Guardrail (2 Records):", resGuard.status, "->", resGuard.recommendation);
  assert.strictEqual(resGuard.status, "TESTING");
  assert.strictEqual(resGuard.recommendation, "TEST THIS PRODUCT");
  assert.ok(resGuard.reasoning.includes("ambang batas reliabilitas minimum adalah 5 video"));
  console.log("✔ Phase 3 Data sufficiency guardrail (< 5 records -> TESTING) successfully guarded.");

  // SCENARIO A: High CTR + High CVR + High Orders -> SCALE
  // e.g. views: 20,000, clicks: 800 (CTR = 4.0%), orders: 24 (CVR = 3.0%), revenue: 1,200,000
  const resA = evaluateProductStatus({
    productId: "prod-a",
    productName: "Product A Winning",
    views: 20000,
    clicks: 800,
    orders: 24,
    revenue: 1200000,
    sampleCount: 8, // Sufficient sample
  });
  console.log("\nScenario A (High CTR + High CVR + High Orders):");
  console.log(`Status: ${resA.status}, Recommendation: ${resA.recommendation}, SubFocus: ${resA.subFocus}`);
  console.log(`Reasoning: ${resA.reasoning}`);
  assert.strictEqual(resA.status, "SCALE");
  assert.strictEqual(resA.recommendation, "SCALE THIS PRODUCT");
  assert.strictEqual(resA.subFocus, "MAINTAIN WINNING FORMULA");
  console.log("✔ Scenario A PASS: Correctly classified as SCALE.");

  // SCENARIO B: High CTR + Low CVR -> OPTIMIZE (Purchase Intent)
  // e.g. views: 30,000, clicks: 1200 (CTR = 4.0%), orders: 10 (CVR = 0.83%)
  const resB = evaluateProductStatus({
    productId: "prod-b",
    productName: "Product B High Click Low Buy",
    views: 30000,
    clicks: 1200,
    orders: 10,
    revenue: 300000,
    sampleCount: 7,
  });
  console.log("\nScenario B (High CTR + Low CVR):");
  console.log(`Status: ${resB.status}, Recommendation: ${resB.recommendation}, SubFocus: ${resB.subFocus}`);
  console.log(`Reasoning: ${resB.reasoning}`);
  assert.strictEqual(resB.status, "OPTIMIZE");
  assert.strictEqual(resB.recommendation, "OPTIMIZE CONTENT");
  assert.strictEqual(resB.subFocus, "OPTIMIZE PURCHASE INTENT");
  console.log("✔ Scenario B PASS: Correctly classified as OPTIMIZE (Purchase Intent).");

  // SCENARIO C: Low CTR + High CVR -> OPTIMIZE (Hook / Distribution)
  // e.g. views: 25,000, clicks: 300 (CTR = 1.2%), orders: 12 (CVR = 4.0%)
  const resC = evaluateProductStatus({
    productId: "prod-c",
    productName: "Product C Low Click High Buy",
    views: 25000,
    clicks: 300,
    orders: 12,
    revenue: 450000,
    sampleCount: 6,
  });
  console.log("\nScenario C (Low CTR + High CVR):");
  console.log(`Status: ${resC.status}, Recommendation: ${resC.recommendation}, SubFocus: ${resC.subFocus}`);
  console.log(`Reasoning: ${resC.reasoning}`);
  assert.strictEqual(resC.status, "OPTIMIZE");
  assert.strictEqual(resC.recommendation, "OPTIMIZE CONTENT");
  assert.strictEqual(resC.subFocus, "OPTIMIZE HOOK / DISTRIBUTION");
  console.log("✔ Scenario C PASS: Correctly classified as OPTIMIZE (Hook / Distribution).");

  // SCENARIO D: Low CTR + Low CVR + Sufficient Sample -> KILL
  // e.g. views: 18,000, clicks: 180 (CTR = 1.0%), orders: 1 (CVR = 0.55%) after 6 videos
  const resD = evaluateProductStatus({
    productId: "prod-d",
    productName: "Product D Bad Performer",
    views: 18000,
    clicks: 180,
    orders: 1,
    revenue: 35000,
    sampleCount: 6,
  });
  console.log("\nScenario D (Low CTR + Low CVR + Sufficient Sample):");
  console.log(`Status: ${resD.status}, Recommendation: ${resD.recommendation}`);
  console.log(`Reasoning: ${resD.reasoning}`);
  assert.strictEqual(resD.status, "KILL");
  assert.strictEqual(resD.recommendation, "KILL THIS PRODUCT");
  console.log("✔ Scenario D PASS: Correctly classified as KILL.");

  console.log("\n>>> TEST 2 PASS: ALL STATUS TRANSITIONS VALIDATED <<<\n");
}

runStatusEngineTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
