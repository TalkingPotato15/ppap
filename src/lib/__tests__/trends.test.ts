import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock google-trends-api
vi.mock("google-trends-api", () => ({
  default: {
    dailyTrends: vi.fn(),
  },
}));

// Mock supabase
vi.mock("../supabase", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({
              data: [{ topic_name: "AI Technology" }],
              error: null,
            }),
          })),
        })),
      })),
    })),
  })),
}));

import { fetchDailyTrends, getRandomTrendingTopic } from "../trends";
import googleTrends from "google-trends-api";

describe("trends service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchDailyTrends", () => {
    it("should parse Google Trends response correctly", async () => {
      const mockResponse = JSON.stringify({
        default: {
          trendingSearchesDays: [
            {
              trendingSearches: [
                { title: { query: "AI News" } },
                { title: { query: "Tech Update" } },
              ],
            },
          ],
        },
      });

      vi.mocked(googleTrends.dailyTrends).mockResolvedValue(mockResponse);

      const trends = await fetchDailyTrends("US");

      expect(trends).toHaveLength(2);
      expect(trends[0]).toEqual({ name: "AI News", rank: 1 });
      expect(trends[1]).toEqual({ name: "Tech Update", rank: 2 });
    });

    it("should return empty array on error", async () => {
      vi.mocked(googleTrends.dailyTrends).mockRejectedValue(new Error("API Error"));

      const trends = await fetchDailyTrends("US");

      expect(trends).toEqual([]);
    });

    it("should limit results to 20 topics", async () => {
      const mockSearches = Array.from({ length: 30 }, (_, i) => ({
        title: { query: `Topic ${i + 1}` },
      }));

      const mockResponse = JSON.stringify({
        default: {
          trendingSearchesDays: [{ trendingSearches: mockSearches }],
        },
      });

      vi.mocked(googleTrends.dailyTrends).mockResolvedValue(mockResponse);

      const trends = await fetchDailyTrends("US");

      expect(trends).toHaveLength(20);
    });
  });

  describe("getRandomTrendingTopic", () => {
    it("should return a random topic from database", async () => {
      const topic = await getRandomTrendingTopic();

      expect(topic).toBe("AI Technology");
    });
  });
});
