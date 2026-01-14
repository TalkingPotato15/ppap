import googleTrends from "google-trends-api";
import { createServerClient } from "./supabase";
import type {
  TrendingTopic,
  TrendCollection,
  CollectionJob,
  CategoryType,
} from "@/types";
import type { TrendingTopicRow } from "@/types/database";
import { randomUUID } from "crypto";

const TRENDS_REGION = process.env.TRENDS_REGION || "KR";
const TRENDS_MAX_TOPICS = parseInt(process.env.TRENDS_MAX_TOPICS || "50");
const TRENDS_CACHE_TTL = parseInt(
  process.env.TRENDS_COLLECTION_INTERVAL || "604800"
); // 1 week
const MAX_RETRIES = 3;

/**
 * Google Trends Collector Service
 * 002 spec 구현
 */
export class GoogleTrendsService {
  /**
   * US-001: 트렌딩 토픽 주기적 수집
   */
  async collectTrends(category?: CategoryType): Promise<TrendCollection> {
    const jobId = randomUUID();
    console.log(`[GoogleTrends] Starting collection job: ${jobId}`);

    let lastError: Error | null = null;

    // US-004: 재시도 로직 (지수 백오프)
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const topics = await this.fetchTrendingTopics(category);

        // Supabase에 저장
        await this.saveTopics(topics);

        const collection: TrendCollection = {
          topics,
          region: TRENDS_REGION,
          collectedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + TRENDS_CACHE_TTL * 1000
          ).toISOString(),
        };

        console.log(
          `[GoogleTrends] Collection completed: ${topics.length} topics`
        );
        return collection;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `[GoogleTrends] Attempt ${attempt + 1} failed:`,
          error
        );

        if (attempt < MAX_RETRIES - 1) {
          // 지수 백오프: 1초, 2초, 4초
          const delay = 1000 * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Collection failed after ${MAX_RETRIES} attempts: ${lastError?.message}`
    );
  }

  /**
   * Google Trends API에서 트렌딩 토픽 가져오기
   */
  private async fetchTrendingTopics(
    category?: CategoryType
  ): Promise<TrendingTopic[]> {
    const options: {
      trendDate: Date;
      geo: string;
      category?: number;
    } = {
      trendDate: new Date(),
      geo: TRENDS_REGION,
    };

    // US-003: 카테고리별 필터링
    if (category) {
      const categoryCode = this.getCategoryCode(category);
      if (categoryCode) {
        options.category = categoryCode;
      }
    }

    const results = await googleTrends.dailyTrends(options);
    const parsed = JSON.parse(results);

    const topics: TrendingTopic[] = [];
    const trendingSearches =
      parsed.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

    for (let i = 0; i < Math.min(trendingSearches.length, TRENDS_MAX_TOPICS); i++) {
      const trend = trendingSearches[i];
      const topic: TrendingTopic = {
        id: `trend_${randomUUID().substring(0, 8)}`,
        title: trend.title?.query || trend.query || "Unknown",
        rank: i + 1,
        category: category || undefined,
        relatedQueries: this.extractRelatedQueries(trend),
        traffic: trend.formattedTraffic || undefined,
        collectedAt: new Date().toISOString(),
      };
      topics.push(topic);
    }

    return topics;
  }

  /**
   * 관련 검색어 추출
   */
  private extractRelatedQueries(trend: {
    relatedQueries?: { query: string }[];
  }): string[] {
    if (!trend.relatedQueries || !Array.isArray(trend.relatedQueries)) {
      return [];
    }
    return trend.relatedQueries
      .slice(0, 5)
      .map((rq: { query: string }) => rq.query)
      .filter(Boolean);
  }

  /**
   * Supabase에 토픽 저장
   */
  private async saveTopics(topics: TrendingTopic[]): Promise<void> {
    const supabase = createServerClient();

    // 기존 토픽 삭제 (최신 데이터로 교체)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await supabase
      .from("trending_topics")
      .delete()
      .lt("collected_at", oneWeekAgo.toISOString());

    // 새 토픽 삽입
    const rows = topics.map((topic) => ({
      topic_name: topic.title,
      rank: topic.rank,
      category: topic.category,
      related_queries: topic.relatedQueries,
      traffic: topic.traffic,
      collected_at: topic.collectedAt,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("trending_topics") as any).insert(rows);

    if (error) {
      throw new Error(`Failed to save topics: ${error.message}`);
    }
  }

  /**
   * US-002: 랜덤 토픽 반환 ("Got no Clue?" 버튼용)
   */
  async getRandomTopic(category?: string): Promise<TrendingTopic | null> {
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("trending_topics") as any).select("*");

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // 캐시된 토픽이 없으면 기본 토픽 반환
      return this.getDefaultTopic();
    }

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * data.length);
    const row = data[randomIndex] as TrendingTopicRow;

    return {
      id: row.id,
      title: row.topic_name,
      rank: row.rank || 0,
      category: row.category || undefined,
      relatedQueries: row.related_queries || [],
      traffic: row.traffic || undefined,
      collectedAt: row.collected_at,
    };
  }

  /**
   * US-002: 토픽 목록 반환
   */
  async getTopics(
    category?: string,
    limit: number = 10
  ): Promise<TrendingTopic[]> {
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("trending_topics") as any)
      .select("*")
      .order("rank", { ascending: true })
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return (data as TrendingTopicRow[]).map((row) => ({
      id: row.id,
      title: row.topic_name,
      rank: row.rank || 0,
      category: row.category || undefined,
      relatedQueries: row.related_queries || [],
      traffic: row.traffic || undefined,
      collectedAt: row.collected_at,
    }));
  }

  /**
   * 기본 토픽 (캐시가 비어있을 때)
   */
  private getDefaultTopic(): TrendingTopic {
    const defaultTopics = [
      "AI 투자 플랫폼",
      "부동산 자동화",
      "교육 테크",
      "헬스케어 AI",
      "핀테크 스타트업",
    ];

    const randomIndex = Math.floor(Math.random() * defaultTopics.length);

    return {
      id: "default_topic",
      title: defaultTopics[randomIndex],
      rank: 1,
      relatedQueries: [],
      collectedAt: new Date().toISOString(),
    };
  }

  /**
   * US-003: 카테고리 코드 변환
   */
  private getCategoryCode(category: CategoryType): number | undefined {
    const codes: Record<string, number> = {
      investment: 7,
      education: 958,
      real_estate: 29,
      technology: 5,
      health: 45,
    };
    return codes[category];
  }

  /**
   * 대기 유틸리티
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 수집 작업 상태 생성
   */
  createJob(
    status: CollectionJob["status"],
    topicsCount: number = 0,
    errorMessage?: string
  ): CollectionJob {
    return {
      id: randomUUID(),
      status,
      startedAt: new Date().toISOString(),
      completedAt: status === "COMPLETED" || status === "FAILED" ? new Date().toISOString() : undefined,
      topicsCount,
      errorMessage,
    };
  }
}

// 싱글톤 인스턴스
let trendsService: GoogleTrendsService | null = null;

export function getTrendsService(): GoogleTrendsService {
  if (!trendsService) {
    trendsService = new GoogleTrendsService();
  }
  return trendsService;
}
