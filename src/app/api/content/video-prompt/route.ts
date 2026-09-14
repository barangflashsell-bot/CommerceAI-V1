import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId } = body;

    const project = await db.contentProjects.findById(projectId);
    if (!project || !project.storyboard) {
      return NextResponse.json({ error: "Storyboard not found" }, { status: 404 });
    }

    const product = await db.products.findById(project.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const concepts = project.concepts as Array<{ id: number; title: string; description: string; hook: string; angle: string; flow: string; expectedImpact: string }>;
    const storyboard = project.storyboard as { scenes: Array<{ sceneNumber: number; timeRange: string; visual: string; camera: string; action: string; purpose: string }>; productConsistencyRules: string[]; totalDuration: string };

    const ai = getAIProvider();
    const videoPrompt = await ai.generateVideoPrompt(storyboard, {
      productName: product.name,
      productDescription: product.description,
      concept: concepts[0],
      duration: project.duration,
      platform: project.platform,
      style: project.style,
    });

    await db.contentProjects.update(projectId, { videoPrompt });

    return NextResponse.json(videoPrompt);
  } catch (error) {
    console.error("Error generating video prompt:", error);
    return NextResponse.json({ error: "Failed to generate video prompt" }, { status: 500 });
  }
}
