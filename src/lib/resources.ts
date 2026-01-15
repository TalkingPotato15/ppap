import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "./supabase";
import {
  DEFAULT_AGENT_CONFIG,
  TEMPLATE_INFO,
  QUICK_START_GUIDE,
  CUSTOMIZATION_PROMPT_TEMPLATE,
} from "./constants";
import type {
  AgentConfig,
  AIAgentIdea,
  ImplementationResources,
  AgentArchitecture,
  RevenueModel,
} from "@/types";
import type { AIAgentIdeaRow, Json } from "@/types/database";

const GENERATION_TIMEOUT = parseInt(process.env.GENERATION_TIMEOUT || "120000");
const MAX_RETRIES = 2;

/**
 * Implementation Resources Service
 * 005 spec 구현 - JSON-Driven Architecture
 * 아이디어를 기반으로 agent-config.json 생성
 */
export class ResourcesService {
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
   * 아이디어 기반 구현 리소스 생성
   */
  async generateResources(ideaId: string): Promise<ImplementationResources> {
    // 1. 아이디어 조회
    const idea = await this.getIdea(ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }

    // 2. 캐시 확인
    const cached = await this.getCachedResources(ideaId);
    if (cached) {
      return cached;
    }

    // 3. LLM으로 AgentConfig 생성
    const agentConfig = await this.generateAgentConfigWithRetry(idea);

    // 4. 리소스 객체 구성
    const resources: ImplementationResources = {
      id: crypto.randomUUID(),
      ideaId: idea.id,
      ideaTitle: idea.title,
      agentConfig,
      agentConfigJson: JSON.stringify(agentConfig, null, 2),
      template: TEMPLATE_INFO,
      quickStartGuide: QUICK_START_GUIDE,
      customizationPrompt: CUSTOMIZATION_PROMPT_TEMPLATE.replace(
        "{CONFIG_JSON}",
        JSON.stringify(agentConfig, null, 2)
      ),
      generatedAt: new Date().toISOString(),
    };

    // 5. 캐시에 저장
    await this.saveResources(resources);

    return resources;
  }

  /**
   * 캐시된 리소스 조회
   */
  async getResourcesForIdea(ideaId: string): Promise<ImplementationResources | null> {
    return this.getCachedResources(ideaId);
  }

