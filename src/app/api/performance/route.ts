import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const metrics = await db.performanceMetrics.findAll();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching performance:", error);
    return NextResponse.json({ error: "Failed to fetch performance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();

    const views = Math.max(0, parseInt(body.views) || 0);
    const clicks = Math.max(0, parseInt(body.clicks) || 0);
    const orders = Math.max(0, parseInt(body.orders) || 0);
    const commission = Math.max(0, parseFloat(body.commission) || 0);
    const likes = Math.max(0, parseInt(body.likes) || 0);
    const comments = Math.max(0, parseInt(body.comments) || 0);
    const shares = Math.max(0, parseInt(body.shares) || 0);
    const addToCart = Math.max(0, parseInt(body.addToCart) || 0);

    const ctr = views > 0 ? clicks / views : 0;
    const cvr = clicks > 0 ? orders / clicks : 0;
    const revenue = commission;

    const metric = await db.performanceMetrics.create({
      id: uuidv4(),
      productId: body.productId,
      contentId: body.contentId || undefined,
      date: body.date || now,
      platform: body.platform,
      views,
      likes,
      comments,
      shares,
      clicks,
      addToCart,
      orders,
      commission,
      videoConcept: body.videoConcept || undefined,
      hook: body.hook || undefined,
      angle: body.angle || undefined,
      ctr,
      cvr,
      revenue,
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error("Error creating performance:", error);
    return NextResponse.json({ error: "Failed to create performance" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.performanceMetrics.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting performance:", error);
    return NextResponse.json({ error: "Failed to delete performance" }, { status: 500 });
  }
}
