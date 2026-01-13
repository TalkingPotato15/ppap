# 004 - Search UI (Google-like Interface)

## Overview

Google 검색 페이지와 유사한 미니멀한 UI로 사용자가 주제를 입력하거나 "Got no Clue?" 버튼으로 트렌딩 토픽을 선택할 수 있습니다.

## User Stories

### US-001: 메인 검색 페이지 (P1)

**Given** 사용자가 메인 페이지에 접속했을 때
**When** 페이지가 로드되면
**Then** 중앙에 검색바와 "Got no Clue?" 버튼이 있는 미니멀한 UI를 표시한다

**Acceptance Criteria:**
- [ ] 중앙 정렬된 로고/타이틀
- [ ] 검색 입력창 (큰 폰트, 넓은 너비)
- [ ] "Got no Clue?" 버튼
- [ ] 반응형 디자인 (모바일/데스크톱)

### US-002: 검색 실행 (P1)

**Given** 사용자가 검색창에 주제를 입력했을 때
**When** Enter를 누르거나 검색 버튼을 클릭하면
**Then** 로딩 상태를 표시하고 Research → Ideation 플로우를 시작한다

**Acceptance Criteria:**
- [ ] 입력 검증 (빈 문자열 방지)
- [ ] 로딩 인디케이터 표시
- [ ] Research API 호출
- [ ] 결과 페이지로 이동

### US-003: Got no Clue? 기능 (P1)

**Given** 사용자가 무엇을 검색할지 모를 때
**When** "Got no Clue?" 버튼을 클릭하면
**Then** 트렌딩 토픽에서 랜덤 주제를 선택하여 자동으로 검색을 시작한다

**Acceptance Criteria:**
- [ ] 버튼 클릭 시 trends API 호출
- [ ] 받아온 토픽을 검색창에 표시
- [ ] 자동으로 검색 실행
- [ ] 로딩 상태 표시

### US-004: 리서치 결과 표시 (P1)

**Given** Gemini Deep Research가 완료되었을 때
**When** 결과를 표시하면
**Then** 시장 조사 요약을 카드 형태로 보여주고 아이디어 생성 버튼을 표시한다

**Acceptance Criteria:**
- [ ] Research 결과 요약 카드
- [ ] 트렌드, 페인포인트, 기회 섹션
- [ ] 출처 링크
- [ ] "Generate Ideas" 버튼

### US-005: 아이디어 결과 표시 (P1)

**Given** Agent B가 아이디어 생성을 완료했을 때
**When** 결과를 표시하면
**Then** 3-5개의 AI 에이전트 아이디어를 카드 형태로 표시한다

**Acceptance Criteria:**
- [ ] 아이디어 카드 목록
- [ ] 각 카드에 핵심 정보 표시
- [ ] 상세 보기 모달/페이지
- [ ] 재생성 버튼

### US-006: 로딩 상태 UX (P1)

**Given** API 호출이 진행 중일 때
**When** 로딩 상태를 표시하면
**Then** 단계별 진행 상태와 예상 시간을 표시한다

**Acceptance Criteria:**
- [ ] "Researching market..." 단계
- [ ] "Generating AI agent ideas..." 단계
- [ ] 진행률 또는 스피너
- [ ] 예상 소요 시간 표시

---

## UI Components

### SearchPage (pages/search.tsx)
```
┌─────────────────────────────────────────┐
│                                         │
│              [PPAP Logo]                │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  What do you want to build?     │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [🔍 Search]    [🎲 Got no Clue?]      │
│                                         │
└─────────────────────────────────────────┘
```

