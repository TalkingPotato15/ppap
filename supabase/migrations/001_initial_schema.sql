-- ============================================
-- 001 - Gemini Deep Research Cache Table
-- ============================================

CREATE TABLE IF NOT EXISTS research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  research_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster cache lookups
CREATE INDEX IF NOT EXISTS idx_research_cache_hash ON research_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_research_cache_expires ON research_cache(expires_at);

-- ============================================
-- 002 - Google Trends Topics Table
-- ============================================

CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_name TEXT NOT NULL,
  rank INTEGER,
  category TEXT,
  related_queries TEXT[] DEFAULT '{}',
  traffic TEXT,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster topic lookups
CREATE INDEX IF NOT EXISTS idx_trending_topics_collected ON trending_topics(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_category ON trending_topics(category);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to trending topics
CREATE POLICY "Allow public read access to trending_topics"
  ON trending_topics
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role full access to trending topics
CREATE POLICY "Allow service role full access to trending_topics"
  ON trending_topics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public read access to research cache
CREATE POLICY "Allow public read access to research_cache"
  ON research_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role full access to research cache
CREATE POLICY "Allow service role full access to research_cache"
  ON research_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
