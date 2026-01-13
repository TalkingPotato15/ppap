# PPP → PPAP 재사용 분석

## Overview

ppp 프로젝트 코드베이스에서 ppap 프로젝트로 재사용 가능한 부분을 분석한 문서입니다.

---

## 재사용 요약

| 카테고리 | 재사용률 | 비고 |
|---------|---------|------|
| 백엔드 인프라 | 80% | FastAPI, SQLAlchemy, 설정 관리 |
| 프론트엔드 인프라 | 70% | Next.js, API 클라이언트 |
| 데이터 모델 | 40% | 새로운 도메인 모델 필요 |
| 비즈니스 로직 | 20% | 대부분 새로 작성 |
| UI 컴포넌트 | 30% | 새로운 디자인 필요 |

---

## 백엔드 (src/)

### 그대로 복사 가능

| 파일/폴더 | 용도 | 복사 위치 |
|----------|------|----------|
| `src/config/settings.py` | Pydantic 기반 환경설정 | `src/config/settings.py` |
| `src/api/dependencies.py` | FastAPI 의존성 주입 | `src/api/dependencies.py` |
| `src/storage/__init__.py` | SQLAlchemy 엔진 설정 | `src/storage/__init__.py` |

### 수정 후 사용

| 파일/폴더 | 수정 내용 | 복사 위치 |
|----------|----------|----------|
| `src/api/app.py` | 라우터 변경 (research, trends, ideation) | `src/api/app.py` |
| `src/services/llm_service.py` | Gemini API로 변경 | `src/services/gemini_service.py` |
| `src/services/ai_agent.py` | AI Agent 아이디어 생성용 프롬프트 변경 | `src/services/ideation_service.py` |
| `src/models/generation_session.py` | 필드 수정 | `src/models/generation_session.py` |
| `src/models/generated_idea.py` | AI Agent 필드 추가 | `src/models/ai_agent_idea.py` |
| `src/storage/idea_store.py` | 새 모델에 맞게 수정 | `src/storage/idea_store.py` |

### 새로 작성 필요

| 파일 | 용도 |
|------|------|
| `src/services/gemini_service.py` | Gemini Deep Research API 래퍼 |
| `src/services/trends_service.py` | Google Trends 수집 |
| `src/models/research_result.py` | 리서치 결과 모델 |
| `src/models/trending_topic.py` | 트렌딩 토픽 모델 |
| `src/api/routers/research.py` | Research API 엔드포인트 |
| `src/api/routers/trends.py` | Trends API 엔드포인트 |
| `src/api/routers/ideation.py` | Ideation API 엔드포인트 |
| `src/jobs/trends_collector.py` | 트렌드 수집 스케줄러 |

### 제거 (사용 안 함)

| 파일/폴더 | 이유 |
|----------|------|
| `src/auth/` | 로그인 기능 제거됨 |
| `src/api/routers/auth.py` | 로그인 기능 제거됨 |
| `src/api/routers/users.py` | 사용자 관리 제거됨 |
| `src/models/user.py` | 로그인 기능 제거됨 |
| `src/models/refresh_token.py` | 로그인 기능 제거됨 |
| `src/services/pipeline.py` | 데이터 수집 방식 변경 |
| `src/services/dedup.py` | 사용 안 함 |

---

## 프론트엔드 (frontend/)

### 그대로 복사 가능

| 파일/폴더 | 용도 | 복사 위치 |
|----------|------|----------|
| `frontend/src/lib/api.ts` | Axios API 클라이언트 | `frontend/src/lib/api.ts` |
| `frontend/src/hooks/useMediaQuery.ts` | 반응형 감지 훅 | `frontend/src/hooks/useMediaQuery.ts` |
| `frontend/tsconfig.json` | TypeScript 설정 | `frontend/tsconfig.json` |
| `frontend/tailwind.config.js` | Tailwind 설정 | `frontend/tailwind.config.js` |

### 수정 후 사용

| 파일/폴더 | 수정 내용 | 복사 위치 |
|----------|----------|----------|
| `frontend/src/app/layout.tsx` | 레이아웃 수정 | `frontend/src/app/layout.tsx` |
| `frontend/src/components/stage-b/IdeaCard.tsx` | AI Agent 필드 추가 | `frontend/src/components/IdeaCard.tsx` |
| `frontend/src/components/stage-b/IdeaDetail.tsx` | AI Agent 필드 추가 | `frontend/src/components/IdeaDetail.tsx` |
| `frontend/src/types/idea.ts` | AI Agent 타입 추가 | `frontend/src/types/idea.ts` |

