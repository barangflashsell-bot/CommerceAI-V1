// AI Provider & Decision Engine Types for CommerceAI

export interface ProductAnalysisInput {
  name: string;
  category: string;
  price: number;
  commissionRate: number;
  targetAudience: string;
  description: string;
  advantages: string;
  problemSolved: string;
}

export interface ProductAnalysisResult {
  opportunityScore: number;
  breakdown: {
    demandPotential: number;
    contentPotential: number;
    problemSolutionStrength: number;
    purchaseIntent: number;
    commissionAttractiveness: number;
    competitionRisk: number;
  };
  reasoning: string;
  targetAudience: string[];
  painPoints: string[];
  buyingTriggers: string[];
  sellingProposition: string;
  contentAngles: ContentAngle[];
  whyPromote?: string;
}

export interface ContentAngle {
  name: string;
  description: string;
  score: number;
  reason: string;
}

export interface HookItem {
  id: number;
  text: string;
  type: string;
  strength: string;
}

export interface AngleItem {
  id: number;
  name: string;
  description: string;
  targetEmotion: string;
  score: number;
}

export interface ConceptItem {
  id: number;
  title: string;
  description: string;
  hook: string;
  angle: string;
  flow: string;
  expectedImpact: string;
}

export interface ContentGenerationInput {
  productName: string;
  productDescription: string;
  productAdvantages: string;
  problemSolved: string;
  targetAudience: string;
  platform: string;
  duration: string;
  style: string;
  objective: string;
}

export interface ContentGenerationResult {
  hooks: HookItem[];
  angles: AngleItem[];
  concepts: ConceptItem[];
  bestConcept: {
    index: number;
    reason: string;
  };
}

export interface StoryboardInput {
  productName: string;
  productDescription: string;
  concept: ConceptItem;
  duration: string;
  platform: string;
  style: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  timeRange: string;
  visual: string;
  camera: string;
  action: string;
  purpose: string;
}

export interface StoryboardResult {
  scenes: StoryboardScene[];
  productConsistencyRules: string[];
  totalDuration: string;
}

export interface VideoPromptResult {
  duration: string;
  aspect_ratio: string;
  style: string;
  product_consistency: {
    reference_image: boolean;
    preserve_exact_product: boolean;
    do_not_redesign: boolean;
  };
  scenes: {
    time: string;
    visual: string;
    camera: string;
    action: string;
    lighting: string;
  }[];
  negative_prompt: string[];
}

export interface PerformanceData {
  productName: string;
  contentId: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  addToCart: number;
  orders: number;
  commission: number;
  videoConcept: string;
  hook: string;
  angle: string;
  ctr: number;
  cvr: number;
}

// Aggregated Decision Engine Metrics
export interface AggregatedAccountMetrics {
  totalViews: number;
  totalClicks: number;
  totalOrders: number;
  totalRevenue: number;
  avgCTR: number;
  avgCVR: number;
}

export interface ProductPerformanceMetric {
  productId: string;
  productName: string;
  productViews: number;
  productClicks: number;
  productOrders: number;
  productRevenue: number;
  productCTR: number;
  productCVR: number;
  performanceScore: number;
}

export interface ContentPerformanceItem {
  contentId: string;
  productName: string;
  platform: string;
  hook: string;
  angle: string;
  videoConcept: string;
  contentViews: number;
  contentClicks: number;
  contentOrders: number;
  contentRevenue: number;
  contentCTR: number;
  contentCVR: number;
  performanceScore: number;
}

export interface AggregatedPerformanceData {
  account: AggregatedAccountMetrics;
  products: ProductPerformanceMetric[];
  contents: ContentPerformanceItem[];
  recordCount: number;
}

// Winning Pattern Result
export interface WinningPatternResult {
  winningProduct: { name: string; score: number; reason: string } | null;
  winningHook: { text: string; reason: string } | null;
  winningAngle: { name: string; reason: string } | null;
  winningContentType: { type: string; reason: string } | null;
  winningPlatform: { name: string; reason: string } | null;
  winningDuration: { duration: string; reason: string } | null;
  losses: { content: string; views: number; cvr: number; reason: string }[];
  patterns: string[];
  opportunities: string[];
}

// Data Sufficiency
export type SufficiencyTier = "insufficient" | "early" | "meaningful" | "strong";

export interface DataSufficiencyResult {
  recordCount: number;
  tier: SufficiencyTier;
  confidenceLabel: string;
  message: string;
}

// Next Content Concept
export interface NextContentConcept {
  title: string;
  reason: string;
  hook: string;
  angle: string;
  concept: string;
  expectedGoal: string;
  basedOnPattern: string;
}

export interface NextContentResult {
  concepts: NextContentConcept[];
  strategySummary: string;
}

// Performance Analysis
export interface PerformanceAnalysisResult {
  bestProduct: { name: string; reason: string } | null;
  bestHook: { text: string; reason: string } | null;
  bestAngle: { name: string; reason: string } | null;
  bestVideoType: { type: string; reason: string } | null;
  bestPlatform: { name: string; reason: string } | null;
  highestCTR: { content: string; value: number } | null;
  highestCVR: { content: string; value: number } | null;
  highestOrder: { content: string; value: number } | null;
  highViewsLowConversion: { content: string; views: number; cvr: number }[];
  lowViewsHighConversion: { content: string; views: number; cvr: number }[];
  whatWorked: string[];
  whatFailed: string[];
  why: string[];
  opportunities?: string[];
  nextActions: string[];
}

export interface AIInsightResult {
  sufficiency: DataSufficiencyResult;
  wins: WinningPatternResult;
  whatWorked: string[];
  whatFailed: string[];
  why: string[];
  opportunities: string[];
  nextActions: string[];
  recommendation: {
    priorityProduct: string;
    headline: string;
    reason: string;
    actionCTA: string;
  };
  nextContent: NextContentResult;
}

