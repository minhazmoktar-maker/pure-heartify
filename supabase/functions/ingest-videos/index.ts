/**
 * Background ingestion edge function — high-throughput, quota-aware.
 *
 * Two ingestion tracks:
 *  1. CHANNELS track (cheap & strict):
 *     - Resolves trusted channel names -> channelId -> uploadsPlaylistId (cached in channels_state).
 *     - Pages through `playlistItems` to fetch up to 50 videos per channel per call (1 quota unit each).
 *     - Every video from a trusted channel auto-passes moderation (still keyword-screened).
 *  2. DISCOVERY track (legacy search):
 *     - Runs a small rotating set of section queries through `search.list` (100 quota units each).
 *     - Strict halalScore filter rejects anything questionable.
 *
 * Designed to be called by pg_cron every 3 hours. Targets ~15k new videos/day on a 10k quota.
 *
 * Body params:
 *   { mode?: "channels" | "discovery" | "both", channels_per_run?: number, discovery_queries?: number }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// === Halal scoring ===
const HARD_REJECT_KEYWORDS = [
  "music video", "official song", "official video", "remix", "mashup", "cover song",
  "lyrical video", "lyrics video", "audio track", "EP release", "DJ set", "beat drop",
  "trap music", "rap song", "hip hop song", "pop song", "dance music", "EDM",
  "concert", "live performance music", "stage performance", "karaoke",
  "dancing", "choreography", "tiktok dance", "viral dance", "trending dance",
  "dance challenge", "lip sync", "lip-sync",
  "sexy", "hot girl", "bikini", "swimsuit", "lingerie",
  "fashion show", "ramp walk", "seductive", "kissing", "romance scene",
  "love scene", "couple goals", "girlfriend prank", "boyfriend prank", "dating advice secular",
  "valentine party", "hookup", "only fan",
  "alcohol", "wine review", "beer review", "whisky", "vodka", "nightclub", "clubbing",
  "party night", "rave", "casino", "gambling", "betting tips", "poker game", "lottery",
  "fuck", "shit ", "bitch", "bastard",
  "gameplay", "battle royale gaming", "GTA gameplay",
  "prank gone wrong", "trolling", "celebrity gossip",
  "exposed scandal",
  // Female-presenting visual content (per moderation rules: no female faces/visuals)
  "makeup tutorial", "hijab tutorial", "hijab style", "modest fashion haul",
  "outfit of the day", "ootd", "get ready with me", "grwm", "vlogmas",
  "my morning routine girl", "girls vlog", "sister vlog", "wife vlog",
  "beauty haul", "fashion haul", "lookbook",
  "حب اغنية", "اغنية رقص", "رقص",
];

const SOFT_REJECT_PATTERNS = [
  /you won't believe/i, /gone wrong/i,
  /\#fyp/i,
];

const BAD_EMOJIS = /[💃🍺🍷🎰💋👙🩱🕺]/;

// Trusted channels — keep in sync with src/data/trustedChannels.ts
const TRUSTED_CHANNELS: string[] = [
  // Core scholars & institutes
  "Mufti Menk", "Yaqeen Institute", "Bayyinah Institute", "MercifulServant",
  "Assim Al Hakeem", "Yasir Qadhi", "OnePath Network", "Omar Suleiman",
  "iLovUAllah", "The Deen Show", "Islamic Guidance", "FreeQuranEducation",
  "The Thinking Muslim", "Muslim Central", "Ink of Scholars", "The Prophets Path",
  "Towards Eternity", "About Islam", "Islamic Relief", "MuslimMatters",
  "Kalamullah", "Zaytuna College", "Al Madina Institute", "Simply Seerah",
  "Daily Reminder", "Message TV", "Islam on Demand", "Dr Zakir Naik",
  "Digital Mimbar", "One Islam Productions", "EPIC MASJID",
  "Quran Weekly", "Holy Quran World",
  // Dawah & intellectual
  "One Message Foundation", "Rational Believer", "Sapience Institute",
  "EFDawah", "SC Dawah", "Dawah Team", "L.A. Dawah", "Always Islam",
  "iERA", "DUS Dawah", "Darul Arqam Studios", "Mohammed Hijab", "Ali Dawah",
  "Smile2Jannah", "5Pillars", "The Muslim Vibe",
  // Academic & fiqh
  "Al-Kauthar Institute", "Mishkah University", "ZamZam Academy", "SeekersGuidance",
  "Roots Academy", "Islamic Online University", "AlMaghrib Institute",
  "IslamQA", "Sharia Program", "Madina Institute",
  // Lifestyle, podcasts, finance
  "Chai With My Bhai", "Productive Muslim", "Islamic Finance Guru",
  "Practical Islamic Finance", "Wahed Invest", "Zoya Finance",
  "Halal Kitchen", "Healthy Muslim", "Muslim Travelers",
  // Recitation
  "Mishary Rashid Alafasy", "Sheikh Shuraim", "Sudais", "Islam Sobhi",
  "Raad Al Kurdi", "Omar Hisham Al Arabi", "Fatih Seferagic",
  // Kids
  "Omar & Hana", "One 4 Kids", "Muslim Kids TV", "Noor Kids", "Iqra Cartoon",
  // Live streams
  "Makkah Live", "Madinah Live",
  // Live streams
  "Makkah Live", "Madinah Live",
  // Nasheeds (vocal-only emphasized)
  "Maher Zain", "Sami Yusuf", "Zain Bhikha", "Siedd", "Deen Squad", "Mishary Alafasy Nasheed",
  // Additional curated (recitation, podcasts, docs, dawah, lifestyle, nasheeds)
  "Quran Revolution TV", "Yasser Al-Dosari", "Maher Al-Muaiqly", "Abdul Rahman Al-Sudais",
  "IlmFeed Podcast", "IlmFeed", "Mind Heist Podcast", "Digital Sisterhood Podcast",
  "Freshly Grounded", "Ali Hammuda", "Al Jazeera Documentary", "TRT World",
  "Eman Channel", "Huda TV", "Islam Channel", "Hamza's Den", "Halal Chef",
  "Cooking with Ammar", "Sunnah Style", "Seerah of Prophet Muhammad",
  "Qalam Institute", "The Daily Reminder",
];

function isTrusted(channel: string): boolean {
  const lower = channel.toLowerCase();
  return TRUSTED_CHANNELS.some(c => lower.includes(c.toLowerCase()));
}

function halalScore(title: string, description: string, channelTitle: string, trusted: boolean): number {
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
    "self-improvement", "productivity", "ruqyah", "adhan", "tajweed",
    "tilawat", "recitation",
  ];
  if (islamicKw.some(k => text.includes(k))) score += 40;
  score += 20;
  score += trusted ? 25 : 5;
  score += 20;
  return Math.min(score, 95);
}

function classifyCategory(title: string, description: string, channelTitle: string): string {
  const t = `${title} ${description} ${channelTitle}`.toLowerCase();
  if (/quran|surah|recitation|tilawat|tafsir|tajweed/.test(t)) return "Quran";
  if (/nasheed|naat|anasheed/.test(t)) return "Nasheeds";
  if (/adhan|call to prayer/.test(t)) return "Adhan";
  if (/ruqyah|healing|dhikr|dua/.test(t)) return "Spirituality";
  if (/dawah|debate|comparative|revert|convert/.test(t)) return "Dawah";
  if (/fiqh|aqeedah|creed|jurisprudence|fatwa/.test(t)) return "Fiqh";
  if (/khutbah|lecture|reminder|jummah|friday/.test(t)) return "Lectures";
  if (/business|entrepreneur|startup|finance|money|invest/.test(t)) return "Business";
  if (/study|learn|education|history/.test(t)) return "Education";
  if (/motivation|discipline|productivity|habit|mindset|success/.test(t)) return "Self-Improvement";
  if (/kids|children|cartoon|family|parenting/.test(t)) return "Kids & Family";
  if (/podcast|interview/.test(t)) return "Podcasts";
  if (/fitness|health|nutrition|workout/.test(t)) return "Health & Fitness";
  if (/travel|food|recipe|lifestyle|modest/.test(t)) return "Lifestyle";
  return "Islamic";
}

// Loose mapping from channel keyword -> section_id (for ranking on homepage)
function inferSectionFromChannel(channelTitle: string): string {
  const c = channelTitle.toLowerCase();
  if (/menk|suleiman|yaqeen|bayyinah|qadhi|deen show|merciful/.test(c)) return "top-100";
  if (/alafasy|shuraim|sudais|sobhi|kurdi|hisham|fatih|holy quran/.test(c)) return "elite-recitation";
  if (/finance guru|practical islamic finance|wahed|zoya/.test(c)) return "halal-finance";
  if (/seekersguidance|al-?kauthar|mishkah|zamzam|almaghrib|roots|madina/.test(c)) return "academic-fiqh";
  if (/sapience|thinking muslim|rational believer|hijab|ali dawah|onepath|efdawah|sc dawah|iera/.test(c)) return "dawah";
  if (/omar.*hana|one 4 kids|muslim kids|noor kids|iqra/.test(c)) return "family-kids";
  if (/chai with my bhai|productive muslim/.test(c)) return "community-podcasts";
  if (/halal kitchen|halal eats|muslim travelers/.test(c)) return "halal-lifestyle";
  if (/healthy muslim|muslim fitness|faith.*fitness/.test(c)) return "health-fitness";
  if (/makkah live|madinah live/.test(c)) return "live-streams";
  if (/maher zain|sami yusuf|nasheed|qari hub|tranquil/.test(c)) return "nasheeds";
  return "islamic-knowledge";
}

const SECTION_QUERIES: Record<string, string[]> = {
  "top-100": ["best Islamic lectures", "Mufti Menk motivation", "Omar Suleiman reminder"],
  "daily-picks": ["Islamic reminder today", "morning dua adhkar"],
  "islamic-knowledge": ["Quran tafsir lecture", "seerah Prophet Muhammad", "hadith explanation"],
  "quran-recitations": ["surah rahman full", "beautiful Quran tilawat"],
  "business-money": ["halal investing", "Islamic Finance Guru"],
  "nasheeds": ["nasheed no music vocal only"],
  "family-kids": ["Islamic cartoons no music kids", "Muslim Kids TV"],
  "podcasts": ["The Thinking Muslim podcast", "Chai With My Bhai"],
  "dawah": ["Mohammed Hijab debate", "Sapience Institute dawah"],
  "intellectual": ["Sapience Institute philosophy", "Rational Believer"],
  "academic-fiqh": ["SeekersGuidance class", "AlMaghrib seminar"],
  "revert-stories": ["The Deen Show revert", "why I became Muslim"],
  "halal-lifestyle": ["halal food recipe no music", "Halal Eats food review"],
  "recitation-tranquility": ["Quran recitation peaceful sleep", "morning evening dhikr"],
  "halal-finance": ["Practical Islamic Finance portfolio", "Zoya Finance screening"],
  "elite-recitation": ["Mishary Rashid Alafasy full surah", "Omar Hisham Al Arabi Quran"],
  "advanced-learning": ["Arabic with Husna", "SeekersGuidance Global"],
  "live-streams": ["Makkah Live stream", "Madinah Live stream"],
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

// === Supabase REST helpers ===
async function sbFetch(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "apikey": SUPABASE_SERVICE_ROLE_KEY!,
      ...(init.headers ?? {}),
    },
  });
}

async function upsertVideos(rows: Record<string, unknown>[]): Promise<number> {
  if (!rows.length) return 0;
  const res = await sbFetch("curated_videos?on_conflict=video_id", {
    method: "POST",
    headers: { "Prefer": "resolution=ignore-duplicates,return=headers-only" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    console.error(`upsert failed ${res.status}: ${await res.text()}`);
    return 0;
  }
  return rows.length;
}

async function logIngestion(query: string, sectionId: string | null, found: number, added: number, quota: number) {
  await sbFetch("ingestion_log", {
    method: "POST",
    body: JSON.stringify({ query, section_id: sectionId, videos_found: found, videos_added: added, quota_used: quota }),
  }).catch(() => {});
}

// === Channel resolution ===
async function ensureChannelsSeeded() {
  // Insert any missing trusted channels into channels_state
  const rows = TRUSTED_CHANNELS.map(name => ({ channel_name: name }));
  await sbFetch("channels_state?on_conflict=channel_name", {
    method: "POST",
    headers: { "Prefer": "resolution=ignore-duplicates,return=headers-only" },
    body: JSON.stringify(rows),
  }).catch((e) => console.error("seed channels error", e));
}

async function resolveChannel(channelName: string): Promise<{ channelId: string; uploadsPlaylistId: string } | null> {
  // 1 quota for search.list (100 units) — only do this once per channel, then cache
  const searchParams = new URLSearchParams({
    part: "snippet",
    q: channelName,
    type: "channel",
    maxResults: "1",
    key: YOUTUBE_API_KEY!,
  });
  const sr = await fetch(`${BASE_URL}/search?${searchParams}`);
  if (!sr.ok) return null;
  const sd = await sr.json();
  const channelId = sd.items?.[0]?.id?.channelId;
  if (!channelId) return null;

  // channels.list to get uploads playlist (1 quota unit)
  const cParams = new URLSearchParams({
    part: "contentDetails",
    id: channelId,
    key: YOUTUBE_API_KEY!,
  });
  const cr = await fetch(`${BASE_URL}/channels?${cParams}`);
  if (!cr.ok) return null;
  const cd = await cr.json();
  const uploads = cd.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return null;

  return { channelId, uploadsPlaylistId: uploads };
}

interface ChannelStateRow {
  id: string;
  channel_name: string;
  channel_id: string | null;
  uploads_playlist_id: string | null;
  next_page_token: string | null;
  total_pulled: number;
  last_pulled_at: string | null;
}

async function pickStaleChannels(limit: number): Promise<ChannelStateRow[]> {
  const url = `channels_state?select=id,channel_name,channel_id,uploads_playlist_id,next_page_token,total_pulled,last_pulled_at&order=last_pulled_at.asc.nullsfirst&limit=${limit}`;
  const res = await sbFetch(url);
  if (!res.ok) return [];
  return await res.json();
}

async function updateChannelState(id: string, patch: Record<string, unknown>) {
  await sbFetch(`channels_state?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  }).catch(() => {});
}

// === CHANNELS TRACK: pull uploads playlist ===
async function ingestChannel(state: ChannelStateRow): Promise<{ added: number; quota: number }> {
  let quota = 0;
  let channelId = state.channel_id;
  let uploadsId = state.uploads_playlist_id;

  if (!channelId || !uploadsId) {
    const resolved = await resolveChannel(state.channel_name);
    quota += 101; // search(100) + channels(1)
    if (!resolved) {
      await updateChannelState(state.id, { last_pulled_at: new Date().toISOString() });
      return { added: 0, quota };
    }
    channelId = resolved.channelId;
    uploadsId = resolved.uploadsPlaylistId;
    await updateChannelState(state.id, {
      channel_id: channelId,
      uploads_playlist_id: uploadsId,
      resolved_at: new Date().toISOString(),
    });
  }

  // Page through playlistItems (1 quota unit per page, 50 items per page)
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId: uploadsId,
    maxResults: "50",
    key: YOUTUBE_API_KEY!,
  });
  if (state.next_page_token) params.set("pageToken", state.next_page_token);

  const res = await fetch(`${BASE_URL}/playlistItems?${params}`);
  quota += 1;
  if (!res.ok) {
    console.error(`playlistItems failed for ${state.channel_name}: ${res.status}`);
    await updateChannelState(state.id, { last_pulled_at: new Date().toISOString() });
    return { added: 0, quota };
  }
  const data = await res.json();
  const items = data.items ?? [];
  const nextToken = data.nextPageToken ?? null;

  const rows: Record<string, unknown>[] = [];
  for (const item of items) {
    const snippet = item.snippet;
    const videoId = item.contentDetails?.videoId;
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue;
    const title = decodeHtml(snippet?.title ?? "");
    if (title === "Private video" || title === "Deleted video") continue;
    const desc = snippet?.description ?? "";
    const channel = snippet?.videoOwnerChannelTitle ?? snippet?.channelTitle ?? state.channel_name;
    const score = halalScore(title, desc, channel, true);
    if (score < 75) continue; // even trusted channels get keyword-screened

    rows.push({
      video_id: videoId,
      title,
      channel_title: channel,
      thumbnail_url:
        snippet?.thumbnails?.high?.url ??
        snippet?.thumbnails?.medium?.url ??
        snippet?.thumbnails?.default?.url ?? "",
      published_at: snippet?.publishedAt ?? null,
      category: classifyCategory(title, desc, channel),
      halal_score: score,
      section_id: inferSectionFromChannel(channel),
      is_trusted_channel: true,
    });
  }

  const added = await upsertVideos(rows);
  await updateChannelState(state.id, {
    next_page_token: nextToken,
    last_pulled_at: new Date().toISOString(),
    total_pulled: state.total_pulled + added,
  });
  await logIngestion(`channel:${state.channel_name}`, null, items.length, added, quota);
  return { added, quota };
}

// === DISCOVERY TRACK: keyword search ===
async function ingestDiscoveryQuery(sectionId: string, query: string): Promise<{ added: number; quota: number }> {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "25",
    safeSearch: "strict",
    relevanceLanguage: "en",
    order: "relevance",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    key: YOUTUBE_API_KEY!,
  });
  const res = await fetch(`${BASE_URL}/search?${params}`);
  if (!res.ok) return { added: 0, quota: 100 };
  const data = await res.json();

  const rows: Record<string, unknown>[] = [];
  for (const item of data.items ?? []) {
    const snippet = item.snippet;
    const videoId = item.id?.videoId;
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue;
    const title = decodeHtml(snippet?.title ?? "");
    const desc = snippet?.description ?? "";
    const channel = snippet?.channelTitle ?? "";
    const trusted = isTrusted(channel);
    const score = halalScore(title, desc, channel, trusted);
    // Strict for discovery: 80+ unless trusted
    if (score < (trusted ? 75 : 80)) continue;

    rows.push({
      video_id: videoId,
      title,
      channel_title: channel,
      thumbnail_url: snippet?.thumbnails?.high?.url ?? snippet?.thumbnails?.medium?.url ?? "",
      published_at: snippet?.publishedAt ?? null,
      category: classifyCategory(title, desc, channel),
      halal_score: score,
      section_id: sectionId,
      is_trusted_channel: trusted,
    });
  }

  const added = await upsertVideos(rows);
  await logIngestion(query, sectionId, data.items?.length ?? 0, added, 100);
  return { added, quota: 100 };
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
    const mode: "channels" | "discovery" | "both" = body?.mode ?? "both";
    // Per 3-hour run, target ~5,000 quota units max (8 runs/day = 40k → safe under 10k/day if we tune):
    // Actually we have 10k/day total. 8 runs/day → 1,250/run.
    // channels_per_run=80 channels (avg ~1 quota each after first resolve) ≈ 80
    // discovery_queries=10 (10 * 100 = 1000)
    // Total per run ≈ 1,080 → 8,640/day. Safe.
    const channelsPerRun = Math.min(body?.channels_per_run ?? 80, 200);
    const discoveryQueries = Math.min(body?.discovery_queries ?? 10, 30);

    let totalAdded = 0;
    let totalQuota = 0;

    if (mode === "channels" || mode === "both") {
      await ensureChannelsSeeded();
      const stale = await pickStaleChannels(channelsPerRun);
      for (const ch of stale) {
        const r = await ingestChannel(ch);
        totalAdded += r.added;
        totalQuota += r.quota;
        if (totalQuota > 8000) break; // safety
      }
    }

    if (mode === "discovery" || mode === "both") {
      const allQueries: Array<[string, string]> = [];
      for (const [sec, qs] of Object.entries(SECTION_QUERIES)) {
        for (const q of qs) allQueries.push([sec, q]);
      }
      // Shuffle and take a slice each run to spread coverage
      allQueries.sort(() => Math.random() - 0.5);
      for (const [sec, q] of allQueries.slice(0, discoveryQueries)) {
        const r = await ingestDiscoveryQuery(sec, q);
        totalAdded += r.added;
        totalQuota += r.quota;
        if (totalQuota > 9500) break;
      }
    }

    return json({
      success: true,
      mode,
      totalAdded,
      totalQuota,
      message: `Ingested ${totalAdded} new videos (~${totalQuota} quota units used).`,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return json({ error: String(error) }, 500);
  }
});
