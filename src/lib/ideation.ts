import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "./supabase";
import type {
  ResearchResult,
  AIAgentIdea,
  GenerationSession,
  GenerationStatus,
  AgentArchitecture,
  RevenueModel,
} from "@/types";
import type { GenerationSessionRow, AIAgentIdeaRow, Json } from "@/types/database";

const GENERATION_TIMEOUT = parseInt(process.env.GENERATION_TIMEOUT || "120000");
const MAX_RETRIES = 2;

/**
 * AI Agent Ideation Service
 * 003 spec 구현 - ppp ai_agent.py 방식 적용
 */
export class IdeationService {
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
   * US-001: AI 에이전트 아이디어 생성
   */
  async generateIdeas(
    researchResult: ResearchResult,
    originalQuery: string,
    feedback?: string
  ): Promise<GenerationSession> {
    // 세션 생성
    const sessionId = this.generateId();
    const session: GenerationSession = {
      id: sessionId,
      status: "PENDING",
      query: originalQuery,
      ideas: [],
      feedback,
      createdAt: new Date().toISOString(),
    };

    // 세션 저장
    await this.saveSession(session);

    // 상태 업데이트: GENERATING
    session.status = "GENERATING";
    await this.updateSessionStatus(sessionId, "GENERATING");

    try {
      // LLM 호출로 아이디어 생성
      const ideas = await this.callLLMWithRetry(
        researchResult,
        originalQuery,
        feedback
      );

      // 아이디어 저장
      const savedIdeas = await this.saveIdeas(sessionId, ideas);

      // 세션 완료
      session.status = "COMPLETED";
      session.ideas = savedIdeas;
      session.completedAt = new Date().toISOString();
      await this.updateSessionStatus(sessionId, "COMPLETED");

      return session;
    } catch (error) {
      // 실패 처리
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      session.status = "FAILED";
      session.errorMessage = errorMessage;
      await this.updateSessionStatus(sessionId, "FAILED", errorMessage);

      throw error;
    }
  }

