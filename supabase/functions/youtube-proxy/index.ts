const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const BASE_URL = "https://www.googleapis.com/youtube/v3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!YOUTUBE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "YouTube API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { query, maxResults } = await req.json();

    if (!query || typeof query !== "string" || query.length > 200) {
      return new Response(
        JSON.stringify({ error: "Invalid query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const max = Math.min(Number(maxResults) || 20, 50);

    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: String(max),
      safeSearch: "strict",
      relevanceLanguage: "en",
      key: YOUTUBE_API_KEY,
    });

    const res = await fetch(`${BASE_URL}/search?${params}`);
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`YouTube API error [${res.status}]: ${errorBody}`);
      return new Response(
        JSON.stringify({ error: `YouTube API error: ${res.status}` }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
