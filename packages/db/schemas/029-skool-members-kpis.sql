-- =============================================
-- SKOOL MEMBERS & KPIs TABLES
-- =============================================
-- Phase 8: Member/KPI sync via Chrome extension
-- Run in Supabase SQL Editor

-- =============================================
-- SKOOL MEMBERS
-- Stores member data from Skool groups
-- =============================================
CREATE TABLE IF NOT EXISTS skool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  skool_user_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  level INTEGER,
  points INTEGER,
  joined_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, group_id, skool_user_id)
);

-- =============================================
-- SKOOL KPIs
-- Stores KPI/metrics data from Skool groups
-- =============================================
CREATE TABLE IF NOT EXISTS skool_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_skool_members_user ON skool_members(user_id);
CREATE INDEX IF NOT EXISTS idx_skool_members_group ON skool_members(group_id);
CREATE INDEX IF NOT EXISTS idx_skool_members_lookup ON skool_members(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_skool_kpis_user ON skool_kpis(user_id);
CREATE INDEX IF NOT EXISTS idx_skool_kpis_group ON skool_kpis(group_id);
CREATE INDEX IF NOT EXISTS idx_skool_kpis_metric ON skool_kpis(metric_name);
CREATE INDEX IF NOT EXISTS idx_skool_kpis_recorded ON skool_kpis(recorded_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE skool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool_kpis ENABLE ROW LEVEL SECURITY;

-- Service role full access (auth handled via Clerk)
CREATE POLICY "Service role full access" ON skool_members FOR ALL USING (true);
CREATE POLICY "Service role full access" ON skool_kpis FOR ALL USING (true);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE TRIGGER update_skool_members_updated_at
  BEFORE UPDATE ON skool_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