  /**
   * 세션 조회
   */
  async getSession(sessionId: string): Promise<GenerationSession | null> {
    try {
      const supabase = createServerClient();

      // 세션 조회
      const { data: sessionData, error: sessionError } = await supabase
        .from("generation_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !sessionData) return null;

      const session = sessionData as unknown as GenerationSessionRow;

      // 아이디어 조회
      const { data: ideasData } = await supabase
        .from("ai_agent_ideas")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      const ideas: AIAgentIdea[] = ((ideasData || []) as unknown as AIAgentIdeaRow[]).map(
        this.mapIdeaFromDb
      );

      return {
        id: session.id,
        status: session.status as GenerationStatus,
        query: session.query,
        ideas,
        feedback: session.feedback || undefined,
        errorMessage: session.error_message || undefined,
        createdAt: session.created_at,
        completedAt: session.completed_at || undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * US-003: 피드백 반영 재생성
   */
  async regenerate(
    sessionId: string,
    feedback: string
  ): Promise<GenerationSession> {
    // 기존 세션 조회
    const existingSession = await this.getSession(sessionId);
    if (!existingSession) {
      throw new Error("Session not found");
    }

    // 원본 리서치 결과 조회 (캐시에서)
    const researchResult = await this.getResearchResultForSession(existingSession.query);
    if (!researchResult) {
      throw new Error("Research result not found for regeneration");
    }

    // 새 세션으로 재생성 (기존 아이디어 참고)
    return this.generateIdeas(researchResult, existingSession.query, feedback);
  }

  /**
   * LLM 호출 (재시도 포함)
   */
  private async callLLMWithRetry(
    researchResult: ResearchResult,
    query: string,
    feedback?: string
  ): Promise<Omit<AIAgentIdea, "id" | "createdAt">[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.callLLMWithTimeout(researchResult, query, feedback);
      } catch (error) {
        lastError = error as Error;
        console.error(`[Ideation] Attempt ${attempt + 1} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await this.sleep(1000 * Math.pow(2, attempt));
        }
      }
    }

    throw new Error(
      `Idea generation failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`
    );
  }

  /**
   * LLM 호출 (타임아웃 포함)
   */
  private async callLLMWithTimeout(
    researchResult: ResearchResult,
    query: string,
    feedback?: string
  ): Promise<Omit<AIAgentIdea, "id" | "createdAt">[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT);

    try {
      const prompt = this.buildIdeationPrompt(researchResult, query, feedback);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return this.parseIdeasResponse(text);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * AI Agent 아이디어 생성 프롬프트
   * ppp의 프롬프트 전략 적용 + AI Agent 특화
   */
  private buildIdeationPrompt(
    researchResult: ResearchResult,
    query: string,
    feedback?: string
  ): string {
    const feedbackSection = feedback
      ? `\nUser Feedback for Regeneration:\n${feedback}\nPlease generate different ideas that address this feedback.`
      : "";

    return `You are an AI agent business strategist. Based on the market research below, generate 3-5 AI agent project ideas.

CRITICAL CONSTRAINT: Every idea MUST be an AI agent-based solution. Think of products that use autonomous AI agents to solve problems.

Market Research:
- Query: ${query}
- Market Overview: ${researchResult.marketOverview}
- Key Trends: ${researchResult.trends.join(", ")}
- Pain Points: ${researchResult.painPoints.join(", ")}
- Existing Solutions: ${researchResult.existingSolutions.join(", ")}
- Market Gaps: ${researchResult.gaps.join(", ")}
- Opportunities: ${researchResult.opportunities.join(", ")}
${feedbackSection}

For each idea, provide:
1. Title (catchy product name for an AI agent product)
2. Description (2-3 sentences about what the AI agent does)
3. Value Proposition (why users need this AI agent)
4. Agent Architecture:
   - Agent Type: single (one agent), multi (multiple collaborating agents), or hierarchical (manager-worker agents)
   - Core Capabilities: what the agent can do
   - Data Sources: what data the agent uses
   - Integration Points: external systems it connects to
   - Tech Stack Suggestion: recommended technologies
5. Target Audience (who will use this)
6. Revenue Model:
   - Model Type: SaaS, API, Freemium, etc.
   - Pricing Strategy: how to charge
   - Target MRR: realistic monthly recurring revenue goal
7. Key Risks (2-3 main risks)
8. Market Fit Score (1-10 with clear reasoning)
9. Implementation Hints (MVP recommendations)

Output as JSON array with this structure:
[
  {
    "title": "string",
    "description": "string",
    "valueProposition": "string",
    "agentArchitecture": {
      "agentType": "single" | "multi" | "hierarchical",
      "coreCapabilities": ["string"],
      "dataSources": ["string"],
      "integrationPoints": ["string"],
      "techStackSuggestion": ["string"]
    },
    "targetAudience": "string",
    "revenueModel": {
      "modelType": "string",
      "pricingStrategy": "string",
      "targetMrr": "string"
    },
    "keyRisks": ["string"],
    "marketFitScore": number,
    "implementationHints": ["string"]
  }
]

Respond ONLY with valid JSON array, no additional text.`;
  }

  /**
   * LLM 응답 파싱
   */
  private parseIdeasResponse(
    rawResponse: string
  ): Omit<AIAgentIdea, "id" | "createdAt">[] {
    try {
      // JSON 추출 (마크다운 코드 블록 처리)
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      if (!Array.isArray(parsed)) {
        throw new Error("Response is not an array");
      }

      return parsed.map((item) => ({
        title: String(item.title || "Untitled"),
        description: String(item.description || ""),
        valueProposition: String(item.valueProposition || ""),
        agentArchitecture: this.parseAgentArchitecture(item.agentArchitecture),
        targetAudience: String(item.targetAudience || ""),
        revenueModel: this.parseRevenueModel(item.revenueModel),
        keyRisks: this.ensureStringArray(item.keyRisks),
        marketFitScore: this.parseMarketFitScore(item.marketFitScore),
        implementationHints: this.ensureStringArray(item.implementationHints),
      }));
    } catch (error) {
      console.error("[Ideation] Failed to parse response:", error);
      throw new Error("Failed to parse AI response");
    }
  }

  private parseAgentArchitecture(arch: unknown): AgentArchitecture {
    if (!arch || typeof arch !== "object") {
      return {
        agentType: "single",
        coreCapabilities: [],
        dataSources: [],
        integrationPoints: [],
        techStackSuggestion: [],
      };
    }

    const a = arch as Record<string, unknown>;
    const agentType = ["single", "multi", "hierarchical"].includes(
      String(a.agentType)
    )
      ? (a.agentType as "single" | "multi" | "hierarchical")
      : "single";

    return {
      agentType,
      coreCapabilities: this.ensureStringArray(a.coreCapabilities),
      dataSources: this.ensureStringArray(a.dataSources),
      integrationPoints: this.ensureStringArray(a.integrationPoints),
      techStackSuggestion: this.ensureStringArray(a.techStackSuggestion),
    };
  }

  private parseRevenueModel(model: unknown): RevenueModel {
    if (!model || typeof model !== "object") {
      return {
        modelType: "SaaS",
        pricingStrategy: "Subscription",
      };
    }

    const m = model as Record<string, unknown>;
    return {
      modelType: String(m.modelType || "SaaS"),
      pricingStrategy: String(m.pricingStrategy || "Subscription"),
      targetMrr: m.targetMrr ? String(m.targetMrr) : undefined,
    };
  }

  private parseMarketFitScore(score: unknown): number {
    const num = Number(score);
    if (isNaN(num)) return 5;
    return Math.min(10, Math.max(1, Math.round(num)));
  }

  private ensureStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((v) => typeof v === "string").map(String);
    }
    return [];
  }

  /**
   * 세션 저장
   */
  private async saveSession(session: GenerationSession): Promise<void> {
    const supabase = createServerClient();
    await supabase.from("generation_sessions").insert({
      id: session.id,
      status: session.status,
      query: session.query,
      feedback: session.feedback || null,
      error_message: session.errorMessage || null,
      created_at: session.createdAt,
      completed_at: session.completedAt || null,
    });
  }

  /**
   * 세션 상태 업데이트
   */
  private async updateSessionStatus(
    sessionId: string,
    status: GenerationStatus,
    errorMessage?: string
  ): Promise<void> {
    const supabase = createServerClient();
    const updateData: Record<string, unknown> = { status };

    if (status === "COMPLETED" || status === "FAILED") {
      updateData.completed_at = new Date().toISOString();
    }
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await supabase
      .from("generation_sessions")
      .update(updateData)
      .eq("id", sessionId);
  }

  /**
   * 아이디어 저장
   */
  private async saveIdeas(
    sessionId: string,
    ideas: Omit<AIAgentIdea, "id" | "createdAt">[]
  ): Promise<AIAgentIdea[]> {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    const ideasToInsert = ideas.map((idea) => ({
      id: this.generateId(),
      session_id: sessionId,
      title: idea.title,
      description: idea.description,
      value_proposition: idea.valueProposition,
      agent_architecture: idea.agentArchitecture as unknown as Json,
      target_audience: idea.targetAudience,
      revenue_model: idea.revenueModel as unknown as Json,
      key_risks: idea.keyRisks,
      market_fit_score: idea.marketFitScore,
      implementation_hints: idea.implementationHints,
      created_at: now,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("ai_agent_ideas") as any).insert(ideasToInsert);

    return ideasToInsert.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      valueProposition: i.value_proposition,
      agentArchitecture: i.agent_architecture as unknown as AgentArchitecture,
      targetAudience: i.target_audience,
      revenueModel: i.revenue_model as unknown as RevenueModel,
      keyRisks: i.key_risks,
      marketFitScore: i.market_fit_score,
      implementationHints: i.implementation_hints,
      createdAt: i.created_at,
    }));
  }

  /**
   * DB 아이디어 -> AIAgentIdea 변환
   */
  private mapIdeaFromDb(row: AIAgentIdeaRow): AIAgentIdea {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      valueProposition: row.value_proposition,
      agentArchitecture: row.agent_architecture as unknown as AgentArchitecture,
      targetAudience: row.target_audience,
      revenueModel: row.revenue_model as unknown as RevenueModel,
      keyRisks: row.key_risks,
      marketFitScore: row.market_fit_score,
      implementationHints: row.implementation_hints,
      createdAt: row.created_at,
    };
  }

  /**
   * 세션의 리서치 결과 조회
   */
  private async getResearchResultForSession(
    query: string
  ): Promise<ResearchResult | null> {
    try {
      const supabase = createServerClient();
      const cacheKey = this.getCacheKey(query);

      const { data } = await supabase
        .from("research_cache")
        .select("research_result")
        .eq("query_hash", cacheKey)
        .single();

      if (!data) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any).research_result as ResearchResult;
    } catch {
      return null;
    }
  }

  private getCacheKey(query: string): string {
    const normalized = query.toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `research_${Math.abs(hash).toString(16)}`;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스
let ideationService: IdeationService | null = null;

export function getIdeationService(): IdeationService {
  if (!ideationService) {
    ideationService = new IdeationService();
  }
  return ideationService;
}
