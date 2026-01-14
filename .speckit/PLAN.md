# Implementation Plan - AI Agent Business Builder

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Next.js App                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │    │
│  │  │  Search  │  │ Ideation │  │   Components     │  │    │
│  │  │  Page    │  │  Page    │  │  (SearchBar,     │  │    │
│  │  │          │  │          │  │   IdeaCard, etc) │  │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  API Routes                          │    │
│  │  /api/search    /api/trends    /api/ideation        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Vercel Cron (Weekly)                    │    │
│  │              → Google Trends 수집                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   trending   │  │   research   │  │      (Auth)      │  │
│  │   _topics    │  │   _cache     │  │    (optional)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External APIs                             │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │  Google Trends   │  │  Gemini API (Deep Research)    │  │
│  └──────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14 (App Router) | Vercel 최적화, Server Components, API Routes |
| Language | TypeScript | 타입 안전성, 개발 생산성 |
| Hosting | Vercel | Edge Functions, Cron Jobs, 간편한 배포 |
| Database | Supabase PostgreSQL | 무료 티어, RLS, 실시간 기능 |
| Styling | Tailwind CSS | 빠른 UI 개발, Google-like 미니멀 디자인 |
| Testing | Vitest | 빠른 실행, ESM 지원 |
| AI API | Gemini API | Deep Research 기능 |

## Task Breakdown

### T001: 프로젝트 초기화
**Dependencies**: None
**Estimated Time**: 1 hour
**Description**: Next.js 프로젝트 생성 및 기본 설정

**Acceptance Criteria:**
- [ ] Next.js 14 프로젝트 생성 (App Router)
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] ESLint/Prettier 설정
- [ ] 환경변수 템플릿 (.env.example)

---

### T002: Supabase 설정
**Dependencies**: None
**Estimated Time**: 1 hour
**Description**: Supabase 프로젝트 및 데이터베이스 스키마 설정

**Acceptance Criteria:**
- [ ] Supabase 클라이언트 설정 (lib/supabase.ts)
- [ ] trending_topics 테이블 생성
- [ ] research_cache 테이블 생성
- [ ] RLS 정책 설정

---

### T003: UI 컴포넌트 (검색)
**Dependencies**: T001
**Estimated Time**: 2 hours
**Description**: Google-like 검색 UI 컴포넌트 개발

**Acceptance Criteria:**
- [ ] SearchBar 컴포넌트 (입력, 검색 버튼)
- [ ] GotNoClueButton 컴포넌트
- [ ] 로딩 상태 컴포넌트
- [ ] 메인 페이지 레이아웃

---

### T004: UI 컴포넌트 (결과)
**Dependencies**: T001
**Estimated Time**: 2 hours
**Description**: 리서치 결과 및 아이디어 카드 UI 개발

**Acceptance Criteria:**
- [ ] ResearchSummary 컴포넌트
- [ ] IdeaCard 컴포넌트
- [ ] Ideation 페이지 레이아웃
- [ ] 출처 인용 표시 컴포넌트

---

### T005: Google Trends 서비스
**Dependencies**: T002
**Estimated Time**: 2 hours
**Description**: Google Trends API 연동 및 수집 로직

**Acceptance Criteria:**
- [ ] Google Trends API 클라이언트 (lib/trends.ts)
- [ ] 트렌딩 토픽 파싱 로직
- [ ] Supabase 저장 로직
- [ ] 에러 핸들링

---

### T006: Gemini Deep Research 서비스
**Dependencies**: T002
**Estimated Time**: 3 hours
**Description**: Gemini API 연동 및 리서치 로직

**Acceptance Criteria:**
- [ ] Gemini API 클라이언트 (lib/gemini.ts)
- [ ] Deep Research 프롬프트 설계
- [ ] 응답 파싱 (트렌드, 문제점, 기회, 출처)
- [ ] 캐싱 로직 (research_cache 테이블)
- [ ] Rate limiting 구현

---

### T007: Agent B 서비스 (ppp 재사용)
**Dependencies**: T006
**Estimated Time**: 1 hour
**Description**: ppp 프로젝트에서 AI 에이전트 아이디어 생성 로직 가져와서 수정

**ppp 재사용:**
- `GenerationSession` 모델
- `GeneratedIdea` 모델 (AI Agent 필드 추가)
- `ai_agent.py` 서비스 (프롬프트 변경)
- `idea_store.py` 스토리지
- `ideas.py` 라우터

