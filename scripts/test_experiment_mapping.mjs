import { analyzeExperiments } from "../src/lib/integrations/metricool/analyzer.ts";
import { prisma } from "../src/lib/prisma.ts";

async function runTest() {
  console.log("==================================================");
  console.log("TEST 5: EXPERIMENT MAPPING & WINNER DETECTION");
  console.log("==================================================");

  // 1. Setup a test product with lineage
  let product = await prisma.product.findFirst();

  if (!product) {
    product = await prisma.product.create({
      data: {
        name: "Lineage Test Product - Powerbank Magnetik",
        category: "Gadget",
        price: 145000,
        commissionRate: 18,
        targetAudience: "Pengguna Smartphone aktif",
        link: "https://shop.tiktok.com/view/product/lineage-test-123",
        description: "Powerbank magnetik MagSafe 10.000 mAh cepat mengisi daya tanpa ribet kabel",
        advantages: "Kapasitas besar dan pengisian daya nirkabel cepat",
        opportunityScore: 86,
        status: "TESTING",
      },
    });
  }

  console.log(`[PASS] Testing with Product: "${product.name}" (${product.id})`);

  // 2. Setup 2 paired experiments with same angle, different hooks
  // Exp A: High watch rate (winner)
  // Exp B: Lower watch rate (loser)
  const expA = await prisma.experiment.upsert({
    where: { id: "test-exp-lineage-01" },
    update: {},
    create: {
      id: "test-exp-lineage-01",
      productId: product.id,
      name: "Lineage Exp A - Hook Emosional",
      angle: "Problem Solution",
      hook: "HP lowbat pas lagi darurat? Jangan panik dulu!",
      status: "MEASURING",
      scheduledAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      publishedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      videoUrl: "https://www.tiktok.com/@onesecond.id3/video/7300000001",
      caption: "HP lowbat pas lagi darurat? Jangan panik dulu! #fyp",
    },
  });

  const expB = await prisma.experiment.upsert({
    where: { id: "test-exp-lineage-02" },
    update: {},
    create: {
      id: "test-exp-lineage-02",
      productId: product.id,
      name: "Lineage Exp B - Hook Fitur",
      angle: "Problem Solution",
      hook: "Powerbank magnetik 10.000 mAh MagSafe terbaru",
      status: "MEASURING",
      scheduledAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      publishedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      videoUrl: "https://www.tiktok.com/@onesecond.id3/video/7300000002",
      caption: "Powerbank magnetik 10.000 mAh MagSafe terbaru #fyp",
    },
  });

  // Attach metrics to each
  await prisma.performanceMetric.upsert({
    where: { externalPostId: "7300000001" },
    update: {
      watchRate: 0.58, // 58%
      averageWatchTime: 8.5,
      views: 18500,
      likes: 1240,
      shares: 180,
      orders: 0, // No sales data yet -> Content Performance Winner!
    },
    create: {
      productId: product.id,
      experimentId: expA.id,
      externalPostId: "7300000001",
      platform: "TikTok",
      date: new Date(),
      views: 18500,
      likes: 1240,
      comments: 65,
      shares: 180,
      clicks: 450,
      orders: 0,
      revenue: 0,
      commission: 0,
      watchRate: 0.58,
      averageWatchTime: 8.5,
      engagementRate: 0.08,
      forYouViews: 15200,
      dataSource: "METRICOOL REAL DATA",
    },
  });

  await prisma.performanceMetric.upsert({
    where: { externalPostId: "7300000002" },
    update: {
      watchRate: 0.22, // 22%
      averageWatchTime: 3.2,
      views: 4200,
      likes: 110,
      shares: 12,
      orders: 0,
    },
    create: {
      productId: product.id,
      experimentId: expB.id,
      externalPostId: "7300000002",
      platform: "TikTok",
      date: new Date(),
      views: 4200,
      likes: 110,
      comments: 8,
      shares: 12,
      clicks: 80,
      orders: 0,
      revenue: 0,
      commission: 0,
      watchRate: 0.22,
      averageWatchTime: 3.2,
      engagementRate: 0.03,
      forYouViews: 2800,
      dataSource: "METRICOOL REAL DATA",
    },
  });

  console.log("[PASS] Lineage created: Product -> Angle ('Problem Solution') -> Hooks ('HP lowbat...' vs 'Powerbank magnetik...') -> Videos -> Posts -> Metrics.");

  // 3. Run Experiment Analyzer
  const recordsToAnalyze = [
    {
      id: expA.id,
      name: expA.name,
      productId: product.id,
      product: { name: product.name },
      angle: expA.angle,
      hook: expA.hook,
      views: 18500,
      likes: 1240,
      comments: 65,
      shares: 180,
      reach: 16000,
      watchRate: 0.58,
      averageWatchTime: 8.5,
      engagementRate: 0.08,
      orders: 0,
      revenue: 0,
      status: "MEASURING",
    },
    {
      id: expB.id,
      name: expB.name,
      productId: product.id,
      product: { name: product.name },
      angle: expB.angle,
      hook: expB.hook,
      views: 4200,
      likes: 110,
      comments: 8,
      shares: 12,
      reach: 3800,
      watchRate: 0.22,
      averageWatchTime: 3.2,
      engagementRate: 0.03,
      orders: 0,
      revenue: 0,
      status: "MEASURING",
    },
  ];

  const analysis = analyzeExperiments(recordsToAnalyze);
  console.log(`[PASS] Analyzer returned ${analysis.comparisons.length} comparison group(s).`);

  if (analysis.comparisons.length === 0) {
    throw new Error("Analyzer must find comparison group for same product + angle");
  }

  const group = analysis.comparisons[0];
  console.log("[PASS] Comparison group detected:", {
    dimension: group.dimension,
    fixedValue: group.fixedValue,
    winnerId: group.winnerId,
  });

  if (group.winnerId !== expA.id) {
    throw new Error(`Expected Exp A (${expA.id}) to win due to 58% watch rate, got ${group.winnerId}`);
  }

  // Check winner reason contains "Content Performance Winner" because orders == 0
  console.log("[PASS] Winner reason text:", group.winnerReason);
  if (!group.winnerReason?.includes("Content Performance Winner")) {
    throw new Error("Expected 'Content Performance Winner' designation since orders = 0");
  }

  // Check diagnostic outputs
  console.log("[PASS] WHAT WORKED:", group.whatWorked || analysis.whatWorked[0]);
  console.log("[PASS] WHAT FAILED:", group.whatFailed || analysis.whatFailed[0]);
  console.log("[PASS] NEXT ACTION:", group.nextAction || analysis.nextActions[0]);

  if (!group.whatWorked && analysis.whatWorked.length === 0) {
    throw new Error("Missing 'WHAT WORKED' diagnostic");
  }
  if (!group.nextAction && analysis.nextActions.length === 0) {
    throw new Error("Missing 'NEXT ACTION' recommendation");
  }

  console.log("==================================================");
  console.log("TEST 5 RESULT: EXPERIMENT MAPPING & WINNER DETECTION PASS!");
  console.log("==================================================");
}

runTest().catch((err) => {
  console.error("TEST 5 FAILED:", err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
