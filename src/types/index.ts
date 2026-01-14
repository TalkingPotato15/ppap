// ============================================
// 001 - Gemini Deep Research Types
// ============================================

export interface ResearchRequest {
  query: string;
  domain?: "investment" | "education" | "real_estate" | "technology" | "health";
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface ResearchResult {
  query: string;
  marketOverview: string;
  trends: string[];
  painPoints: string[];
  existingSolutions: string[];
  gaps: string[];
  opportunities: string[];
  sources: Source[];
  createdAt: string;
  cached?: boolean;
}

// ============================================
// 002 - Google Trends Types
// ============================================

export interface TrendingTopic {
  id: string;
  title: string;
  rank: number;
  category?: string;
  relatedQueries: string[];
  traffic?: string;
  collectedAt: string;
}

export interface TrendCollection {
  topics: TrendingTopic[];
  region: string;
  collectedAt: string;
  expiresAt: string;
}

export interface CollectionJob {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  startedAt?: string;
  completedAt?: string;
  topicsCount: number;
  errorMessage?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RandomTrendResponse {
  topic: TrendingTopic;
  collectedAt: string;
}

export interface TrendsListResponse {
  topics: TrendingTopic[];
  total: number;
  collectedAt: string;
}

// ============================================
// Category Mapping
// ============================================

export const CATEGORY_CODES: Record<string, number> = {
  investment: 7,      // Finance
  education: 958,     // Education
  real_estate: 29,    // Real Estate
  technology: 5,      // Computers & Electronics
  health: 45,         // Health
} as const;

export type CategoryType = keyof typeof CATEGORY_CODES;
