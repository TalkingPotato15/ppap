import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IdeationService } from "@/lib/ideation";
import type { ResearchResult, AIAgentIdea } from "@/types";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    })),
  })),
}));

// Mock research result
const mockResearchResult: ResearchResult = {
  query: "AI 투자 자동화",
  marketOverview: "The AI investment automation market is rapidly growing...",
  trends: ["Automated portfolio management", "AI trading bots", "Robo-advisors"],
  painPoints: ["Complex market analysis", "Time-consuming research", "High fees"],
  existingSolutions: ["Wealthfront", "Betterment", "Robinhood"],
  gaps: ["Lack of personalized AI agents", "No real-time market analysis"],
  opportunities: ["AI agents for individual investors", "Automated trading strategies"],
  sources: [{ title: "Report", url: "https://example.com" }],
  createdAt: "2024-01-15T00:00:00Z",
};

// Mock Gemini response for ideas
const mockIdeasResponse = [
  {
    title: "InvestBot AI",
    description: "An AI agent that analyzes market trends and suggests investment opportunities.",
    valueProposition: "Save time and money with automated investment analysis",
    agentArchitecture: {
      agentType: "multi",
      coreCapabilities: ["Market analysis", "Portfolio optimization", "Risk assessment"],
      dataSources: ["Stock APIs", "News feeds", "SEC filings"],
      integrationPoints: ["Brokerage APIs", "Payment systems"],
      techStackSuggestion: ["LangChain", "FastAPI", "PostgreSQL"],
    },
    targetAudience: "Individual investors aged 25-45",
    revenueModel: {
      modelType: "SaaS",
      pricingStrategy: "Tiered subscription: Free basic, $19/mo Pro, $49/mo Premium",
      targetMrr: "$50K",
    },
    keyRisks: ["Regulatory compliance", "Market volatility", "Data accuracy"],
    marketFitScore: 8,
    implementationHints: ["Start with stock analysis MVP", "Focus on US market initially"],
  },
  {
    title: "WealthPilot Agent",
    description: "A hierarchical AI agent system for comprehensive wealth management.",
    valueProposition: "Professional-grade wealth management accessible to everyone",
    agentArchitecture: {
      agentType: "hierarchical",
      coreCapabilities: ["Asset allocation", "Tax optimization", "Estate planning"],
      dataSources: ["Financial institutions", "Tax databases"],
      integrationPoints: ["Banking APIs", "Tax software"],
      techStackSuggestion: ["CrewAI", "Next.js", "Supabase"],
    },
    targetAudience: "High net worth individuals and families",
    revenueModel: {
      modelType: "Freemium",
      pricingStrategy: "0.5% AUM for premium features",
      targetMrr: "$100K",
    },
    keyRisks: ["Trust building", "Competition from banks", "Security concerns"],
    marketFitScore: 7,
    implementationHints: ["Partner with registered investment advisors"],
  },
];

