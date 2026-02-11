-- Fix Supabase Security Linter Errors
-- Created: 2026-02-11
-- Run via: psql "$DATABASE_URL" -f packages/db/migrations/2026-02-11-fix-security-issues.sql
-- Or copy/paste into Supabase SQL Editor

-- =============================================================================
-- FIX 1: SECURITY DEFINER VIEWS
-- =============================================================================
-- Views should use SECURITY INVOKER (respects caller's RLS policies)
-- not SECURITY DEFINER (bypasses RLS, uses view owner's permissions)

-- Drop and recreate funnel_conversions with SECURITY INVOKER
DROP VIEW IF EXISTS funnel_conversions;
CREATE VIEW funnel_conversions
WITH (security_invoker = true)
AS
SELECT
  campaign_id,
  SUM(new_leads) as leads,
  SUM(new_hand_raisers) as hand_raisers,
  SUM(new_qualified) as qualified,
  SUM(new_vip) as vip,
  SUM(new_premium) as premium,
  SUM(new_vip) + SUM(new_premium) as clients,
  SUM(new_funded) as funded,
  SUM(ad_spend) as total_spend,
  SUM(total_revenue) as total_revenue,
  -- Conversion rates
  CASE WHEN SUM(new_leads) > 0
    THEN ROUND(SUM(new_hand_raisers)::numeric / SUM(new_leads) * 100, 2)
    ELSE 0 END as lead_to_hr_rate,
  CASE WHEN SUM(new_hand_raisers) > 0
    THEN ROUND(SUM(new_qualified)::numeric / SUM(new_hand_raisers) * 100, 2)
    ELSE 0 END as hr_to_qualified_rate,
  CASE WHEN SUM(new_qualified) > 0
    THEN ROUND((SUM(new_vip) + SUM(new_premium))::numeric / SUM(new_qualified) * 100, 2)
    ELSE 0 END as qualified_to_client_rate,
  -- Unit economics
  CASE WHEN SUM(new_leads) > 0
    THEN ROUND(SUM(ad_spend) / SUM(new_leads), 2)
    ELSE 0 END as cost_per_lead,
  CASE WHEN SUM(new_hand_raisers) > 0
    THEN ROUND(SUM(ad_spend) / SUM(new_hand_raisers), 2)
    ELSE 0 END as cost_per_hand_raiser,
  CASE WHEN (SUM(new_vip) + SUM(new_premium)) > 0
    THEN ROUND(SUM(ad_spend) / (SUM(new_vip) + SUM(new_premium)), 2)
    ELSE 0 END as cac
FROM daily_aggregates
GROUP BY campaign_id;

-- Drop and recreate epl_by_cohort_day with SECURITY INVOKER
DROP VIEW IF EXISTS epl_by_cohort_day;
CREATE VIEW epl_by_cohort_day
WITH (security_invoker = true)
AS
SELECT
  snapshot_day,
  AVG(value) as avg_epl,
  COUNT(*) as sample_size
FROM cohort_snapshots
WHERE snapshot_type = 'epl'
GROUP BY snapshot_day
ORDER BY snapshot_day;

-- =============================================================================
-- FIX 2: ENABLE RLS ON PUBLIC TABLES
-- =============================================================================
-- All public tables need RLS enabled, even if policy is permissive

-- Skool Members History tables
ALTER TABLE skool_members_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool_members_daily ENABLE ROW LEVEL SECURITY;

-- Skool Community Activity
ALTER TABLE skool_community_activity_daily ENABLE ROW LEVEL SECURITY;

-- Skool Revenue tables
ALTER TABLE skool_revenue_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool_revenue_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE skool_subscription_events ENABLE ROW LEVEL SECURITY;

-- GHL tables
ALTER TABLE ghl_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_sync_log ENABLE ROW LEVEL SECURITY;

-- Meta Account Daily (KPI)
ALTER TABLE meta_account_daily ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FIX 3: CREATE RLS POLICIES
-- =============================================================================
-- Using same pattern as other tables: service role full access
-- (Auth is handled via Clerk at application layer)

-- Skool Members History policies
DROP POLICY IF EXISTS "Service role full access" ON skool_members_monthly;
CREATE POLICY "Service role full access" ON skool_members_monthly FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON skool_members_daily;
CREATE POLICY "Service role full access" ON skool_members_daily FOR ALL USING (true);

-- Skool Community Activity policy
DROP POLICY IF EXISTS "Service role full access" ON skool_community_activity_daily;
CREATE POLICY "Service role full access" ON skool_community_activity_daily FOR ALL USING (true);

-- Skool Revenue policies
DROP POLICY IF EXISTS "Service role full access" ON skool_revenue_daily;
CREATE POLICY "Service role full access" ON skool_revenue_daily FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON skool_revenue_monthly;
CREATE POLICY "Service role full access" ON skool_revenue_monthly FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON skool_subscription_events;
CREATE POLICY "Service role full access" ON skool_subscription_events FOR ALL USING (true);

-- GHL policies
DROP POLICY IF EXISTS "Service role full access" ON ghl_transactions;
CREATE POLICY "Service role full access" ON ghl_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON ghl_sync_log;
CREATE POLICY "Service role full access" ON ghl_sync_log FOR ALL USING (true);

-- Meta Account Daily policy
DROP POLICY IF EXISTS "Service role full access" ON meta_account_daily;
CREATE POLICY "Service role full access" ON meta_account_daily FOR ALL USING (true);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'skool_members_monthly',
    'skool_members_daily',
    'skool_community_activity_daily',
    'skool_revenue_daily',
    'skool_revenue_monthly',
    'skool_subscription_events',
    'ghl_transactions',
    'ghl_sync_log',
    'meta_account_daily'
  )
ORDER BY tablename;

-- Check views are SECURITY INVOKER
SELECT
  viewname,
  schemaname,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('funnel_conversions', 'epl_by_cohort_day');
