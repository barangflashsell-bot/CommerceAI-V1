import { prisma } from "../prisma";
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
    const metrics = await prisma.performanceMetric.findMany({
      orderBy: { createdAt: "desc" },
    });
    return metrics.map(toDomain);
  },

  async findById(id: string): Promise<PerformanceMetric | null> {
    const metric = await prisma.performanceMetric.findUnique({
      where: { id },
    });
    return metric ? toDomain(metric) : null;
  },

  async findByProductId(productId: string): Promise<PerformanceMetric[]> {
    const metrics = await prisma.performanceMetric.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    return metrics.map(toDomain);
  },

  async create(data: Omit<PerformanceMetric, "createdAt" | "updatedAt"> & { id?: string }): Promise<PerformanceMetric> {
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
  },

  async update(id: string, data: Partial<PerformanceMetric>): Promise<PerformanceMetric | null> {
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
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.performanceMetric.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  },
};
