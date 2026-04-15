/**
 * Background ingestion edge function.
 * Fetches videos from YouTube for each curated section query,
 * scores them, deduplicates, and stores in the curated_videos table.
 * Designed to be called by pg_cron or manually.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// === Halal scoring (server-side copy) ===
const HARD_REJECT_KEYWORDS = [
  "music video", "official song", "official video", "remix", "mashup", "cover song",
  "lyrical video", "lyrics video", "audio track", "EP release", "DJ", "beat",
  "instrumental", "trap", "rap", "hip hop", "pop song", "dance music", "EDM",
  "concert", "live performance", "stage performance", "karaoke",
  "dance", "dancing", "choreography", "tiktok", "viral dance", "trending dance",
  "dance challenge", "lip sync", "lip-sync",
  "sexy", "hot girl", "beautiful girl", "model", "bikini", "swimsuit", "lingerie",
  "fashion show", "ramp walk", "bold", "seductive", "kissing", "romance scene",
  "love scene", "couple goals", "girlfriend", "boyfriend", "dating", "crush",
  "relationship goals", "valentine", "hookup", "only fan",
  "alcohol", "wine", "beer", "whisky", "vodka", "bar", "nightclub", "clubbing",
  "party night", "rave", "casino", "gambling", "betting", "poker", "lottery",
  "fuck", "shit", "bitch", "bastard",
  "gameplay", "gaming", "live stream gaming", "GTA", "shooting game", "battle royale",
  "prank", "trolling", "reaction video", "funny moments", "comedy skit",
  "meme compilation", "roast", "drama", "celebrity gossip", "controversy",
  "exposed", "viral clip", "shocking video",
  "pyar", "mohabbat", "ladki", "sharab", "jua", "nach",
  "حب", "اغنية", "رقص",
];

const SOFT_REJECT_PATTERNS = [
  /you won't believe/i, /shocking/i, /gone wrong/i,
  /\#viral/i, /\#fyp/i, /\#trending/i,
];

const BAD_EMOJIS = /[💃🍺🎉😍🔥🍷🎰💋👙🩱🕺]/;

const TRUSTED_CHANNELS_LOWER = [
  "mufti menk", "yaqeen institute", "bayyinah institute", "nouman ali khan",
  "mercifulservant", "merciful servant", "assim al hakeem", "yasir qadhi",
  "onepath network", "omar suleiman", "ilovuallah", "the deen show",
  "islamic guidance", "freequraneducation", "the thinking muslim", "muslim central",
  "ink of scholars", "the prophets path", "towards eternity", "about islam",
  "islamic relief", "muslim matters", "kalamullah", "zaytuna college",
  "al madina institute", "simply seerah", "daily reminder", "the daily reminder",
  "message tv", "islam on demand", "masjid al-aqsa", "makkah live", "madinah live",
  "dr. zakir naik", "digital mimbar", "one islam productions", "epic masjid",
  "omar & hana", "one 4 kids", "zaky", "muslim kids tv", "noor kids",
  "iqra cartoon", "islamic finance guru", "practical islamic finance",
  "freshly grounded", "smile2jannah", "mohammed hijab", "ali dawah",
  "5pillars", "the muslim vibe", "halal kitchen", "healthy muslim",
  "dawat-e-islami", "muslim travelers", "islam channel", "quran weekly",
  "holy quran world", "maher zain", "sami yusuf", "khan academy", "ted", "tedx talks",
  "kurzgesagt", "crashcourse", "ali abdaal",
];

function isTrusted(channel: string): boolean {
  const lower = channel.toLowerCase();
  return TRUSTED_CHANNELS_LOWER.some(c => lower.includes(c));
}

function halalScore(title: string, description: string, channelTitle: string): number {
  const text = `${title} ${description} ${channelTitle}`.toLowerCase();
  for (const kw of HARD_REJECT_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) return 0;
  }
  for (const pat of SOFT_REJECT_PATTERNS) {
    if (pat.test(text)) return 0;
  }
  if (BAD_EMOJIS.test(text)) return 0;

  let score = 0;
  const islamicKw = [
    "quran", "surah", "hadith", "sunnah", "prophet", "allah", "islam",
    "deen", "tafsir", "khutbah", "jummah", "ramadan", "eid", "hajj",
    "dawah", "nasheed", "dhikr", "dua", "salah", "prayer", "mosque",
    "scholar", "sheikh", "mufti", "imam", "fiqh", "aqeedah", "seerah",
    "islamic", "muslim", "ummah", "halal", "haram", "taqwa", "sabr",
    "education", "learn", "study", "motivation", "discipline",
    "self-improvement", "productivity", "business", "entrepreneur",
    "success", "mindset", "knowledge", "wisdom", "lecture", "reminder",
  ];
  if (islamicKw.some(k => text.includes(k))) score += 40;
  score += 20;
  score += isTrusted(channelTitle) ? 25 : 5;
  score += 20;
  return Math.min(score, 95);
}

function classifyCategory(title: string, description: string): string {
  const t = `${title} ${description}`.toLowerCase();
  if (/quran|surah|recitation|tilawat|tafsir|tajweed/.test(t)) return "Quran";
  if (/nasheed|naat|anasheed/.test(t)) return "Nasheeds";
  if (/khutbah|lecture|reminder|jummah|friday/.test(t)) return "Lectures";
  if (/business|entrepreneur|startup|marketing|finance|money|invest/.test(t)) return "Business";
  if (/study|learn|education|school|university|science|math|history/.test(t)) return "Education";
  if (/motivation|discipline|self.?improvement|productivity|habit|mindset|success/.test(t)) return "Self-Improvement";
  if (/kids|children|cartoon|family|parenting/.test(t)) return "Kids & Family";
  return "Islamic";
}

// Curated section queries (server-side config)
const SECTION_QUERIES: Record<string, string[]> = {
  "top-100": ["best Islamic lectures", "Quran recitation beautiful", "Islamic motivation", "Mufti Menk motivation", "Omar Suleiman lecture"],
  "daily-picks": ["Islamic reminder today", "morning dua adhkar", "Quran verse of the day", "Daily Reminder Islam"],
  "islamic-knowledge": ["Quran tafsir lecture", "hadith explanation", "seerah Prophet Muhammad", "Yasir Qadhi theology", "Yaqeen Institute"],
  "quran-recitations": ["Quran recitation peaceful", "surah rahman full", "beautiful Quran tilawat", "Makkah Live Quran"],
  "study-focus": ["study motivation discipline", "focus productivity tips", "Islamic study tips"],
  "business-money": ["halal investing finance", "Islamic finance explained", "Muslim entrepreneur", "Islamic Finance Guru"],
  "nasheeds": ["nasheed no music", "Islamic nasheed", "naat sharif", "Arabic nasheed acapella"],
  "family-kids": ["Islamic cartoons for kids no music", "learn Quran children", "Omar Hana no music", "Muslim Kids TV"],
  "podcasts": ["Islamic podcast discussion", "The Thinking Muslim podcast", "The Deen Show interview"],
  "dawah": ["dawah street preaching", "Islam explained non-Muslim", "Mohammed Hijab debate", "OnePath Network documentary"],
  "health-fitness": ["Muslim fitness motivation", "halal nutrition diet", "sunnah health tips"],
  "revert-stories": ["revert to Islam story", "The Deen Show revert", "why I became Muslim"],
  "halal-lifestyle": ["halal food recipe no music", "Halal Kitchen cooking", "Muslim travel vlog halal"],
  "live-streams": ["Makkah Live stream", "Madinah Live stream", "Masjid Al-Aqsa live"],
};

function decodeHtml(html: string): string {
  return html.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!YOUTUBE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Missing configuration" }, 500);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetSection = body?.section_id as string | undefined;
    const maxPerQuery = Math.min(body?.max_per_query ?? 15, 25);

    const sections = targetSection
      ? { [targetSection]: SECTION_QUERIES[targetSection] ?? [] }
      : SECTION_QUERIES;

    let totalAdded = 0;
    let totalQuota = 0;

    for (const [sectionId, queries] of Object.entries(sections)) {
      if (!queries.length) continue;

      // Pick 2 random queries per section to spread across calls
      const shuffled = queries.sort(() => Math.random() - 0.5).slice(0, 2);

      for (const query of shuffled) {
        totalQuota++;

        const params = new URLSearchParams({
          part: "snippet",
          q: query,
          type: "video",
          maxResults: String(maxPerQuery),
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
          console.error(`YouTube API error for "${query}": ${res.status}`);
          if (res.status === 403) break; // quota exceeded, stop
          continue;
        }

        const data = await res.json();
        const rows: Array<Record<string, unknown>> = [];

        for (const item of data.items ?? []) {
          const snippet = item.snippet;
          const videoId = item.id?.videoId;
          if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue;

          const title = decodeHtml(snippet?.title ?? "");
          const desc = snippet?.description ?? "";
          const channel = snippet?.channelTitle ?? "";
          const score = halalScore(title, desc, channel);

          if (score < 75) continue;

          rows.push({
            video_id: videoId,
            title,
            channel_title: channel,
            thumbnail_url: snippet?.thumbnails?.high?.url ?? snippet?.thumbnails?.medium?.url ?? "",
            published_at: snippet?.publishedAt ?? null,
            category: classifyCategory(title, desc),
            halal_score: score,
            section_id: sectionId,
            is_trusted_channel: isTrusted(channel),
          });
        }

        if (rows.length > 0) {
          // Upsert: insert new, update existing
          const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/curated_videos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": SUPABASE_SERVICE_ROLE_KEY,
              "Prefer": "resolution=merge-duplicates",
            },
            body: JSON.stringify(rows),
          });

          if (upsertRes.ok) {
            totalAdded += rows.length;
          } else {
            console.error(`Upsert failed: ${await upsertRes.text()}`);
          }
        }

        // Log ingestion
        await fetch(`${SUPABASE_URL}/rest/v1/ingestion_log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            query,
            section_id: sectionId,
            videos_found: data.items?.length ?? 0,
            videos_added: rows.length,
            quota_used: 1,
          }),
        });
      }
    }

    return json({
      success: true,
      totalAdded,
      totalQuota,
      message: `Ingested ${totalAdded} videos using ${totalQuota} API calls`,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});
