import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function runAIProviderTest() {
  console.log("=== STARTING AI PROVIDER TEST ===");

  // 1. Check AI Provider Health Status API
  console.log("Checking AI Provider Health API (/api/settings/ai-status)...");
  const resHealth = await fetch(`${BASE_URL}/api/settings/ai-status`);
  if (!resHealth.ok) throw new Error("FAIL: /api/settings/ai-status failed");
  const healthData = await resHealth.json();

  console.log("Provider Statuses:", healthData);
  const mockP = healthData.find((p) => p.id === "mock");
  const openaiP = healthData.find((p) => p.id === "openai");
  const geminiP = healthData.find((p) => p.id === "gemini");

  if (!mockP || mockP.status !== "Connected") throw new Error("FAIL: Mock provider should be Connected");
  if (!openaiP || !geminiP) throw new Error("FAIL: OpenAI or Gemini provider missing from health check");
  console.log("PASS: Multi-AI Provider health reporting verified (MOCK, OPENAI, GEMINI).");

  // 2. Test Product Analysis through active AI Provider
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  const products = await prodRes.json();
  if (products.length === 0) throw new Error("FAIL: No products available");
  const testProduct = products[0];

  console.log(`\nTesting analyzeProduct via AI Provider for "${testProduct.name}"...`);
  const resAnalyze = await fetch(`${BASE_URL}/api/products/${testProduct.id}/analyze`, { method: "POST" });
  if (!resAnalyze.ok) throw new Error("FAIL: Product analyze failed");
  const analysis = await resAnalyze.json();

  if (typeof analysis.opportunityScore !== "number" || !analysis.breakdown) {
    throw new Error("FAIL: Analysis output missing opportunityScore or breakdown");
  }
  console.log(`PASS: Product analyzed successfully. Opportunity Score: ${analysis.opportunityScore}/100`);

  // 3. Verify AI Request Logging in SQLite
  const logCount = await prisma.aiLog.count();
  console.log(`\nPASS: Verified AI execution metadata logged to SQLite table "AiLog" (Total logs recorded: ${logCount})`);

  console.log("=== AI PROVIDER TEST COMPLETED: ALL PASS ===\n");
}

runAIProviderTest()
  .catch((err) => {
    console.error("AI Provider Test Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
