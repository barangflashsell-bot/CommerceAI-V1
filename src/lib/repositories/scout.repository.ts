import { prisma } from "../prisma";
import type {
  ProductPortfolioSummary,
  ProductScoutResult,
  TestingPlanConfig,
  TestingPlanSuccessCriteria,
} from "../ai/types";
import { evaluateProductStatus } from "../ai/engine/product-status";

function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

export const ScoutRepository = {
  async saveScoutAnalysis(productId: string, scout: ProductScoutResult) {
    return await prisma.scoutAnalysis.upsert({
      where: { productId },
      create: {
        productId,
        score: scout.score,
        category: scout.category,
        breakdown: JSON.stringify(scout.breakdown),
        why: scout.why,
        risks: JSON.stringify(scout.risks),
        bestAngles: JSON.stringify(scout.bestAngles),
        testingPlan: JSON.stringify(scout.testingPlan),
        expectedGoal: scout.expectedGoal,
        dataSource: scout.dataSource,
      },
      update: {
        score: scout.score,
        category: scout.category,
        breakdown: JSON.stringify(scout.breakdown),
        why: scout.why,
        risks: JSON.stringify(scout.risks),
        bestAngles: JSON.stringify(scout.bestAngles),
        testingPlan: JSON.stringify(scout.testingPlan),
        expectedGoal: scout.expectedGoal,
        dataSource: scout.dataSource,
      },
    });
  },

  async getScoutAnalysis(productId: string) {
    const raw = await prisma.scoutAnalysis.findUnique({
      where: { productId },
    });
    if (!raw) return null;

    return {
      id: raw.id,
      productId: raw.productId,
      score: raw.score,
      category: raw.category,
      breakdown: safeJsonParse(raw.breakdown, {}),
      why: raw.why,
      risks: safeJsonParse(raw.risks, []),
      bestAngles: safeJsonParse(raw.bestAngles, []),
      testingPlan: safeJsonParse(raw.testingPlan, null),
      expectedGoal: raw.expectedGoal,
      dataSource: raw.dataSource,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };
  },

  async saveTestingPlan(productId: string, plan: TestingPlanConfig) {
    return await prisma.testingPlan.upsert({
      where: { productId },
      create: {
        productId,
        testDays: plan.testDays,
        videoCount: plan.videoCount,
        angles: JSON.stringify(plan.angles),
        hooks: JSON.stringify(plan.hooks),
        platforms: JSON.stringify(plan.platforms),
        successCriteria: JSON.stringify(plan.successCriteria),
        thresholdType: plan.thresholdType || "AI TESTING THRESHOLD",
        userCustomThreshold: plan.userCustomThreshold ? JSON.stringify(plan.userCustomThreshold) : null,
      },
      update: {
        testDays: plan.testDays,
        videoCount: plan.videoCount,
        angles: JSON.stringify(plan.angles),
        hooks: JSON.stringify(plan.hooks),
        platforms: JSON.stringify(plan.platforms),
        successCriteria: JSON.stringify(plan.successCriteria),
        thresholdType: plan.thresholdType || "AI TESTING THRESHOLD",
        userCustomThreshold: plan.userCustomThreshold ? JSON.stringify(plan.userCustomThreshold) : null,
      },
    });
  },

  async getTestingPlan(productId: string) {
    const raw = await prisma.testingPlan.findUnique({
      where: { productId },
    });
    if (!raw) return null;

    return {
      id: raw.id,
      productId: raw.productId,
      testDays: raw.testDays,
      videoCount: raw.videoCount,
      angles: safeJsonParse<string[]>(raw.angles, []),
      hooks: safeJsonParse<string[]>(raw.hooks, []),
      platforms: safeJsonParse<string[]>(raw.platforms, []),
      successCriteria: safeJsonParse<TestingPlanSuccessCriteria>(raw.successCriteria, {
        minimumCTR: 0.02,
        minimumCVR: 0.03,
      }),
      thresholdType: raw.thresholdType,
      userCustomThreshold: safeJsonParse<TestingPlanSuccessCriteria | null>(raw.userCustomThreshold, null),
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };
  },

  async updateTestingThreshold(productId: string, customThreshold: TestingPlanSuccessCriteria) {
    return await prisma.testingPlan.update({
      where: { productId },
      data: {
        userCustomThreshold: JSON.stringify(customThreshold),
      },
    });
  },

  async getPortfolio(): Promise<ProductPortfolioSummary> {
    const products = await prisma.product.findMany({
      include: {
        performanceMetrics: true,
        scoutAnalysis: true,
        testingPlan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let scaleCount = 0;
    let testingCount = 0;
    let optimizeCount = 0;
    let killCount = 0;
    let discoveredCount = 0;
    let hiddenGemsCount = 0;

    const evaluatedProducts = products.map((p) => {
      // Aggregate performance metrics
      let totalViews = 0;
      let totalClicks = 0;
      let totalOrders = 0;
      let totalRevenue = 0;

      for (const m of p.performanceMetrics) {
        totalViews += m.views || 0;
        totalClicks += m.clicks || 0;
        totalOrders += m.orders || 0;
        totalRevenue += m.revenue || (m.commission || 0) * 5; // fallback estimation if revenue null
      }

      const sampleCount = p.performanceMetrics.length;

      let parsedTestingPlan: TestingPlanConfig | null = null;
      if (p.testingPlan) {
        parsedTestingPlan = {
          testDays: p.testingPlan.testDays,
          videoCount: p.testingPlan.videoCount,
          angles: safeJsonParse(p.testingPlan.angles, []),
          hooks: safeJsonParse(p.testingPlan.hooks, []),
          platforms: safeJsonParse(p.testingPlan.platforms, []),
          successCriteria: safeJsonParse(p.testingPlan.successCriteria, { minimumCTR: 0.02, minimumCVR: 0.03 }),
          thresholdType: p.testingPlan.thresholdType,
          userCustomThreshold: safeJsonParse(p.testingPlan.userCustomThreshold, undefined),
        };
      }

      // Evaluate status based on performance
      const decision = evaluateProductStatus({
        productId: p.id,
        productName: p.name,
        views: totalViews,
        clicks: totalClicks,
        orders: totalOrders,
        revenue: totalRevenue,
        sampleCount,
        testingPlan: parsedTestingPlan,
      });

      // Count portfolio statuses
      if (decision.status === "SCALE") scaleCount++;
      else if (decision.status === "TESTING") testingCount++;
      else if (decision.status === "OPTIMIZE") optimizeCount++;
      else if (decision.status === "KILL") killCount++;
      else if (decision.status === "DISCOVERED") discoveredCount++;

      if (decision.isHiddenGem) hiddenGemsCount++;

      const score = p.scoutAnalysis?.score ?? p.opportunityScore ?? 70;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        commissionRate: p.commissionRate,
        status: decision.status,
        score,
        rpm: decision.metrics.rpm,
        views: totalViews,
        orders: totalOrders,
        revenue: totalRevenue,
        ctr: decision.metrics.ctr,
        cvr: decision.metrics.cvr,
        isHiddenGem: decision.isHiddenGem,
        sampleCount,
        dataSource: decision.dataSource,
      };
    });

    return {
      totalProducts: products.length,
      counts: {
        scale: scaleCount,
        testing: testingCount,
        optimize: optimizeCount,
        kill: killCount,
        discovered: discoveredCount,
        hiddenGems: hiddenGemsCount,
      },
      products: evaluatedProducts,
    };
  },
};
