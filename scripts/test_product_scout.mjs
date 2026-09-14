import assert from "node:assert";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runScoutTest() {
  console.log("\n=======================================================");
  console.log("TEST 1: PRODUCT SCOUTING ENGINE (7 DIMENSIONS & MATH)");
  console.log("=======================================================\n");

  // Dynamic import of TS module through standard import
  const { calculateScoutDimensions, calculateWeightedScoutScore, determineScoutCategory, evaluateProductScout } =
    await import("../src/lib/ai/engine/scout-score.ts");

  const productHigh = {
    name: "Mini Chopper Elektrik Portable USB",
    category: "Kitchen & Home",
    price: 69000,
    commissionRate: 18,
    description: "Cincang bawang, cabai, dan daging dalam 5 detik tanpa pedih di mata. Pisau tajam otomatis USB rechargeable.",
    targetBuyer: "Ibu rumah tangga dan anak kos yang mau masak cepat",
    productUrl: "https://shopee.co.id/mini-chopper-elektrik",
  };

  // 1. Calculate 7 dimensions
  const dimensions = calculateScoutDimensions(productHigh);
  console.log("Dimension breakdown for High Opportunity Product:");
  console.log(dimensions);

  assert.ok(typeof dimensions.demandPotential === "number", "Demand potential must be number");
  assert.ok(typeof dimensions.contentPotential === "number", "Content potential must be number");
  assert.ok(typeof dimensions.purchaseIntent === "number", "Purchase intent must be number");
  assert.ok(typeof dimensions.commissionAttractiveness === "number", "Commission attractiveness must be number");
  assert.ok(typeof dimensions.competitionRisk === "number", "Competition risk must be number");
  assert.ok(typeof dimensions.problemStrength === "number", "Problem strength must be number");
  assert.ok(typeof dimensions.demonstrationStrength === "number", "Demonstration strength must be number");

  // 2. Test Determinism (Non-random requirement)
  const dimensionsRun2 = calculateScoutDimensions(productHigh);
  assert.deepStrictEqual(dimensions, dimensionsRun2, "Scout calculation MUST be 100% deterministic, no Math.random!");
  console.log("✔ Deterministic check passed: identical results across repeated runs.");

  // 3. Test Weighted Formula
  const score = calculateWeightedScoutScore(dimensions);
  console.log(`Calculated Weighted Score: ${score}/100`);
  assert.ok(score >= 0 && score <= 100, "Score must be within 0-100 range");

  // 4. Test Category Assignment
  assert.strictEqual(determineScoutCategory(85), "HIGH OPPORTUNITY");
  assert.strictEqual(determineScoutCategory(72), "TEST");
  assert.strictEqual(determineScoutCategory(58), "LOW SIGNAL");
  assert.strictEqual(determineScoutCategory(42), "AVOID");
  console.log("✔ Category assignment passed (HIGH OPPORTUNITY, TEST, LOW SIGNAL, AVOID).");

  // 5. Test Full Evaluator
  const scoutResult = evaluateProductScout(productHigh);
  assert.ok(scoutResult.score > 75, "Expected high score for low price, high commission utility product");
  assert.strictEqual(scoutResult.dataSource, "AI ESTIMATE", "Pre-launch scout must be AI ESTIMATE");
  assert.ok(scoutResult.bestAngles.length >= 3, "Must produce at least 3 angles");
  assert.ok(scoutResult.testingPlan.videoCount === 10, "Testing plan must recommend 10 videos");
  assert.strictEqual(scoutResult.testingPlan.thresholdType, "AI TESTING THRESHOLD");
  console.log("✔ Full evaluation payload verified.");

  // 6. Test SQLite persistence for ScoutAnalysis and TestingPlan
  console.log("\nTesting SQLite persistence with Prisma...");
  const created = await prisma.product.create({
    data: {
      name: productHigh.name,
      link: productHigh.productUrl,
      category: productHigh.category,
      price: productHigh.price,
      commissionRate: productHigh.commissionRate,
      targetAudience: productHigh.targetBuyer,
      description: productHigh.description,
      advantages: "Hemat waktu, portable",
      problemSolved: "Pedih saat cincang bumbu",
      opportunityScore: scoutResult.score,
      status: "DISCOVERED",
      scoutAnalysis: {
        create: {
          score: scoutResult.score,
          category: scoutResult.category,
          breakdown: JSON.stringify(scoutResult.breakdown),
          why: scoutResult.why,
          risks: JSON.stringify(scoutResult.risks),
          bestAngles: JSON.stringify(scoutResult.bestAngles),
          testingPlan: JSON.stringify(scoutResult.testingPlan),
          expectedGoal: scoutResult.expectedGoal,
          dataSource: "AI ESTIMATE",
        },
      },
      testingPlan: {
        create: {
          testDays: scoutResult.testingPlan.testDays,
          videoCount: scoutResult.testingPlan.videoCount,
          angles: JSON.stringify(scoutResult.testingPlan.angles),
          hooks: JSON.stringify(scoutResult.testingPlan.hooks),
          platforms: JSON.stringify(scoutResult.testingPlan.platforms),
          successCriteria: JSON.stringify(scoutResult.testingPlan.successCriteria),
          thresholdType: "AI TESTING THRESHOLD",
        },
      },
    },
    include: {
      scoutAnalysis: true,
      testingPlan: true,
    },
  });

  assert.ok(created.id, "Product must be created with valid ID");
  assert.ok(created.scoutAnalysis, "ScoutAnalysis must be linked");
  assert.ok(created.testingPlan, "TestingPlan must be linked");
  console.log(`✔ Successfully created product "${created.name}" in SQLite (ID: ${created.id}) with linked ScoutAnalysis and TestingPlan.`);

  // Cleanup test product
  await prisma.product.delete({ where: { id: created.id } });
  console.log("✔ Cleaned up test product.");

  console.log("\n>>> TEST 1 PASS: PRODUCT SCOUTING ENGINE FULLY FUNCTIONAL <<<\n");
}

runScoutTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
