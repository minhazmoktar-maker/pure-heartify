
CREATE TABLE public.moderation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  reject_reason TEXT NOT NULL,
  matched_rule TEXT,
  halal_score INTEGER DEFAULT 0,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_moderation_log_created ON public.moderation_log (created_at DESC);
CREATE INDEX idx_moderation_log_reason ON public.moderation_log (reject_reason, created_at DESC);

ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation log"
  ON public.moderation_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
