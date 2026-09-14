import backupData from "../../prisma/sqlite_backup.json";
import type { Product, ContentProject, PerformanceMetric } from "./db";

// Helper to safely parse JSON
function safeJson(val: any) {
  if (!val) return undefined;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return undefined;
  }
}

interface MemoryStore {
  products: Product[];
  contentProjects: ContentProject[];
  performanceMetrics: PerformanceMetric[];
  experiments: any[];
  scoutAnalyses: any[];
  testingPlans: any[];
  settings: any[];
}

function initStore(): MemoryStore {
  const data = (backupData as any).data || {};

  const products: Product[] = (data.products || []).map((p: any) => ({
    ...p,
    aiAnalysis: safeJson(p.aiAnalysis),
    createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date(p.createdAt).toISOString(),
    updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : new Date(p.updatedAt).toISOString(),
  }));

  const contentProjects: ContentProject[] = (data.contentProjects || []).map((c: any) => ({
    ...c,
    hooks: safeJson(c.hooks),
    angles: safeJson(c.angles),
    concepts: safeJson(c.concepts),
    bestConcept: safeJson(c.bestConcept),
    storyboard: safeJson(c.storyboard),
    videoPrompt: safeJson(c.videoPrompt),
    createdAt: typeof c.createdAt === "string" ? c.createdAt : new Date(c.createdAt).toISOString(),
    updatedAt: typeof c.updatedAt === "string" ? c.updatedAt : new Date(c.updatedAt).toISOString(),
  }));

  const performanceMetrics: PerformanceMetric[] = (data.performanceMetrics || []).map((m: any) => ({
    ...m,
    date: typeof m.date === "string" ? m.date : new Date(m.date).toISOString().split("T")[0],
    createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
    updatedAt: typeof m.updatedAt === "string" ? m.updatedAt : new Date(m.updatedAt).toISOString(),
  }));

  const experiments: any[] = (data.experiments || []).map((e: any) => ({
    ...e,
    createdAt: typeof e.createdAt === "string" ? e.createdAt : new Date(e.createdAt).toISOString(),
    updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : new Date(e.updatedAt).toISOString(),
  }));

  return {
    products,
    contentProjects,
    performanceMetrics,
    experiments,
    scoutAnalyses: data.scoutAnalyses || [],
    testingPlans: data.testingPlans || [],
    settings: data.settings || [],
  };
}

// Global store to persist within serverless container lifecycle
const globalMemoryStore = globalThis as unknown as {
  _commerceAiMemoryStore?: MemoryStore;
};

if (!globalMemoryStore._commerceAiMemoryStore) {
  globalMemoryStore._commerceAiMemoryStore = initStore();
}

export const memoryDb = globalMemoryStore._commerceAiMemoryStore!;
