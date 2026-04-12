const API_KEY = "AIzaSyApFYC1PRsrAvHeTmx5XWqQI57lxKGFNfY";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// ── Hard-reject keyword lists ──────────────────────────────────────
const HARD_REJECT_KEYWORDS = [
  // music
  "music video", "official song", "official video", "remix", "mashup", "cover song",
  "lyrical video", "lyrics video", "audio track", "EP release", "DJ", "beat",
  "instrumental", "trap", "rap", "hip hop", "pop song", "dance music", "EDM",
  "concert", "live performance", "stage performance", "karaoke",
  // dance
  "dance", "dancing", "choreography", "tiktok", "viral dance", "trending dance",
  "dance challenge", "lip sync", "lip-sync",
  // sexual / romance
  "sexy", "hot girl", "beautiful girl", "model", "bikini", "swimsuit", "lingerie",
  "fashion show", "ramp walk", "bold", "seductive", "kissing", "romance scene",
  "love scene", "couple goals", "girlfriend", "boyfriend", "dating", "crush",
  "relationship goals", "valentine", "hookup", "only fan",
  // alcohol / gambling
  "alcohol", "wine", "beer", "whisky", "vodka", "bar", "nightclub", "clubbing",
  "party night", "rave", "casino", "gambling", "betting", "poker", "lottery",
  // profanity (partial)
  "fuck", "shit", "bitch", "bastard",
  // gaming / entertainment
  "gameplay", "gaming", "live stream gaming", "GTA", "shooting game", "battle royale",
  "prank", "trolling", "reaction video", "funny moments", "comedy skit",
  "meme compilation", "roast", "drama", "celebrity gossip", "controversy",
  "exposed", "viral clip", "shocking video",
  // non-English
  "pyar", "mohabbat", "ladki", "sharab", "jua", "nach",
  "حب", "اغنية", "رقص",
];

const SOFT_REJECT_PATTERNS = [
  /you won't believe/i,
  /shocking/i,
  /gone wrong/i,
  /\#viral/i,
  /\#fyp/i,
  /\#trending/i,
];

const BAD_EMOJIS = /[💃🍺🎉😍🔥🍷🎰💋👙🩱🕺]/;

// ── Halal scoring ──────────────────────────────────────────────────
function halalScore(title: string, description: string, channelTitle: string): number {
  const text = `${title} ${description} ${channelTitle}`.toLowerCase();

  // Hard reject
  for (const kw of HARD_REJECT_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) return 0;
  }
  for (const pat of SOFT_REJECT_PATTERNS) {
    if (pat.test(text)) return 0;
  }
  if (BAD_EMOJIS.test(text)) return 0;

  let score = 0;

  // +40 Islamic / educational value
  const islamicKeywords = [
    "quran", "surah", "hadith", "sunnah", "prophet", "allah", "islam",
    "deen", "tafsir", "khutbah", "jummah", "ramadan", "eid", "hajj",
    "dawah", "nasheed", "dhikr", "dua", "salah", "prayer", "mosque",
    "scholar", "sheikh", "mufti", "imam", "fiqh", "aqeedah", "seerah",
    "islamic", "muslim", "ummah", "halal", "haram", "taqwa", "sabr",
    "shukr", "tawbah", "jannat", "jannah", "aakhirah",
    "education", "learn", "study", "motivation", "discipline",
    "self-improvement", "productivity", "business", "entrepreneur",
    "success", "mindset", "knowledge", "wisdom", "lecture", "reminder",
  ];
  if (islamicKeywords.some((k) => text.includes(k))) score += 40;

  // +20 clean wording
  score += 20;

  // +20 trusted channel indicators
  const trustedIndicators = [
    "official", "academy", "institute", "studio", "foundation",
    "media", "tv", "network", "podcast",
  ];
  if (trustedIndicators.some((t) => channelTitle.toLowerCase().includes(t))) score += 20;
  else score += 10; // partial

  // +20 no suspicious keywords already passed
  score += 20;

  return score;
}

