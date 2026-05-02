CREATE INDEX IF NOT EXISTS idx_curated_section_score
  ON public.curated_videos (section_id, halal_score DESC, ingested_at DESC);

CREATE INDEX IF NOT EXISTS idx_curated_category_score
  ON public.curated_videos (category, halal_score DESC, ingested_at DESC);

CREATE INDEX IF NOT EXISTS idx_curated_trusted_score
  ON public.curated_videos (is_trusted_channel, halal_score DESC, ingested_at DESC);

CREATE INDEX IF NOT EXISTS idx_curated_published
  ON public.curated_videos (published_at DESC NULLS LAST);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_curated_title_trgm
  ON public.curated_videos USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_curated_channel_trgm
  ON public.curated_videos USING gin (channel_title gin_trgm_ops);

CREATE TABLE IF NOT EXISTS public.channels_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name text NOT NULL UNIQUE,
  channel_id text,
  uploads_playlist_id text,
  category text,
  last_pulled_at timestamptz,
  next_page_token text,
  total_pulled integer NOT NULL DEFAULT 0,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.channels_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view channel state" ON public.channels_state;
CREATE POLICY "Anyone can view channel state"
  ON public.channels_state FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_channels_last_pulled
  ON public.channels_state (last_pulled_at NULLS FIRST);

DROP TRIGGER IF EXISTS update_channels_state_updated_at ON public.channels_state;
CREATE TRIGGER update_channels_state_updated_at
  BEFORE UPDATE ON public.channels_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;