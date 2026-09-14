import { metricoolClient } from "../src/lib/integrations/metricool/client.ts";
import { prisma } from "../src/lib/prisma.ts";

async function runTest() {
  console.log("==================================================");
  console.log("TEST 4: SCHEDULE VALIDATION & EXPERIMENT CREATION");
  console.log("==================================================");

  // 1. Validation error when missing required fields
  console.log("Testing validation error on missing videoUrl / text...");
  const invalidRes = await metricoolClient.createScheduledPost({
    targetAccount: "onesecond.id3",
    text: "",
    videoUrl: "",
    dateTime: new Date().toISOString(),
  });

  if (invalidRes.success) {
    throw new Error("Should have returned success=false for empty text / videoUrl");
  }
  console.log(`[PASS] Correctly rejected invalid payload: "${invalidRes.error}"`);

  // 2. Schedule valid post
  const testProduct = await prisma.product.findFirst();
  if (!testProduct) {
    throw new Error("A product is required for schedule test");
  }

  const scheduledTime = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // Tomorrow
  const captionText = "Rahasia produk viral ini bikin hemat waktu! 🔥 Cek keranjang kuning sekarang! #racuntiktok #onesecond.id3 #fyp";
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

  console.log(`Scheduling post for TikTok @onesecond.id3 at ${scheduledTime}...`);
  const postResult = await metricoolClient.createScheduledPost({
    targetAccount: "onesecond.id3",
    text: captionText,
    videoUrl: videoUrl,
    dateTime: scheduledTime,
    privacy: "PUBLIC_TO_EVERYONE",
    aiGeneratedContent: true,
  });

  console.log("[PASS] Metricool client accepted schedule:", {
    id: postResult.id,
    targetAccount: postResult.targetAccount,
    status: postResult.status,
    network: postResult.network,
  });

  if (postResult.targetAccount !== "onesecond.id3") {
    throw new Error(`Expected targetAccount "onesecond.id3", got "${postResult.targetAccount}"`);
  }
  if (postResult.status !== "SCHEDULED") {
    throw new Error(`Expected status "SCHEDULED", got "${postResult.status}"`);
  }

  // 3. Create associated Experiment in database
  const experiment = await prisma.experiment.create({
    data: {
      productId: testProduct.id,
      name: "Eksperimen Test Schedule Validation",
      angle: "Problem Solution",
      hook: "Rahasia produk viral ini bikin hemat waktu!",
      status: "SCHEDULED",
      scheduledAt: new Date(scheduledTime),
      videoUrl: videoUrl,
      caption: captionText,
    },
  });

  console.log(`[PASS] Experiment record saved in DB with ID: ${experiment.id}, Status: ${experiment.status}`);

  // 4. Verify in DB
  const foundExp = await prisma.experiment.findUnique({
    where: { id: experiment.id },
  });

  if (!foundExp || foundExp.status !== "SCHEDULED") {
    throw new Error("Failed to find created experiment in SCHEDULED state");
  }

  console.log("==================================================");
  console.log("TEST 4 RESULT: SCHEDULE VALIDATION & EXPERIMENT PASS!");
  console.log("==================================================");
}

runTest().catch((err) => {
  console.error("TEST 4 FAILED:", err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
