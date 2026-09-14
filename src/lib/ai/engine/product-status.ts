import type {
  ProductDecisionRecommendation,
  ProductLifecycleStatus,
  TestingPlanConfig,
} from "../types";

export interface ProductMetricsSummary {
  productId: string;
  productName: string;
  views: number;
  clicks: number;
  orders: number;
  revenue: number;
  sampleCount: number;
  testingPlan?: TestingPlanConfig | null;
}

/**
 * Calculates affiliate RPM (Revenue Per 1000 Views):
 * Revenue / Views * 1000
 */
export function calculateRevenuePer1000Views(revenue: number, views: number): number {
  if (!views || views <= 0) return 0;
  return Math.round((revenue / views) * 1000);
}

/**
 * Evaluates a product's lifecycle status, action recommendation, and hidden gem potential.
 * Incorporates Phase 3 Data Sufficiency Guardrails (< 5 records).
 */
export function evaluateProductStatus(input: ProductMetricsSummary): ProductDecisionRecommendation {
  const { productId, productName, views, clicks, orders, revenue, sampleCount, testingPlan } = input;

  const ctr = views > 0 ? clicks / views : 0;
  const cvr = clicks > 0 ? orders / clicks : 0;
  const rpm = calculateRevenuePer1000Views(revenue, views);

  // Default criteria threshold if testingPlan exists
  const targetCTR = testingPlan?.userCustomThreshold?.minimumCTR ?? testingPlan?.successCriteria?.minimumCTR ?? 0.02;
  const targetCVR = testingPlan?.userCustomThreshold?.minimumCVR ?? testingPlan?.successCriteria?.minimumCVR ?? 0.03;

  const metrics = {
    views,
    clicks,
    orders,
    revenue,
    ctr,
    cvr,
    rpm,
    sampleCount,
  };

  // 1. DATA SUFFICIENCY GUARDRAIL: < 5 records
  if (sampleCount === 0) {
    return {
      productId,
      productName,
      status: "DISCOVERED",
      recommendation: "TEST THIS PRODUCT",
      subFocus: "VALIDATE MARKET RESPONSE",
      reasoning: "Produk baru ditambahkan ke sistem. Belum ada catatan performa video. Jalankan pengujian 10 video pertama sesuai rekomendasi Testing Plan.",
      dataSource: "AI ESTIMATE",
      metrics,
      isHiddenGem: false,
      testingPlan: testingPlan || undefined,
    };
  }

  if (sampleCount < 5) {
    return {
      productId,
      productName,
      status: "TESTING",
      recommendation: "TEST THIS PRODUCT",
      subFocus: "VALIDATE MARKET RESPONSE",
      reasoning: `Data pengujian baru terkumpul ${sampleCount} video (ambang batas reliabilitas minimum adalah 5 video). Lanjutkan publikasi variasi angle dan hook untuk mencapai data statistik yang valid.`,
      dataSource: "PERFORMANCE BASED",
      metrics,
      isHiddenGem: false,
      testingPlan: testingPlan || undefined,
    };
  }

  // 2. SUFFICIENT DATA (sampleCount >= 5): Run Decision Matrix

  // Hidden Gem Detection:
  // Low/moderate views (<= 15,000) with strong CTR (>= 3.0%), strong CVR (>= 2.5%), and good revenue efficiency
  const isHiddenGem = views <= 15000 && ctr >= 0.03 && cvr >= 0.025 && rpm > 0;
  const hiddenGemReason = isHiddenGem
    ? `Produk ini merupakan HIDDEN GEM: Efisiensi konversi sangat tinggi (CVR ${(cvr * 100).toFixed(1)}%, RPM Rp ${rpm.toLocaleString("id-ID")}) dengan volume tayangan baru ${views.toLocaleString("id-ID")} views. Potensi omset sangat besar jika distribusi traffic dan frekuensi posting ditingkatkan.`
    : undefined;

  // Scenario A: High CTR + High CVR + High Orders -> SCALE
  if (ctr >= 0.03 && cvr >= 0.02 && orders >= 15) {
    return {
      productId,
      productName,
      status: "SCALE",
      recommendation: "SCALE THIS PRODUCT",
      subFocus: "MAINTAIN WINNING FORMULA",
      reasoning: `Produk terbukti memenangkan pasar dengan CTR tinggi (${(ctr * 100).toFixed(1)}%), CVR solid (${(cvr * 100).toFixed(1)}%), dan menghasilkan ${orders} order (Revenue: Rp ${revenue.toLocaleString("id-ID")}, RPM: Rp ${rpm.toLocaleString("id-ID")}). Tingkatkan alokasi posting harian dan variasikan angle winning.`,
      dataSource: "PERFORMANCE BASED",
      metrics,
      isHiddenGem,
      hiddenGemReason,
      testingPlan: testingPlan || undefined,
    };
  }

  // Scenario B: Strong CTR + Low CVR -> OPTIMIZE (Purchase Intent)
  if (ctr >= 0.03 && cvr < 0.015) {
    return {
      productId,
      productName,
      status: "OPTIMIZE",
      recommendation: "OPTIMIZE CONTENT",
      subFocus: "OPTIMIZE PURCHASE INTENT",
      reasoning: `CTR tinggi (${(ctr * 100).toFixed(1)}%) membuktikan hook video sangat efektif menghentikan scroll, namun CVR rendah (${(cvr * 100).toFixed(1)}%). Penonton penasaran tapi ragu membeli. Perbaiki buying triggers: jelaskan garansi, ulas harga vs nilai guna, atau buat penawaran promo/bundling lebih tegas di akhir video.`,
      dataSource: "PERFORMANCE BASED",
      metrics,
      isHiddenGem: false,
      testingPlan: testingPlan || undefined,
    };
  }

  // Scenario C: Low CTR + Good CVR -> OPTIMIZE (Hook / Distribution)
  if (ctr < 0.02 && cvr >= 0.02) {
    return {
      productId,
      productName,
      status: "OPTIMIZE",
      recommendation: "OPTIMIZE CONTENT",
      subFocus: "OPTIMIZE HOOK / DISTRIBUTION",
      reasoning: `CVR sangat baik (${(cvr * 100).toFixed(1)}%) membuktikan produk ini mudah laku saat orang mengklik keranjang, namun CTR video rendah (${(ctr * 100).toFixed(1)}%). Masalah ada pada daya tarik awal video. Rombak 3 detik pertama: gunakan hook visual kontras, teks pertanyaan provokatif, atau suara problem-solver.`,
      dataSource: "PERFORMANCE BASED",
      metrics,
      isHiddenGem,
      hiddenGemReason,
      testingPlan: testingPlan || undefined,
    };
  }

  // Scenario D: Low CTR + Low CVR + Sufficient Sample -> KILL
  if (ctr < 0.02 && cvr < 0.015 && sampleCount >= 5) {
    return {
      productId,
      productName,
      status: "KILL",
      recommendation: "KILL THIS PRODUCT",
      reasoning: `Setelah pengujian komprehensif pada ${sampleCount} video (${views.toLocaleString("id-ID")} views), CTR (${(ctr * 100).toFixed(1)}%) dan CVR (${(cvr * 100).toFixed(1)}%) tetap berada di bawah standar minimum (Target CTR: ${(targetCTR * 100).toFixed(1)}%, Target CVR: ${(targetCVR * 100).toFixed(1)}%). Hentikan produksi konten produk ini untuk menghemat kapasitas dan alihkan ke produk potensial lain.`,
      dataSource: "PERFORMANCE BASED",
      metrics,
      isHiddenGem: false,
      testingPlan: testingPlan || undefined,
    };
  }

  // Default moderate performance: testing/optimize
  const isBetterThanTarget = ctr >= targetCTR && cvr >= targetCVR;
  const status: ProductLifecycleStatus = isBetterThanTarget ? "SCALE" : "TESTING";

  return {
    productId,
    productName,
    status,
    recommendation: isBetterThanTarget ? "SCALE THIS PRODUCT" : "TEST THIS PRODUCT",
    subFocus: "VALIDATE MARKET RESPONSE",
    reasoning: `Performa berada pada tingkat moderat (CTR: ${(ctr * 100).toFixed(1)}%, CVR: ${(cvr * 100).toFixed(1)}%, Orders: ${orders}, RPM: Rp ${rpm.toLocaleString("id-ID")}). Terus pantau metrik sambil menyempurnakan storyboard.`,
    dataSource: "PERFORMANCE BASED",
    metrics,
    isHiddenGem,
    hiddenGemReason,
    testingPlan: testingPlan || undefined,
  };
}
