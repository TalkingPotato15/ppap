# Project Specification

## Functional Requirements

### FR001: Google Trends 데이터 수집
시스템은 Google Trends API를 통해 1주일에 1회 트렌딩 토픽을 수집하고 Supabase에 저장해야 한다.

### FR002: 트렌딩 토픽 조회
시스템은 저장된 트렌딩 토픽 목록을 API를 통해 조회할 수 있어야 한다.

### FR003: 검색 기능
사용자가 관심 토픽/도메인을 입력하면 Gemini Deep Research를 호출하여 시장 분석 결과를 반환해야 한다.

### FR004: "Got no Clue?" 기능
사용자가 버튼 클릭 시 저장된 트렌딩 토픽 중 랜덤으로 하나를 선택하여 자동 검색을 수행해야 한다.

### FR005: Gemini Deep Research 통합
시스템은 Gemini API를 호출하여 입력된 토픽에 대한 포괄적인 시장 조사 결과를 반환해야 한다.
- 시장 개요 및 트렌드
- 주요 문제점/페인포인트
- 기존 솔루션 및 갭
- 기회 분석
- 출처 인용

### FR006: Agent B 아이디어 생성
시스템은 Gemini Research 결과를 기반으로 3-5개의 AI 에이전트 프로젝트 아이디어를 생성해야 한다.

### FR007: 아이디어 카드 출력
각 아이디어는 다음 정보를 포함해야 한다:
- 핵심 가치 제안
- AI 에이전트 아키텍처 개요
- 수익 모델
- 주요 리스크
- 시장 적합성 점수

### FR008: 리서치 결과 캐싱
동일/유사 쿼리에 대한 Gemini 결과를 Supabase에 캐싱하여 API 비용을 절감해야 한다.

---

## Non-Functional Requirements

### NFR001: 성능
- Gemini Research 응답 시간: 30초 이내 (Deep Research 특성상)
- 트렌딩 토픽 조회: 200ms 이내
- 아이디어 생성: 10초 이내

### NFR002: 확장성
- 동시 사용자 100명 지원 (PoC 단계)
- Vercel Edge Functions로 글로벌 응답

### NFR003: 가용성
- Vercel/Supabase 기본 SLA 준수
- 에러 발생 시 사용자에게 명확한 메시지 표시

### NFR004: 보안
- API 키는 환경변수로 관리
- Supabase RLS(Row Level Security) 적용
- 사용자 입력 검증 (XSS, Injection 방지)

### NFR005: 비용 관리
- Gemini API 호출 rate limiting (분당 10회)
- 캐시 히트율 목표: 30% 이상

---

## User Stories

### US001: 토픽 검색
**As a** 개발자
**I want** 관심 있는 토픽을 검색하여 시장 분석 결과를 받고 싶다
**So that** 실제 시장 데이터를 기반으로 사업 아이디어를 탐색할 수 있다

**Acceptance Criteria:**
- [ ] 검색창에 토픽 입력 가능
- [ ] Enter 또는 버튼 클릭으로 검색 실행
- [ ] 로딩 상태 표시
- [ ] 시장 분석 결과 표시 (트렌드, 문제점, 기회)
- [ ] 출처 링크 포함

### US002: 랜덤 토픽 발견
**As a** 아이디어가 없는 개발자
**I want** "Got no Clue?" 버튼을 눌러 트렌딩 토픽으로 자동 검색하고 싶다
**So that** 영감 없이도 시장 기회를 발견할 수 있다

**Acceptance Criteria:**
- [ ] "Got no Clue?" 버튼 존재
- [ ] 클릭 시 트렌딩 토픽 중 랜덤 선택
- [ ] 선택된 토픽으로 자동 검색 실행
- [ ] 어떤 토픽이 선택되었는지 표시

### US003: AI 에이전트 아이디어 확인
**As a** 개발자
**I want** 시장 분석 결과를 기반으로 AI 에이전트 프로젝트 아이디어를 받고 싶다
**So that** 구체적인 사업 아이디어로 프로젝트를 시작할 수 있다

**Acceptance Criteria:**
- [ ] 3-5개 아이디어 카드 표시
- [ ] 각 카드에 가치 제안, 수익 모델, 리스크 포함
- [ ] 모든 아이디어는 AI 에이전트 기반
- [ ] 시장 적합성 점수 표시

### US004: 리서치 결과 확인
**As a** 개발자
**I want** Gemini가 분석한 시장 리서치 결과를 상세히 보고 싶다
**So that** 아이디어 선택 전에 시장 상황을 이해할 수 있다

**Acceptance Criteria:**
- [ ] 시장 개요 섹션 표시
- [ ] 주요 페인포인트 목록
- [ ] 기존 경쟁 솔루션 분석
- [ ] 기회 영역 하이라이트
- [ ] 모든 정보에 출처 인용

---

## Success Metrics

### PoC 성공 기준
- **리서치 품질**: Gemini가 관련성 있고 포괄적인 시장 데이터 반환
- **아이디어 품질**: 사용자 평가 4+/5 (논리적 완성도)
- **응답 시간**: 전체 플로우 2분 이내 완료

### 기술 품질 기준
- 테스트 커버리지: 핵심 로직 80% 이상
- 타입 안전성: TypeScript strict mode
- 보안: OWASP Top 10 취약점 없음

### 사용자 테스트 기준
- 테스트 그룹: 10명 타겟 유저
- 도메인: 부동산/주거
- 만족도 설문 수집
