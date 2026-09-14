import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { calculateAggregatedMetrics } from "@/lib/ai/engine/metrics";
import { detectWinningPatterns } from "@/lib/ai/engine/winning-pattern";

export async function POST() {
  try {
    const metrics = await db.performanceMetrics.findAll();
    const products = await db.products.findAll();

    const aggregated = calculateAggregatedMetrics(metrics, products);
    const patterns = detectWinningPatterns(aggregated);

    const ai = getAIProvider();
    const nextContent = await ai.generateNextContent(patterns, aggregated);

    return NextResponse.json(nextContent);
  } catch (error) {
    console.error("Error generating next content:", error);
    return NextResponse.json({ error: "Failed to generate next content" }, { status: 500 });
  }
}
