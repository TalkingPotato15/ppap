# Project Constitution

## Vision

**AI Agent Business Builder** - 개발자가 실제 시장 데이터를 기반으로 AI 에이전트 스타트업 아이디어를 발굴할 수 있도록 돕는 멀티 에이전트 시스템.

**핵심 문제**: "나는 코딩할 수 있지만, 사람들이 실제로 돈을 낼 만한 것이 무엇인지 모르겠다."

**해결책**: AI 에이전트가 시장 조사와 아이디어 생성을 자동으로 수행.

## Core Values

1. **Simplicity First**: Google 검색처럼 단순한 UI - 검색창 하나로 시작
2. **Data-Driven**: 추측이 아닌 실제 시장 데이터(Google Trends, Gemini Research) 기반
3. **AI Agent Focus**: 모든 생성된 아이디어는 AI 에이전트 기반 솔루션
4. **MVP Mindset**: PoC 범위에서 빠르게 검증 - 부동산 도메인, 10명 타겟 유저

## Technology Stack

- **Platform**: Vercel (hosting, API routes, Cron)
- **Database**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Frontend**: TypeScript, Next.js (App Router)
- **APIs**:
  - Gemini API (Deep Research)
  - Google Trends API
- **Testing**: Vitest

## Quality Standards

- **Test Coverage**: 핵심 비즈니스 로직 80% 이상
- **Response Time**: 전체 플로우 합리적 시간 내 완료
- **Research Quality**: Gemini가 관련성 있고 포괄적인 시장 데이터 반환
- **Idea Quality**: Agent B 아이디어 논리적 완성도 (사용자 평가 4+/5)

## Development Principles

1. **Citation Required**: AI 생성 데이터는 반드시 출처 명시 (환각 방지)
2. **Rate Limit Aware**: API 비용/제한 고려한 캐싱 및 속도 제한
3. **Incremental Delivery**: 작은 단위로 자주 배포
4. **Separation of Concerns**:
   - Google Trends Collector (백그라운드 작업)
   - Gemini Deep Research (Stage A: 실시간 리서치)
   - Agent B (Stage B: 아이디어 생성)

## Architecture Overview

```
BACKGROUND: Google Trends Collector
└─ 주기적으로 트렌딩 토픽 수집 → 캐시/DB 저장

STAGE A: Search (사용자 시작점)
├─ 검색창: 관심 토픽/도메인 입력
├─ "Got no Clue?" 버튼: Google Trends에서 랜덤 선택
└─ Gemini Deep Research → 시장 데이터 반환

STAGE B: Ideation
└─ Agent B가 3-5개 AI 에이전트 프로젝트 아이디어 생성
```

## Constraints

- **Must have**:
  - 출처 인용 기능
  - "Got no Clue?" 랜덤 발견 기능
  - AI 에이전트 기반 아이디어만 생성

- **Must not have**:
  - 환각된 시장 데이터 (출처 없는 정보)
  - 복잡한 UI (Google 검색 수준 단순함 유지)

- **PoC Scope**:
  - 단일 도메인: 부동산/주거
  - 테스트 그룹: 10명 타겟 유저
