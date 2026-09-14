import { prisma } from "../prisma";
import type { AiInsight } from "../db";

function parseJson(str: any) {
  if (!str) return undefined;
  if (typeof str !== "string") return str;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

function stringifyJson(val: any) {
  if (val === undefined || val === null) return null;
  return typeof val === "string" ? val : JSON.stringify(val);
}

function toDomain(raw: any): AiInsight {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    content: parseJson(raw.content),
    productId: raw.productId || undefined,
    confidence: raw.confidence ?? undefined,
    actionItems: parseJson(raw.actionItems),
    metadata: parseJson(raw.metadata),
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
  };
}

export const InsightRepository = {
  async findAll(): Promise<AiInsight[]> {
    const insights = await prisma.aiInsight.findMany({
      orderBy: { createdAt: "desc" },
    });
    return insights.map(toDomain);
  },

  async create(data: Omit<AiInsight, "createdAt"> & { id?: string }): Promise<AiInsight> {
    const created = await prisma.aiInsight.create({
      data: {
        id: data.id,
        type: data.type,
        title: data.title,
        content: stringifyJson(data.content) || "{}",
        productId: data.productId,
        confidence: data.confidence,
        actionItems: stringifyJson(data.actionItems),
        metadata: stringifyJson(data.metadata),
      },
    });
    return toDomain(created);
  },

  async deleteAll(): Promise<void> {
    await prisma.aiInsight.deleteMany();
  },
};
