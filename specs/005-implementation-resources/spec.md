# 005 - Stage C: Implementation Resources Generation

## Overview

Stage C는 생성된 AI 에이전트 아이디어를 **실행 가능한 템플릿 프로젝트**로 변환합니다.

### 핵심 컨셉: JSON-Driven Architecture

- **고정된 UI 템플릿**: 모든 팀이 동일한 UI/코드를 사용
- **JSON이 앱의 성격을 결정**: `agent-config.json` 파일 하나만 바꾸면 앱 전체가 변함
- **LLM으로 JSON 생성**: ChatGPT(무료 버전)로 JSON을 생성하고 붙여넣기만 하면 작동
- **안전장치**: JSON 형식이 잘못되면 에러 위치 표시 또는 기본값 사용

```
┌─────────────────────────────────────────────────────────┐
│  Fixed Template (Next.js + TypeScript + Tailwind)       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  agent-config.json  ← 이것만 바꾸면 앱이 변함     │   │
│  │  - persona (AI의 성격, 말투)                     │   │
│  │  - prompts (시스템 프롬프트)                     │   │
│  │  - ui (타이틀, 설명, 테마 색상)                  │   │
│  │  - capabilities (지원 기능)                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## User Stories

### US-001: 아이디어 기반 JSON Config 생성 (P1)

**Given** AI 에이전트 아이디어가 생성되었을 때
**When** 사용자가 "Generate Implementation Resources" 버튼을 클릭하면
**Then** 해당 아이디어에 맞는 `agent-config.json` 파일을 생성한다

**Acceptance Criteria:**
- [ ] 아이디어의 제목, 설명, 가치제안을 JSON에 반영
- [ ] AI 페르소나(성격, 말투) 생성
- [ ] 시스템 프롬프트 생성
- [ ] UI 설정(타이틀, 색상 등) 생성
- [ ] 복사 가능한 JSON 형태로 제공

### US-002: 템플릿 프로젝트 제공 (P1)

**Given** 구현 리소스가 요청되었을 때
**When** 리소스 모달이 열리면
**Then** 다음을 제공한다:
- 고정된 템플릿 코드 (모든 팀 동일)
- Quick Start 가이드
- `agent-config.json` 파일 (아이디어별로 다름)

**Acceptance Criteria:**
- [ ] 템플릿 코드는 사전 정의된 고정 코드
- [ ] JSON 파일만 아이디어별로 동적 생성
- [ ] 복사/다운로드 기능 제공

### US-003: JSON 유효성 검증 및 안전장치 (P1)

**Given** 사용자가 JSON을 수정하거나 붙여넣을 때
**When** JSON 형식이 잘못되면
**Then** 다음 중 하나를 수행한다:
- 에러 위치와 메시지 표시
- 또는 기본값으로 폴백

**Acceptance Criteria:**
- [ ] JSON 파싱 에러 시 친절한 에러 메시지
- [ ] 에러 발생 위치(줄 번호) 표시
- [ ] 필수 필드 누락 시 기본값 사용
- [ ] 앱이 크래시되지 않음

### US-004: ChatGPT 프롬프트 제공 (P2)

**Given** 사용자가 JSON을 직접 수정하고 싶을 때
**When** "Customize with ChatGPT" 옵션을 선택하면
**Then** ChatGPT에 붙여넣을 수 있는 프롬프트를 제공한다

**Acceptance Criteria:**
- [ ] 현재 JSON 구조 설명 포함
- [ ] 수정 가이드라인 포함
- [ ] 복사 가능한 프롬프트 형태

---

## Data Model

### AgentConfig (agent-config.json)

```typescript
interface AgentConfig {
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
```

### 기본값 (Default Config)

```typescript
const DEFAULT_CONFIG: AgentConfig = {
  meta: { version: "1.0.0" },
  agent: {
    name: "AI Assistant",
    persona: "You are a helpful AI assistant.",
    tone: "friendly and professional",
    language: "ko"
  },
  prompts: {
    system: "You are a helpful assistant. Answer questions clearly and concisely.",
    welcome: "안녕하세요! 무엇을 도와드릴까요?",
    placeholder: "메시지를 입력하세요...",
    errorMessage: "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요."
  },
  ui: {
    title: "AI Agent",
    subtitle: "Your AI Assistant",
    description: "AI 에이전트와 대화하세요",
    primaryColor: "#3B82F6",
    accentColor: "#10B981"
  },
  capabilities: {
    streaming: true,
    markdown: true,
    codeHighlight: true,
    maxTokens: 2048,
    temperature: 0.7
  },
  examples: [
    "이 서비스는 무엇을 할 수 있나요?",
    "사용 방법을 알려주세요",
    "예시를 보여주세요"
  ]
};
```

### ImplementationResources

```typescript
interface ImplementationResources {
  id: string;
  ideaId: string;
  ideaTitle: string;