// Backward compatibility with previous RecommendationResult
export interface RecommendationResult {
  winningPatterns: {
    product: string;
    hook: string;
    angle: string;
    duration: string;
    result: string;
    improvement: string;
  }[];
  recommendedContent: {
    title: string;
    description: string;
    product: string;
    angle: string;
    hook: string;
    reason: string;
  }[];
  summary: string;
}

// The Unified AI Provider Interface (9 Methods)
export interface AIProvider {
  name: string;
  isMock: boolean;

  // 1. Analyze Product
  analyzeProduct(input: ProductAnalysisInput): Promise<ProductAnalysisResult>;

  // 2. Generate Hooks
  generateHooks(input: { productName: string; problemSolved: string; targetAudience: string }): Promise<HookItem[]>;

  // 3. Generate Angles
  generateAngles(input: { productName: string; description: string; problemSolved: string }): Promise<AngleItem[]>;

  // 4. Generate Content Strategy
  generateContentStrategy(input: ContentGenerationInput): Promise<ContentGenerationResult>;
  // Alias for backward compatibility
  generateContent(input: ContentGenerationInput): Promise<ContentGenerationResult>;

  // 5. Generate Storyboard
  generateStoryboard(input: StoryboardInput): Promise<StoryboardResult>;

  // 6. Generate Video Prompt
  generateVideoPrompt(storyboard: StoryboardResult, input: StoryboardInput): Promise<VideoPromptResult>;

  // 7. Analyze Performance
  analyzePerformance(data: PerformanceData[]): Promise<PerformanceAnalysisResult>;

  // 8. Generate Insights (Decision Engine)
  generateInsights(
    aggregated: AggregatedPerformanceData,
    patterns: WinningPatternResult,
    sufficiency: DataSufficiencyResult
  ): Promise<AIInsightResult>;

  // 9. Generate Next Content (5 Concepts grounded in data)
  generateNextContent(
    winningPatterns: WinningPatternResult,
    aggregated: AggregatedPerformanceData
  ): Promise<NextContentResult>;

  // Backward compatibility
  generateRecommendations(data: PerformanceData[]): Promise<RecommendationResult>;
}

// Phase 4: Product Scouting Engine Types
export interface ProductScoutInput {
  name: string;
  category: string;
  price: number;
  commissionRate: number;
  description: string;
  targetBuyer: string;
  productUrl: string;
  imageUrl?: string;
}

export interface ScoutScoreBreakdown {
  demandPotential: number; // 0-100
  contentPotential: number; // 0-100
  purchaseIntent: number; // 0-100
  commissionAttractiveness: number; // 0-100
  competitionRisk: number; // 0-100 (higher = healthier/lower risk)
  problemStrength: number; // 0-100
  demonstrationStrength: number; // 0-100
}

export type ScoutCategory = "HIGH OPPORTUNITY" | "TEST" | "LOW SIGNAL" | "AVOID";

export type ProductLifecycleStatus = "DISCOVERED" | "TESTING" | "OPTIMIZE" | "SCALE" | "KILL";

export interface TestingPlanSuccessCriteria {
  minimumCTR: number; // e.g. 0.02 (2%)
  minimumCVR: number; // e.g. 0.03 (3%)
  minimumRPM?: number; // e.g. 15000 IDR per 1000 views
}

export interface TestingPlanConfig {
  testDays: number;
  videoCount: number;
  angles: string[];
  hooks: string[];
  platforms: string[];
  successCriteria: TestingPlanSuccessCriteria;
  thresholdType: string; // "AI TESTING THRESHOLD"
  userCustomThreshold?: TestingPlanSuccessCriteria;
}

export interface ProductScoutResult {
  score: number; // 0-100
  category: ScoutCategory;
  breakdown: ScoutScoreBreakdown;
  status: ProductLifecycleStatus;
  why: string;
  risks: string[];
  bestAngles: string[];
  testingPlan: TestingPlanConfig;
  expectedGoal: string;
  dataSource: "AI ESTIMATE" | "PERFORMANCE BASED";
}

export interface ProductDecisionRecommendation {
  productId: string;
  productName: string;
  status: ProductLifecycleStatus;
  recommendation: "TEST THIS PRODUCT" | "SCALE THIS PRODUCT" | "OPTIMIZE CONTENT" | "KILL THIS PRODUCT";
  subFocus?: "OPTIMIZE PURCHASE INTENT" | "OPTIMIZE HOOK / DISTRIBUTION" | "VALIDATE MARKET RESPONSE" | "MAINTAIN WINNING FORMULA";
  reasoning: string;
  dataSource: "AI ESTIMATE" | "PERFORMANCE BASED";
  metrics: {
    views: number;
    clicks: number;
    orders: number;
    revenue: number;
    ctr: number;
    cvr: number;
    rpm: number; // RevenuePer1000Views
    sampleCount: number;
  };
  isHiddenGem: boolean;
  hiddenGemReason?: string;
  testingPlan?: TestingPlanConfig;
}

export interface ProductPortfolioSummary {
  totalProducts: number;
  counts: {
    scale: number;
    testing: number;
    optimize: number;
    kill: number;
    discovered: number;
    hiddenGems: number;
  };
  products: {
    id: string;
    name: string;
    category: string;
    price: number;
    commissionRate: number;
    status: ProductLifecycleStatus;
    score: number;
    rpm: number;
    views: number;
    orders: number;
    revenue: number;
    ctr: number;
    cvr: number;
    isHiddenGem: boolean;
    sampleCount: number;
    dataSource: "AI ESTIMATE" | "PERFORMANCE BASED";
  }[];
}
