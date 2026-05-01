CREATE TABLE IF NOT EXISTS public.behavioral_baselines (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avg_typing_interval_ms NUMERIC,
  std_typing_interval_ms NUMERIC,
  avg_pointer_velocity NUMERIC,
  std_pointer_velocity NUMERIC,
  common_hours INTEGER[] DEFAULT '{}',
  known_devices TEXT[] DEFAULT '{}',
  known_locations TEXT[] DEFAULT '{}',
  samples_count INTEGER NOT NULL DEFAULT 0,
  accessibility_mode BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.behavioral_baselines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bb_select" ON public.behavioral_baselines;
DROP POLICY IF EXISTS "bb_insert" ON public.behavioral_baselines;
DROP POLICY IF EXISTS "bb_update" ON public.behavioral_baselines;
CREATE POLICY "bb_select" ON public.behavioral_baselines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bb_insert" ON public.behavioral_baselines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bb_update" ON public.behavioral_baselines FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.behavioral_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avg_typing_interval_ms NUMERIC,
  avg_pointer_velocity NUMERIC,
  hour_of_day INTEGER,
  device_fp TEXT,
  location_hint TEXT,
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.behavioral_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bs_select" ON public.behavioral_signals;
DROP POLICY IF EXISTS "bs_insert" ON public.behavioral_signals;
CREATE POLICY "bs_select" ON public.behavioral_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bs_insert" ON public.behavioral_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_signals_user_created ON public.behavioral_signals(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  decision TEXT NOT NULL CHECK (decision IN ('approved','step_up','blocked')),
  reason_codes TEXT[] DEFAULT '{}',
  transaction_ref TEXT,
  step_up_method TEXT,
  step_up_passed BOOLEAN,
  cold_start BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "re_select" ON public.risk_events;
DROP POLICY IF EXISTS "re_insert" ON public.risk_events;
DROP POLICY IF EXISTS "re_update" ON public.risk_events;
CREATE POLICY "re_select" ON public.risk_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "re_insert" ON public.risk_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "re_update" ON public.risk_events FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_user ON public.risk_events(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.risk_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_event_id UUID REFERENCES public.risk_events(id) ON DELETE CASCADE,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('false_positive','accessibility_change','device_change','other')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.risk_disputes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rd_select" ON public.risk_disputes;
DROP POLICY IF EXISTS "rd_insert" ON public.risk_disputes;
DROP POLICY IF EXISTS "rd_update" ON public.risk_disputes;
CREATE POLICY "rd_select" ON public.risk_disputes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rd_insert" ON public.risk_disputes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rd_update" ON public.risk_disputes FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_risk_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  behavioral_monitoring_enabled BOOLEAN NOT NULL DEFAULT true,
  accessibility_mode BOOLEAN NOT NULL DEFAULT false,
  preferred_step_up TEXT NOT NULL DEFAULT 'biometric' CHECK (preferred_step_up IN ('biometric','pin','email_otp')),
  share_signals_for_global_model BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_risk_prefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "urp_select" ON public.user_risk_prefs;
DROP POLICY IF EXISTS "urp_insert" ON public.user_risk_prefs;
DROP POLICY IF EXISTS "urp_update" ON public.user_risk_prefs;
CREATE POLICY "urp_select" ON public.user_risk_prefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "urp_insert" ON public.user_risk_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "urp_update" ON public.user_risk_prefs FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.step_up_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.step_up_otps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suo_select" ON public.step_up_otps;
CREATE POLICY "suo_select" ON public.step_up_otps FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_otps_user ON public.step_up_otps(user_id, created_at DESC);