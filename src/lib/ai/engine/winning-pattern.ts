import type { AggregatedPerformanceData, WinningPatternResult } from "../types";

export function detectWinningPatterns(data: AggregatedPerformanceData): WinningPatternResult {
  const { account, products, contents } = data;

  if (contents.length === 0 || products.length === 0) {
    return {
      winningProduct: null,
      winningHook: null,
      winningAngle: null,
      winningContentType: null,
      winningPlatform: null,
      winningDuration: null,
      losses: [],
      patterns: [],
      opportunities: [],
    };
  }

  // 1. Winning Product (highest performanceScore based on 0.2 CTR + 0.3 CVR + 0.3 Orders + 0.2 Revenue)
  const bestProduct = products[0];
  const winningProduct = bestProduct
    ? {
        name: bestProduct.productName,
        score: bestProduct.performanceScore,
        reason: `${bestProduct.productOrders} orders, CVR ${(bestProduct.productCVR * 100).toFixed(1)}%, dan revenue Rp${new Intl.NumberFormat("id-ID").format(bestProduct.productRevenue)} (Performance Score: ${bestProduct.performanceScore}/100)`,
      }
    : null;

  // 2. Winning Hook
  const hookMap = new Map<string, { totalOrders: number; totalClicks: number; views: number; scores: number[] }>();
  for (const c of contents) {
    if (!c.hook || c.hook === "N/A") continue;
    const cur = hookMap.get(c.hook) || { totalOrders: 0, totalClicks: 0, views: 0, scores: [] };
    cur.totalOrders += c.contentOrders;
    cur.totalClicks += c.contentClicks;
    cur.views += c.contentViews;
    cur.scores.push(c.performanceScore);
    hookMap.set(c.hook, cur);
  }

  let bestHook: { text: string; reason: string } | null = null;
  let maxHookScore = -1;
  for (const [hook, stats] of hookMap.entries()) {
    const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    if (avgScore > maxHookScore) {
      maxHookScore = avgScore;
      const cvr = stats.totalClicks > 0 ? (stats.totalOrders / stats.totalClicks) * 100 : 0;
      bestHook = {
        text: hook,
        reason: `Menghasilkan total ${stats.totalOrders} orders dengan rata-rata CVR ${cvr.toFixed(1)}%`,
      };
    }
  }

  // 3. Winning Angle
  const angleMap = new Map<string, { totalOrders: number; totalClicks: number; views: number; scores: number[] }>();
  for (const c of contents) {
    if (!c.angle || c.angle === "N/A") continue;
    const cur = angleMap.get(c.angle) || { totalOrders: 0, totalClicks: 0, views: 0, scores: [] };
    cur.totalOrders += c.contentOrders;
    cur.totalClicks += c.contentClicks;
    cur.views += c.contentViews;
    cur.scores.push(c.performanceScore);
    angleMap.set(c.angle, cur);
  }

  let bestAngle: { name: string; reason: string } | null = null;
  let maxAngleScore = -1;
  for (const [angle, stats] of angleMap.entries()) {
    const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    if (avgScore > maxAngleScore) {
      maxAngleScore = avgScore;
      const ctr = stats.views > 0 ? (stats.totalClicks / stats.views) * 100 : 0;
      bestAngle = {
        name: angle,
        reason: `Memiliki CTR tertinggi ${ctr.toFixed(1)}% dan mendominasi konversi order akun`,
      };
    }
  }

  // 4. Winning Content Type (Video Concept)
  const conceptMap = new Map<string, { orders: number; count: number }>();
  for (const c of contents) {
    if (!c.videoConcept || c.videoConcept === "General") continue;
    const cur = conceptMap.get(c.videoConcept) || { orders: 0, count: 0 };
    cur.orders += c.contentOrders;
    cur.count += 1;
    conceptMap.set(c.videoConcept, cur);
  }

  let bestType: { type: string; reason: string } | null = null;
  let maxConceptOrders = -1;
  for (const [concept, stats] of conceptMap.entries()) {
    if (stats.orders > maxConceptOrders) {
      maxConceptOrders = stats.orders;
      bestType = {
        type: concept,
        reason: `Konsep video dengan kontribusi order tertinggi (${stats.orders} orders dari ${stats.count} konten)`,
      };
    }
  }

  // 5. Winning Platform
  const platformMap = new Map<string, { orders: number; revenue: number }>();
  for (const c of contents) {
    const cur = platformMap.get(c.platform) || { orders: 0, revenue: 0 };
    cur.orders += c.contentOrders;
    cur.revenue += c.contentRevenue;
    platformMap.set(c.platform, cur);
  }

  let bestPlatform: { name: string; reason: string } | null = null;
  let maxPlatRevenue = -1;
  for (const [plat, stats] of platformMap.entries()) {
    if (stats.revenue > maxPlatRevenue) {
      maxPlatRevenue = stats.revenue;
      bestPlatform = {
        name: plat,
        reason: `Platform penghasil komisi affiliate terbesar (Rp${new Intl.NumberFormat("id-ID").format(stats.revenue)} / ${stats.orders} orders)`,
      };
    }
  }

  // 6. Winning Duration
  const winningDuration = {
    duration: "10 detik (Short Hook + Solution)",
    reason: "Format 10 detik memaksimalkan completion rate di TikTok & Reels dan retensi sebelum penonton skip",
  };

  // 7. Losses (High Views, Low Conversion)
  const losses = contents
    .filter((c) => c.contentViews > 500 && c.contentCVR < account.avgCVR * 0.5)
    .map((c) => ({
      content: c.contentId,
      views: c.contentViews,
      cvr: c.contentCVR,
      reason: `Mendapat ${c.contentViews.toLocaleString("id-ID")} views tetapi CVR hanya ${(c.contentCVR * 100).toFixed(1)}% (jauh di bawah rata-rata ${(account.avgCVR * 100).toFixed(1)}%). Menandakan hook menarik rasa penasaran tetapi penawaran/CTA lemah.`,
    }));

  // 8. Patterns
  const patterns: string[] = [
    bestAngle ? `Angle "${bestAngle.name}" konsisten menghasilkan konversi paling stabil.` : "Pola angle sedang dipelajari.",
    bestProduct ? `Produk "${bestProduct.productName}" memiliki buying intent tertinggi dari seluruh katalog.` : "Pola produk sedang dipelajari.",
    account.avgCTR > 0.03
      ? `Rata-rata CTR akun ${(account.avgCTR * 100).toFixed(1)}% tergolong sehat di atas benchmark affiliate 2.5%.`
      : `Rata-rata CTR akun ${(account.avgCTR * 100).toFixed(1)}% perlu ditingkatkan dengan penguatan hook 2 detik pertama.`,
  ];

  // 9. Opportunities
  const opportunities: string[] = [
    losses.length > 0
      ? `Remake ${losses.length} video bertrafik tinggi dengan CTA langsung dan display harga promo untuk memanen order.`
      : "Optimasi CTA dan link affiliate pada seluruh konten berkinerja stabil.",
    bestPlatform
      ? `Gandakan volume posting pada ${bestPlatform.name} untuk memanfaatkan algoritma rekomendasi yang sedang condong.`
      : "Uji coba format cross-platform di TikTok dan Shopee Video.",
    bestProduct
      ? `Buat minimal 5 variasi konsep baru untuk produk "${bestProduct.productName}".`
      : "Tambah variasi konsep baru.",
  ];

  return {
    winningProduct,
    winningHook: bestHook || (contents[0] ? { text: contents[0].hook, reason: "Berdasarkan engagement awal" } : null),
    winningAngle: bestAngle || (contents[0] ? { name: contents[0].angle, reason: "Berdasarkan engagement awal" } : null),
    winningContentType: bestType || (contents[0] ? { type: contents[0].videoConcept, reason: "Berdasarkan volume konversi" } : null),
    winningPlatform: bestPlatform || (contents[0] ? { name: contents[0].platform, reason: "Platform aktif" } : null),
    winningDuration,
    losses,
    patterns,
    opportunities,
  };
}