describe("IdeationService", () => {
  let service: IdeationService;
  let mockGenerateContent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock for generateContent
    mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockIdeasResponse),
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

    service = new IdeationService();
  });

  describe("generateIdeas", () => {
    it("should generate AI agent ideas from research result", async () => {
      const result = await service.generateIdeas(
        mockResearchResult,
        "AI 투자 자동화"
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("COMPLETED");
      expect(result.query).toBe("AI 투자 자동화");
      expect(result.ideas).toHaveLength(2);
    });

    it("should include all required fields in generated ideas", async () => {
      const result = await service.generateIdeas(
        mockResearchResult,
        "AI 투자 자동화"
      );

      const idea = result.ideas[0];
      expect(idea.title).toBe("InvestBot AI");
      expect(idea.description).toBeDefined();
      expect(idea.valueProposition).toBeDefined();
      expect(idea.agentArchitecture).toBeDefined();
      expect(idea.agentArchitecture.agentType).toBe("multi");
      expect(idea.targetAudience).toBeDefined();
      expect(idea.revenueModel).toBeDefined();
      expect(idea.keyRisks).toBeInstanceOf(Array);
      expect(idea.marketFitScore).toBeGreaterThanOrEqual(1);
      expect(idea.marketFitScore).toBeLessThanOrEqual(10);
      expect(idea.implementationHints).toBeInstanceOf(Array);
    });

    it("should include feedback in prompt when provided", async () => {
      await service.generateIdeas(
        mockResearchResult,
        "AI 투자 자동화",
        "B2B 솔루션 위주로 생성해주세요"
      );

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain("B2B 솔루션 위주로 생성해주세요");
    });

    it("should handle JSON wrapped in markdown code blocks", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => "```json\n" + JSON.stringify(mockIdeasResponse) + "\n```",
        },
      });

      const result = await service.generateIdeas(
        mockResearchResult,
        "테스트 쿼리"
      );

      expect(result.ideas).toHaveLength(2);
      expect(result.ideas[0].title).toBe("InvestBot AI");
    });

    it("should retry on API failure", async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({
          response: {
            text: () => JSON.stringify(mockIdeasResponse),
          },
        });

      const result = await service.generateIdeas(
        mockResearchResult,
        "재시도 테스트"
      );

      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(result.status).toBe("COMPLETED");
    });

    it("should throw error after max retries", async () => {
      mockGenerateContent.mockRejectedValue(new Error("Persistent Error"));

      await expect(
        service.generateIdeas(mockResearchResult, "실패 테스트")
      ).rejects.toThrow(/Idea generation failed after/);
    });
  });

  describe("response parsing", () => {
    it("should handle missing agent architecture fields", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify([
              {
                title: "Test Idea",
                description: "Test description",
                valueProposition: "Test value",
                agentArchitecture: {}, // Missing fields
                targetAudience: "Test audience",
                revenueModel: {},
                keyRisks: [],
                marketFitScore: 5,
                implementationHints: [],
              },
            ]),
        },
      });

      const result = await service.generateIdeas(
        mockResearchResult,
        "부분 데이터"
      );

      const idea = result.ideas[0];
      expect(idea.agentArchitecture.agentType).toBe("single"); // Default
      expect(idea.agentArchitecture.coreCapabilities).toEqual([]);
    });

    it("should clamp market fit score to 1-10 range", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify([
              {
                ...mockIdeasResponse[0],
                marketFitScore: 15, // Out of range
              },
            ]),
        },
      });

      const result = await service.generateIdeas(
        mockResearchResult,
        "범위 테스트"
      );

      expect(result.ideas[0].marketFitScore).toBe(10);
    });

    it("should handle invalid market fit score", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify([
              {
                ...mockIdeasResponse[0],
                marketFitScore: "not a number",
              },
            ]),
        },
      });

      const result = await service.generateIdeas(
        mockResearchResult,
        "유효하지 않은 점수"
      );

      expect(result.ideas[0].marketFitScore).toBe(5); // Default
    });

    it("should filter non-string values from arrays", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify([
              {
                ...mockIdeasResponse[0],
                keyRisks: ["Valid risk", 123, null, { obj: true }],
                implementationHints: ["Valid hint", undefined, "Another hint"],
              },
            ]),
        },
      });

      const result = await service.generateIdeas(
        mockResearchResult,
        "배열 필터링"
      );

      expect(result.ideas[0].keyRisks).toEqual(["Valid risk"]);
      expect(result.ideas[0].implementationHints).toEqual([
        "Valid hint",
        "Another hint",
      ]);
    });
  });

  describe("prompt generation", () => {
    it("should include research result in prompt", async () => {
      await service.generateIdeas(mockResearchResult, "AI 투자");

      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain("AI 투자");
      expect(prompt).toContain(mockResearchResult.marketOverview);
      expect(prompt).toContain("Automated portfolio management");
      expect(prompt).toContain("Complex market analysis");
    });

    it("should emphasize AI agent constraint in prompt", async () => {
      await service.generateIdeas(mockResearchResult, "테스트");

      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain("AI agent");
      expect(prompt).toContain("CRITICAL CONSTRAINT");
    });
  });
});

describe("IdeationService - Agent Architecture Types", () => {
  it("should parse single agent type correctly", () => {
    const service = new IdeationService();
    const parseAgentArchitecture = (arch: unknown) => {
      return (
        service as unknown as {
          parseAgentArchitecture: (a: unknown) => unknown;
        }
      ).parseAgentArchitecture(arch);
    };

    const result = parseAgentArchitecture({ agentType: "single" });
    expect((result as { agentType: string }).agentType).toBe("single");
  });

  it("should default to single for invalid agent types", () => {
    const service = new IdeationService();
    const parseAgentArchitecture = (arch: unknown) => {
      return (
        service as unknown as {
          parseAgentArchitecture: (a: unknown) => unknown;
        }
      ).parseAgentArchitecture(arch);
    };

    const result = parseAgentArchitecture({ agentType: "invalid" });
    expect((result as { agentType: string }).agentType).toBe("single");
  });
});