  /**
   * DB에서 아이디어 조회
   */
  private async getIdea(ideaId: string): Promise<AIAgentIdea | null> {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("ai_agent_ideas")
        .select("*")
        .eq("id", ideaId)
        .single();

      if (error || !data) return null;

      const row = data as unknown as AIAgentIdeaRow;
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
    } catch {
      return null;
    }
  }

  /**
   * 캐시된 리소스 조회
   */
  private async getCachedResources(
    ideaId: string
  ): Promise<ImplementationResources | null> {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("implementation_resources")
        .select("*")
        .eq("idea_id", ideaId)
        .single();

      if (error || !data) return null;

      return this.mapResourcesFromDb(data);
    } catch {
      return null;
    }
  }

  /**
   * LLM 호출 (재시도 포함)
   */
  private async generateAgentConfigWithRetry(
    idea: AIAgentIdea
  ): Promise<AgentConfig> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.generateAgentConfigWithTimeout(idea);
      } catch (error) {
        lastError = error as Error;
        console.error(`[Resources] Attempt ${attempt + 1} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await this.sleep(1000 * Math.pow(2, attempt));
        }
      }
    }

    throw new Error(
      `Config generation failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`
    );
  }

  /**
   * LLM 호출 (타임아웃 포함)
   */
  private async generateAgentConfigWithTimeout(
    idea: AIAgentIdea
  ): Promise<AgentConfig> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT);

    try {
      const prompt = this.buildConfigPrompt(idea);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return this.parseAgentConfig(text, idea);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * AgentConfig 생성 프롬프트
   */
  private buildConfigPrompt(idea: AIAgentIdea): string {
    return `You are generating a configuration file for an AI agent application.

Based on the following AI agent idea, create an agent-config.json file.

IDEA DETAILS:
- Title: ${idea.title}
- Description: ${idea.description}
- Value Proposition: ${idea.valueProposition}
- Target Audience: ${idea.targetAudience}
- Agent Type: ${idea.agentArchitecture.agentType}
- Core Capabilities: ${idea.agentArchitecture.coreCapabilities.join(", ")}
- Data Sources: ${idea.agentArchitecture.dataSources.join(", ")}
- Integration Points: ${idea.agentArchitecture.integrationPoints.join(", ")}
- Tech Stack: ${idea.agentArchitecture.techStackSuggestion.join(", ")}
- Revenue Model: ${idea.revenueModel.modelType} - ${idea.revenueModel.pricingStrategy}
- Implementation Hints: ${idea.implementationHints.join(", ")}

Generate a JSON configuration with:

1. meta: version "1.0.0", ideaId "${idea.id}"
2. agent:
   - name: A catchy name for this AI agent
   - persona: A detailed description of the AI's personality and expertise (2-3 sentences)
   - tone: The communication style (e.g., "친근하면서도 전문적인", "격식있는")
   - language: "ko"
3. prompts:
   - system: A detailed system prompt (3-5 sentences) that defines the AI's role, expertise, constraints, and how it should respond
   - welcome: A friendly Korean greeting message that introduces the agent
   - placeholder: Input field placeholder in Korean
   - errorMessage: Error message in Korean
4. ui:
   - title: The agent's name
   - subtitle: A catchy Korean tagline
   - description: Brief Korean description
   - primaryColor: A hex color that matches the industry/brand (e.g., blue for finance, green for health)
   - accentColor: A complementary hex color
5. capabilities:
   - streaming: true
   - markdown: true
   - codeHighlight: based on whether the agent deals with code
   - maxTokens: 2048
   - temperature: 0.7 (adjust based on whether creativity or accuracy is more important)
6. examples: 3-5 example questions in Korean that users might ask this specific agent

IMPORTANT:
- The persona and system prompt should be specific to the domain and target audience
- All user-facing text (welcome, placeholder, examples) must be in Korean
- Choose professional, industry-appropriate colors
- The system prompt should include specific instructions about the AI's expertise

Output ONLY valid JSON, no additional text or markdown code blocks.`;
  }

  /**
   * LLM 응답 파싱
   */
  private parseAgentConfig(rawResponse: string, idea: AIAgentIdea): AgentConfig {
    try {
      // JSON 추출 (마크다운 코드 블록 처리)
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      // 기본값과 병합하여 누락된 필드 보완
      return this.validateAndMergeConfig(parsed, idea);
    } catch (error) {
      console.error("[Resources] Failed to parse config:", error);
      // 파싱 실패 시 아이디어 기반 기본 config 생성
      return this.createFallbackConfig(idea);
    }
  }

  /**
   * Config 유효성 검증 및 기본값 병합
   */
  private validateAndMergeConfig(
    config: Partial<AgentConfig>,
    idea: AIAgentIdea
  ): AgentConfig {
    return {
      meta: {
        version: "1.0.0",
        ideaId: idea.id,
        generatedAt: new Date().toISOString(),
        ...config.meta,
      },
      agent: {
        name: idea.title,
        persona: DEFAULT_AGENT_CONFIG.agent.persona,
        tone: DEFAULT_AGENT_CONFIG.agent.tone,
        language: "ko",
        ...config.agent,
      },
      prompts: {
        ...DEFAULT_AGENT_CONFIG.prompts,
        ...config.prompts,
      },
      ui: {
        title: idea.title,
        subtitle: DEFAULT_AGENT_CONFIG.ui.subtitle,
        description: idea.description,
        primaryColor: DEFAULT_AGENT_CONFIG.ui.primaryColor,
        accentColor: DEFAULT_AGENT_CONFIG.ui.accentColor,
        ...config.ui,
      },
      capabilities: {
        ...DEFAULT_AGENT_CONFIG.capabilities,
        ...config.capabilities,
      },
      examples: config.examples || DEFAULT_AGENT_CONFIG.examples,
    };
  }

  /**
   * 파싱 실패 시 폴백 config 생성
   */
  private createFallbackConfig(idea: AIAgentIdea): AgentConfig {
    return {
      meta: {
        version: "1.0.0",
        ideaId: idea.id,
        generatedAt: new Date().toISOString(),
      },
      agent: {
        name: idea.title,
        persona: `${idea.description} ${idea.valueProposition}`,
        tone: "친근하면서도 전문적인",
        language: "ko",
      },
      prompts: {
        system: `당신은 ${idea.title}입니다. ${idea.description} ${idea.valueProposition} 사용자의 질문에 친절하고 전문적으로 답변해주세요.`,
        welcome: `안녕하세요! ${idea.title}입니다. 무엇을 도와드릴까요?`,
        placeholder: "질문을 입력하세요...",
        errorMessage: "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.",
      },
      ui: {
        title: idea.title,
        subtitle: idea.valueProposition.slice(0, 50),
        description: idea.description,
        primaryColor: "#3B82F6",
        accentColor: "#10B981",
      },
      capabilities: {
        streaming: true,
        markdown: true,
        codeHighlight: idea.agentArchitecture.techStackSuggestion.some(
          (t) => t.toLowerCase().includes("code") || t.toLowerCase().includes("dev")
        ),
        maxTokens: 2048,
        temperature: 0.7,
      },
      examples: [
        `${idea.title}은 무엇을 할 수 있나요?`,
        "사용 방법을 알려주세요",
        "가장 많이 사용되는 기능은 무엇인가요?",
      ],
    };
  }

  /**
   * 리소스 저장
   */
  private async saveResources(resources: ImplementationResources): Promise<void> {
    try {
      const supabase = createServerClient();
      await supabase.from("implementation_resources").insert({
        id: resources.id,
        idea_id: resources.ideaId,
        idea_title: resources.ideaTitle,
        agent_config: resources.agentConfig as unknown as Json,
        agent_config_json: resources.agentConfigJson,
        template_info: resources.template as unknown as Json,
        quick_start_guide: resources.quickStartGuide as unknown as Json,
        customization_prompt: resources.customizationPrompt,
        created_at: resources.generatedAt,
      });
    } catch (error) {
      console.error("[Resources] Failed to save resources:", error);
      // 저장 실패해도 리소스는 반환
    }
  }

  /**
   * DB 데이터 -> ImplementationResources 변환
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapResourcesFromDb(data: any): ImplementationResources {
    return {
      id: data.id,
      ideaId: data.idea_id,
      ideaTitle: data.idea_title,
      agentConfig: data.agent_config as AgentConfig,
      agentConfigJson: data.agent_config_json,
      template: data.template_info as ImplementationResources["template"],
      quickStartGuide: data.quick_start_guide as ImplementationResources["quickStartGuide"],
      customizationPrompt: data.customization_prompt,
      generatedAt: data.created_at,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스
let resourcesService: ResourcesService | null = null;

export function getResourcesService(): ResourcesService {
  if (!resourcesService) {
    resourcesService = new ResourcesService();
  }
  return resourcesService;
}
