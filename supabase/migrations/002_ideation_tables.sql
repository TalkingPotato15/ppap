-- ============================================
-- 003 - AI Agent Ideation Tables
-- ============================================

-- Generation Sessions Table
CREATE TABLE IF NOT EXISTS generation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED')),
  query TEXT NOT NULL,
  feedback TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for generation sessions
CREATE INDEX IF NOT EXISTS idx_generation_sessions_status ON generation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_created ON generation_sessions(created_at DESC);

-- AI Agent Ideas Table
CREATE TABLE IF NOT EXISTS ai_agent_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES generation_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  value_proposition TEXT NOT NULL,
  agent_architecture JSONB NOT NULL,
  target_audience TEXT NOT NULL,
  revenue_model JSONB NOT NULL,
  key_risks TEXT[] NOT NULL DEFAULT '{}',
  market_fit_score INTEGER NOT NULL CHECK (market_fit_score >= 1 AND market_fit_score <= 10),
  implementation_hints TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for AI agent ideas
CREATE INDEX IF NOT EXISTS idx_ai_agent_ideas_session ON ai_agent_ideas(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_ideas_score ON ai_agent_ideas(market_fit_score DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_ideas ENABLE ROW LEVEL SECURITY;

-- Allow public read access to generation sessions
CREATE POLICY "Allow public read access to generation_sessions"
  ON generation_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role full access to generation sessions
CREATE POLICY "Allow service role full access to generation_sessions"
  ON generation_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public read access to AI agent ideas
CREATE POLICY "Allow public read access to ai_agent_ideas"
  ON ai_agent_ideas
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role full access to AI agent ideas
CREATE POLICY "Allow service role full access to ai_agent_ideas"
  ON ai_agent_ideas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
