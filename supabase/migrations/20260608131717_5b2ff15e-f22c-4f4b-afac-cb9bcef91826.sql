
-- ============ USER INTERESTS ============
CREATE TABLE public.user_interests (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_interest text NOT NULL,
  secondary_interest text,
  exploration_interest text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_interests TO authenticated;
GRANT ALL ON public.user_interests TO service_role;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_interests_select_own" ON public.user_interests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_interests_insert_own" ON public.user_interests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_interests_update_own" ON public.user_interests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_user_interests_updated BEFORE UPDATE ON public.user_interests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DAILY DOSE ============
CREATE TABLE public.daily_dose (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dose_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  video_ids text[] NOT NULL DEFAULT '{}',
  total_minutes int NOT NULL DEFAULT 0,
  completed_count int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dose_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_dose TO authenticated;
GRANT ALL ON public.daily_dose TO service_role;
ALTER TABLE public.daily_dose ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_dose_select_own" ON public.daily_dose FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "daily_dose_insert_own" ON public.daily_dose FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_dose_update_own" ON public.daily_dose FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX daily_dose_user_date_idx ON public.daily_dose (user_id, dose_date DESC);
CREATE TRIGGER trg_daily_dose_updated BEFORE UPDATE ON public.daily_dose FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DOSE COMPLETIONS ============
CREATE TABLE public.dose_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dose_id uuid NOT NULL REFERENCES public.daily_dose(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dose_id, video_id)
);
GRANT SELECT, INSERT, DELETE ON public.dose_completions TO authenticated;
GRANT ALL ON public.dose_completions TO service_role;
ALTER TABLE public.dose_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dose_completions_select_own" ON public.dose_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dose_completions_insert_own" ON public.dose_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ STREAKS ============
CREATE TABLE public.streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_completed_date date,
  total_doses_completed int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.streaks TO authenticated;
GRANT ALL ON public.streaks TO service_role;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks_select_own" ON public.streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "streaks_insert_own" ON public.streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "streaks_update_own" ON public.streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_streaks_updated BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ WATCH HISTORY: add progress ============
ALTER TABLE public.watch_history
  ADD COLUMN IF NOT EXISTS progress_seconds int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_seconds int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;
