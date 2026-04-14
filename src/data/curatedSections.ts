/**
 * Curated section definitions — Spotify-style browsing experience.
 * Each section maps to specific YouTube search queries and filtering rules.
 */

export interface CuratedSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  queries: string[];
  minScore: number;
  maxResults: number;
}

export const CURATED_SECTIONS: CuratedSection[] = [
  {
    id: "top-100",
    title: "Top 100 Halal Videos",
    description: "The most beneficial, highest-rated halal content — hand-picked by our filtering engine.",
    icon: "🏆",
    queries: [
      "best Islamic lectures",
      "Quran recitation beautiful",
      "Islamic motivation",
      "Muslim productivity tips",
      "halal lifestyle",
    ],
    minScore: 85,
    maxResults: 20,
  },
  {
    id: "daily-picks",
    title: "Daily Halal Picks",
    description: "Fresh, beneficial content updated every day to keep your feed wholesome.",
    icon: "✦",
    queries: [
      "Islamic reminder today",
      "morning dua adhkar",
      "Quran verse of the day",
      "Islamic short reminder",
    ],
    minScore: 80,
    maxResults: 12,
  },
  {
    id: "islamic-knowledge",
    title: "Islamic Knowledge",
    description: "Deep dives into Quran, Hadith, Seerah, and the fundamentals of our Deen.",
    icon: "📖",
    queries: [
      "Quran tafsir lecture",
      "hadith explanation",
      "seerah Prophet Muhammad",
      "Islamic history documentary",
      "fiqh basics",
    ],
    minScore: 80,
    maxResults: 16,
  },
  {
    id: "quran-recitations",
    title: "Quran Recitations",
    description: "Beautiful Quran recitations to soothe your heart and strengthen your connection.",
    icon: "🕌",
    queries: [
      "Quran recitation peaceful",
      "surah rahman full",
      "surah mulk recitation",
      "beautiful Quran tilawat",
      "Quran recitation for sleep",
    ],
    minScore: 80,
    maxResults: 16,
  },
  {
    id: "study-focus",
    title: "Study & Focus Mode",
    description: "Clean, distraction-free content to help you study, work, and stay productive.",
    icon: "🎯",
    queries: [
      "study motivation discipline",
      "focus productivity tips",
      "Quran recitation study background",
      "Islamic study tips",
    ],
    minScore: 80,
    maxResults: 12,
  },
  {
    id: "business-money",
    title: "Business & Money (Halal)",
    description: "Halal finance, entrepreneurship, and ethical business — grow your wealth the right way.",
    icon: "💼",
    queries: [
      "halal investing finance",
      "Islamic finance explained",
      "Muslim entrepreneur",
      "halal business tips",
    ],
    minScore: 80,
    maxResults: 12,
  },
  {
    id: "nasheeds",
    title: "Nasheeds & Anaasheed",
    description: "Beautiful nasheeds without instruments — uplifting and halal.",
    icon: "🎵",
    queries: [
      "nasheed no music",
      "Islamic nasheed",
      "naat sharif",
      "Arabic nasheed acapella",
    ],
    minScore: 75,
    maxResults: 12,
  },
  {
    id: "family-kids",
    title: "Family & Kids",
    description: "Safe, educational Islamic content for the whole family.",
    icon: "👨‍👩‍👧‍👦",
    queries: [
      "Islamic cartoons for kids",
      "learn Quran children",
      "Islamic stories for kids",
      "Muslim family vlog halal",
    ],
    minScore: 80,
    maxResults: 12,
  },
  {
    id: "podcasts",
    title: "Podcasts (Clean & Beneficial)",
    description: "Long-form conversations on faith, life, and growth — only the cleanest picks.",
    icon: "🎙️",
    queries: [
      "Islamic podcast discussion",
      "Muslim podcast interview",
      "faith and life podcast",
      "Islamic talk show",
    ],
    minScore: 80,
    maxResults: 12,
  },
  {
    id: "dawah",
    title: "Dawah & Outreach",
    description: "Inspiring dawah content — sharing the message of Islam with wisdom.",
    icon: "🌍",
    queries: [
      "dawah street preaching",
      "speakers corner Islam",
      "Islam explained non-Muslim",
      "why Islam is the truth",
    ],
    minScore: 75,
    maxResults: 12,
  },
  {
    id: "health-fitness",
    title: "Health & Fitness (Halal)",
    description: "Stay fit with clean, halal-friendly health and fitness content.",
    icon: "💪",
    queries: [
      "Muslim fitness motivation",
      "halal nutrition diet",
      "sunnah health tips",
      "Islamic wellness",
    ],
    minScore: 75,
    maxResults: 12,
  },
];
