import { describe, it, expect, vi, beforeEach } from "vitest";
import googleTrends from "google-trends-api";
import { GoogleTrendsService } from "@/lib/trends";
import type { TrendingTopic } from "@/types";

// Mock Google Trends API response
const mockTrendsResponse = {
  default: {
    trendingSearchesDays: [
      {
        trendingSearches: [
          {
            title: { query: "AI 투자" },
            formattedTraffic: "100K+",
            relatedQueries: [{ query: "로보어드바이저" }, { query: "자동 투자" }],
          },
          {
            title: { query: "부동산 전망" },
            formattedTraffic: "50K+",
            relatedQueries: [{ query: "아파트 가격" }],
          },
          {
            query: "교육 테크", // Alternative format without title object
            formattedTraffic: "20K+",
          },
        ],
      },
    ],
  },
};

// Mock Supabase
const mockSupabaseInsert = vi.fn(() => Promise.resolve({ error: null }));
const mockSupabaseDelete = vi.fn(() => ({
  lt: vi.fn(() => Promise.resolve({ error: null })),
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: mockSupabaseInsert,
      delete: mockSupabaseDelete,
    })),
  })),
}));

describe("GoogleTrendsService", () => {
  let service: GoogleTrendsService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock google-trends-api
    vi.mocked(googleTrends.dailyTrends).mockResolvedValue(
      JSON.stringify(mockTrendsResponse)
    );

    service = new GoogleTrendsService();
  });

  describe("collectTrends", () => {
    it("should collect and parse trending topics", async () => {
      const result = await service.collectTrends();

      expect(result).toBeDefined();
      expect(result.topics).toHaveLength(3);
      expect(result.region).toBe("KR");
      expect(result.collectedAt).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it("should parse topic titles correctly", async () => {
      const result = await service.collectTrends();

      expect(result.topics[0].title).toBe("AI 투자");
      expect(result.topics[1].title).toBe("부동산 전망");
      expect(result.topics[2].title).toBe("교육 테크"); // Fallback to query field
    });

    it("should assign correct ranks", async () => {
      const result = await service.collectTrends();

      expect(result.topics[0].rank).toBe(1);
      expect(result.topics[1].rank).toBe(2);
      expect(result.topics[2].rank).toBe(3);
    });

    it("should extract traffic information", async () => {
      const result = await service.collectTrends();

      expect(result.topics[0].traffic).toBe("100K+");
      expect(result.topics[1].traffic).toBe("50K+");
    });

    it("should extract related queries", async () => {
      const result = await service.collectTrends();

      expect(result.topics[0].relatedQueries).toContain("로보어드바이저");
      expect(result.topics[0].relatedQueries).toContain("자동 투자");
      expect(result.topics[1].relatedQueries).toContain("아파트 가격");
    });

    it("should save topics to Supabase", async () => {
      await service.collectTrends();

      expect(mockSupabaseInsert).toHaveBeenCalled();
    });

    it("should retry on API failure with exponential backoff", async () => {
      vi.mocked(googleTrends.dailyTrends)
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce(JSON.stringify(mockTrendsResponse));

      const result = await service.collectTrends();

      expect(googleTrends.dailyTrends).toHaveBeenCalledTimes(2);
      expect(result.topics).toHaveLength(3);
    });

    it("should throw error after max retries", async () => {
      vi.mocked(googleTrends.dailyTrends).mockRejectedValue(
        new Error("Persistent Error")
      );

      await expect(service.collectTrends()).rejects.toThrow(
        /Collection failed after/
      );
      expect(googleTrends.dailyTrends).toHaveBeenCalledTimes(3);
    });

    it("should apply category filter when provided", async () => {
      await service.collectTrends("investment");

      expect(googleTrends.dailyTrends).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 7, // Finance category code
        })
      );
    });
  });

  describe("getRandomTopic", () => {
    it("should return default topic when database is empty", async () => {
      const result = await service.getRandomTopic();

      expect(result).toBeDefined();
      expect(result?.id).toBe("default_topic");
      expect(result?.rank).toBe(1);
    });
  });

  describe("getTopics", () => {
    it("should return empty array when no data", async () => {
      const result = await service.getTopics();

      expect(result).toEqual([]);
    });
  });

  describe("createJob", () => {
    it("should create a job with PENDING status", () => {
      const job = service.createJob("PENDING");

      expect(job.status).toBe("PENDING");
      expect(job.id).toBeDefined();
      expect(job.startedAt).toBeDefined();
      expect(job.topicsCount).toBe(0);
    });

    it("should create a job with COMPLETED status and completion time", () => {
      const job = service.createJob("COMPLETED", 25);

      expect(job.status).toBe("COMPLETED");
      expect(job.completedAt).toBeDefined();
      expect(job.topicsCount).toBe(25);
    });

    it("should create a job with FAILED status and error message", () => {
      const job = service.createJob("FAILED", 0, "Collection failed");

      expect(job.status).toBe("FAILED");
      expect(job.errorMessage).toBe("Collection failed");
      expect(job.completedAt).toBeDefined();
    });
  });

  describe("Category Mapping", () => {
    it("should map investment to correct category code", async () => {
      await service.collectTrends("investment");

      expect(googleTrends.dailyTrends).toHaveBeenCalledWith(
        expect.objectContaining({ category: 7 })
      );
    });

    it("should map education to correct category code", async () => {
      await service.collectTrends("education");

      expect(googleTrends.dailyTrends).toHaveBeenCalledWith(
        expect.objectContaining({ category: 958 })
      );
    });

    it("should map real_estate to correct category code", async () => {
      await service.collectTrends("real_estate");

      expect(googleTrends.dailyTrends).toHaveBeenCalledWith(
        expect.objectContaining({ category: 29 })
      );
    });
  });
});

describe("GoogleTrendsService - Default Topics", () => {
  it("should return one of the predefined default topics", () => {
    const service = new GoogleTrendsService();
    const defaultTopics = [
      "AI 투자 플랫폼",
      "부동산 자동화",
      "교육 테크",
      "헬스케어 AI",
      "핀테크 스타트업",
    ];

    // Access private method
    const getDefaultTopic = () => {
      return (
        service as unknown as { getDefaultTopic: () => TrendingTopic }
      ).getDefaultTopic();
    };

    const topic = getDefaultTopic();

    expect(defaultTopics).toContain(topic.title);
    expect(topic.id).toBe("default_topic");
    expect(topic.rank).toBe(1);
  });
});
