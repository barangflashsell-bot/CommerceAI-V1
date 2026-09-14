import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { calculateAggregatedMetrics } from "@/lib/ai/engine/metrics";
import { detectWinningPatterns } from "@/lib/ai/engine/winning-pattern";
import { evaluateDataSufficiency } from "@/lib/ai/engine/data-sufficiency";

export async function GET() {
  try {
    const metrics = await db.performanceMetrics.findAll();
    const products = await db.products.findAll();

    const aggregated = calculateAggregatedMetrics(metrics, products);
    const patterns = detectWinningPatterns(aggregated);
    const sufficiency = evaluateDataSufficiency(metrics.length);

    const ai = getAIProvider();
    const insights = await ai.generateInsights(aggregated, patterns, sufficiency);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
