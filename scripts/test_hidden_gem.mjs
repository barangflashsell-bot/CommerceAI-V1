import assert from "node:assert";

async function runHiddenGemTest() {
  console.log("\n=======================================================");
  console.log("TEST 3: HIDDEN GEM DETECTION ENGINE (SCENARIO E)");
  console.log("=======================================================\n");

  const { evaluateProductStatus } = await import(
    "../src/lib/ai/engine/product-status.ts"
  );

  // Scenario E: Low views (e.g. 7,500 views), High CTR (4.0%), High CVR (3.3%), Good RPM
  // views: 7,500, clicks: 300, orders: 10, revenue: 350,000 (RPM: 46,667 IDR)
  const candidateHiddenGem = {
    productId: "gem-1",
    productName: "Serum Niacinamide Travel Size",
    views: 7500,
    clicks: 300,
    orders: 10,
    revenue: 350000,
    sampleCount: 5,
  };

  const decisionGem = evaluateProductStatus(candidateHiddenGem);
  console.log("Candidate Hidden Gem Decision:");
  console.log({
    productName: decisionGem.productName,
    views: decisionGem.metrics.views,
    ctr: `${(decisionGem.metrics.ctr * 100).toFixed(1)}%`,
    cvr: `${(decisionGem.metrics.cvr * 100).toFixed(1)}%`,
    rpm: `Rp ${decisionGem.metrics.rpm.toLocaleString("id-ID")}`,
    isHiddenGem: decisionGem.isHiddenGem,
    hiddenGemReason: decisionGem.hiddenGemReason,
  });

  assert.strictEqual(decisionGem.isHiddenGem, true, "Product with low views and high CVR/CTR must be flagged as HIDDEN GEM");
  assert.ok(decisionGem.hiddenGemReason, "Hidden Gem must include descriptive reasoning");
  assert.ok(decisionGem.hiddenGemReason.includes("HIDDEN GEM"), "Reason text must explain Hidden Gem status");
  console.log("✔ Hidden Gem successfully detected and reasoned.");

  // Contrasting Test: Mass view product (100,000 views) with moderate CVR (0.8%)
  const massViewProduct = {
    productId: "mass-1",
    productName: "Viral Gadget Sachet",
    views: 100000,
    clicks: 4000,
    orders: 32,
    revenue: 800000,
    sampleCount: 8,
  };

  const decisionMass = evaluateProductStatus(massViewProduct);
  assert.strictEqual(decisionMass.isHiddenGem, false, "Mass view product must NOT be flagged as HIDDEN GEM");
  console.log("✔ Mass view product correctly excluded from Hidden Gem.");

  console.log("\n>>> TEST 3 PASS: HIDDEN GEM DETECTION VALIDATED <<<\n");
}

runHiddenGemTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
