
CREATE TABLE IF NOT EXISTS public.blocked_creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blocked_creators TO authenticated;
GRANT ALL ON public.blocked_creators TO service_role;

ALTER TABLE public.blocked_creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view blocked creators"
  ON public.blocked_creators FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage blocked creators"
  ON public.blocked_creators FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.blocked_creators (pattern, reason) VALUES
  ('mia yilin', 'policy: blocked creator'),
  ('leila hormozi', 'policy: blocked creator'),
  ('layla hormozi', 'policy: blocked creator'),
  ('mehreen', 'policy: blocked creator')
ON CONFLICT (pattern) DO NOTHING;

CREATE OR REPLACE FUNCTION public.enforce_blocked_creators()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hay text := lower(coalesce(NEW.channel_title,'') || ' ' || coalesce(NEW.title,''));
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.blocked_creators
    WHERE hay LIKE '%' || lower(pattern) || '%'
  ) THEN
    RAISE EXCEPTION 'Blocked creator content rejected: %', NEW.channel_title;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_blocked_creators ON public.curated_videos;
CREATE TRIGGER trg_enforce_blocked_creators
  BEFORE INSERT OR UPDATE ON public.curated_videos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_blocked_creators();

-- Sweep any pre-existing rows that would violate the new rule.
DELETE FROM public.curated_videos cv
USING public.blocked_creators bc
WHERE lower(coalesce(cv.channel_title,'') || ' ' || coalesce(cv.title,'')) LIKE '%' || lower(bc.pattern) || '%';
