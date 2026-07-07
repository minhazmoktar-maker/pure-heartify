
CREATE OR REPLACE FUNCTION public.nightly_reaudit_sweep()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer := 0;
  sample text[];
BEGIN
  WITH del AS (
    DELETE FROM public.curated_videos v
    USING public.blocked_creators b
    WHERE lower(coalesce(v.channel_title,'') || ' ' || coalesce(v.title,''))
          LIKE '%' || lower(b.pattern) || '%'
    RETURNING v.video_id, v.channel_title
  )
  SELECT count(*), array_agg(channel_title) FILTER (WHERE channel_title IS NOT NULL)
  INTO removed, sample
  FROM del;

  INSERT INTO public.moderation_overrides (admin_id, action, target, reason, metadata)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    'nightly_sweep',
    'curated_videos',
    'automated nightly re-audit',
    jsonb_build_object('removed', removed, 'sample_channels', coalesce(sample[1:20], ARRAY[]::text[]))
  );

  RETURN jsonb_build_object('removed', removed);
END;
$$;

-- moderation_overrides.admin_id policy requires auth.uid() = admin_id on insert; the
-- security-definer function bypasses RLS, but we widen the CHECK constraint by dropping
-- the not-null tie so the sweep row (system id) is accepted for admin reads.
ALTER TABLE public.moderation_overrides ALTER COLUMN admin_id DROP NOT NULL;