### 새로 작성 필요

| 파일 | 용도 |
|------|------|
| `frontend/src/app/page.tsx` | 검색 메인 페이지 |
| `frontend/src/app/results/page.tsx` | 결과 페이지 |
| `frontend/src/components/SearchBar.tsx` | 검색 입력창 |
| `frontend/src/components/GotNoClueButton.tsx` | 트렌드 랜덤 선택 버튼 |
| `frontend/src/components/ResearchSummary.tsx` | 리서치 결과 표시 |
| `frontend/src/components/LoadingState.tsx` | 로딩 상태 표시 |
| `frontend/src/hooks/useSearch.ts` | 검색 상태 관리 훅 |
| `frontend/src/types/research.ts` | 리서치 관련 타입 |
| `frontend/src/types/trends.ts` | 트렌드 관련 타입 |

### 제거 (사용 안 함)

| 파일/폴더 | 이유 |
|----------|------|
| `frontend/src/app/auth/` | 로그인 기능 제거됨 |
| `frontend/src/app/profile/` | 사용자 프로필 제거됨 |
| `frontend/src/app/my-ideas/` | 저장 기능 제거됨 |
| `frontend/src/lib/auth-context.tsx` | 로그인 기능 제거됨 |
| `frontend/src/components/auth/` | 로그인 기능 제거됨 |
| `frontend/src/components/discovery/` | UI 방식 변경 |
| `frontend/src/types/auth.ts` | 로그인 기능 제거됨 |
| `frontend/src/types/problem.ts` | 사용 안 함 |
| `frontend/middleware.ts` | 인증 미들웨어 불필요 |

---

## 데이터베이스

### 테이블 비교

| ppp 테이블 | ppap 사용 | 비고 |
|-----------|----------|------|
| users | X | 로그인 제거 |
| refresh_tokens | X | 로그인 제거 |
| document_summaries | X | UI 방식 변경 |
| processed_documents | X | Gemini가 대체 |
| generation_sessions | O | 수정 필요 |
| generated_ideas | O | AI Agent 필드 추가 |
| saved_ideas | X | 저장 기능 제거 |

### 새로운 테이블

| 테이블 | 용도 |
|--------|------|
| research_results | Gemini 리서치 결과 캐싱 |
| trending_topics | Google Trends 토픽 저장 |
| collection_jobs | 트렌드 수집 작업 로그 |

---

## 의존성 (Dependencies)

### 유지

```toml
# Backend
fastapi = "^0.104.0"
uvicorn = "^0.24.0"
sqlalchemy = "^2.0.0"
alembic = "^1.12.0"
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
aiosqlite = "^0.19.0"
httpx = "^0.25.0"

# Frontend
next = "^14.2.0"
react = "^18.3.0"
axios = "^1.7.0"
tailwindcss = "^3.4.0"
```

### 추가

```toml
# Backend
google-generativeai = "^0.3.0"  # Gemini API
pytrends = "^4.9.0"             # Google Trends
apscheduler = "^3.10.0"         # 스케줄링
redis = "^5.0.0"                # 캐싱 (선택)

# Frontend
# (추가 의존성 없음)
```

### 제거

```toml
# Backend
chromadb = "^0.4.0"      # Vector DB 불필요
google-auth = "..."      # OAuth 제거
python-jose = "..."      # JWT 제거
passlib = "..."          # 비밀번호 해싱 제거
aiosmtplib = "..."       # 이메일 발송 제거

# Frontend
@react-oauth/google = "..."  # Google 로그인 제거
```

---

## 마이그레이션 체크리스트

### Phase 1: 인프라 설정
- [ ] ppp에서 설정 파일 복사 (settings.py, dependencies.py)
- [ ] SQLAlchemy 엔진 설정 복사
- [ ] FastAPI 앱 구조 복사 및 수정
- [ ] 새 의존성 추가 (pyproject.toml)

### Phase 2: 백엔드 개발
- [ ] 새 데이터 모델 작성
- [ ] Gemini 서비스 구현
- [ ] Trends 서비스 구현
- [ ] Ideation 서비스 구현
- [ ] API 라우터 구현
- [ ] 스케줄러 설정

### Phase 3: 프론트엔드 개발
- [ ] 프로젝트 초기 설정 복사
- [ ] API 클라이언트 수정
- [ ] 검색 페이지 구현
- [ ] 결과 페이지 구현
- [ ] 컴포넌트 구현

### Phase 4: 통합 테스트
- [ ] API 테스트
- [ ] E2E 테스트
- [ ] 성능 테스트
