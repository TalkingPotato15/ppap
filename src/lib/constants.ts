import type { AgentConfig, TemplateInfo, QuickStartStep } from "@/types";

/**
 * 기본 Agent Config - JSON 파싱 실패 시 사용
 */
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  meta: {
    version: "1.0.0",
  },
  agent: {
    name: "AI Assistant",
    persona: "You are a helpful AI assistant.",
    tone: "friendly and professional",
    language: "ko",
  },
  prompts: {
    system:
      "You are a helpful assistant. Answer questions clearly and concisely.",
    welcome: "안녕하세요! 무엇을 도와드릴까요?",
    placeholder: "메시지를 입력하세요...",
    errorMessage: "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.",
  },
  ui: {
    title: "AI Agent",
    subtitle: "Your AI Assistant",
    description: "AI 에이전트와 대화하세요",
    primaryColor: "#3B82F6",
    accentColor: "#10B981",
  },
  capabilities: {
    streaming: true,
    markdown: true,
    codeHighlight: true,
    maxTokens: 2048,
    temperature: 0.7,
  },
  examples: [
    "이 서비스는 무엇을 할 수 있나요?",
    "사용 방법을 알려주세요",
    "예시를 보여주세요",
  ],
};

/**
 * Quick Start 가이드 (고정)
 */
export const QUICK_START_GUIDE: QuickStartStep[] = [
  {
    order: 1,
    title: "프로젝트 생성",
    description: "Next.js 프로젝트를 생성합니다",
    command:
      "npx create-next-app@latest my-agent --typescript --tailwind --app --src-dir --no-eslint",
    notes: [
      "App Router와 src/ 디렉토리 사용",
      "프로젝트 이름은 원하는 대로 변경 가능",
    ],
  },
  {
    order: 2,
    title: "의존성 설치",
    description: "필요한 패키지를 설치합니다",
    command: "cd my-agent && npm install openai ai react-markdown",
  },
  {
    order: 3,
    title: "환경 변수 설정",
    description: ".env.local 파일을 생성하고 API 키를 설정합니다",
    command: "echo 'OPENAI_API_KEY=your-api-key-here' > .env.local",
    notes: [
      "OpenAI API 키는 https://platform.openai.com/api-keys 에서 발급",
      "실제 API 키로 교체하세요",
    ],
  },
  {
    order: 4,
    title: "Config 파일 저장",
    description:
      "'Agent Config' 탭의 JSON을 public/agent-config.json 파일로 저장합니다",
    notes: ["JSON 내용을 복사하여 붙여넣기", "파일 경로: public/agent-config.json"],
  },
  {
    order: 5,
    title: "템플릿 코드 복사",
    description: "'Template Files' 탭의 코드를 해당 경로에 복사합니다",
    notes: [
      "각 파일의 경로를 확인하고 해당 위치에 저장",
      "기존 파일이 있다면 덮어쓰기",
    ],
  },
  {
    order: 6,
    title: "개발 서버 실행",
    description: "개발 서버를 실행하고 브라우저에서 확인합니다",
    command: "npm run dev",
    notes: ["http://localhost:3000 에서 확인"],
  },
];

/**
 * 고정 템플릿 정보
 */
