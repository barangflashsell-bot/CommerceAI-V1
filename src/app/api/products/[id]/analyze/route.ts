import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.products.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const ai = getAIProvider();
    const analysis = await ai.analyzeProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      commissionRate: product.commissionRate,
      targetAudience: product.targetAudience,
      description: product.description,
      advantages: product.advantages,
      problemSolved: product.problemSolved,
    });

    await db.products.update(id, {
      opportunityScore: analysis.opportunityScore,
      aiAnalysis: analysis as unknown as Record<string, unknown>,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing product:", error);
    return NextResponse.json({ error: "Failed to analyze product" }, { status: 500 });
  }
}
