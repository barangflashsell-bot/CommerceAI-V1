import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, conceptIndex } = body;

    const project = await db.contentProjects.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const product = await db.products.findById(project.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const concepts = project.concepts as Array<{ id: number; title: string; description: string; hook: string; angle: string; flow: string; expectedImpact: string }>;
    const concept = concepts[conceptIndex] || concepts[0];

    const ai = getAIProvider();
    const storyboard = await ai.generateStoryboard({
      productName: product.name,
      productDescription: product.description,
      concept,
      duration: project.duration,
      platform: project.platform,
      style: project.style,
    });

    await db.contentProjects.update(projectId, { storyboard });

    return NextResponse.json(storyboard);
  } catch (error) {
    console.error("Error generating storyboard:", error);
    return NextResponse.json({ error: "Failed to generate storyboard" }, { status: 500 });
  }
}
