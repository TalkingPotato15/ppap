// ============================================
// 001 - Gemini Deep Research Types
// ============================================

export interface ResearchRequest {
  query: string;
  domain?: "investment" | "education" | "real_estate" | "technology" | "health";
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface ResearchResult {
  query: string;
  marketOverview: string;
  trends: string[];
  painPoints: string[];
  existingSolutions: string[];
  gaps: string[];
  opportunities: string[];
  sources: Source[];
  createdAt: string;
  cached?: boolean;
}

// ============================================
// 002 - Google Trends Types
// ============================================

export interface TrendingTopic {
  id: string;
  title: string;
  rank: number;
  category?: string;
  relatedQueries: string[];
  traffic?: string;
  collectedAt: string;
}

export interface TrendCollection {
  topics: TrendingTopic[];
  region: string;
  collectedAt: string;
  expiresAt: string;
}

export interface CollectionJob {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  startedAt?: string;
  completedAt?: string;
  topicsCount: number;
  errorMessage?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RandomTrendResponse {
  topic: TrendingTopic;
  collectedAt: string;
}

export interface TrendsListResponse {
  topics: TrendingTopic[];
  total: number;
  collectedAt: string;
}

// ============================================
// Category Mapping
// ============================================

export const CATEGORY_CODES: Record<string, number> = {
  investment: 7,      // Finance
  education: 958,     // Education
  real_estate: 29,    // Real Estate
  technology: 5,      // Computers & Electronics
  health: 45,         // Health
} as const;

export type CategoryType = keyof typeof CATEGORY_CODES;

// ============================================
// 003 - AI Agent Ideation Types
// ============================================

export type GenerationStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

export interface IdeaGenerationRequest {
  researchResult: ResearchResult;
  originalQuery: string;
  feedback?: string;
}

export interface AgentArchitecture {
  agentType: "single" | "multi" | "hierarchical";
  coreCapabilities: string[];
  dataSources: string[];
  integrationPoints: string[];
  techStackSuggestion: string[];
}

export interface RevenueModel {
  modelType: string;  // SaaS, API, Freemium 등
  pricingStrategy: string;
  targetMrr?: string;
}

export interface AIAgentIdea {
  id: string;
  title: string;
  description: string;
  valueProposition: string;
  agentArchitecture: AgentArchitecture;
  targetAudience: string;
  revenueModel: RevenueModel;
  keyRisks: string[];
  marketFitScore: number;  // 1-10
  implementationHints: string[];
  createdAt: string;
}

export interface GenerationSession {
  id: string;
  status: GenerationStatus;
  query: string;
  ideas: AIAgentIdea[];
  feedback?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface GenerateIdeasResponse {
  sessionId: string;
  status: GenerationStatus;
  message: string;
}

export interface RegenerateRequest {
  feedback: string;
}

// ============================================
// 005 - Implementation Resources Types
// ============================================

/**
 * Agent Configuration - JSON 파일로 앱의 성격을 정의
 * 모든 팀이 동일한 템플릿을 사용하고, 이 JSON만 바꿔서 앱을 커스터마이징
 */
export interface AgentConfig {
  // 메타 정보
  meta: {
    version: string;           // "1.0.0"
    ideaId?: string;           // 생성된 아이디어 ID
    generatedAt?: string;      // 생성 시간
  };

  // AI 에이전트 설정
  agent: {
    name: string;              // 에이전트 이름 (e.g., "PropInvest AI")
    persona: string;           // 성격/역할 설명
    tone: string;              // 말투 (e.g., "친근하고 전문적인", "격식있는")
    language: string;          // 기본 언어 (e.g., "ko", "en")
  };

  // 프롬프트 설정
  prompts: {
    system: string;            // 시스템 프롬프트
    welcome: string;           // 환영 메시지
    placeholder: string;       // 입력창 placeholder
    errorMessage: string;      // 에러 시 표시할 메시지
  };

  // UI 설정
  ui: {
    title: string;             // 앱 타이틀
    subtitle: string;          // 서브타이틀
    description: string;       // 앱 설명
    primaryColor: string;      // 주요 색상 (hex)
    accentColor: string;       // 강조 색상 (hex)
    logo?: string;             // 로고 URL (optional)
  };

  // 기능 설정
  capabilities: {
    streaming: boolean;        // 스트리밍 응답 사용 여부
    markdown: boolean;         // 마크다운 렌더링 여부
    codeHighlight: boolean;    // 코드 하이라이팅 여부
    maxTokens: number;         // 최대 토큰 수
    temperature: number;       // LLM temperature (0.0 - 1.0)
  };

  // 예시 질문 (Quick Start)
  examples: string[];          // 예시 질문 목록
}

/**
 * 환경 변수 정보
 */
export interface EnvVariable {
  key: string;                 // 변수명
  description: string;         // 설명
  example: string;             // 예시 값
  required: boolean;           // 필수 여부
  source?: string;             // 획득 경로 (e.g., "OpenAI Dashboard")
}

/**
 * Quick Start 단계
 */
export interface QuickStartStep {
  order: number;               // 순서
  title: string;               // 단계 제목
  command?: string;            // CLI 명령어 (있을 경우)
  description: string;         // 설명
  notes?: string[];            // 주의사항
}

/**
 * 템플릿 파일 정보
 */
export interface TemplateFile {
  path: string;                // 파일 경로 (e.g., "src/app/page.tsx")
  filename: string;            // 파일명
  content: string;             // 파일 내용
  description: string;         // 설명
  language: string;            // 언어 (typescript, json, etc.)
}

/**
 * 템플릿 정보 (고정)
 */
export interface TemplateInfo {
  repoUrl?: string;            // GitHub 템플릿 저장소 URL
  setupCommands: string[];     // 설치 명령어들
  envVariables: EnvVariable[]; // 필요한 환경 변수
  files: TemplateFile[];       // 템플릿 파일들
}

/**
 * 구현 리소스 - API 응답 타입
 */
export interface ImplementationResources {
  id: string;
  ideaId: string;
  ideaTitle: string;

  // 동적 생성되는 부분
  agentConfig: AgentConfig;    // agent-config.json 내용
  agentConfigJson: string;     // JSON 문자열 (복사용)

  // 고정된 템플릿 정보
  template: TemplateInfo;

  // Quick Start 가이드
  quickStartGuide: QuickStartStep[];

  // ChatGPT 커스터마이징 프롬프트
  customizationPrompt: string;

  generatedAt: string;
}

/**
 * 리소스 생성 응답
 */
export interface ResourceGenerationResponse {
  success: boolean;
  resources?: ImplementationResources;
  error?: string;
  status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
}
