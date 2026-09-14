import { prisma, isDatabaseReady } from "../prisma";
import { memoryDb } from "../memory-db";
import type { PerformanceMetric } from "../db";

function toDomain(raw: any): PerformanceMetric {
  return {
    id: raw.id,
    productId: raw.productId,
    contentVariationId: raw.contentVariationId || undefined,
    contentId: raw.contentId || undefined,
    date: raw.date instanceof Date ? raw.date.toISOString() : String(raw.date),
    platform: raw.platform,
    views: raw.views,
    likes: raw.likes,
    comments: raw.comments,
    shares: raw.shares,
    clicks: raw.clicks,
    addToCart: raw.addToCart,
    orders: raw.orders,
    commission: raw.commission,
    videoConcept: raw.videoConcept || undefined,
    hook: raw.hook || undefined,
    angle: raw.angle || undefined,
    ctr: raw.ctr ?? undefined,
    cvr: raw.cvr ?? undefined,
    revenue: raw.revenue ?? undefined,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : String(raw.updatedAt),
  };
}

export const PerformanceRepository = {
  async findAll(): Promise<PerformanceMetric[]> {
    if (!isDatabaseReady) {
      return [...memoryDb.performanceMetrics];
    }
    try {
      const metrics = await prisma.performanceMetric.findMany({
        orderBy: { createdAt: "desc" },
      });
      return metrics.map(toDomain);
    } catch {
      return [...memoryDb.performanceMetrics];
    }
  },

  async findById(id: string): Promise<PerformanceMetric | null> {
    if (!isDatabaseReady) {
      return memoryDb.performanceMetrics.find((m) => m.id === id) || null;
    }
    try {
      const metric = await prisma.performanceMetric.findUnique({
        where: { id },
      });
      return metric ? toDomain(metric) : (memoryDb.performanceMetrics.find((m) => m.id === id) || null);
    } catch {
      return memoryDb.performanceMetrics.find((m) => m.id === id) || null;
    }
  },

  async findByProductId(productId: string): Promise<PerformanceMetric[]> {
    if (!isDatabaseReady) {
      return memoryDb.performanceMetrics.filter((m) => m.productId === productId);
    }
    try {
      const metrics = await prisma.performanceMetric.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
      });
      return metrics.map(toDomain);
    } catch {
      return memoryDb.performanceMetrics.filter((m) => m.productId === productId);
    }
  },

  async create(data: Omit<PerformanceMetric, "createdAt" | "updatedAt"> & { id?: string }): Promise<PerformanceMetric> {
    if (!isDatabaseReady) {
      const newMetric: PerformanceMetric = {
        id: data.id || `metric_${Date.now()}`,
        productId: data.productId,
        contentVariationId: data.contentVariationId,
        contentId: data.contentId,
        date: data.date || new Date().toISOString().split("T")[0],
        platform: data.platform,
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        clicks: data.clicks || 0,
        addToCart: data.addToCart || 0,
        orders: data.orders || 0,
        commission: data.commission || 0,
        videoConcept: data.videoConcept,
        hook: data.hook,
        angle: data.angle,
        ctr: data.ctr,
        cvr: data.cvr,
        revenue: data.revenue,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.performanceMetrics.unshift(newMetric);
      return newMetric;
    }
    try {
      const created = await prisma.performanceMetric.create({
        data: {
          id: data.id,
          productId: data.productId,
          contentVariationId: data.contentVariationId,
          contentId: data.contentId,
          date: data.date ? new Date(data.date) : new Date(),
          platform: data.platform,
          views: data.views,
          likes: data.likes,
          comments: data.comments,
          shares: data.shares,
          clicks: data.clicks,
          addToCart: data.addToCart,
          orders: data.orders,
          commission: data.commission,
          videoConcept: data.videoConcept,
          hook: data.hook,
          angle: data.angle,
          ctr: data.ctr,
          cvr: data.cvr,
          revenue: data.revenue,
        },
      });
      return toDomain(created);
    } catch {
      const fallbackMetric: PerformanceMetric = {
        ...data,
        id: data.id || `metric_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.performanceMetrics.unshift(fallbackMetric);
      return fallbackMetric;
    }
  },

  async update(id: string, data: Partial<PerformanceMetric>): Promise<PerformanceMetric | null> {
    if (!isDatabaseReady) {
      const idx = memoryDb.performanceMetrics.findIndex((m) => m.id === id);
      if (idx !== -1) {
        memoryDb.performanceMetrics[idx] = { ...memoryDb.performanceMetrics[idx], ...data, updatedAt: new Date().toISOString() };
        return memoryDb.performanceMetrics[idx];
      }
      return null;
    }
    try {
      const updateData: any = {};
      if (data.views !== undefined) updateData.views = data.views;
      if (data.likes !== undefined) updateData.likes = data.likes;
      if (data.comments !== undefined) updateData.comments = data.comments;
      if (data.shares !== undefined) updateData.shares = data.shares;
      if (data.clicks !== undefined) updateData.clicks = data.clicks;
      if (data.addToCart !== undefined) updateData.addToCart = data.addToCart;
      if (data.orders !== undefined) updateData.orders = data.orders;
      if (data.commission !== undefined) updateData.commission = data.commission;
      if (data.videoConcept !== undefined) updateData.videoConcept = data.videoConcept;
      if (data.hook !== undefined) updateData.hook = data.hook;
      if (data.angle !== undefined) updateData.angle = data.angle;
      if (data.ctr !== undefined) updateData.ctr = data.ctr;
      if (data.cvr !== undefined) updateData.cvr = data.cvr;
      if (data.revenue !== undefined) updateData.revenue = data.revenue;

      const updated = await prisma.performanceMetric.update({
        where: { id },
        data: updateData,
      });
      return toDomain(updated);
    } catch {
      const idx = memoryDb.performanceMetrics.findIndex((m) => m.id === id);
      if (idx !== -1) {
        memoryDb.performanceMetrics[idx] = { ...memoryDb.performanceMetrics[idx], ...data, updatedAt: new Date().toISOString() };
        return memoryDb.performanceMetrics[idx];
      }
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isDatabaseReady) {
      memoryDb.performanceMetrics = memoryDb.performanceMetrics.filter((m) => m.id !== id);
      return true;
    }
    try {
      await prisma.performanceMetric.delete({
        where: { id },
      });
      return true;
    } catch {
      memoryDb.performanceMetrics = memoryDb.performanceMetrics.filter((m) => m.id !== id);
      return true;
    }
  },
};
