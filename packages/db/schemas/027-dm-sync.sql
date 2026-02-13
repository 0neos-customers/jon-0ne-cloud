-- =============================================
-- DM SYNC INTEGRATION TABLES
-- =============================================
-- Multi-tenant DM sync between Skool and GHL
-- Supports bidirectional message sync and hand-raiser campaigns
-- Run in Supabase SQL Editor

-- =============================================
-- DM SYNC CONFIGURATION
-- Per-user settings for Skool → GHL sync
-- =============================================
CREATE TABLE dm_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  skool_community_slug TEXT NOT NULL,
  ghl_location_id TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skool_community_slug)
);

-- =============================================
-- CONTACT MAPPING
-- Links Skool users to GHL contacts
-- =============================================
CREATE TABLE dm_contact_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  skool_user_id TEXT NOT NULL,
  skool_username TEXT,
  skool_display_name TEXT,
  ghl_contact_id TEXT NOT NULL,
  match_method TEXT,  -- 'skool_id', 'email', 'name', 'synthetic'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skool_user_id)
);

-- =============================================
-- MESSAGE LOG
-- Deduplication and history tracking
-- =============================================
CREATE TABLE dm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  skool_conversation_id TEXT NOT NULL,
  skool_message_id TEXT NOT NULL,
  ghl_message_id TEXT,
  skool_user_id TEXT NOT NULL,
  direction TEXT NOT NULL,  -- 'inbound' | 'outbound'
  message_text TEXT,
  status TEXT DEFAULT 'synced',  -- 'synced' | 'pending' | 'failed'
  created_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ,
  UNIQUE(user_id, skool_message_id)
);

-- =============================================
-- HAND-RAISER CAMPAIGNS
-- Auto-DM configuration for post engagement
-- =============================================
CREATE TABLE dm_hand_raiser_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  post_url TEXT NOT NULL,
  skool_post_id TEXT,
  keyword_filter TEXT,
  dm_template TEXT NOT NULL,
  ghl_tag TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- HAND-RAISER SENT LOG
-- Track sent hand-raiser DMs (prevent duplicates)
-- =============================================
CREATE TABLE dm_hand_raiser_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES dm_hand_raiser_campaigns(id),
  skool_user_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, skool_user_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_dm_messages_user ON dm_messages(user_id);
CREATE INDEX idx_dm_messages_conversation ON dm_messages(skool_conversation_id);
CREATE INDEX idx_dm_contact_mappings_ghl ON dm_contact_mappings(ghl_contact_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE dm_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_contact_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_hand_raiser_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_hand_raiser_sent ENABLE ROW LEVEL SECURITY;

-- Service role full access (auth handled via Clerk)
CREATE POLICY "Service role full access" ON dm_sync_config FOR ALL USING (true);
CREATE POLICY "Service role full access" ON dm_contact_mappings FOR ALL USING (true);
CREATE POLICY "Service role full access" ON dm_messages FOR ALL USING (true);
CREATE POLICY "Service role full access" ON dm_hand_raiser_campaigns FOR ALL USING (true);
CREATE POLICY "Service role full access" ON dm_hand_raiser_sent FOR ALL USING (true);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER update_dm_sync_config_updated_at
  BEFORE UPDATE ON dm_sync_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dm_hand_raiser_campaigns_updated_at
  BEFORE UPDATE ON dm_hand_raiser_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
