import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResearchData, IdeaData } from "@/components";
import { v4 as uuidv4 } from "uuid";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const IDEATION_PROMPT = `You are an AI startup ideation expert specializing in AI agent businesses.

Based on the market research below, generate 3-5 AI agent business ideas.

CONSTRAINTS:
- Each idea MUST be an AI agent-based solution (autonomous agents, multi-agent systems, etc.)
- Focus on solving real pain points identified in the research
- Target specific user segments
- Be realistic about MVP scope

For each idea, provide:
1. Title (catchy, clear)
2. Description (1-2 sentences)
3. Target User (specific persona)
4. Pain Point (what problem it solves)
5. Solution (how the AI agent solves it)
6. Agent Architecture (single agent, multi-agent, hierarchical, etc.)
7. Agent Capabilities (list of 3-5 key capabilities)
8. Monetization (how to make money)
9. MVP Scope (what to build first, achievable in 2-4 weeks)

Respond in JSON format:
{
  "ideas": [
    {
      "title": "...",
      "description": "...",
      "targetUser": "...",
      "painPoint": "...",
      "solution": "...",
      "agentArchitecture": "...",
      "agentCapabilities": ["cap1", "cap2", ...],
      "monetization": "...",
      "mvpScope": "..."
    }
  ]
}

MARKET RESEARCH:
Topic: {query}

Trends:
{trends}

Pain Points:
{problems}

Opportunities:
{opportunities}
`;

function formatResearchForPrompt(research: ResearchData): string {
  let prompt = IDEATION_PROMPT;
  prompt = prompt.replace("{query}", research.query);
  prompt = prompt.replace("{trends}", research.trends.map((t) => `- ${t}`).join("\n"));
  prompt = prompt.replace("{problems}", research.problems.map((p) => `- ${p}`).join("\n"));
  prompt = prompt.replace("{opportunities}", research.opportunities.map((o) => `- ${o}`).join("\n"));
  return prompt;
}

export async function generateIdeas(research: ResearchData): Promise<IdeaData[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const prompt = formatResearchForPrompt(research);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  let parsed: {
    ideas: Array<{
      title: string;
      description: string;
      targetUser: string;
      painPoint: string;
      solution: string;
      agentArchitecture: string;
      agentCapabilities: string[];
      monetization: string;
      mvpScope: string;
    }>;
  };

  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    parsed = JSON.parse(jsonStr);
  } catch {
    // Return empty array if parsing fails
    return [];
  }

  return parsed.ideas.map((idea) => ({
    id: uuidv4(),
    title: idea.title,
    description: idea.description,
    targetUser: idea.targetUser,
    painPoint: idea.painPoint,
    solution: idea.solution,
    agentArchitecture: idea.agentArchitecture,
    agentCapabilities: idea.agentCapabilities || [],
    monetization: idea.monetization,
    mvpScope: idea.mvpScope,
  }));
}
