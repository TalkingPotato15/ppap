# 001 - Gemini Deep Research Service

## Overview

Gemini Deep Research 서비스는 사용자가 입력한 주제에 대해 실시간으로 종합적인 시장 조사를 수행합니다.

## User Stories

### US-001: 주제 기반 시장 조사 (P1)

**Given** 사용자가 검색창에 주제를 입력했을 때
**When** Gemini Deep Research API를 호출하면
**Then** 해당 주제에 대한 종합적인 시장 조사 결과를 반환한다

**Acceptance Criteria:**
- [ ] 사용자 쿼리를 Gemini API 형식으로 변환
- [ ] Deep Research 모드로 API 호출
- [ ] 응답을 구조화된 형식으로 파싱
- [ ] 에러 발생 시 적절한 에러 메시지 반환

### US-002: 조사 결과 구조화 (P1)

**Given** Gemini Deep Research가 원본 결과를 반환했을 때
**When** 결과를 파싱하면
**Then** 다음 구조로 정리된 데이터를 반환한다:
- Market overview and trends
- Key problems/pain points identified
- Existing solutions and gaps
- Opportunity analysis
- Source citations

**Acceptance Criteria:**
- [ ] JSON 형식으로 구조화된 출력
- [ ] 각 섹션별 데이터 추출
- [ ] 출처 URL 포함
- [ ] 빈 섹션 처리

### US-003: API 비용 관리 (P2)

**Given** 동일하거나 유사한 쿼리가 반복될 때
**When** 캐시를 확인하면
**Then** 캐시된 결과가 있으면 API 호출 없이 반환한다

**Acceptance Criteria:**
- [ ] 쿼리 해시 기반 캐시 키 생성
- [ ] TTL 설정 (기본 24시간)
- [ ] 캐시 히트/미스 로깅

### US-004: 타임아웃 처리 (P1)

**Given** Gemini API 호출이 지연될 때
**When** 타임아웃 시간이 초과하면
**Then** 적절한 에러를 반환하고 사용자에게 재시도를 안내한다

**Acceptance Criteria:**
- [ ] 타임아웃 설정 (기본 60초)
- [ ] 타임아웃 시 명확한 에러 메시지
- [ ] 재시도 로직 (최대 2회)

---

## Data Model

### ResearchRequest
```python
class ResearchRequest(BaseModel):
    query: str                    # 사용자 입력 주제
    domain: Optional[str]         # 도메인 힌트 (investment, education, real_estate)
```

### ResearchResult
```python
class ResearchResult(BaseModel):
    query: str                    # 원본 쿼리
    market_overview: str          # 시장 개요
    trends: List[str]             # 주요 트렌드
    pain_points: List[str]        # 문제점/페인포인트
    existing_solutions: List[str] # 기존 솔루션
    gaps: List[str]               # 시장 갭
    opportunities: List[str]      # 기회 분석
    sources: List[Source]         # 출처 목록
    created_at: datetime          # 생성 시간
```

### Source
```python
class Source(BaseModel):
    title: str
    url: str
    snippet: Optional[str]
```

---

## API Endpoints

### POST /api/research

주제에 대한 시장 조사를 수행합니다.

**Request:**
```json
{
  "query": "부동산 투자 자동화",
  "domain": "real_estate"
}
```

**Response (200):**
```json
{
  "query": "부동산 투자 자동화",
  "market_overview": "부동산 투자 자동화 시장은...",
  "trends": ["AI 기반 가치 평가", "자동화된 포트폴리오 관리"],
  "pain_points": ["복잡한 시장 분석", "시간 소요"],
  "existing_solutions": ["Zillow", "Redfin"],
  "gaps": ["개인 투자자용 AI 도구 부족"],
  "opportunities": ["소규모 투자자 타겟 AI 에이전트"],
  "sources": [
    {"title": "Real Estate Tech Report 2024", "url": "https://..."}
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- 400: Invalid query
- 429: Rate limit exceeded
- 500: Gemini API error
- 504: Request timeout

---

## Technical Implementation

### Dependencies
- `google-generativeai` - Gemini API SDK
- `aiohttp` - 비동기 HTTP 클라이언트
- `redis` / `diskcache` - 캐싱

### Environment Variables
```
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash-thinking-exp
RESEARCH_CACHE_TTL=86400
RESEARCH_TIMEOUT=60
```

### Service Interface
```python
class GeminiResearchService:
    async def research(self, request: ResearchRequest) -> ResearchResult:
        """주제에 대한 시장 조사 수행"""
        pass

    async def _call_gemini_api(self, prompt: str) -> str:
        """Gemini API 호출"""
        pass

    def _parse_response(self, raw_response: str) -> ResearchResult:
        """응답 파싱 및 구조화"""
        pass

    def _get_cache_key(self, query: str) -> str:
        """캐시 키 생성"""
        pass
```

---

## ppp 재사용 부분

| 항목 | 재사용 | 비고 |
|------|--------|------|
| FastAPI 라우터 구조 | O | `/src/api/routers/` 패턴 |
| Pydantic 모델 패턴 | O | 요청/응답 검증 |
| 설정 관리 | O | `/src/config/settings.py` |
| 에러 핸들링 패턴 | O | HTTPException 사용 |
| LLM 서비스 구조 | 부분 | `/src/services/llm_service.py` 참고하여 Gemini용으로 수정 |

---

## Testing Strategy

### Unit Tests
- `test_gemini_service.py`: API 호출 모킹, 응답 파싱 테스트

### Integration Tests
- 실제 Gemini API 호출 테스트 (별도 API 키 사용)

### Mock Data
- `fixtures/sample_research_response.json`: 샘플 응답 데이터