### SearchBar (components/SearchBar.tsx)
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  loading?: boolean;
}
```

### GotNoClueButton (components/GotNoClueButton.tsx)
```typescript
interface GotNoClueButtonProps {
  onClick: () => void;
  loading?: boolean;
}
```

### ResearchSummary (components/ResearchSummary.tsx)
```typescript
interface ResearchSummaryProps {
  result: ResearchResult;
  onGenerateIdeas: () => void;
}
```

### IdeaCard (components/IdeaCard.tsx)
```typescript
interface IdeaCardProps {
  idea: AIAgentIdea;
  onClick: () => void;
}
```

### IdeaDetail (components/IdeaDetail.tsx)
```typescript
interface IdeaDetailProps {
  idea: AIAgentIdea;
  onClose: () => void;
  onRegenerate: (feedback: string) => void;
}
```

### LoadingState (components/LoadingState.tsx)
```typescript
interface LoadingStateProps {
  stage: 'research' | 'ideation';
  progress?: number;
}
```

---

## Page Flow

```
[Search Page]
     │
     ├─── Enter Query ───► [Loading: Research]
     │                            │
     ├─── Got no Clue? ──► [Fetch Trend] ───► [Loading: Research]
     │                                               │
     │                                               ▼
     │                                    [Research Results Page]
     │                                               │
     │                                     Click "Generate Ideas"
     │                                               │
     │                                               ▼
     │                                    [Loading: Ideation]
     │                                               │
     │                                               ▼
     │                                    [Ideas Results Page]
     │                                               │
     │                               ┌───────────────┴───────────────┐
     │                               │                               │
     │                        Click Card                    Click Regenerate
     │                               │                               │
     │                               ▼                               ▼
     │                        [Idea Detail]              [Feedback Input]
     │                                                         │
     └────────────────────────────────────────────────────────►│
                                                               ▼
                                                    [Loading: Regenerate]
```

---

## Styling Guidelines

### Color Palette
```css
:root {
  --primary: #4285F4;      /* Google Blue */
  --secondary: #34A853;    /* Google Green */
  --accent: #FBBC05;       /* Google Yellow */
  --danger: #EA4335;       /* Google Red */
  --background: #FFFFFF;
  --surface: #F8F9FA;
  --text-primary: #202124;
  --text-secondary: #5F6368;
}
```

### Typography
```css
/* Search Input */
.search-input {
  font-size: 16px;
  padding: 12px 20px;
  border-radius: 24px;
  border: 1px solid #DFE1E5;
  width: 100%;
  max-width: 584px;
}

/* Button */
.btn-primary {
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 4px;
  background: var(--surface);
  border: 1px solid var(--surface);
}
```

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
  .search-input { max-width: 100%; }
}

/* Desktop */
@media (min-width: 769px) {
  .search-input { max-width: 584px; }
}
```

---

## ppp 재사용 부분

| 항목 | 재사용 | 비고 |
|------|--------|------|
| Next.js App Router | O | 동일 구조 |
| API 클라이언트 | O | `/frontend/src/lib/api.ts` |
| IdeaCard 컴포넌트 | 수정 | AI Agent 필드 추가 |
| 반응형 훅 | O | `useMediaQuery.ts` |
| Tailwind 설정 | O | 스타일 기반 |

---

## State Management

### Search State
```typescript
interface SearchState {
  query: string;
  stage: 'idle' | 'researching' | 'research_complete' | 'generating' | 'complete';
  researchResult: ResearchResult | null;
  ideas: AIAgentIdea[];
  error: string | null;
}
```

### Custom Hook
```typescript
// hooks/useSearch.ts
function useSearch() {
  const [state, setState] = useState<SearchState>(initialState);

  const search = async (query: string) => { /* ... */ };
  const generateIdeas = async () => { /* ... */ };
  const regenerate = async (feedback: string) => { /* ... */ };
  const reset = () => { /* ... */ };

  return { state, search, generateIdeas, regenerate, reset };
}
```

---

## API Integration

### Endpoints Used
```typescript
// Research
POST /api/research
  Body: { query: string, domain?: string }
  Response: ResearchResult

// Trends (Got no Clue?)
GET /api/trends/random
  Response: { topic: TrendingTopic }

// Ideation
POST /api/ideation/generate
  Body: { research_result: ResearchResult, original_query: string }
  Response: { session_id: string, status: string }

GET /api/ideation/sessions/{session_id}
  Response: GenerationSession

POST /api/ideation/sessions/{session_id}/regenerate
  Body: { feedback: string }
  Response: { session_id: string, status: string }
```

---

## Testing Strategy

### Unit Tests
- `SearchBar.test.tsx`: 입력, 검색 이벤트 테스트
- `GotNoClueButton.test.tsx`: 클릭 이벤트 테스트
- `IdeaCard.test.tsx`: 렌더링 테스트

### Integration Tests
- `search-flow.test.tsx`: 전체 검색 플로우 테스트

### E2E Tests
- Playwright/Cypress로 전체 사용자 시나리오 테스트