export const TEMPLATE_INFO: TemplateInfo = {
  setupCommands: [
    "npx create-next-app@latest my-agent --typescript --tailwind --app --src-dir --no-eslint",
    "cd my-agent",
    "npm install openai ai react-markdown",
  ],
  envVariables: [
    {
      key: "OPENAI_API_KEY",
      description: "OpenAI API 키",
      example: "sk-...",
      required: true,
      source: "https://platform.openai.com/api-keys",
    },
  ],
  files: [
    {
      path: "src/types/config.ts",
      filename: "config.ts",
      language: "typescript",
      description: "AgentConfig 타입 정의 및 기본값",
      content: `// Agent Configuration Types
export interface AgentConfig {
  meta: {
    version: string;
    ideaId?: string;
    generatedAt?: string;
  };
  agent: {
    name: string;
    persona: string;
    tone: string;
    language: string;
  };
  prompts: {
    system: string;
    welcome: string;
    placeholder: string;
    errorMessage: string;
  };
  ui: {
    title: string;
    subtitle: string;
    description: string;
    primaryColor: string;
    accentColor: string;
    logo?: string;
  };
  capabilities: {
    streaming: boolean;
    markdown: boolean;
    codeHighlight: boolean;
    maxTokens: number;
    temperature: number;
  };
  examples: string[];
}

export const DEFAULT_CONFIG: AgentConfig = {
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
};`,
    },
    {
      path: "src/lib/config.ts",
      filename: "config.ts",
      language: "typescript",
      description: "Config 로더 (안전장치 포함)",
      content: `import { AgentConfig, DEFAULT_CONFIG } from "@/types/config";

interface ConfigError {
  message: string;
  line: number;
  column: number;
  context: string;
}

// 전역 에러 상태 (UI에서 접근 가능)
let configError: ConfigError | null = null;

export function getConfigError(): ConfigError | null {
  return configError;
}

export function clearConfigError(): void {
  configError = null;
}

/**
 * Config 파일 로드 (안전장치 포함)
 * - 파일이 없으면 기본값 사용
 * - JSON 파싱 에러 시 에러 정보 저장 + 기본값 사용
 * - 부분적인 config도 기본값과 병합하여 처리
 */
export async function loadConfig(): Promise<AgentConfig> {
  try {
    const response = await fetch("/agent-config.json");

    if (!response.ok) {
      console.warn("Config file not found, using defaults");
      return DEFAULT_CONFIG;
    }

    const text = await response.text();

    try {
      const config = JSON.parse(text);
      configError = null;
      return validateAndMergeConfig(config);
    } catch (parseError) {
      // JSON 파싱 에러 - 위치 정보 추출
      configError = extractJsonErrorInfo(text, parseError as Error);
      console.error("JSON Parse Error:", configError);
      return DEFAULT_CONFIG;
    }
  } catch (error) {
    console.error("Failed to load config:", error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Config 유효성 검증 및 기본값 병합
 */
function validateAndMergeConfig(config: Partial<AgentConfig>): AgentConfig {
  return {
    meta: { ...DEFAULT_CONFIG.meta, ...config.meta },
    agent: { ...DEFAULT_CONFIG.agent, ...config.agent },
    prompts: { ...DEFAULT_CONFIG.prompts, ...config.prompts },
    ui: { ...DEFAULT_CONFIG.ui, ...config.ui },
    capabilities: { ...DEFAULT_CONFIG.capabilities, ...config.capabilities },
    examples: config.examples || DEFAULT_CONFIG.examples,
  };
}

/**
 * JSON 에러 정보 추출
 */
function extractJsonErrorInfo(text: string, error: Error): ConfigError {
  const match = error.message.match(/position (\\d+)/);
  const position = match ? parseInt(match[1]) : 0;

  // 줄 번호 계산
  const lines = text.substring(0, position).split("\\n");
  const lineNumber = lines.length;
  const column = lines[lines.length - 1].length + 1;

  return {
    message: error.message,
    line: lineNumber,
    column: column,
    context: getErrorContext(text, position),
  };
}

/**
 * 에러 위치 주변 컨텍스트 추출
 */
function getErrorContext(text: string, position: number): string {
  const start = Math.max(0, position - 30);
  const end = Math.min(text.length, position + 30);
  const context = text.substring(start, end);
  const marker = " ".repeat(Math.min(30, position - start)) + "^";
  return context + "\\n" + marker;
}`,
    },
    {
      path: "src/app/layout.tsx",
      filename: "layout.tsx",
      language: "typescript",
      description: "루트 레이아웃",
      content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Agent",
  description: "AI Agent Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}`,
    },
    {
      path: "src/app/page.tsx",
      filename: "page.tsx",
      language: "typescript",
      description: "메인 페이지 - 채팅 UI",
      content: `"use client";

import { useState, useEffect, useRef } from "react";
import { loadConfig, getConfigError } from "@/lib/config";
import { AgentConfig, DEFAULT_CONFIG } from "@/types/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  const [configError, setConfigError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConfig().then((loadedConfig) => {
      setConfig(loadedConfig);
      const error = getConfigError();
      if (error) {
        setConfigError(\`JSON 파싱 에러 (줄 \${error.line}): \${error.message}\`);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          config,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: config.prompts.errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: \`\${config.ui.primaryColor}10\` }}
    >
      {/* Header */}
      <header
        className="p-4 text-white"
        style={{ backgroundColor: config.ui.primaryColor }}
      >
        <h1 className="text-2xl font-bold">{config.ui.title}</h1>
        <p className="text-sm opacity-90">{config.ui.subtitle}</p>
      </header>

      {/* Config Error Banner */}
      {configError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700 text-sm">
            ⚠️ {configError} - 기본 설정을 사용합니다.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{config.prompts.welcome}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {config.examples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="px-4 py-2 rounded-full text-sm border hover:bg-gray-100 transition-colors"
                  style={{ borderColor: config.ui.primaryColor, color: config.ui.primaryColor }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={\`flex \${message.role === "user" ? "justify-end" : "justify-start"}\`}
          >
            <div
              className={\`max-w-[80%] rounded-lg p-4 \${
                message.role === "user"
                  ? "text-white"
                  : "bg-white border border-gray-200"
              }\`}
              style={message.role === "user" ? { backgroundColor: config.ui.primaryColor } : {}}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.prompts.placeholder}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: config.ui.primaryColor + "40",
              focusRing: config.ui.primaryColor
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 text-white rounded-lg disabled:opacity-50 transition-colors"
            style={{ backgroundColor: config.ui.primaryColor }}
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}`,
    },
    {
      path: "src/app/api/chat/route.ts",
      filename: "route.ts",
      language: "typescript",
      description: "Chat API 엔드포인트",
      content: `import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, config } = await request.json();

    const systemMessage = {
      role: "system" as const,
      content: config.prompts.system,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, ...messages],
      max_tokens: config.capabilities.maxTokens,
      temperature: config.capabilities.temperature,
    });

    const content = response.choices[0]?.message?.content || config.prompts.errorMessage;

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}`,
    },
  ],
};

/**
 * ChatGPT 커스터마이징 프롬프트 템플릿
 */
export const CUSTOMIZATION_PROMPT_TEMPLATE = `다음은 AI 에이전트 설정 JSON입니다. 이 설정을 수정하여 [원하는 변경사항]을 적용해주세요.

현재 설정:
\`\`\`json
{CONFIG_JSON}
\`\`\`

수정 규칙:
1. JSON 형식을 유지해주세요
2. 모든 필드를 포함해주세요
3. 한국어로 작성해주세요
4. 색상은 hex 코드로 작성해주세요 (예: "#3B82F6")

수정 요청: `;
