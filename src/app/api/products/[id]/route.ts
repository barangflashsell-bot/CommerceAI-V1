import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluateProductStatus } from "@/lib/ai/engine/product-status";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.products.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch related performance metrics to compute live decision recommendation
    const metrics = await db.performanceMetrics.findByProductId(id);
    let totalViews = 0;
    let totalClicks = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    for (const m of metrics) {
      totalViews += m.views || 0;
      totalClicks += m.clicks || 0;
      totalOrders += m.orders || 0;
      totalRevenue += m.revenue || (m.commission || 0) * 5;
    }

    const decision = evaluateProductStatus({
      productId: product.id,
      productName: product.name,
      views: totalViews,
      clicks: totalClicks,
      orders: totalOrders,
      revenue: totalRevenue,
      sampleCount: metrics.length,
      testingPlan: product.testingPlan,
    });

    return NextResponse.json({
      ...product,
      decision,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await db.products.update(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.products.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
