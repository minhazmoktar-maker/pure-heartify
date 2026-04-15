
-- Cached curated videos table
CREATE TABLE public.curated_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  category TEXT NOT NULL DEFAULT 'Islamic',
  halal_score INTEGER NOT NULL DEFAULT 0 CHECK (halal_score >= 0 AND halal_score <= 95),
  section_id TEXT,
  is_trusted_channel BOOLEAN NOT NULL DEFAULT false,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.curated_videos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view curated videos"
  ON public.curated_videos
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Indexes for fast cursor pagination
CREATE INDEX idx_curated_videos_score_ingested ON public.curated_videos (halal_score DESC, ingested_at DESC);
CREATE INDEX idx_curated_videos_category ON public.curated_videos (category, halal_score DESC);
CREATE INDEX idx_curated_videos_section ON public.curated_videos (section_id, halal_score DESC);
CREATE INDEX idx_curated_videos_ingested ON public.curated_videos (ingested_at DESC);

-- Ingestion log to track API usage
CREATE TABLE public.ingestion_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  section_id TEXT,
  videos_found INTEGER NOT NULL DEFAULT 0,
  videos_added INTEGER NOT NULL DEFAULT 0,
  quota_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ingestion_log ENABLE ROW LEVEL SECURITY;

-- No client access to ingestion log
CREATE POLICY "No client access to ingestion log"
  ON public.ingestion_log
  FOR SELECT
  TO authenticated
  USING (false);
