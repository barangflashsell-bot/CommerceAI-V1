import { prisma } from "../prisma";

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
  },

  async findById(id: string) {
    return await prisma.experiment.findUnique({
      where: { id },
      include: {
        product: true,
        contentProject: true,
        performanceMetrics: true,
      },
    });
  },

  async findByExternalPostId(externalPostId: string) {
    return await prisma.experiment.findUnique({
      where: { externalPostId },
    });
  },

  async create(data: CreateExperimentInput) {
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
  },

  async update(id: string, data: Partial<any>) {
    return await prisma.experiment.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  },

  async delete(id: string) {
    return await prisma.experiment.delete({
      where: { id },
    });
  },

  async getCounts() {
    const all = await prisma.experiment.findMany({
      select: { status: true, winnerType: true },
    });

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
      const s = exp.status.toLowerCase();
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
