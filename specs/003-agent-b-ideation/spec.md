# 003 - Agent B: AI Agent Idea Generation

## Overview

Agent B는 Gemini Deep Research 결과를 기반으로 AI 에이전트 프로젝트 아이디어를 생성합니다.
모든 생성된 아이디어는 AI 에이전트 기반 솔루션이어야 합니다.

## User Stories

### US-001: AI 에이전트 아이디어 생성 (P1)

**Given** Gemini Deep Research 결과가 준비되었을 때
**When** 아이디어 생성을 요청하면
**Then** 3-5개의 AI 에이전트 프로젝트 아이디어를 생성한다

**Acceptance Criteria:**
- [ ] Research 결과를 입력으로 받음
- [ ] 모든 아이디어는 AI 에이전트 기반
- [ ] 각 아이디어에 필수 필드 포함 (value prop, architecture, revenue model, risks, market fit)
- [ ] 3-5개 아이디어 생성

### US-002: 아이디어 상세 정보 (P1)

**Given** AI 에이전트 아이디어가 생성되었을 때
**When** 아이디어 상세를 조회하면
**Then** 다음 정보를 포함한다:
- Core value proposition
- AI agent architecture overview
- Revenue model
- Key risks
- Market fit score (1-10)

**Acceptance Criteria:**
- [ ] 모든 필드 값 존재
- [ ] Market fit score는 1-10 범위
- [ ] Architecture overview는 구체적인 에이전트 구조 포함

### US-003: 아이디어 재생성 (P2)

**Given** 사용자가 생성된 아이디어에 만족하지 않을 때
**When** 피드백과 함께 재생성을 요청하면
**Then** 피드백을 반영한 새로운 아이디어를 생성한다

**Acceptance Criteria:**
- [ ] 사용자 피드백 입력 받음
- [ ] 이전 아이디어와 다른 결과 생성
- [ ] 피드백 반영 여부 표시

### US-004: 세션 관리 (P1)

**Given** 아이디어 생성 요청이 들어왔을 때
**When** 세션을 생성하면
**Then** 생성 상태를 추적하고 결과를 세션에 저장한다

**Acceptance Criteria:**
- [ ] 세션 ID 발급
- [ ] 상태 추적 (PENDING → GENERATING → COMPLETED/FAILED)
- [ ] 결과를 세션에 연결

---

## Data Model

### IdeaGenerationRequest
```python
class IdeaGenerationRequest(BaseModel):
    research_result: ResearchResult   # Gemini Deep Research 결과
    original_query: str               # 사용자 원본 쿼리
    feedback: Optional[str]           # 재생성 시 피드백
```

### AIAgentIdea
```python
class AIAgentIdea(BaseModel):
    id: str                           # 아이디어 ID
    title: str                        # 아이디어 제목
    description: str                  # 상세 설명
    value_proposition: str            # 핵심 가치 제안
    agent_architecture: AgentArchitecture  # AI 에이전트 아키텍처
    target_audience: str              # 타겟 고객
    revenue_model: RevenueModel       # 수익 모델
    key_risks: List[str]              # 주요 리스크
    market_fit_score: int             # 시장 적합도 (1-10)
    implementation_hints: List[str]   # 구현 힌트
    created_at: datetime
```

### AgentArchitecture
```python
class AgentArchitecture(BaseModel):
    agent_type: str                   # 에이전트 유형 (single, multi, hierarchical)
    core_capabilities: List[str]      # 핵심 기능
    data_sources: List[str]           # 데이터 소스
    integration_points: List[str]     # 외부 연동 포인트
    tech_stack_suggestion: List[str]  # 기술 스택 제안
```

### RevenueModel
```python
class RevenueModel(BaseModel):
    model_type: str                   # SaaS, API, Freemium 등
    pricing_strategy: str             # 가격 전략
    target_mrr: Optional[str]         # 목표 MRR
```

### GenerationSession
```python
class GenerationSession(BaseModel):
    id: str
    status: Literal["PENDING", "GENERATING", "COMPLETED", "FAILED"]
    query: str
    ideas: List[AIAgentIdea]
    feedback: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
```

---

## API Endpoints

### POST /api/ideation/generate

AI 에이전트 아이디어를 생성합니다.

**Request:**
```json
{
  "research_result": { /* ResearchResult */ },
  "original_query": "부동산 투자 자동화",
  "feedback": null
}
```

