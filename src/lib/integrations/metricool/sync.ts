import { prisma } from "@/lib/prisma";
import { metricoolClient } from "./client";
import type { SyncTikTokResult, MetricoolTikTokPostAnalytics } from "./types";

/**
 * Synchronizes TikTok analytics from Metricool into CommerceAI database.
 * Strictly enforces Duplicate Prevention using externalPostId and videoUrl.
 */
export async function syncTikTokData(
  options?: string | { brandId?: string; lookbackDays?: number; fallbackProductId?: string }
): Promise<SyncTikTokResult> {
  const brandId = typeof options === "string" ? options : options?.brandId;
  const customFallbackId = typeof options === "object" ? options?.fallbackProductId : undefined;
  const accountName = "onesecond.id3";

  try {
    const posts: MetricoolTikTokPostAnalytics[] = await metricoolClient.getTikTokAnalytics({
      brandId,
    });

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Get an active product for fallback association if no specific experiment exists
    const defaultProduct = await prisma.product.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const fallbackProductId = customFallbackId || defaultProduct?.id || "fallback-product-id";

    for (const post of posts) {
      // 1. Check existing PerformanceMetric by externalPostId
      const existingMetric = await prisma.performanceMetric.findFirst({
        where: {
          OR: [
            { externalPostId: post.externalPostId },
            { contentId: post.videoUrl },
          ],
        },
      });

      // 2. Check or update matching Experiment
      const existingExperiment = await prisma.experiment.findUnique({
        where: { externalPostId: post.externalPostId },
      });

      if (existingExperiment) {
        await prisma.experiment.update({
          where: { id: existingExperiment.id },
          data: {
            views: post.views,
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            reach: post.reach,
            watchRate: post.watchRate,
            averageWatchTime: post.averageWatchTime,
            engagementRate: post.engagementRate,
            forYouViews: post.forYouViews,
            searchViews: post.searchViews,
            soundViews: post.soundViews,
            profileViews: post.profileViews,
            status: "MEASURING",
            dataSource: post.dataSource,
            updatedAt: new Date(),
          },
        });
      }

      if (existingMetric) {
        // UPDATE EXISTING (No Duplicate)
        await prisma.performanceMetric.update({
          where: { id: existingMetric.id },
          data: {
            views: post.views,
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            reach: post.reach,
            watchRate: post.watchRate,
            averageWatchTime: post.averageWatchTime,
            engagementRate: post.engagementRate,
            forYouViews: post.forYouViews,
            searchViews: post.searchViews,
            soundViews: post.soundViews,
            profileViews: post.profileViews,
            dataSource: post.dataSource,
            updatedAt: new Date(),
          },
        });
        updatedCount++;
      } else {
        // CREATE NEW RECORD
        // Link to matching product or default product
        const targetProductId = existingExperiment?.productId || fallbackProductId;
        if (!targetProductId) {
          skippedCount++;
          continue;
        }

        const calculatedClicks = Math.round(post.views * (post.engagementRate * 0.4));
        const estimatedOrders = post.orders || Math.round(calculatedClicks * 0.025);
        const estimatedRevenue = post.revenue || estimatedOrders * 89000;
        const calculatedCommission = estimatedRevenue * 0.15;

        await prisma.performanceMetric.create({
          data: {
            productId: targetProductId,
            externalPostId: post.externalPostId,
            experimentId: existingExperiment?.id,
            contentId: post.videoUrl,
            platform: "TikTok",
            date: new Date(post.publishedDate),
            views: post.views,
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            clicks: calculatedClicks,
            orders: estimatedOrders,
            revenue: estimatedRevenue,
            commission: calculatedCommission,
            videoConcept: post.description.slice(0, 100),
            hook: post.description.split("#")[0]?.trim() || "Hook dari TikTok",
            angle: "Problem Solution / Review",
            ctr: post.views > 0 ? calculatedClicks / post.views : 0,
            cvr: calculatedClicks > 0 ? estimatedOrders / calculatedClicks : 0,
            reach: post.reach,
            watchRate: post.watchRate,
            averageWatchTime: post.averageWatchTime,
            engagementRate: post.engagementRate,
            forYouViews: post.forYouViews,
            searchViews: post.searchViews,
            soundViews: post.soundViews,
            profileViews: post.profileViews,
            dataSource: post.dataSource,
          },
        });
        createdCount++;
      }
    }

    return {
      success: true,
      syncedAt: new Date().toISOString(),
      accountName,
      totalFetched: posts.length,
      createdCount,
      updatedCount,
      skippedCount,
      posts,
      dataSource: metricoolClient.isConfigured() ? "METRICOOL REAL DATA" : "AI ESTIMATE",
    };
  } catch (error: any) {
    console.error("TikTok sync error:", error);
    return {
      success: false,
      syncedAt: new Date().toISOString(),
      accountName,
      totalFetched: 0,
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      posts: [],
      dataSource: "AI ESTIMATE",
      error: error.message || "Gagal sinkronisasi data dari Metricool",
    };
  }
}

export const syncTikTokAnalytics = syncTikTokData;
