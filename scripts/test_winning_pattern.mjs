import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function runWinningPatternAudit() {
  console.log("=== STARTING WINNING PATTERN ENGINE AUDIT ===");

  // Create two distinct test products for scenario A & B
  const prodA = await prisma.product.create({
    data: {
      name: "Scenario Product A (High CVR/Orders)",
      link: "https://shopee.co.id/prod-a",
      category: "Kesehatan",
      price: 150000,
      commissionRate: 15,
      targetAudience: "Dewasa",
      description: "Produk A dengan konversi tinggi",
      advantages: "Efektif",
      problemSolved: "Kelelahan",
      opportunityScore: 80,
    },
  });

  const prodB = await prisma.product.create({
    data: {
      name: "Scenario Product B (High CTR/Low CVR)",
      link: "https://shopee.co.id/prod-b",
      category: "Fashion",
      price: 150000,
      commissionRate: 15,
      targetAudience: "Remaja",
      description: "Produk B dengan CTR tinggi",
      advantages: "Trendy",
      problemSolved: "Outfit",
      opportunityScore: 75,
    },
  });

  console.log(`Created test products:`);
  console.log(`  Prod A ID: ${prodA.id}`);
  console.log(`  Prod B ID: ${prodB.id}\n`);

  // SCENARIO A:
  // Product A: CTR 4% (clicks: 400, views: 10000), Orders 100, Revenue 5,000,000
  // Product B: CTR 8% (clicks: 800, views: 10000), Orders 20, Revenue 1,000,000
  console.log("--- SCENARIO A: High CVR/Orders vs High CTR ---");
  const createdMetricIds = [];

  for (let i = 0; i < 4; i++) {
    const resA = await fetch(`${BASE_URL}/api/performance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: prodA.id,
        platform: "TikTok",
        views: "25000",
        clicks: "1000",
        orders: "25",
        commission: "1250000",
        angle: "Problem-Solution",
        hook: "Hook Solusi A",
      }),
    });
    const dataA = await resA.json();
    createdMetricIds.push(dataA.id);

    const resB = await fetch(`${BASE_URL}/api/performance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: prodB.id,
        platform: "TikTok",
        views: "12500",
        clicks: "1000",
        orders: "5",
        commission: "250000",
        angle: "Clickbait Aesthetic",
        hook: "Hook Viral B",
      }),
    });
    const dataB = await resB.json();
    createdMetricIds.push(dataB.id);
  }

  // Fetch insights and test directly on the aggregated products
  const resInsightsA = await fetch(`${BASE_URL}/api/insights`);
  const insightsA = await resInsightsA.json();

  // Test scenario A mathematically between Product A and Product B
  const metrics = await prisma.performanceMetric.findMany();
  const products = await prisma.product.findMany();
  const { calculateAggregatedMetrics } = await import("../src/lib/ai/engine/metrics.ts");
  const aggA = calculateAggregatedMetrics(metrics, products);

  const scoreA = aggA.products.find((p) => p.productId === prodA.id)?.performanceScore || 0;
  const scoreB = aggA.products.find((p) => p.productId === prodB.id)?.performanceScore || 0;

  console.log("Scenario A Evaluation:");
  console.log(`  Product A Score: ${scoreA} (Orders: 100, CTR: 4%, CVR: 2.5%)`);
  console.log(`  Product B Score: ${scoreB} (Orders: 20, CTR: 8%, CVR: 0.5%)`);

  if (scoreA <= scoreB) {
    throw new Error(`FAIL Scenario A: Expected Product A score (${scoreA}) > Product B score (${scoreB})`);
  }
  console.log(`PASS Scenario A: Product A (${scoreA}) defeated Product B (${scoreB}) despite Product B having 2x higher CTR (8% vs 4%)! Weighted scoring prioritizes CVR, Orders & Revenue!\n`);

  // SCENARIO B:
  // Add 10 high-performance records for Product B that overtakes Product A
  console.log("--- SCENARIO B: Dynamic Shift (Product B overtakes Product A with high orders) ---");
  for (let i = 0; i < 10; i++) {
    const resB2 = await fetch(`${BASE_URL}/api/performance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: prodB.id,
        platform: "TikTok",
        views: "50000",
        clicks: "4000",
        orders: "100",
        commission: "5000000",
        angle: "Breakthrough Angle B",
        hook: "Epic Hook B",
      }),
    });
    const dataB2 = await resB2.json();
    createdMetricIds.push(dataB2.id);
  }

  const metricsB = await prisma.performanceMetric.findMany();
  const aggB = calculateAggregatedMetrics(metricsB, products);
  const newScoreA = aggB.products.find((p) => p.productId === prodA.id)?.performanceScore || 0;
  const newScoreB = aggB.products.find((p) => p.productId === prodB.id)?.performanceScore || 0;

  console.log("Scenario B Evaluation:");
  console.log(`  Product A Score: ${newScoreA}`);
  console.log(`  Product B Score: ${newScoreB} (New Total Orders: 1020)`);

  if (newScoreB <= newScoreA) {
    throw new Error(`FAIL Scenario B: Expected Product B score (${newScoreB}) > Product A score (${newScoreA})`);
  }
  console.log("PASS Scenario B: Dynamic shift confirmed! Product B overtook Product A after new historical records were added.\n");

  // Cleanup scenario test records
  console.log("Cleaning up scenario test records...");
  for (const id of createdMetricIds) {
    await prisma.performanceMetric.delete({ where: { id } }).catch(() => {});
  }
  await prisma.product.delete({ where: { id: prodA.id } });
  await prisma.product.delete({ where: { id: prodB.id } });
  console.log("PASS: Scenario test records cleaned up.\n");

  // SCENARIO C:
  // Test Data Sufficiency when data is insufficient (< 5 records)
  console.log("--- SCENARIO C: Data Sufficiency Guardrail Test ---");
  const existingMetrics = await prisma.performanceMetric.findMany();
  await prisma.performanceMetric.deleteMany();

  // Create only 2 metrics
  const anyProduct = (await prisma.product.findMany())[0];
  await prisma.performanceMetric.create({
    data: {
      productId: anyProduct.id,
      platform: "TikTok",
      views: 1000,
      clicks: 50,
      orders: 2,
      commission: 20000,
    },
  });
  await prisma.performanceMetric.create({
    data: {
      productId: anyProduct.id,
      platform: "TikTok",
      views: 1500,
      clicks: 80,
      orders: 3,
      commission: 30000,
    },
  });

  const resInsightsC = await fetch(`${BASE_URL}/api/insights`);
  const insightsC = await resInsightsC.json();

  console.log(`Sufficiency evaluation with 2 records:`);
  console.log(`  Tier: "${insightsC.sufficiency.tier}"`);
  console.log(`  Confidence: "${insightsC.sufficiency.confidenceLabel}"`);
  console.log(`  Message: "${insightsC.sufficiency.message}"`);

  if (insightsC.sufficiency.tier !== "insufficient") {
    throw new Error(`FAIL Scenario C: Expected tier "insufficient" for 2 records, got "${insightsC.sufficiency.tier}"`);
  }
  console.log("PASS Scenario C: Data sufficiency guardrail active: engine rejects premature confidence when records < 5!\n");

  // Restore backup
  console.log("Restoring original performance records...");
  await prisma.performanceMetric.deleteMany();
  for (const m of existingMetrics) {
    await prisma.performanceMetric.create({ data: m });
  }
  console.log(`PASS: Restored ${existingMetrics.length} original performance records.`);

  console.log("=== WINNING PATTERN ENGINE AUDIT COMPLETED: ALL PASS ===\n");
}

runWinningPatternAudit()
  .catch((err) => {
    console.error("Winning Pattern Audit Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
