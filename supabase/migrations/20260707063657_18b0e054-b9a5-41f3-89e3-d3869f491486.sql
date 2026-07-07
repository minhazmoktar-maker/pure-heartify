
INSERT INTO public.blocked_creators (pattern, reason) VALUES
  ('muslimah vlog', 'female vlog content'),
  ('hijab tutorial', 'female fashion/beauty'),
  ('hijab style', 'female fashion'),
  ('modest fashion', 'female fashion'),
  ('makeup tutorial', 'female beauty'),
  ('grwm', 'female get-ready content'),
  ('haleh banani', 'female presenter (AlMaghrib)'),
  ('yasmin mogahed', 'female presenter'),
  ('fatima barkatulla', 'female presenter'),
  ('ustadha', 'female presenter title'),
  ('shaykha', 'female scholar title'),
  ('sisters vlog', 'female vlog'),
  ('sister speaks', 'female presenter'),
  ('her journey', 'female presenter'),
  ('her story', 'female presenter'),
  ('bikini', 'inappropriate visual'),
  ('lingerie', 'inappropriate visual'),
  ('twerk', 'inappropriate content'),
  ('onlyfans', 'inappropriate content'),
  ('nightclub', 'haram lifestyle'),
  ('dance challenge', 'inappropriate content')
ON CONFLICT (pattern) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.moderation_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('unblock_pattern','block_pattern','restore_video','purge_video','allow_video','nightly_sweep')),
  target text NOT NULL,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.moderation_overrides TO authenticated;
GRANT ALL ON public.moderation_overrides TO service_role;

ALTER TABLE public.moderation_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read overrides"
  ON public.moderation_overrides FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert overrides"
  ON public.moderation_overrides FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

DELETE FROM public.curated_videos v
USING public.blocked_creators b
WHERE lower(coalesce(v.channel_title,'') || ' ' || coalesce(v.title,''))
      LIKE '%' || lower(b.pattern) || '%';

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
