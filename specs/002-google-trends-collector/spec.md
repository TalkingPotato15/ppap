# 002 - Google Trends Collector

## Overview

Google Trends Collector는 백그라운드에서 주기적으로 트렌딩 토픽을 수집하여 "Got no Clue?" 기능을 지원합니다.

## User Stories

### US-001: 트렌딩 토픽 주기적 수집 (P1)

**Given** 스케줄러가 설정된 주기에 도달했을 때
**When** Google Trends API를 호출하면
**Then** 현재 트렌딩 토픽 목록을 수집하여 저장한다

**Acceptance Criteria:**
- [ ] 설정 가능한 수집 주기 (기본 6시간)
- [ ] Google Trends API 호출
- [ ] 결과를 DB/캐시에 저장
- [ ] 수집 성공/실패 로깅

### US-002: 트렌딩 토픽 조회 (P1)

**Given** 사용자가 "Got no Clue?" 버튼을 클릭했을 때
**When** 트렌딩 토픽 API를 호출하면
**Then** 저장된 트렌딩 토픽 중 하나를 랜덤으로 반환한다

**Acceptance Criteria:**
- [ ] 캐시된 토픽 목록에서 랜덤 선택
- [ ] 토픽이 없으면 기본 토픽 반환
- [ ] 최근 수집 시간 포함

### US-003: 카테고리별 필터링 (P2)

**Given** 특정 도메인의 트렌딩 토픽이 필요할 때
**When** 카테고리 파라미터와 함께 호출하면
**Then** 해당 카테고리의 트렌딩 토픽만 반환한다

**Acceptance Criteria:**
- [ ] 카테고리 매핑 (investment, education, real_estate)
- [ ] Google Trends 카테고리 코드 변환
- [ ] 카테고리별 별도 저장

### US-004: 수집 실패 복구 (P2)

**Given** Google Trends API 호출이 실패했을 때
**When** 재시도 로직이 실행되면
**Then** 지수 백오프로 최대 3회 재시도한다

**Acceptance Criteria:**
- [ ] 재시도 로직 (1초, 2초, 4초 백오프)
- [ ] 최대 재시도 횟수 설정
- [ ] 최종 실패 시 알림 (로깅)

---

## Data Model

### TrendingTopic
```python
class TrendingTopic(BaseModel):
    id: str                       # 고유 ID
    title: str                    # 토픽 제목
    rank: int                     # 순위
    category: Optional[str]       # 카테고리
    related_queries: List[str]    # 관련 검색어
    traffic: Optional[str]        # 검색량 (예: "100K+")
    collected_at: datetime        # 수집 시간
```

### TrendCollection
```python
class TrendCollection(BaseModel):
    topics: List[TrendingTopic]   # 토픽 목록
    region: str                   # 지역 (기본: KR)
    collected_at: datetime        # 수집 시간
    expires_at: datetime          # 만료 시간
```

### CollectionJob
```python
class CollectionJob(BaseModel):
    id: str
    status: Literal["PENDING", "RUNNING", "COMPLETED", "FAILED"]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    topics_count: int
    error_message: Optional[str]
```

---

## API Endpoints

### GET /api/trends/random

랜덤 트렌딩 토픽 1개를 반환합니다. ("Got no Clue?" 버튼용)

**Response (200):**
```json
{
  "topic": {
    "id": "trend_001",
    "title": "AI 투자 플랫폼",
    "rank": 3,
    "category": "investment",
    "related_queries": ["로보어드바이저", "자동 투자"],
    "traffic": "50K+"
  },
  "collected_at": "2024-01-15T06:00:00Z"
}
```

### GET /api/trends

전체 트렌딩 토픽 목록을 반환합니다.

**Query Parameters:**
- `category` (optional): 카테고리 필터
- `limit` (optional): 반환 개수 (기본 10)

**Response (200):**
```json
{
  "topics": [
    {
      "id": "trend_001",
      "title": "AI 투자 플랫폼",
      "rank": 1,
      "category": "investment"
    }
  ],
  "total": 25,
  "collected_at": "2024-01-15T06:00:00Z"
}
```

### POST /api/trends/collect (Internal)

수동으로 트렌드 수집을 트리거합니다. (관리자용)

**Response (202):**
```json
{
  "job_id": "job_123",
  "status": "PENDING",
  "message": "Collection job started"
}
```

---

## Technical Implementation

### Dependencies
- `pytrends` - Google Trends 비공식 API
- `apscheduler` - 스케줄링
- `redis` / `sqlite` - 캐싱/저장

### Environment Variables
```
TRENDS_COLLECTION_INTERVAL=21600  # 6시간 (초)
TRENDS_REGION=KR
TRENDS_CACHE_TTL=21600
TRENDS_MAX_TOPICS=50
```

### Service Interface
```python
class GoogleTrendsService:
    async def collect_trends(self) -> TrendCollection:
        """트렌딩 토픽 수집"""
        pass

    async def get_random_topic(self, category: Optional[str] = None) -> TrendingTopic:
        """랜덤 토픽 반환"""
        pass

    async def get_topics(self, category: Optional[str] = None, limit: int = 10) -> List[TrendingTopic]:
        """토픽 목록 반환"""
        pass
```

### Scheduler Job
```python
# jobs/trends_collector.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('interval', hours=6)
async def collect_trends_job():
    service = GoogleTrendsService()
    await service.collect_trends()
```

---

## Category Mapping

| 내부 카테고리 | Google Trends 카테고리 코드 |
|--------------|---------------------------|
| investment | 7 (Finance) |
| education | 958 (Education) |
| real_estate | 29 (Real Estate) |
| technology | 5 (Computers & Electronics) |
| health | 45 (Health) |

---

## ppp 재사용 부분

| 항목 | 재사용 | 비고 |
|------|--------|------|
| Job 모델 패턴 | O | `/src/models/job.py` 참고 |
| 스케줄러 구조 | 부분 | ppp의 pipeline 스케줄링 참고 |
| API 라우터 패턴 | O | FastAPI 라우터 구조 |
| 설정 관리 | O | Pydantic Settings |

---

## Testing Strategy

### Unit Tests
- `test_trends_service.py`: pytrends 모킹, 랜덤 선택 로직 테스트

### Integration Tests
- 실제 Google Trends 호출 테스트 (rate limit 주의)

### Mock Data
- `fixtures/sample_trends.json`: 샘플 트렌드 데이터
