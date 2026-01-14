-- Trending Topics Table
-- Stores Google Trends data collected by cron job
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_name TEXT NOT NULL,
  rank INTEGER,
  category TEXT,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research Cache Table
-- Caches Gemini Deep Research results to reduce API calls
CREATE TABLE IF NOT EXISTS research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  research_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_research_cache_hash ON research_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_trending_topics_collected ON trending_topics(collected_at DESC);

-- Row Level Security (RLS)
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for trending topics
CREATE POLICY "Allow public read access to trending_topics"
  ON trending_topics
  FOR SELECT
  TO anon
  USING (true);

-- Service role full access for trending topics (for cron job)
CREATE POLICY "Allow service role full access to trending_topics"
  ON trending_topics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public read access for research cache
CREATE POLICY "Allow public read access to research_cache"
  ON research_cache
  FOR SELECT
  TO anon
  USING (true);

-- Service role full access for research cache
CREATE POLICY "Allow service role full access to research_cache"
  ON research_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
