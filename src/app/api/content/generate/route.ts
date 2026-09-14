import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await db.products.findById(body.productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const ai = getAIProvider();
    const result = await ai.generateContent({
      productName: product.name,
      productDescription: product.description,
      productAdvantages: product.advantages,
      problemSolved: product.problemSolved,
      targetAudience: body.targetAudience || product.targetAudience,
      platform: body.platform,
      duration: body.duration,
      style: body.style,
      objective: body.objective,
    });

    const project = await db.contentProjects.create({
      id: uuidv4(),
      productId: body.productId,
      platform: body.platform,
      duration: body.duration,
      style: body.style,
      objective: body.objective,
      targetAudience: body.targetAudience || product.targetAudience,
      hooks: result.hooks,
      angles: result.angles,
      concepts: result.concepts,
      bestConcept: result.bestConcept,
      status: "generated",
    });

    return NextResponse.json({ project, result });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
