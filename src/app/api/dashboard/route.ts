import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.products.findAll();
    const contentProjects = await db.contentProjects.findAll();
    const metrics = await db.performanceMetrics.findAll();

    const totalProducts = products.length;
    const potentialProducts = products.filter((p) => (p.opportunityScore || 0) >= 60).length;
    const totalContent = contentProjects.length;
    const totalOrders = metrics.reduce((sum, m) => sum + m.orders, 0);
    const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
    const conversionRate = totalClicks > 0 ? totalOrders / totalClicks : 0;
    const totalRevenue = metrics.reduce((sum, m) => sum + (m.revenue || m.commission || 0), 0);

    // Top products by opportunity score
    const topProducts = [...products]
      .filter((p) => p.opportunityScore)
      .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        opportunityScore: p.opportunityScore,
        orders: metrics.filter((m) => m.productId === p.id).reduce((s, m) => s + m.orders, 0),
        clicks: metrics.filter((m) => m.productId === p.id).reduce((s, m) => s + m.clicks, 0),
        views: metrics.filter((m) => m.productId === p.id).reduce((s, m) => s + m.views, 0),
      }));

    // Best content by orders
    const contentWithMetrics = metrics
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)
      .map((m) => {
        const product = products.find((p) => p.id === m.productId);
        return {
          contentId: m.contentId || m.id,
          productName: product?.name || "Unknown",
          platform: m.platform,
          views: m.views,
          clicks: m.clicks,
          orders: m.orders,
          ctr: m.ctr,
          cvr: m.cvr,
          hook: m.hook,
          angle: m.angle,
        };
      });

    // High views low conversion
    const avgCVR = metrics.length > 0 ? metrics.reduce((s, m) => s + (m.cvr || 0), 0) / metrics.length : 0;
    const highViewsLowConv = metrics
      .filter((m) => m.views > 100 && (m.cvr || 0) < avgCVR * 0.5)
      .slice(0, 3)
      .map((m) => {
        const product = products.find((p) => p.id === m.productId);
        return { contentId: m.contentId || m.id, productName: product?.name || "Unknown", views: m.views, cvr: m.cvr };
      });

    return NextResponse.json({
      summary: {
        totalProducts,
        potentialProducts,
        totalContent,
        totalOrders,
        conversionRate,
        totalRevenue,
      },
      topProducts,
      bestContent: contentWithMetrics,
      highViewsLowConversion: highViewsLowConv,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