  // 동적 생성되는 부분
  agentConfig: AgentConfig;       // agent-config.json 내용
  agentConfigJson: string;        // JSON 문자열 (복사용)

  // 고정된 템플릿 정보
  template: {
    repoUrl: string;              // GitHub 템플릿 저장소 URL
    setupCommands: string[];      // 설치 명령어들
    envVariables: EnvVariable[];  // 필요한 환경 변수
  };

  // Quick Start 가이드
  quickStartGuide: QuickStartStep[];

  // ChatGPT 커스터마이징 프롬프트
  customizationPrompt: string;

  generatedAt: string;
}
```

---

## API Endpoints

### POST /api/ideation/resources/{ideaId}

아이디어 기반 구현 리소스 생성

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "res_abc123",
    "ideaId": "idea_001",
    "ideaTitle": "PropInvest AI Agent",
    "agentConfig": {
      "meta": { "version": "1.0.0", "ideaId": "idea_001" },
      "agent": {
        "name": "PropInvest AI",
        "persona": "부동산 투자 전문가 AI. 초보 투자자도 이해하기 쉽게 설명합니다.",
        "tone": "친근하면서도 전문적인",
        "language": "ko"
      },
      "prompts": {
        "system": "당신은 부동산 투자 전문가 AI입니다. 사용자의 질문에 대해 친절하고 전문적으로 답변합니다. 초보 투자자도 이해할 수 있도록 쉽게 설명하고, 필요시 예시를 들어 설명합니다.",
        "welcome": "안녕하세요! 부동산 투자 AI 어시스턴트입니다. 투자에 관한 궁금한 점을 물어보세요!",
        "placeholder": "부동산 투자에 대해 물어보세요...",
        "errorMessage": "죄송합니다. 잠시 문제가 발생했습니다."
      },
      "ui": {
        "title": "PropInvest AI",
        "subtitle": "스마트한 부동산 투자의 시작",
        "description": "AI가 분석하는 부동산 투자 인사이트",
        "primaryColor": "#2563EB",
        "accentColor": "#059669"
      },
      "capabilities": {
        "streaming": true,
        "markdown": true,
        "codeHighlight": false,
        "maxTokens": 2048,
        "temperature": 0.7
      },
      "examples": [
        "서울에서 1억으로 시작할 수 있는 투자는?",
        "전세가율이 높은 지역을 추천해주세요",
        "재개발 투자 시 주의할 점은?"
      ]
    },
    "agentConfigJson": "{ ... }",
    "template": {
      "repoUrl": "https://github.com/your-org/ai-agent-template",
      "setupCommands": [
        "npx create-next-app@latest my-agent --typescript --tailwind --app",
        "cd my-agent",
        "npm install openai ai",
        "# agent-config.json 파일을 public/ 폴더에 복사"
      ],
      "envVariables": [
        {
          "key": "OPENAI_API_KEY",
          "description": "OpenAI API 키",
          "example": "sk-...",
          "required": true,
          "source": "https://platform.openai.com/api-keys"
        }
      ]
    },
    "quickStartGuide": [
      {
        "order": 1,
        "title": "프로젝트 설정",
        "description": "Next.js 프로젝트를 생성하고 의존성을 설치합니다",
        "command": "npx create-next-app@latest my-agent --typescript --tailwind --app && cd my-agent && npm install openai ai"
      },
      {
        "order": 2,
        "title": "환경 변수 설정",
        "description": ".env.local 파일을 생성하고 API 키를 설정합니다",
        "command": "echo 'OPENAI_API_KEY=your-api-key' > .env.local"
      },
      {
        "order": 3,
        "title": "Config 파일 추가",
        "description": "아래 JSON을 public/agent-config.json 파일로 저장합니다",
        "notes": ["JSON 내용은 'Agent Config' 탭에서 복사하세요"]
      },
      {
        "order": 4,
        "title": "템플릿 코드 복사",
        "description": "'Template Files' 탭의 코드를 해당 경로에 복사합니다"
      },
      {
        "order": 5,
        "title": "실행",
        "description": "개발 서버를 실행합니다",
        "command": "npm run dev"
      }
    ],
    "customizationPrompt": "다음은 AI 에이전트 설정 JSON입니다. 이 설정을 수정하여 [원하는 변경사항]을 적용해주세요. JSON 형식을 유지해주세요.\n\n현재 설정:\n{current_config}\n\n수정 요청: ",
    "generatedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

## Fixed Template Structure

### 템플릿 프로젝트 구조 (모든 팀 동일)

```
my-agent/
├── public/
│   └── agent-config.json    ← 이 파일만 팀별로 다름!
├── src/
│   ├── app/
│   │   ├── page.tsx         # 메인 UI (고정)
│   │   ├── layout.tsx       # 레이아웃 (고정)
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts # Chat API (고정)
│   ├── components/
│   │   ├── ChatInterface.tsx    # 채팅 UI (고정)
│   │   ├── MessageBubble.tsx    # 메시지 컴포넌트 (고정)
│   │   └── ExampleQuestions.tsx # 예시 질문 (config 기반)
│   ├── lib/
│   │   ├── config.ts        # Config 로더 + 유효성 검증
│   │   └── openai.ts        # OpenAI 클라이언트
│   └── types/
│       └── config.ts        # AgentConfig 타입 정의
├── .env.local               # 환경 변수
├── package.json
└── tailwind.config.js
```

### 핵심: Config 로더 with 안전장치

```typescript
// src/lib/config.ts

import { AgentConfig, DEFAULT_CONFIG } from '@/types/config';

export async function loadConfig(): Promise<AgentConfig> {
  try {
    const response = await fetch('/agent-config.json');

    if (!response.ok) {
      console.warn('Config file not found, using defaults');
      return DEFAULT_CONFIG;
    }

    const text = await response.text();

    try {
      const config = JSON.parse(text);
      return validateAndMergeConfig(config);
    } catch (parseError) {
      // JSON 파싱 에러 - 위치 정보 추출
      const errorInfo = extractJsonErrorInfo(text, parseError);
      console.error('JSON Parse Error:', errorInfo);

      // 에러 정보를 UI에 표시할 수 있도록 저장
      if (typeof window !== 'undefined') {
        (window as any).__CONFIG_ERROR__ = errorInfo;
      }

      return DEFAULT_CONFIG;
    }
  } catch (error) {
    console.error('Failed to load config:', error);
    return DEFAULT_CONFIG;
  }
}

function validateAndMergeConfig(config: Partial<AgentConfig>): AgentConfig {
  // 필수 필드 검증 및 기본값 병합
  return {
    meta: { ...DEFAULT_CONFIG.meta, ...config.meta },
    agent: { ...DEFAULT_CONFIG.agent, ...config.agent },
    prompts: { ...DEFAULT_CONFIG.prompts, ...config.prompts },
    ui: { ...DEFAULT_CONFIG.ui, ...config.ui },
    capabilities: { ...DEFAULT_CONFIG.capabilities, ...config.capabilities },
    examples: config.examples || DEFAULT_CONFIG.examples,
  };
}

function extractJsonErrorInfo(text: string, error: Error): ConfigError {
  const match = error.message.match(/position (\d+)/);
  const position = match ? parseInt(match[1]) : 0;

  // 줄 번호 계산
  const lines = text.substring(0, position).split('\n');
  const lineNumber = lines.length;
  const column = lines[lines.length - 1].length + 1;

  return {
    message: error.message,
    line: lineNumber,
    column: column,
    context: getErrorContext(text, position),
  };
}

interface ConfigError {
  message: string;
  line: number;
  column: number;
  context: string;
}
```

---

## UI Components

### ImplementationResources 모달 (수정)

**탭 구조:**
1. **Quick Start**: 단계별 설정 가이드
2. **Agent Config**: JSON 파일 (복사 버튼) ← 핵심!
3. **Template Files**: 고정 템플릿 코드들
4. **Customize**: ChatGPT 커스터마이징 프롬프트

### Agent Config 탭 (중요!)

```typescript
function AgentConfigTab({ config, configJson }: { config: AgentConfig; configJson: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(configJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-config.json';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">agent-config.json</h3>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-secondary">
            {copied ? '복사됨!' : '복사'}
          </button>
          <button onClick={handleDownload} className="btn-primary">
            다운로드
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        이 파일을 <code className="bg-gray-200 px-1 rounded">public/agent-config.json</code>에 저장하세요.
        JSON 내용을 수정하면 앱의 성격이 바뀝니다!
      </div>

      <CodeBlock code={configJson} language="json" filename="agent-config.json" />

      {/* Config 미리보기 */}
      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="font-medium">설정 미리보기</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">에이전트 이름:</span>
            <span className="ml-2 font-medium">{config.agent.name}</span>
          </div>
          <div>
            <span className="text-gray-500">말투:</span>
            <span className="ml-2">{config.agent.tone}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">환영 메시지:</span>
            <p className="mt-1 text-gray-700">{config.prompts.welcome}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: config.ui.primaryColor }}
            title="Primary Color"
          />
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: config.ui.accentColor }}
            title="Accent Color"
          />
        </div>
      </div>
    </div>
  );
}
```

---

## LLM Prompt for Config Generation

```
You are generating a configuration file for an AI agent application.

