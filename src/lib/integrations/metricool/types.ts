// Metricool Integration Types for CommerceAI

export interface MetricoolBrand {
  id: string;
  name: string;
  blogId?: string;
  timezone?: string;
  tiktokAccount?: {
    username: string;
    connected: boolean;
    followers?: number;
  };
}

export interface MetricoolConnectionStatus {
  connected: boolean;
  brandId: string;
  blogId?: string;
  accountName: string; // "onesecond.id3"
  role: string; // "ANALYTICS + PUBLISH"
  statusLabel: "CONNECTED" | "NOT CONFIGURED" | "ERROR";
  isMock: boolean;
  error?: string;
}

export interface MetricoolPostPayload {
  brandId?: string;
  targetAccount: string; // "onesecond.id3"
  text: string; // caption + hashtags
  videoUrl: string; // video url or media reference
  dateTime: string; // ISO 8601 or YYYY-MM-DD HH:mm
  privacy?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY";
  aiGeneratedContent?: boolean;
  title?: string;
}

export interface MetricoolScheduledPost {
  id: string;
  externalId?: string;
  targetAccount: string;
  dateTime: string;
  text: string;
  videoUrl?: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ERROR";
  network: "TIKTOK";
  error?: string;
}

export interface MetricoolTikTokPostAnalytics {
  externalPostId: string;
  publishedDate: string;
  videoUrl: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  watchRate: number; // 0 to 1 (full video watched rate)
  averageWatchTime: number; // in seconds
  engagementRate: number; // 0 to 1
  forYouViews: number;
  searchViews: number;
  soundViews: number;
  profileViews: number;
  orders?: number;
  revenue?: number;
  dataSource: "METRICOOL REAL DATA" | "AI ESTIMATE" | "PERFORMANCE BASED";
}

export interface MetricoolBestTimeSlot {
  hour: number; // 0 - 23
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  score: number; // 0 - 100
  recommendedLabel: string; // e.g. "19:00 - 21:00 WIB"
  isPeak: boolean;
  dataSource: "METRICOOL REAL DATA" | "AI ESTIMATE";
  dayName?: string;
  peakAudience?: string;
}

export type BestTimeSlot = MetricoolBestTimeSlot;

export interface SyncTikTokResult {
  success: boolean;
  syncedAt: string;
  accountName: string;
  totalFetched: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  posts: MetricoolTikTokPostAnalytics[];
  dataSource: "METRICOOL REAL DATA" | "AI ESTIMATE";
  error?: string;
}

export interface ExperimentComparisonGroup {
  dimension: "DIFFERENT_HOOKS" | "DIFFERENT_ANGLES";
  productId: string;
  productName: string;
  fixedValue: string; // The constant angle or constant hook
  experiments: {
    id: string;
    name: string;
    hook: string;
    angle: string;
    views: number;
    engagementRate: number;
    watchRate: number;
    averageWatchTime: number;
    orders: number;
    revenue: number;
    isWinner: boolean;
  }[];
  winnerId?: string;
  winnerReason?: string;
  winnerExperiment?: {
    id: string;
    name: string;
    hook: string;
    angle: string;
    views: number;
    engagementRate: number;
    watchRate: number;
    orders: number;
    revenue: number;
    isWinner: boolean;
  };
  whatWorked?: string;
  whatFailed?: string;
  nextAction?: string;
}

export interface ExperimentAnalysisResult {
  totalExperiments: number;
  measuringCount: number;
  winnerCount: number;
  comparisons: ExperimentComparisonGroup[];
  whatWorked: string[];
  whatFailed: string[];
  nextActions: string[];
}
