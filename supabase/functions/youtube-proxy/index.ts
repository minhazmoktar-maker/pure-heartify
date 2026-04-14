const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const BASE_URL = "https://www.googleapis.com/youtube/v3";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!YOUTUBE_API_KEY) {
    return json({ error: "YouTube API key not configured", code: "YOUTUBE_API_KEY_MISSING" }, 500);
  }

  try {
    const body = await req.json().catch(() => null);
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const requestedMax = Number(body?.maxResults);

    if (!query || query.length > 200) {
      return json({ error: "Invalid query parameter", code: "INVALID_QUERY" }, 400);
    }

    const max = Math.min(Math.max(Number.isFinite(requestedMax) ? requestedMax : 12, 1), 25);

    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: String(max),
      safeSearch: "strict",
      relevanceLanguage: "en",
      regionCode: "US",
      order: "relevance",
      videoEmbeddable: "true",
      videoSyndicated: "true",
      key: YOUTUBE_API_KEY,
    });

    const res = await fetch(`${BASE_URL}/search?${params}`);

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`YouTube API error [${res.status}]: ${errorBody}`);

      const isQuotaExceeded =
        res.status === 403 && /quotaExceeded|exceeded your .*quota/i.test(errorBody);

      if (isQuotaExceeded) {
        return json({
          items: [],
          degraded: true,
          code: "YOUTUBE_QUOTA_EXCEEDED",
          error: "YouTube quota temporarily exhausted",
        });
      }

      return json(
        { error: `YouTube API error: ${res.status}`, code: "YOUTUBE_API_ERROR" },
        res.status,
      );
    }

    const data = await res.json();
    return json({ ...data, degraded: false });
  } catch (error) {
    console.error("Edge function error:", error);
    return json({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" }, 500);
  }
});
