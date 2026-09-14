import { prisma, isDatabaseReady } from "../prisma";
import { memoryDb } from "../memory-db";
import type { Product } from "../db";

function toDomain(raw: any): Product {
  let aiAnalysis = undefined;
  if (raw.aiAnalysis) {
    try {
      aiAnalysis = typeof raw.aiAnalysis === "string" ? JSON.parse(raw.aiAnalysis) : raw.aiAnalysis;
    } catch {
      aiAnalysis = undefined;
    }
  }

  let scoutAnalysis = undefined;
  if (raw.scoutAnalysis) {
    try {
      const sa = raw.scoutAnalysis;
      scoutAnalysis = {
        id: sa.id,
        score: sa.score,
        category: sa.category,
        breakdown: typeof sa.breakdown === "string" ? JSON.parse(sa.breakdown) : sa.breakdown,
        why: sa.why,
        risks: typeof sa.risks === "string" ? JSON.parse(sa.risks) : sa.risks,
        bestAngles: typeof sa.bestAngles === "string" ? JSON.parse(sa.bestAngles) : sa.bestAngles,
        testingPlan: typeof sa.testingPlan === "string" ? JSON.parse(sa.testingPlan) : sa.testingPlan,
        expectedGoal: sa.expectedGoal,
        dataSource: sa.dataSource,
      };
    } catch {
      scoutAnalysis = undefined;
    }
  }

  let testingPlan = undefined;
  if (raw.testingPlan) {
    try {
      const tp = raw.testingPlan;
      testingPlan = {
        id: tp.id,
        testDays: tp.testDays,
        videoCount: tp.videoCount,
        angles: typeof tp.angles === "string" ? JSON.parse(tp.angles) : tp.angles,
        hooks: typeof tp.hooks === "string" ? JSON.parse(tp.hooks) : tp.hooks,
        platforms: typeof tp.platforms === "string" ? JSON.parse(tp.platforms) : tp.platforms,
        successCriteria: typeof tp.successCriteria === "string" ? JSON.parse(tp.successCriteria) : tp.successCriteria,
        thresholdType: tp.thresholdType,
        userCustomThreshold: tp.userCustomThreshold ? (typeof tp.userCustomThreshold === "string" ? JSON.parse(tp.userCustomThreshold) : tp.userCustomThreshold) : undefined,
      };
    } catch {
      testingPlan = undefined;
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    link: raw.link,
    category: raw.category,
    price: raw.price,
    commissionRate: raw.commissionRate,
    imageUrl: raw.imageUrl || undefined,
    targetAudience: raw.targetAudience,
    description: raw.description,
    advantages: raw.advantages,
    problemSolved: raw.problemSolved,
    opportunityScore: raw.opportunityScore ?? undefined,
    aiAnalysis,
    status: raw.status || "DISCOVERED",
    scoutAnalysis,
    testingPlan,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : String(raw.updatedAt),
  };
}

export const ProductRepository = {
  async findAll(): Promise<Product[]> {
    if (!isDatabaseReady) {
      return [...memoryDb.products];
    }
    try {
      const products = await prisma.product.findMany({
        include: {
          scoutAnalysis: true,
          testingPlan: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return products.map(toDomain);
    } catch (e) {
      console.warn("[ProductRepository] DB error, falling back to memory:", e);
      return [...memoryDb.products];
    }
  },

  async findById(id: string): Promise<Product | null> {
    if (!isDatabaseReady) {
      return memoryDb.products.find((p) => p.id === id) || null;
    }
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          scoutAnalysis: true,
          testingPlan: true,
        },
      });
      return product ? toDomain(product) : (memoryDb.products.find((p) => p.id === id) || null);
    } catch {
      return memoryDb.products.find((p) => p.id === id) || null;
    }
  },

  async create(data: Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Product> {
    if (!isDatabaseReady) {
      const newProduct: Product = {
        id: data.id || `prod_${Date.now()}`,
        name: data.name,
        link: data.link,
        category: data.category,
        price: data.price,
        commissionRate: data.commissionRate,
        imageUrl: data.imageUrl,
        targetAudience: data.targetAudience,
        description: data.description,
        advantages: data.advantages,
        problemSolved: data.problemSolved,
        opportunityScore: data.opportunityScore,
        aiAnalysis: data.aiAnalysis,
        status: data.status || "DISCOVERED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.products.unshift(newProduct);
      return newProduct;
    }
    try {
      const created = await prisma.product.create({
        data: {
          id: data.id,
          name: data.name,
          link: data.link,
          category: data.category,
          price: data.price,
          commissionRate: data.commissionRate,
          imageUrl: data.imageUrl,
          targetAudience: data.targetAudience,
          description: data.description,
          advantages: data.advantages,
          problemSolved: data.problemSolved,
          opportunityScore: data.opportunityScore,
          aiAnalysis: data.aiAnalysis ? JSON.stringify(data.aiAnalysis) : null,
          status: data.status || "DISCOVERED",
        },
        include: {
          scoutAnalysis: true,
          testingPlan: true,
        },
      });
      return toDomain(created);
    } catch {
      const fallbackProduct: Product = {
        ...data,
        id: data.id || `prod_${Date.now()}`,
        status: data.status || "DISCOVERED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.products.unshift(fallbackProduct);
      return fallbackProduct;
    }
  },

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    if (!isDatabaseReady) {
      const idx = memoryDb.products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        memoryDb.products[idx] = { ...memoryDb.products[idx], ...data, updatedAt: new Date().toISOString() };
        return memoryDb.products[idx];
      }
      return null;
    }
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.link !== undefined) updateData.link = data.link;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.commissionRate !== undefined) updateData.commissionRate = data.commissionRate;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.advantages !== undefined) updateData.advantages = data.advantages;
      if (data.problemSolved !== undefined) updateData.problemSolved = data.problemSolved;
      if (data.opportunityScore !== undefined) updateData.opportunityScore = data.opportunityScore;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.aiAnalysis !== undefined) {
        updateData.aiAnalysis = data.aiAnalysis ? JSON.stringify(data.aiAnalysis) : null;
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          scoutAnalysis: true,
          testingPlan: true,
        },
      });
      return toDomain(updated);
    } catch {
      const idx = memoryDb.products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        memoryDb.products[idx] = { ...memoryDb.products[idx], ...data, updatedAt: new Date().toISOString() };
        return memoryDb.products[idx];
      }
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isDatabaseReady) {
      memoryDb.products = memoryDb.products.filter((p) => p.id !== id);
      return true;
    }
    try {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    } catch {
      memoryDb.products = memoryDb.products.filter((p) => p.id !== id);
      return true;
    }
  },
};