**Response (202):**
```json
{
  "session_id": "session_abc123",
  "status": "GENERATING",
  "message": "Idea generation started"
}
```

### GET /api/ideation/sessions/{session_id}

세션 상태 및 결과를 조회합니다.

**Response (200):**
```json
{
  "id": "session_abc123",
  "status": "COMPLETED",
  "query": "부동산 투자 자동화",
  "ideas": [
    {
      "id": "idea_001",
      "title": "PropInvest AI Agent",
      "description": "부동산 투자 분석 및 추천 AI 에이전트",
      "value_proposition": "초보 투자자도 전문가 수준의 부동산 분석 가능",
      "agent_architecture": {
        "agent_type": "multi",
        "core_capabilities": ["시장 분석", "가격 예측", "투자 추천"],
        "data_sources": ["공공데이터", "부동산 플랫폼 API"],
        "integration_points": ["카카오맵 API", "국토부 실거래가"],
        "tech_stack_suggestion": ["LangChain", "FastAPI", "PostgreSQL"]
      },
      "target_audience": "2030 부동산 초보 투자자",
      "revenue_model": {
        "model_type": "Freemium",
        "pricing_strategy": "기본 분석 무료, 상세 리포트 월 9,900원",
        "target_mrr": "$10K"
      },
      "key_risks": ["데이터 정확도", "규제 리스크"],
      "market_fit_score": 8,
      "implementation_hints": ["MVP는 서울 지역만 타겟"]
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:31:30Z"
}
```

### POST /api/ideation/sessions/{session_id}/regenerate

피드백을 반영하여 아이디어를 재생성합니다.

**Request:**
```json
{
  "feedback": "B2B 솔루션 위주로 다시 생성해주세요"
}
```

**Response (202):**
```json
{
  "session_id": "session_abc123",
  "status": "GENERATING",
  "message": "Regeneration started with feedback"
}
```

---

## Technical Implementation

### LLM Prompt Strategy

```python
IDEA_GENERATION_PROMPT = """
You are an AI agent business strategist. Based on the market research below,
generate {num_ideas} AI agent project ideas.

CRITICAL CONSTRAINT: Every idea MUST be an AI agent-based solution.

Market Research:
{research_result}

Original Query: {query}
{feedback_section}

For each idea, provide:
1. Title (catchy product name)
2. Description (2-3 sentences)
3. Value Proposition (why users need this)
4. Agent Architecture:
   - Agent Type (single/multi/hierarchical)
   - Core Capabilities
   - Data Sources
   - Integration Points
   - Tech Stack Suggestion
5. Target Audience
6. Revenue Model (type, pricing, target MRR)
7. Key Risks (2-3 main risks)
8. Market Fit Score (1-10 with reasoning)
9. Implementation Hints

Output as JSON array.
"""
```

### Service Interface
```python
class IdeationService:
    async def generate_ideas(
        self,
        research_result: ResearchResult,
        query: str,
        feedback: Optional[str] = None
    ) -> GenerationSession:
        """AI 에이전트 아이디어 생성"""
        pass

    async def get_session(self, session_id: str) -> GenerationSession:
        """세션 조회"""
        pass

    async def regenerate(
        self,
        session_id: str,
        feedback: str
    ) -> GenerationSession:
        """피드백 반영 재생성"""
        pass
```

---

## ppp 재사용 부분

| 항목 | 재사용 | 비고 |
|------|--------|------|
| GenerationSession 모델 | O | `/src/models/generation_session.py` |
| GeneratedIdea 모델 | 수정 | AI Agent 필드 추가 필요 |
| AI Agent 서비스 | 수정 | `/src/services/ai_agent.py` 참고, 프롬프트 변경 |
| Idea Store | 수정 | `/src/storage/idea_store.py` |
| Ideas 라우터 | 수정 | `/src/api/routers/ideas.py` |

---

## Testing Strategy

### Unit Tests
- `test_ideation_service.py`: LLM 응답 모킹, 아이디어 파싱 테스트
- `test_idea_validation.py`: 모든 아이디어가 AI 에이전트 기반인지 검증

### Integration Tests
- 실제 LLM 호출 테스트 (비용 주의)
- 전체 플로우 테스트 (Research → Ideation)

### Mock Data
- `fixtures/sample_ideas.json`: 샘플 아이디어 데이터
