import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST() {
  try {
    const metrics = await db.performanceMetrics.findAll();
    const products = await db.products.findAll();

    const performanceData = metrics.map((m) => {
      const product = products.find((p) => p.id === m.productId);
      return {
        productName: product?.name || "Unknown",
        contentId: m.contentId || m.id,
        platform: m.platform,
        views: m.views,
        likes: m.likes,
        comments: m.comments,
        shares: m.shares,
        clicks: m.clicks,
        addToCart: m.addToCart,
        orders: m.orders,
        commission: m.commission,
        videoConcept: m.videoConcept || "",
        hook: m.hook || "",
        angle: m.angle || "",
        ctr: m.ctr || 0,
        cvr: m.cvr || 0,
      };
    });

    const ai = getAIProvider();
    const analysis = await ai.analyzePerformance(performanceData);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing performance:", error);
    return NextResponse.json({ error: "Failed to analyze performance" }, { status: 500 });
  }
}
