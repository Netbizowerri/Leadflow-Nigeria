-- =============================================================
-- LeadFlow Nigeria: Application Tables with RLS
-- Run this AFTER 001_profiles_and_auth.sql
-- =============================================================

-- 1. LEADS TABLE
-- Stores discovered business leads per user
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT NOT NULL DEFAULT '',
  rating NUMERIC(3,1),
  user_ratings_total INTEGER,
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Closed', 'Not Interested')),
  source TEXT NOT NULL DEFAULT 'Manual' CHECK (source IN ('Google Maps', 'Nigerian Directories', 'VConnect', 'BusinessList', 'Manual')),
  notes TEXT NOT NULL DEFAULT '',
  date_added TIMESTAMPTZ NOT NULL DEFAULT now(),
  original_search_query TEXT,
  website TEXT,
  has_website BOOLEAN DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id, user_id)
);

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_date_added ON public.leads(date_added DESC);

-- Updated_at trigger for leads
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Leads RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
CREATE POLICY "Super admin full access on leads"
  ON public.leads FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Users can CRUD their own leads
CREATE POLICY "Users can insert own leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;

-- 2. WEBHOOK LOGS TABLE
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_name TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  status_code INTEGER,
  response_preview TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON public.webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_timestamp ON public.webhook_logs(timestamp DESC);

-- Webhook logs RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on webhook_logs"
  ON public.webhook_logs FOR ALL
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Users can insert own webhook_logs"
  ON public.webhook_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own webhook_logs"
  ON public.webhook_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own webhook_logs"
  ON public.webhook_logs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.webhook_logs TO authenticated;

-- 3. SEARCH HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at DESC);

-- Search history RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on search_history"
  ON public.search_history FOR ALL
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Users can insert own search_history"
  ON public.search_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own search_history"
  ON public.search_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own search_history"
  ON public.search_history FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.search_history TO authenticated;

-- 4. USER SETTINGS TABLE (per-user configuration)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hunter_api_key TEXT NOT NULL DEFAULT '',
  privyr_webhook_url TEXT NOT NULL DEFAULT '',
  custom_webhook_url TEXT NOT NULL DEFAULT '',
  webhook_auth_header TEXT NOT NULL DEFAULT 'Authorization',
  webhook_auth_value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- User settings RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on user_settings"
  ON public.user_settings FOR ALL
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Users can insert own user_settings"
  ON public.user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own user_settings"
  ON public.user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own user_settings"
  ON public.user_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;

-- 5. BLOCKED PHONES TABLE (per-user blocklist)
CREATE TABLE IF NOT EXISTS public.blocked_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_blocked_phones_user_id ON public.blocked_phones(user_id);

-- Blocked phones RLS
ALTER TABLE public.blocked_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on blocked_phones"
  ON public.blocked_phones FOR ALL
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Users can manage own blocked_phones"
  ON public.blocked_phones FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.blocked_phones TO authenticated;
