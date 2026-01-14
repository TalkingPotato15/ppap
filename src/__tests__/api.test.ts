import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Create mock functions
const mockResearch = vi.fn();
const mockGetTopics = vi.fn();
const mockGetRandomTopic = vi.fn();
const mockCollectTrends = vi.fn();
const mockCreateJob = vi.fn();

// Mock services before importing routes
vi.mock("@/lib/gemini", () => ({
  getGeminiService: () => ({
    research: mockResearch,
  }),
  GeminiResearchService: vi.fn(),
}));

vi.mock("@/lib/trends", () => ({
  getTrendsService: () => ({
    getTopics: mockGetTopics,
    getRandomTopic: mockGetRandomTopic,
    collectTrends: mockCollectTrends,
    createJob: mockCreateJob,
  }),
  GoogleTrendsService: vi.fn(),
}));

// Import after mocking
import { POST as researchPost } from "@/app/api/research/route";
import { GET as trendsGet } from "@/app/api/trends/route";
import { GET as trendsRandomGet } from "@/app/api/trends/random/route";

describe("POST /api/research", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 for missing query", async () => {
    const request = new NextRequest("http://localhost/api/research", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await researchPost(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain("query");
  });

  it("should return 400 for invalid query type", async () => {
    const request = new NextRequest("http://localhost/api/research", {
      method: "POST",
      body: JSON.stringify({ query: 123 }),
    });

    const response = await researchPost(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("should return 400 for query too short", async () => {
    const request = new NextRequest("http://localhost/api/research", {
      method: "POST",
      body: JSON.stringify({ query: "a" }),
    });

    const response = await researchPost(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("2 and 500");
  });

  it("should return 400 for query too long", async () => {
    const longQuery = "a".repeat(501);
    const request = new NextRequest("http://localhost/api/research", {
      method: "POST",
      body: JSON.stringify({ query: longQuery }),
    });

    const response = await researchPost(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("2 and 500");
  });

  it("should return research result for valid query", async () => {
    const mockResult = {
      query: "AI 투자",
      marketOverview: "Market overview...",
      trends: ["trend1"],
      painPoints: ["pain1"],
      existingSolutions: ["solution1"],
      gaps: ["gap1"],
      opportunities: ["opportunity1"],
      sources: [],
      createdAt: "2024-01-15T00:00:00Z",
    };

    mockResearch.mockResolvedValueOnce(mockResult);

    const request = new NextRequest("http://localhost/api/research", {
      method: "POST",
      body: JSON.stringify({ query: "AI 투자", domain: "investment" }),
    });

    const response = await researchPost(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.query).toBe("AI 투자");
  });

  it("should return 504 for timeout error", async () => {
    mockResearch.mockRejectedValueOnce(new Error("Request timeout"));

    const request = new NextRequest("http://localhost/api/research", {
      method: "POST",
      body: JSON.stringify({ query: "test query" }),
    });

    const response = await researchPost(request);
    const json = await response.json();

    expect(response.status).toBe(504);
    expect(json.error).toContain("timeout");
  });

  it("should return 429 for rate limit error", async () => {
    mockResearch.mockRejectedValueOnce(new Error("rate limit exceeded"));

    const request = new NextRequest("http://localhost/api/research", {
      method: "POST",
      body: JSON.stringify({ query: "test query" }),
    });

    const response = await researchPost(request);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json.error).toContain("Rate limit");
  });

  it("should return 500 for generic error", async () => {
    mockResearch.mockRejectedValueOnce(new Error("Unknown error"));

    const request = new NextRequest("http://localhost/api/research", {
      method: "POST",
      body: JSON.stringify({ query: "test query" }),
    });

    const response = await researchPost(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});

describe("GET /api/trends", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return topics list", async () => {
    const mockTopics = [
      {
        id: "1",
        title: "Topic 1",
        rank: 1,
        relatedQueries: [],
        collectedAt: "2024-01-15T00:00:00Z",
      },
    ];

    mockGetTopics.mockResolvedValueOnce(mockTopics);

    const request = new NextRequest("http://localhost/api/trends");

    const response = await trendsGet(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.topics).toHaveLength(1);
    expect(json.data.total).toBe(1);
  });

  it("should apply category filter", async () => {
    mockGetTopics.mockResolvedValueOnce([]);

    const request = new NextRequest(
      "http://localhost/api/trends?category=investment"
    );

    await trendsGet(request);

    expect(mockGetTopics).toHaveBeenCalledWith("investment", 10);
  });

  it("should apply limit parameter", async () => {
    mockGetTopics.mockResolvedValueOnce([]);

    const request = new NextRequest("http://localhost/api/trends?limit=5");

    await trendsGet(request);

    expect(mockGetTopics).toHaveBeenCalledWith(undefined, 5);
  });

  it("should cap limit at 50", async () => {
    mockGetTopics.mockResolvedValueOnce([]);

    const request = new NextRequest("http://localhost/api/trends?limit=100");

    await trendsGet(request);

    expect(mockGetTopics).toHaveBeenCalledWith(undefined, 50);
  });

  it("should return 500 on error", async () => {
    mockGetTopics.mockRejectedValueOnce(new Error("DB Error"));

    const request = new NextRequest("http://localhost/api/trends");

    const response = await trendsGet(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});

describe("GET /api/trends/random", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a random topic", async () => {
    const mockTopic = {
      id: "1",
      title: "Random Topic",
      rank: 5,
      relatedQueries: ["related"],
      traffic: "10K+",
      collectedAt: "2024-01-15T00:00:00Z",
    };

    mockGetRandomTopic.mockResolvedValueOnce(mockTopic);

    const request = new NextRequest("http://localhost/api/trends/random");

    const response = await trendsRandomGet(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.topic.title).toBe("Random Topic");
    expect(json.data.collectedAt).toBeDefined();
  });

  it("should apply category filter", async () => {
    mockGetRandomTopic.mockResolvedValueOnce({
      id: "1",
      title: "Topic",
      rank: 1,
      relatedQueries: [],
      collectedAt: "2024-01-15T00:00:00Z",
    });

    const request = new NextRequest(
      "http://localhost/api/trends/random?category=education"
    );

    await trendsRandomGet(request);

    expect(mockGetRandomTopic).toHaveBeenCalledWith("education");
  });

  it("should return 404 when no topic available", async () => {
    mockGetRandomTopic.mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost/api/trends/random");

    const response = await trendsRandomGet(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toContain("No trending topics");
  });

  it("should return 500 on error", async () => {
    mockGetRandomTopic.mockRejectedValueOnce(new Error("Service Error"));

    const request = new NextRequest("http://localhost/api/trends/random");

    const response = await trendsRandomGet(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