**Acceptance Criteria:**
- [ ] ppp에서 관련 코드 복사
- [ ] TypeScript로 변환 (lib/agent-b.ts)
- [ ] AI 에이전트 필드 추가 (architecture, capabilities 등)
- [ ] 프롬프트 수정 (AI 에이전트 제약 조건)

---

### T008: API Routes
**Dependencies**: T005, T006, T007
**Estimated Time**: 2 hours
**Description**: Next.js API 라우트 구현

**Acceptance Criteria:**
- [ ] /api/trends - 트렌딩 토픽 조회
- [ ] /api/search - Gemini 리서치 실행
- [ ] /api/ideation - Agent B 아이디어 생성
- [ ] 에러 핸들링 및 응답 포맷

---

### T009: Vercel Cron Job
**Dependencies**: T005
**Estimated Time**: 1 hour
**Description**: 주간 Google Trends 수집 스케줄러

**Acceptance Criteria:**
- [ ] vercel.json cron 설정 (주 1회)
- [ ] /api/cron/trends 엔드포인트
- [ ] 수집 로그 기록

---

### T010: 페이지 통합
**Dependencies**: T003, T004, T008
**Estimated Time**: 2 hours
**Description**: 컴포넌트와 API 연결, 전체 플로우 완성

**Acceptance Criteria:**
- [ ] 검색 → 리서치 → 아이디어 플로우
- [ ] "Got no Clue?" 기능 연결
- [ ] 로딩/에러 상태 처리
- [ ] 반응형 디자인

---

### T011: 테스트 작성
**Dependencies**: T006, T007, T008
**Estimated Time**: 2 hours
**Description**: 핵심 로직 유닛 테스트

**Acceptance Criteria:**
- [ ] Gemini 서비스 테스트
- [ ] Agent B 서비스 테스트
- [ ] API 라우트 테스트
- [ ] 커버리지 80% 이상

---

### T012: 배포 및 검증
**Dependencies**: T009, T010, T011
**Estimated Time**: 1 hour
**Description**: Vercel 배포 및 E2E 검증

**Acceptance Criteria:**
- [ ] Vercel 배포 성공
- [ ] 환경변수 설정
- [ ] 전체 플로우 E2E 테스트
- [ ] Cron Job 동작 확인

---

## Execution Timeline

**Sequential Execution**: 20 hours

**Parallel Execution**: ~11 hours

**Time Savings**: ~9 hours (45%)

### Wave 1 (2 tasks in parallel, 1 hour)
| Task | Description | Time |
|------|-------------|------|
| T001 | 프로젝트 초기화 | 1h |
| T002 | Supabase 설정 | 1h |

### Wave 2 (4 tasks in parallel, 3 hours)
| Task | Description | Time | Depends On |
|------|-------------|------|------------|
| T003 | UI 컴포넌트 (검색) | 2h | T001 |
| T004 | UI 컴포넌트 (결과) | 2h | T001 |
| T005 | Google Trends 서비스 | 2h | T002 |
| T006 | Gemini Deep Research 서비스 | 3h | T002 |

### Wave 3 (2 tasks in parallel, 1 hour)
| Task | Description | Time | Depends On |
|------|-------------|------|------------|
| T007 | Agent B 서비스 (ppp 재사용) | 1h | T006 |
| T009 | Vercel Cron Job | 1h | T005 |

### Wave 4 (2 tasks in parallel, 2 hours)
| Task | Description | Time | Depends On |
|------|-------------|------|------------|
| T008 | API Routes | 2h | T005, T006, T007 |
| T010 | 페이지 통합 | 2h | T003, T004, T008 |

### Wave 5 (1 task, 2 hours)
| Task | Description | Time | Depends On |
|------|-------------|------|------------|
| T011 | 테스트 작성 | 2h | T006, T007, T008 |

### Wave 6 (1 task, 1 hour)
| Task | Description | Time | Depends On |
|------|-------------|------|------------|
| T012 | 배포 및 검증 | 1h | T009, T010, T011 |

---

## Critical Path

```
T001 → T003 → T010 → T012
  ↓
T002 → T006 → T007 → T008 → T010
```

## Database Schema

```sql
-- trending_topics
CREATE TABLE trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_name TEXT NOT NULL,
  rank INTEGER,
  category TEXT,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- research_cache
CREATE TABLE research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  research_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX idx_research_cache_hash ON research_cache(query_hash);
CREATE INDEX idx_trending_topics_collected ON trending_topics(collected_at DESC);
```
