import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "./supabase";
import type { ResearchRequest, ResearchResult, Source } from "@/types";

const RESEARCH_TIMEOUT = parseInt(process.env.RESEARCH_TIMEOUT || "60000");
const RESEARCH_CACHE_TTL = parseInt(process.env.RESEARCH_CACHE_TTL || "86400"); // 24 hours
const MAX_RETRIES = 2;

/**
 * Gemini Deep Research Service
 * 001 spec 구현
 */
export class GeminiResearchService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-thinking-exp",
    });
  }

  /**
   * 주제에 대한 시장 조사 수행
   * US-001, US-002, US-003, US-004 구현
   */
  async research(request: ResearchRequest): Promise<ResearchResult> {
    // US-003: 캐시 확인
    const cacheKey = this.getCacheKey(request.query);
    const cached = await this.getCachedResult(cacheKey);
    if (cached) {
      console.log(`[GeminiResearch] Cache hit for query: ${request.query}`);
      return { ...cached, cached: true };
    }

    console.log(`[GeminiResearch] Cache miss for query: ${request.query}`);

    // US-001: API 호출 (US-004: 재시도 로직 포함)
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.callGeminiWithTimeout(request);

        // 결과 캐싱
        await this.cacheResult(cacheKey, request.query, result);

        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `[GeminiResearch] Attempt ${attempt + 1} failed:`,
          error
        );

        if (attempt < MAX_RETRIES) {
          // 재시도 전 대기
          await this.sleep(1000 * Math.pow(2, attempt));
        }
      }
    }

    throw new Error(
      `Research failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`
    );
  }

  /**
   * Gemini API 호출 (타임아웃 포함)
   */
  private async callGeminiWithTimeout(
    request: ResearchRequest
  ): Promise<ResearchResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RESEARCH_TIMEOUT);

    try {
      const prompt = this.buildResearchPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return this.parseResponse(request.query, text);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Deep Research 프롬프트 생성
   */
  private buildResearchPrompt(request: ResearchRequest): string {
    const domainContext = request.domain
      ? `Focus on the ${request.domain} domain.`
      : "";

    return `You are a market research analyst. Conduct comprehensive research on the following topic and provide structured insights.

Topic: ${request.query}
${domainContext}

Please analyze and provide:

1. **Market Overview**: Brief overview of the current market landscape
2. **Key Trends**: List 3-5 major trends in this space
3. **Pain Points**: List 3-5 key problems or pain points users/customers face
4. **Existing Solutions**: List 3-5 existing solutions or competitors in this space
5. **Market Gaps**: List 2-4 gaps or unmet needs in the market
6. **Opportunities**: List 3-5 potential business opportunities
7. **Sources**: List any relevant sources, reports, or references

Format your response as JSON with the following structure:
{
  "marketOverview": "string",
  "trends": ["trend1", "trend2", ...],
  "painPoints": ["pain1", "pain2", ...],
  "existingSolutions": ["solution1", "solution2", ...],
  "gaps": ["gap1", "gap2", ...],
  "opportunities": ["opportunity1", "opportunity2", ...],
  "sources": [{"title": "string", "url": "string", "snippet": "string"}, ...]
}

Respond ONLY with valid JSON, no additional text.`;
  }

  /**
   * US-002: 응답 파싱 및 구조화
   */
  private parseResponse(query: string, rawResponse: string): ResearchResult {
    try {
      // JSON 추출 (마크다운 코드 블록 처리)
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      return {
        query,
        marketOverview: parsed.marketOverview || "",
        trends: this.ensureArray(parsed.trends),
        painPoints: this.ensureArray(parsed.painPoints),
        existingSolutions: this.ensureArray(parsed.existingSolutions),
        gaps: this.ensureArray(parsed.gaps),
        opportunities: this.ensureArray(parsed.opportunities),
        sources: this.parseSources(parsed.sources),
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[GeminiResearch] Failed to parse response:", error);

      // 파싱 실패 시 기본 구조 반환
      return {
        query,
        marketOverview: rawResponse.substring(0, 500),
        trends: [],
        painPoints: [],
        existingSolutions: [],
        gaps: [],
        opportunities: [],
        sources: [],
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * 배열 보장
   */
  private ensureArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((v) => typeof v === "string");
    }
    return [];
  }

  /**
   * 소스 파싱
   */
  private parseSources(sources: unknown): Source[] {
    if (!Array.isArray(sources)) return [];

    return sources
      .filter(
        (s): s is { title: string; url: string; snippet?: string } =>
          typeof s === "object" &&
          s !== null &&
          typeof (s as Record<string, unknown>).title === "string" &&
          typeof (s as Record<string, unknown>).url === "string"
      )
      .map((s) => ({
        title: s.title,
        url: s.url,
        snippet: s.snippet,
      }));
  }

  /**
   * US-003: 캐시 키 생성
   */
  private getCacheKey(query: string): string {
    // 간단한 해시 (production에서는 crypto 사용 권장)
    const normalized = query.toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `research_${Math.abs(hash).toString(16)}`;
  }

  /**
   * 캐시에서 결과 조회
   */
  private async getCachedResult(
    cacheKey: string
  ): Promise<ResearchResult | null> {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("research_cache")
        .select("research_result")
        .eq("query_hash", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any).research_result as ResearchResult;
    } catch {
      return null;
    }
  }

  /**
   * 결과 캐싱
   */
  private async cacheResult(
    cacheKey: string,
    queryText: string,
    result: ResearchResult
  ): Promise<void> {
    try {
      const supabase = createServerClient();
      const expiresAt = new Date(Date.now() + RESEARCH_CACHE_TTL * 1000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("research_cache") as any).upsert({
        query_hash: cacheKey,
        query_text: queryText,
        research_result: result,
        expires_at: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error("[GeminiResearch] Failed to cache result:", error);
    }
  }

  /**
   * 대기 유틸리티
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스
let geminiService: GeminiResearchService | null = null;

export function getGeminiService(): GeminiResearchService {
  if (!geminiService) {
    geminiService = new GeminiResearchService();
  }
  return geminiService;
}
