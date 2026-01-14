import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn(() => "test-uuid-123"),
}));

const mockGenerateContent = vi.fn().mockResolvedValue({
  response: {
    text: () =>
      JSON.stringify({
        ideas: [
          {
            title: "PropertyBot",
            description: "AI agent for property search",
            targetUser: "Real estate agents",
            painPoint: "Time-consuming property matching",
            solution: "Automated property matching with preferences",
            agentArchitecture: "Single agent with tool use",
            agentCapabilities: ["Property search", "Price comparison", "Scheduling"],
            monetization: "Subscription model",
            mvpScope: "Basic property search with filters",
          },
          {
            title: "LeaseAssistant",
            description: "AI agent for lease management",
            targetUser: "Property managers",
            painPoint: "Complex lease documentation",
            solution: "Automated lease generation and tracking",
            agentArchitecture: "Multi-agent system",
            agentCapabilities: ["Document generation", "Reminder system"],
            monetization: "Per-document pricing",
            mvpScope: "Lease template generator",
          },
        ],
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

import { generateIdeas } from "../agent-b";
import { ResearchData } from "@/components";

describe("agent-b service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockResearch: ResearchData = {
    query: "real estate technology",
    trends: ["PropTech growth", "Remote viewings"],
    problems: ["Time-consuming searches", "Complex documentation"],
    opportunities: ["AI automation", "Streamlined processes"],
    sources: [],
  };

  describe("generateIdeas", () => {
    it("should generate AI agent ideas based on research", async () => {
      const ideas = await generateIdeas(mockResearch);

      expect(ideas).toHaveLength(2);
      expect(ideas[0].title).toBe("PropertyBot");
      expect(ideas[1].title).toBe("LeaseAssistant");
    });

    it("should include all required fields in ideas", async () => {
      const ideas = await generateIdeas(mockResearch);
      const idea = ideas[0];

      expect(idea).toHaveProperty("id");
      expect(idea).toHaveProperty("title");
      expect(idea).toHaveProperty("description");
      expect(idea).toHaveProperty("targetUser");
      expect(idea).toHaveProperty("painPoint");
      expect(idea).toHaveProperty("solution");
      expect(idea).toHaveProperty("agentArchitecture");
      expect(idea).toHaveProperty("agentCapabilities");
      expect(idea).toHaveProperty("monetization");
      expect(idea).toHaveProperty("mvpScope");
    });

    it("should generate unique IDs for each idea", async () => {
      const ideas = await generateIdeas(mockResearch);

      expect(ideas[0].id).toBe("test-uuid-123");
    });

    it("should include agent capabilities as array", async () => {
      const ideas = await generateIdeas(mockResearch);

      expect(Array.isArray(ideas[0].agentCapabilities)).toBe(true);
      expect(ideas[0].agentCapabilities).toContain("Property search");
    });
  });
});
