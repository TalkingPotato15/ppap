-- ============================================
-- 005 - Implementation Resources Table
-- JSON-Driven Architecture for AI Agent Templates
-- ============================================

-- Implementation Resources Table
CREATE TABLE IF NOT EXISTS implementation_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ai_agent_ideas(id) ON DELETE CASCADE,
  idea_title TEXT NOT NULL,

  -- Agent Config (핵심 - JSON으로 앱 성격 정의)
  agent_config JSONB NOT NULL,
  agent_config_json TEXT NOT NULL,  -- 포맷팅된 JSON 문자열 (복사용)

  -- 템플릿 정보 (고정)
  template_info JSONB NOT NULL,

  -- Quick Start & Customization
  quick_start_guide JSONB NOT NULL,
  customization_prompt TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 캐싱: 아이디어당 하나의 리소스만 저장
  UNIQUE(idea_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_implementation_resources_idea
  ON implementation_resources(idea_id);
CREATE INDEX IF NOT EXISTS idx_implementation_resources_created
  ON implementation_resources(created_at DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE implementation_resources ENABLE ROW LEVEL SECURITY;

-- Allow public read access to implementation resources
CREATE POLICY "Allow public read access to implementation_resources"
  ON implementation_resources
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role full access to implementation resources
CREATE POLICY "Allow service role full access to implementation_resources"
  ON implementation_resources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
