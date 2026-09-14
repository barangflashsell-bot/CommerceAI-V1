import type {
  PerformanceMetric,
  Product
} from "@/lib/db";
import type {
  AggregatedPerformanceData,
  ProductPerformanceMetric,
  ContentPerformanceItem,
  AggregatedAccountMetrics
} from "../types";

export function calculateAggregatedMetrics(
  metrics: PerformanceMetric[],
  products: Product[]
): AggregatedPerformanceData {
  const totalViews = metrics.reduce((sum, m) => sum + m.views, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalOrders = metrics.reduce((sum, m) => sum + m.orders, 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + (m.revenue || m.commission || 0), 0);
  const avgCTR = totalViews > 0 ? totalClicks / totalViews : 0;
  const avgCVR = totalClicks > 0 ? totalOrders / totalClicks : 0;

  const account: AggregatedAccountMetrics = {
    totalViews,
    totalClicks,
    totalOrders,
    totalRevenue,
    avgCTR: Number(avgCTR.toFixed(4)),
    avgCVR: Number(avgCVR.toFixed(4)),
  };

  // Find max values for normalization
  const maxCTR = Math.max(...metrics.map((m) => m.ctr || 0), 0.001);
  const maxCVR = Math.max(...metrics.map((m) => m.cvr || 0), 0.001);
  const maxOrders = Math.max(...metrics.map((m) => m.orders || 0), 1);
  const maxRevenue = Math.max(...metrics.map((m) => m.revenue || m.commission || 0), 1);

  // Helper for performance score: 0.20 * normCTR + 0.30 * normCVR + 0.30 * normOrders + 0.20 * normRevenue
  function computeScore(ctr: number, cvr: number, orders: number, revenue: number): number {
    const normCTR = Math.min(1, ctr / maxCTR);
    const normCVR = Math.min(1, cvr / maxCVR);
    const normOrders = Math.min(1, orders / maxOrders);
    const normRevenue = Math.min(1, revenue / maxRevenue);

    const score = 0.20 * normCTR + 0.30 * normCVR + 0.30 * normOrders + 0.20 * normRevenue;
    return Number((score * 100).toFixed(1));
  }

  // Aggregate per Product
  const productMap = new Map<string, PerformanceMetric[]>();
  for (const m of metrics) {
    const arr = productMap.get(m.productId) || [];
    arr.push(m);
    productMap.set(m.productId, arr);
  }

  const productMetrics: ProductPerformanceMetric[] = [];
  for (const prod of products) {
    const prodMetrics = productMap.get(prod.id) || [];
    if (prodMetrics.length === 0) continue;

    const pViews = prodMetrics.reduce((s, m) => s + m.views, 0);
    const pClicks = prodMetrics.reduce((s, m) => s + m.clicks, 0);
    const pOrders = prodMetrics.reduce((s, m) => s + m.orders, 0);
    const pRevenue = prodMetrics.reduce((s, m) => s + (m.revenue || m.commission || 0), 0);
    const pCTR = pViews > 0 ? pClicks / pViews : 0;
    const pCVR = pClicks > 0 ? pOrders / pClicks : 0;
    const pScore = computeScore(pCTR, pCVR, pOrders, pRevenue);

    productMetrics.push({
      productId: prod.id,
      productName: prod.name,
      productViews: pViews,
      productClicks: pClicks,
      productOrders: pOrders,
      productRevenue: pRevenue,
      productCTR: Number(pCTR.toFixed(4)),
      productCVR: Number(pCVR.toFixed(4)),
      performanceScore: pScore,
    });
  }

  // Aggregate per Content
  const contents: ContentPerformanceItem[] = metrics.map((m) => {
    const prod = products.find((p) => p.id === m.productId);
    const ctr = m.ctr || (m.views > 0 ? m.clicks / m.views : 0);
    const cvr = m.cvr || (m.clicks > 0 ? m.orders / m.clicks : 0);
    const revenue = m.revenue || m.commission || 0;
    const score = computeScore(ctr, cvr, m.orders, revenue);

    return {
      contentId: m.contentId || m.id,
      productName: prod?.name || "Unknown Product",
      platform: m.platform,
      hook: m.hook || "N/A",
      angle: m.angle || "N/A",
      videoConcept: m.videoConcept || "General",
      contentViews: m.views,
      contentClicks: m.clicks,
      contentOrders: m.orders,
      contentRevenue: revenue,
      contentCTR: Number(ctr.toFixed(4)),
      contentCVR: Number(cvr.toFixed(4)),
      performanceScore: score,
    };
  });

  return {
    account,
    products: productMetrics.sort((a, b) => b.performanceScore - a.performanceScore),
    contents: contents.sort((a, b) => b.performanceScore - a.performanceScore),
    recordCount: metrics.length,
  };
}
