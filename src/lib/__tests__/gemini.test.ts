import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn().mockResolvedValue({
  response: {
    text: () =>
      JSON.stringify({
        trends: ["AI adoption growing", "Remote work tools"],
        problems: ["Data privacy concerns", "Integration challenges"],
        opportunities: ["AI automation", "Custom solutions"],
        sources: [{ title: "Tech Report 2024", url: "https://example.com" }],
      }),
  },
});

// Mock @google/generative-ai
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent };
    }
  },
}));

// Mock supabase
vi.mock("../supabase", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

// Mock crypto
vi.mock("crypto", () => ({
  default: {
    createHash: vi.fn(() => ({
      update: vi.fn(() => ({
        digest: vi.fn(() => "mockhash123"),
      })),
    })),
  },
}));

import { performDeepResearch } from "../gemini";

describe("gemini service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("performDeepResearch", () => {
    it("should return structured research data", async () => {
      const result = await performDeepResearch("AI agents in healthcare");

      expect(result.query).toBe("AI agents in healthcare");
      expect(result.trends).toHaveLength(2);
      expect(result.problems).toHaveLength(2);
      expect(result.opportunities).toHaveLength(2);
      expect(result.sources).toHaveLength(1);
    });

    it("should include trends in response", async () => {
      const result = await performDeepResearch("technology");

      expect(result.trends).toContain("AI adoption growing");
      expect(result.trends).toContain("Remote work tools");
    });

    it("should include source citations", async () => {
      const result = await performDeepResearch("market research");

      expect(result.sources[0]).toEqual({
        title: "Tech Report 2024",
        url: "https://example.com",
      });
    });
  });
});