// ── Category classifier ────────────────────────────────────────────
export type HalalCategory =
  | "All"
  | "Islamic"
  | "Education"
  | "Business"
  | "Self-Improvement"
  | "Nasheeds"
  | "Quran"
  | "Lectures";

function classifyCategory(title: string, description: string): HalalCategory {
  const t = `${title} ${description}`.toLowerCase();
  if (/quran|surah|recitation|tilawat|tafsir|tajweed/.test(t)) return "Quran";
  if (/nasheed|naat|anasheed/.test(t)) return "Nasheeds";
  if (/khutbah|lecture|reminder|jummah|friday/.test(t)) return "Lectures";
  if (/business|entrepreneur|startup|marketing|finance|money|invest/.test(t)) return "Business";
  if (/study|learn|education|school|university|science|math|history/.test(t)) return "Education";
  if (/motivation|discipline|self.?improvement|productivity|habit|mindset|success/.test(t))
    return "Self-Improvement";
  return "Islamic";
}

// ── Public types & API ─────────────────────────────────────────────
export interface YouTubeVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  channelTitle: string;
  category: HalalCategory;
  halalScore: number;
  publishedAt: string;
}

const SEARCH_QUERIES = [
  "Islamic reminder",
  "Quran recitation beautiful",
  "self improvement discipline Islam",
  "halal business motivation",
  "Quran tafsir",
  "nasheed no music",
  "Islamic lecture",
  "dua dhikr morning",
  "Muslim productivity",
  "seerah Prophet Muhammad",
];

export async function fetchHalalVideos(
  query?: string,
  maxResults = 20
): Promise<YouTubeVideo[]> {
  const q = query || SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];

  const params = new URLSearchParams({
    part: "snippet",
    q,
    type: "video",
    maxResults: String(Math.min(maxResults * 2, 50)), // fetch extra to account for filtering
    safeSearch: "strict",
    relevanceLanguage: "en",
    key: API_KEY,
  });

  const res = await fetch(`${BASE_URL}/search?${params}`);
  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }
  const data = await res.json();

  const approved: YouTubeVideo[] = [];

  for (const item of data.items ?? []) {
    const snippet = item.snippet;
    const title: string = snippet.title ?? "";
    const desc: string = snippet.description ?? "";
    const channel: string = snippet.channelTitle ?? "";
    const videoId: string = item.id?.videoId;

    if (!videoId) continue;

    const score = halalScore(title, desc, channel);
    if (score < 75) continue;

    approved.push({
      id: videoId,
      title: decodeHtml(title),
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl:
        snippet.thumbnails?.high?.url ??
        snippet.thumbnails?.medium?.url ??
        snippet.thumbnails?.default?.url ??
        "",
      channelTitle: channel,
      category: classifyCategory(title, desc),
      halalScore: score,
      publishedAt: snippet.publishedAt ?? "",
    });

    if (approved.length >= maxResults) break;
  }

  return approved;
}

export async function fetchMultiQueryVideos(maxTotal = 24): Promise<YouTubeVideo[]> {
  const perQuery = Math.ceil(maxTotal / SEARCH_QUERIES.length);
  const allResults: YouTubeVideo[] = [];
  const seenIds = new Set<string>();

  // Fetch from multiple queries in parallel (batches of 3)
  for (let i = 0; i < SEARCH_QUERIES.length; i += 3) {
    const batch = SEARCH_QUERIES.slice(i, i + 3);
    const results = await Promise.all(
      batch.map((q) => fetchHalalVideos(q, perQuery).catch(() => [] as YouTubeVideo[]))
    );
    for (const videos of results) {
      for (const v of videos) {
        if (!seenIds.has(v.id)) {
          seenIds.add(v.id);
          allResults.push(v);
        }
      }
    }
    if (allResults.length >= maxTotal) break;
  }

  return allResults.slice(0, maxTotal).sort((a, b) => b.halalScore - a.halalScore);
}

function decodeHtml(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

export const halalCategories: HalalCategory[] = [
  "All", "Islamic", "Quran", "Lectures", "Nasheeds", "Education", "Business", "Self-Improvement",
];
