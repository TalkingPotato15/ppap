import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "./supabase";
import { ResearchData } from "@/components";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const RESEARCH_PROMPT = `You are a market research analyst specializing in AI agent businesses.

Given a topic/domain, research and analyze:
1. Current market trends (3-5 bullet points)
2. Key pain points users face (3-5 bullet points)
3. Business opportunities for AI agents (3-5 bullet points)

Focus on opportunities where AI agents can solve real problems.

IMPORTANT: For each insight, cite your source. If you cannot cite a specific source, indicate it's based on general market knowledge.

Respond in JSON format:
{
  "trends": ["trend1", "trend2", ...],
  "problems": ["problem1", "problem2", ...],
  "opportunities": ["opportunity1", "opportunity2", ...],
  "sources": [{"title": "Source Title", "url": "https://..."}]
}

Topic: `;

function hashQuery(query: string): string {
  return crypto.createHash("sha256").update(query.toLowerCase().trim()).digest("hex");
}

async function getCachedResearch(queryHash: string): Promise<ResearchData | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("research_cache")
    .select("research_result, expires_at")
    .eq("query_hash", queryHash)
    .single();

  if (error || !data) return null;

  const record = data as { research_result: unknown; expires_at: string | null };

  // Check if expired
  if (record.expires_at && new Date(record.expires_at) < new Date()) {
    return null;
  }

  return record.research_result as ResearchData;
}

async function cacheResearch(
  queryHash: string,
  queryText: string,
  result: ResearchData
): Promise<void> {
  const supabase = createServerClient();

  // Cache for 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await supabase.from("research_cache").upsert({
    query_hash: queryHash,
    query_text: queryText,
    research_result: result,
    expires_at: expiresAt.toISOString(),
  });
}

export async function performDeepResearch(query: string): Promise<ResearchData> {
  const queryHash = hashQuery(query);

  // Check cache first
  const cached = await getCachedResearch(queryHash);
  if (cached) {
    return cached;
  }

  // Call Gemini API
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const result = await model.generateContent(RESEARCH_PROMPT + query);
  const response = result.response;
  const text = response.text();

  // Parse JSON from response
  let parsed: {
    trends: string[];
    problems: string[];
    opportunities: string[];
    sources: { title: string; url: string }[];
  };

  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    parsed = JSON.parse(jsonStr);
  } catch {
    // Fallback structure if parsing fails
    parsed = {
      trends: ["Market data unavailable"],
      problems: ["Unable to analyze pain points"],
      opportunities: ["Research inconclusive"],
      sources: [],
    };
  }

  const researchData: ResearchData = {
    query,
    trends: parsed.trends || [],
    problems: parsed.problems || [],
    opportunities: parsed.opportunities || [],
    sources: parsed.sources || [],
  };

  // Cache the result
  await cacheResearch(queryHash, query, researchData);

  return researchData;
}
