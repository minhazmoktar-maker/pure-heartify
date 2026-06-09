/**
 * Curated interest options shown during onboarding.
 * Each id MUST match a CURATED_SECTIONS id so the Daily Dose generator
 * can fetch from the corresponding section.
 */

export interface InterestOption {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export const INTEREST_OPTIONS: InterestOption[] = [
  { id: "islamic-knowledge", title: "Islamic Knowledge", icon: "📖", description: "Quran, Hadith, Seerah, Tafsir" },
  { id: "quran-recitations", title: "Quran Recitation", icon: "🕌", description: "Beautiful, calming recitations" },
  { id: "lectures-scholars", title: "Lectures from Scholars", icon: "🎤", description: "Talks from top scholars" },
  { id: "dawah", title: "Dawah & Outreach", icon: "🌍", description: "Inviting to the truth" },
  { id: "study-focus", title: "Study & Focus", icon: "🎯", description: "Productivity & deep work" },
  { id: "business-money", title: "Business & Halal Wealth", icon: "💼", description: "Career, finance, entrepreneurship" },
  { id: "family-kids", title: "Family & Kids", icon: "👨‍👩‍👧‍👦", description: "Parenting, marriage, children" },
  { id: "health-fitness", title: "Health & Fitness", icon: "💪", description: "Body, mind, halal lifestyle" },
  { id: "nasheeds", title: "Nasheeds", icon: "🎶", description: "Vocal & spiritual nasheeds" },
  { id: "intellectual", title: "Intellectual Discourse", icon: "🧠", description: "Deep conversations & debates" },
  { id: "revert-stories", title: "Revert Stories", icon: "💚", description: "Journeys to Islam" },
  { id: "podcasts", title: "Podcasts", icon: "🎙️", description: "Long-form beneficial talks" },
];
