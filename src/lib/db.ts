import { ProductRepository } from "./repositories/product.repository";
import { ContentRepository } from "./repositories/content.repository";
import { PerformanceRepository } from "./repositories/performance.repository";
import { InsightRepository } from "./repositories/insight.repository";
import { SettingRepository } from "./repositories/setting.repository";
import { ScoutRepository } from "./repositories/scout.repository";

// Types
export interface Product {
  id: string;
  name: string;
  link: string;
  category: string;
  price: number;
  commissionRate: number;
  imageUrl?: string;
  targetAudience: string;
  description: string;
  advantages: string;
  problemSolved: string;
  opportunityScore?: number;
  aiAnalysis?: Record<string, unknown>;
  status?: string; // DISCOVERED | TESTING | OPTIMIZE | SCALE | KILL
  scoutAnalysis?: any;
  testingPlan?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ContentProject {
  id: string;
  productId: string;
  platform: string;
  duration: string;
  style: string;
  objective: string;
  targetAudience: string;
  hooks?: unknown;
  angles?: unknown;
  concepts?: unknown;
  bestConcept?: unknown;
  storyboard?: unknown;
  videoPrompt?: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceMetric {
  id: string;
  productId: string;
  contentVariationId?: string;
  contentId?: string;
  date: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  addToCart: number;
  orders: number;
  commission: number;
  videoConcept?: string;
  hook?: string;
  angle?: string;
  ctr?: number;
  cvr?: number;
  revenue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AiInsight {
  id: string;
  type: string;
  title: string;
  content: unknown;
  productId?: string;
  confidence?: number;
  actionItems?: unknown;
  metadata?: unknown;
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

import { ExperimentRepository } from "./repositories/experiment.repository";

// Database abstraction accessing SQLite via Repository Layer
export const db = {
  products: ProductRepository,
  contentProjects: ContentRepository,
  performanceMetrics: PerformanceRepository,
  aiInsights: InsightRepository,
  settings: SettingRepository,
  scout: ScoutRepository,
  experiments: ExperimentRepository,
};

export {
  ProductRepository,
  ContentRepository,
  PerformanceRepository,
  InsightRepository,
  SettingRepository,
  ScoutRepository,
  ExperimentRepository,
};
