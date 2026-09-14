const BASE_URL = "http://localhost:3000";

async function runNextContentAudit() {
  console.log("=== STARTING NEXT CONTENT ENGINE AUDIT ===");

  // 1. Call POST /api/insights/next-content
  console.log("Calling POST /api/insights/next-content...");
  const res = await fetch(`${BASE_URL}/api/insights/next-content`, { method: "POST" });
  if (!res.ok) throw new Error(`FAIL: API returned status ${res.status}`);
  const data = await res.json();

  if (!data.concepts || !Array.isArray(data.concepts)) {
    throw new Error("FAIL: Output missing concepts array");
  }

  if (data.concepts.length !== 5) {
    throw new Error(`FAIL: Expected exactly 5 concepts, got ${data.concepts.length}`);
  }
  console.log(`PASS: Received exactly 5 recommended content concepts.`);

  // 2. Validate every concept structure & historical data grounding
  const requiredFields = ["title", "reason", "hook", "angle", "concept", "expectedGoal", "basedOnPattern"];

  data.concepts.forEach((concept, idx) => {
    console.log(`\nValidating Concept #${idx + 1}: "${concept.title}"`);
    for (const field of requiredFields) {
      if (!concept[field] || typeof concept[field] !== "string" || concept[field].trim() === "") {
        throw new Error(`FAIL: Concept #${idx + 1} missing or empty field "${field}"`);
      }
    }
    console.log(`  - Angle: ${concept.angle}`);
    console.log(`  - Hook: "${concept.hook}"`);
    console.log(`  - Goal: ${concept.expectedGoal}`);
    console.log(`  - Data Grounding (basedOnPattern): ${concept.basedOnPattern}`);

    if (!concept.basedOnPattern.toLowerCase().includes("historis") && !concept.basedOnPattern.toLowerCase().includes("data")) {
      throw new Error(`FAIL: Concept #${idx + 1} basedOnPattern is not grounded in historical data`);
    }
  });

  console.log("\nPASS: All 5 concepts contain non-empty data grounding (basedOnPattern).");
  console.log(`Strategy Summary: "${data.strategySummary}"`);
  console.log("\n=== NEXT CONTENT ENGINE AUDIT COMPLETED: ALL PASS ===\n");
}

runNextContentAudit().catch((err) => {
  console.error("Next Content Audit Error:", err);
  process.exit(1);
});
