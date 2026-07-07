/**
 * useSmartSearch — client-side intelligent search over the moderated feed.
 *
 * Loads a bounded, moderation-safe corpus from `curated_videos`
 * (RLS already filters non-halal content) and runs the searchEngine
 * against it. Debounced, cached, and never bypasses server-side filters.
 */
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  buildIndex,
  didYouMean,
  search,
  suggest,
  type Searchable,
} from "@/lib/searchEngine";

interface Row {
  video_id: string;
  title: string;
  channel_title: string | null;
  category: string | null;
  thumbnail_url: string | null;
  halal_score: number | null;
  published_at: string | null;
}

async function loadCorpus(): Promise<Row[]> {
  const { data, error } = await supabase
    .from("curated_videos")
    .select("video_id,title,channel_title,category,thumbnail_url,halal_score,published_at")
    .eq("is_trusted_channel", true)
    .order("published_at", { ascending: false })
    .limit(1500);
  if (error) throw error;
  return (data ?? []) as Row[];
}

export function useSmartSearch(rawQuery: string) {
  const [debounced, setDebounced] = useState(rawQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(rawQuery), 250);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const { data: corpus = [], isLoading } = useQuery({
    queryKey: ["smart-search-corpus"],
    queryFn: loadCorpus,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items: Searchable[] = useMemo(
    () =>
      corpus.map((r) => ({
        id: r.video_id,
        title: r.title,
        channelTitle: r.channel_title,
        category: r.category,
      })),
    [corpus],
  );

  const fuse = useMemo(() => buildIndex(items), [items]);

  const results = useMemo(() => {
    if (!debounced) return [];
    return search(fuse, debounced, 60);
  }, [fuse, debounced]);

  const suggestion = useMemo(() => {
    if (!debounced || results.length >= 3) return null;
    return didYouMean(items, debounced);
  }, [items, debounced, results.length]);

  const suggestionsForPrefix = useMemo(() => {
    if (!rawQuery || rawQuery.length < 2) return [];
    return suggest(items, rawQuery, 6);
  }, [items, rawQuery]);

  const enriched = useMemo(() => {
    const byId = new Map(corpus.map((r) => [r.video_id, r]));
    return results
      .map((r) => {
        const row = byId.get(r.item.id);
        if (!row) return null;
        return {
          id: row.video_id,
          title: row.title,
          channelTitle: row.channel_title ?? "",
          thumbnailUrl: row.thumbnail_url ?? "",
          category: row.category ?? "All",
          halalScore: row.halal_score ?? 0,
          publishedAt: row.published_at ?? new Date().toISOString(),
          videoUrl: `https://www.youtube.com/watch?v=${row.video_id}`,
          matchType: r.matchType,
          score: r.score,
        };
      })
      .filter(Boolean);
  }, [results, corpus]);

  return {
    isLoading,
    results: enriched,
    didYouMean: suggestion,
    autocomplete: suggestionsForPrefix,
  };
}
