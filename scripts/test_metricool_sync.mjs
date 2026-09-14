import { syncTikTokAnalytics } from "../src/lib/integrations/metricool/sync.ts";
import { prisma } from "../src/lib/prisma.ts";

async function runTest() {
  console.log("==================================================");
  console.log("TEST 2: TIKTOK METRICOOL ANALYTICS SYNC");
  console.log("==================================================");

  // 1. Ensure at least 1 product exists in DB for sync association
  let sampleProduct = await prisma.product.findFirst();
  if (!sampleProduct) {
    sampleProduct = await prisma.product.create({
      data: {
        name: "Mic Wireless TikTok Viral Pro",
        category: "Elektronik",
        price: 189000,
        commissionRate: 15,
        targetAudience: "Content Creator, Live Streamer",
        keyFeatures: JSON.stringify(["Noise cancelling", "Baterai 12 jam", "Plug & Play"]),
        opportunityScore: 88,
        status: "TESTING",
      },
    });
    console.log(`[PASS] Created test product: ${sampleProduct.name} (${sampleProduct.id})`);
  } else {
    console.log(`[PASS] Using existing product for sync test: ${sampleProduct.name} (${sampleProduct.id})`);
  }

  // 2. Run sync
  console.log("Running syncTikTokAnalytics({ lookbackDays: 30 })...");
  const syncResult = await syncTikTokAnalytics({
    lookbackDays: 30,
    fallbackProductId: sampleProduct.id,
  });

  console.log("[PASS] Sync completed successfully:", {
    accountName: syncResult.accountName,
    totalFetched: syncResult.totalFetched,
    createdCount: syncResult.createdCount,
    updatedCount: syncResult.updatedCount,
    dataSource: syncResult.dataSource,
  });

  if (syncResult.accountName !== "onesecond.id3") {
    throw new Error(`Expected sync accountName "onesecond.id3", got "${syncResult.accountName}"`);
  }

  if (syncResult.totalFetched === 0) {
    throw new Error("Expected at least one post fetched from Metricool analytics");
  }

  // 3. Verify metrics in database
  const metricsInDb = await prisma.performanceMetric.findMany({
    where: { platform: "TikTok" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log(`[PASS] Found ${metricsInDb.length} TikTok metric records in SQLite database.`);
  const sampleMetric = metricsInDb[0];

  console.log("[PASS] Sample metric data fields verification:", {
    externalPostId: sampleMetric.externalPostId,
    views: sampleMetric.views,
    likes: sampleMetric.likes,
    shares: sampleMetric.shares,
    watchRate: sampleMetric.watchRate,
    averageWatchTime: sampleMetric.averageWatchTime,
    forYouViews: sampleMetric.forYouViews,
    dataSource: sampleMetric.dataSource,
  });

  if (!sampleMetric.externalPostId) {
    throw new Error("Metric must have externalPostId populated");
  }
  if (typeof sampleMetric.watchRate !== "number") {
    throw new Error("Metric must have numeric watchRate");
  }

  console.log("==================================================");
  console.log("TEST 2 RESULT: ALL TIKTOK ANALYTICS SYNC CHECKS PASSED!");
  console.log("==================================================");
}

runTest().catch((err) => {
  console.error("TEST 2 FAILED:", err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
