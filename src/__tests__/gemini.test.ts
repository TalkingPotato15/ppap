import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiResearchService } from "@/lib/gemini";
import type { ResearchRequest, ResearchResult } from "@/types";

// Mock response data
const mockGeminiResponse = {
  marketOverview: "The AI investment platform market is growing rapidly...",
  trends: ["AI-powered portfolio management", "Automated trading bots"],
  painPoints: ["Complex market analysis", "Time-consuming research"],
  existingSolutions: ["Robinhood", "Wealthfront"],
  gaps: ["Lack of AI tools for individual investors"],
  opportunities: ["AI agents for small investors"],
  sources: [
    {
      title: "AI Investment Report 2024",
      url: "https://example.com/report",
      snippet: "Market analysis shows...",
    },
  ],
};

describe("GeminiResearchService", () => {
  let service: GeminiResearchService;
  let mockGenerateContent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock for generateContent
    mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockGeminiResponse),
      },
    });

    // Mock the GoogleGenerativeAI class
    vi.mocked(GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: vi.fn(() => ({
            generateContent: mockGenerateContent,
          })),
        }) as unknown as GoogleGenerativeAI
    );

    service = new GeminiResearchService();
  });

  describe("research", () => {
    it("should return structured research result for valid query", async () => {
      const request: ResearchRequest = {
        query: "AI 투자 플랫폼",
        domain: "investment",
      };

      const result = await service.research(request);

      expect(result).toBeDefined();
      expect(result.query).toBe(request.query);
      expect(result.marketOverview).toBe(mockGeminiResponse.marketOverview);
      expect(result.trends).toEqual(mockGeminiResponse.trends);
      expect(result.painPoints).toEqual(mockGeminiResponse.painPoints);
      expect(result.existingSolutions).toEqual(
        mockGeminiResponse.existingSolutions
      );
      expect(result.gaps).toEqual(mockGeminiResponse.gaps);
      expect(result.opportunities).toEqual(mockGeminiResponse.opportunities);
      expect(result.sources).toHaveLength(1);
      expect(result.createdAt).toBeDefined();
    });

    it("should call Gemini API with correct prompt", async () => {
      const request: ResearchRequest = {
        query: "부동산 자동화",
        domain: "real_estate",
      };

      await service.research(request);

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain("부동산 자동화");
      expect(prompt).toContain("real_estate");
    });

    it("should handle JSON response wrapped in markdown code block", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => "```json\n" + JSON.stringify(mockGeminiResponse) + "\n```",
        },
      });

      const request: ResearchRequest = { query: "테스트 쿼리" };
      const result = await service.research(request);

      expect(result.marketOverview).toBe(mockGeminiResponse.marketOverview);
      expect(result.trends).toEqual(mockGeminiResponse.trends);
    });

    it("should handle malformed JSON response gracefully", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => "This is not valid JSON response",
        },
      });

      const request: ResearchRequest = { query: "테스트" };
      const result = await service.research(request);

      // Should return default structure with raw response in marketOverview
      expect(result.query).toBe("테스트");
      expect(result.marketOverview).toContain("This is not valid JSON");
      expect(result.trends).toEqual([]);
      expect(result.painPoints).toEqual([]);
    });

    it("should retry on API failure", async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({
          response: {
            text: () => JSON.stringify(mockGeminiResponse),
          },
        });

      const request: ResearchRequest = { query: "재시도 테스트" };
      const result = await service.research(request);

      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(result.marketOverview).toBe(mockGeminiResponse.marketOverview);
    });

    it("should throw error after max retries", async () => {
      mockGenerateContent.mockRejectedValue(new Error("Persistent API Error"));

      const request: ResearchRequest = { query: "실패 테스트" };

      await expect(service.research(request)).rejects.toThrow(
        /Research failed after/
      );
      expect(mockGenerateContent).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe("response parsing", () => {
    it("should handle missing fields in response", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              marketOverview: "Some overview",
              // Missing other fields
            }),
        },
      });

      const request: ResearchRequest = { query: "부분 응답" };
      const result = await service.research(request);

      expect(result.marketOverview).toBe("Some overview");
      expect(result.trends).toEqual([]);
      expect(result.painPoints).toEqual([]);
      expect(result.sources).toEqual([]);
    });

    it("should filter invalid source entries", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              ...mockGeminiResponse,
              sources: [
                { title: "Valid", url: "https://valid.com" },
                { title: "Missing URL" }, // Invalid - no url
                { url: "https://no-title.com" }, // Invalid - no title
                null, // Invalid
                "string source", // Invalid
              ],
            }),
        },
      });

      const request: ResearchRequest = { query: "소스 필터링" };
      const result = await service.research(request);

      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].title).toBe("Valid");
    });

    it("should filter non-string values from arrays", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              ...mockGeminiResponse,
              trends: ["Valid trend", 123, null, { obj: true }, "Another trend"],
            }),
        },
      });

      const request: ResearchRequest = { query: "배열 필터링" };
      const result = await service.research(request);

      expect(result.trends).toEqual(["Valid trend", "Another trend"]);
    });
  });
});

describe("GeminiResearchService - Cache Key Generation", () => {
  it("should generate consistent cache key for same query", () => {
    const service1 = new GeminiResearchService();
    const service2 = new GeminiResearchService();

    // Access private method through type casting for testing
    const getCacheKey = (service: GeminiResearchService, query: string) => {
      return (service as unknown as { getCacheKey: (q: string) => string }).getCacheKey(
        query
      );
    };

    const key1 = getCacheKey(service1, "테스트 쿼리");
    const key2 = getCacheKey(service2, "테스트 쿼리");

    expect(key1).toBe(key2);
  });

  it("should generate different cache keys for different queries", () => {
    const service = new GeminiResearchService();
    const getCacheKey = (query: string) => {
      return (service as unknown as { getCacheKey: (q: string) => string }).getCacheKey(
        query
      );
    };

    const key1 = getCacheKey("쿼리1");
    const key2 = getCacheKey("쿼리2");

    expect(key1).not.toBe(key2);
  });

  it("should normalize query before generating cache key", () => {
    const service = new GeminiResearchService();
    const getCacheKey = (query: string) => {
      return (service as unknown as { getCacheKey: (q: string) => string }).getCacheKey(
        query
      );
    };

    const key1 = getCacheKey("Test Query");
    const key2 = getCacheKey("test query");
    const key3 = getCacheKey("  TEST QUERY  ");

    expect(key1).toBe(key2);
    expect(key2).toBe(key3);
  });
});