Based on the following AI agent idea, create an agent-config.json file.

IDEA DETAILS:
- Title: {idea.title}
- Description: {idea.description}
- Value Proposition: {idea.valueProposition}
- Target Audience: {idea.targetAudience}
- Agent Type: {idea.agentArchitecture.agentType}
- Core Capabilities: {idea.agentArchitecture.coreCapabilities}

Generate a JSON configuration with:

1. agent: Define the AI's personality and tone appropriate for the target audience
2. prompts:
   - system: A detailed system prompt that defines the AI's role, expertise, and behavior
   - welcome: A friendly greeting message
   - placeholder: Input field placeholder text
3. ui:
   - title, subtitle, description based on the idea
   - primaryColor, accentColor: Choose colors that match the brand/industry
4. capabilities: Standard settings (streaming: true, markdown: true, maxTokens: 2048, temperature: 0.7)
5. examples: 3-5 example questions that users might ask

IMPORTANT:
- The persona should match the target audience's expectations
- System prompt should be detailed and specific to the domain
- Use Korean for all user-facing text
- Choose professional, industry-appropriate colors

Output ONLY valid JSON, no additional text.
```

---

## Database Schema

### implementation_resources 테이블 (수정)

```sql
CREATE TABLE implementation_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ai_agent_ideas(id) ON DELETE CASCADE,
  idea_title TEXT NOT NULL,

  -- Agent Config (핵심!)
  agent_config JSONB NOT NULL,
  agent_config_json TEXT NOT NULL,  -- 포맷팅된 JSON 문자열

  -- 템플릿 정보 (고정)
  template_info JSONB NOT NULL,

  -- Quick Start & Customization
  quick_start_guide JSONB NOT NULL,
  customization_prompt TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(idea_id)
);
```

---

## 구현 우선순위

| Phase | 항목 | 설명 |
|-------|------|------|
| 1 | AgentConfig 타입 정의 | types/index.ts에 추가 |
| 1 | DEFAULT_CONFIG 정의 | 기본값 상수 정의 |
| 2 | ResourcesService 수정 | JSON config 생성 로직 |
| 2 | API 엔드포인트 | 리소스 생성/조회 |
| 3 | Config 로더 (템플릿) | 안전장치 포함 |
| 3 | 템플릿 코드 준비 | 고정 템플릿 파일들 |
| 4 | UI 컴포넌트 | 모달, 탭, 복사 기능 |
| 5 | ChatGPT 프롬프트 | 커스터마이징 가이드 |

---

## Testing Strategy

### JSON 유효성 검증 테스트

```typescript
describe('Config Loader', () => {
  it('should return default config when file not found', async () => {
    // ...
  });

  it('should return default config when JSON is invalid', async () => {
    // 잘못된 JSON으로 테스트
  });

  it('should merge partial config with defaults', async () => {
    // 일부 필드만 있는 JSON으로 테스트
  });

  it('should extract error position from invalid JSON', () => {
    const invalidJson = '{ "name": "test", }';  // trailing comma
    // 에러 위치가 올바른지 확인
  });
});
```
