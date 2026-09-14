import { prisma, isDatabaseReady } from "../prisma";
import { memoryDb } from "../memory-db";

export interface CreateExperimentInput {
  name: string;
  productId: string;
  contentProjectId?: string;
  contentVariationId?: string;
  externalPostId?: string;
  angle: string;
  hook: string;
  platform?: string;
  duration?: string;
  objective?: string;
  status?: string;
  scheduledAt?: string | Date;
  videoUrl?: string;
  caption?: string;
  hashtags?: string;
  privacy?: string;
  aiGeneratedContent?: boolean;
}

export const ExperimentRepository = {
  async findAll(filter?: { status?: string; productId?: string }) {
    if (!isDatabaseReady) {
      let list = [...memoryDb.experiments];
      if (filter?.status && filter.status !== "ALL") list = list.filter((e) => e.status === filter.status);
      if (filter?.productId) list = list.filter((e) => e.productId === filter.productId);
      return list.map((e) => {
        const prod = memoryDb.products.find((p) => p.id === e.productId);
        const cont = memoryDb.contentProjects.find((c) => c.id === e.contentProjectId);
        return {
          ...e,
          product: prod ? { id: prod.id, name: prod.name, category: prod.category, price: prod.price } : null,
          contentProject: cont ? { id: cont.id, style: cont.style, duration: cont.duration } : null,
        };
      });
    }
    try {
      const where: any = {};
      if (filter?.status && filter.status !== "ALL") where.status = filter.status;
      if (filter?.productId) where.productId = filter.productId;

      return await prisma.experiment.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, category: true, price: true } },
          contentProject: { select: { id: true, style: true, duration: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      let list = [...memoryDb.experiments];
      if (filter?.status && filter.status !== "ALL") list = list.filter((e) => e.status === filter.status);
      if (filter?.productId) list = list.filter((e) => e.productId === filter.productId);
      return list;
    }
  },

  async findById(id: string) {
    if (!isDatabaseReady) {
      const exp = memoryDb.experiments.find((e) => e.id === id);
      if (!exp) return null;
      const product = memoryDb.products.find((p) => p.id === exp.productId) || null;
      const contentProject = memoryDb.contentProjects.find((c) => c.id === exp.contentProjectId) || null;
      const performanceMetrics = memoryDb.performanceMetrics.filter((m) => m.productId === exp.productId);
      return { ...exp, product, contentProject, performanceMetrics };
    }
    try {
      return await prisma.experiment.findUnique({
        where: { id },
        include: {
          product: true,
          contentProject: true,
          performanceMetrics: true,
        },
      });
    } catch {
      const exp = memoryDb.experiments.find((e) => e.id === id);
      if (!exp) return null;
      return { ...exp, product: null, contentProject: null, performanceMetrics: [] };
    }
  },

  async findByExternalPostId(externalPostId: string) {
    if (!isDatabaseReady) {
      return memoryDb.experiments.find((e) => e.externalPostId === externalPostId) || null;
    }
    try {
      return await prisma.experiment.findUnique({
        where: { externalPostId },
      });
    } catch {
      return memoryDb.experiments.find((e) => e.externalPostId === externalPostId) || null;
    }
  },

  async create(data: CreateExperimentInput) {
    if (!isDatabaseReady) {
      const newExp = {
        id: `exp_${Date.now()}`,
        name: data.name,
        productId: data.productId,
        contentProjectId: data.contentProjectId,
        contentVariationId: data.contentVariationId,
        externalPostId: data.externalPostId,
        angle: data.angle,
        hook: data.hook,
        platform: data.platform || "TikTok",
        duration: data.duration || "15s",
        objective: data.objective || "Conversion",
        status: data.status || "DRAFT",
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        videoUrl: data.videoUrl,
        caption: data.caption,
        hashtags: data.hashtags,
        targetAccount: "onesecond.id3",
        privacy: data.privacy || "PUBLIC_TO_EVERYONE",
        aiGeneratedContent: Boolean(data.aiGeneratedContent),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.experiments.unshift(newExp);
      const product = memoryDb.products.find((p) => p.id === data.productId) || null;
      return { ...newExp, product };
    }
    try {
      return await prisma.experiment.create({
        data: {
          name: data.name,
          productId: data.productId,
          contentProjectId: data.contentProjectId,
          contentVariationId: data.contentVariationId,
          externalPostId: data.externalPostId,
          angle: data.angle,
          hook: data.hook,
          platform: data.platform || "TikTok",
          duration: data.duration || "15s",
          objective: data.objective || "Conversion",
          status: data.status || "DRAFT",
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          videoUrl: data.videoUrl,
          caption: data.caption,
          hashtags: data.hashtags,
          targetAccount: "onesecond.id3",
          privacy: data.privacy || "PUBLIC_TO_EVERYONE",
          aiGeneratedContent: Boolean(data.aiGeneratedContent),
        },
        include: {
          product: true,
        },
      });
    } catch {
      const newExp = {
        id: `exp_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.experiments.unshift(newExp);
      return newExp;
    }
  },

  async update(id: string, data: Partial<any>) {
    if (!isDatabaseReady) {
      const idx = memoryDb.experiments.findIndex((e) => e.id === id);
      if (idx !== -1) {
        memoryDb.experiments[idx] = { ...memoryDb.experiments[idx], ...data, updatedAt: new Date().toISOString() };
        return memoryDb.experiments[idx];
      }
      return null;
    }
    try {
      return await prisma.experiment.update({
        where: { id },
        data,
        include: {
          product: true,
        },
      });
    } catch {
      const idx = memoryDb.experiments.findIndex((e) => e.id === id);
      if (idx !== -1) {
        memoryDb.experiments[idx] = { ...memoryDb.experiments[idx], ...data, updatedAt: new Date().toISOString() };
        return memoryDb.experiments[idx];
      }
      return null;
    }
  },

  async delete(id: string) {
    if (!isDatabaseReady) {
      memoryDb.experiments = memoryDb.experiments.filter((e) => e.id !== id);
      return true;
    }
    try {
      return await prisma.experiment.delete({
        where: { id },
      });
    } catch {
      memoryDb.experiments = memoryDb.experiments.filter((e) => e.id !== id);
      return true;
    }
  },

  async getCounts() {
    let all: any[] = [];
    if (!isDatabaseReady) {
      all = memoryDb.experiments;
    } else {
      try {
        all = await prisma.experiment.findMany({
          select: { status: true, winnerType: true },
        });
      } catch {
        all = memoryDb.experiments;
      }
    }

    const counts = {
      total: all.length,
      draft: 0,
      scheduled: 0,
      published: 0,
      measuring: 0,
      winner: 0,
      loser: 0,
    };

    for (const exp of all) {
      const s = (exp.status || "").toLowerCase();
      if (s === "draft") counts.draft++;
      else if (s === "scheduled" || s === "ready") counts.scheduled++;
      else if (s === "published") counts.published++;
      else if (s === "measuring") counts.measuring++;
      else if (s === "winner") counts.winner++;
      else if (s === "loser") counts.loser++;
    }

    return counts;
  },
};
