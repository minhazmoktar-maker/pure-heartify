/**
 * Trusted Channel Whitelist
 * Videos from these channels get priority and relaxed scoring.
 * Unknown channels require halalScore > 90.
 */

export const TRUSTED_CHANNELS: string[] = [
  // Major Islamic scholars & dawah
  "Mufti Menk",
  "Omar Suleiman",
  "Nouman Ali Khan",
  "Yaqeen Institute",
  "Bayyinah Institute",
  "Dr. Zakir Naik",
  "Yasir Qadhi",
  "Islamic Guidance",
  "The Daily Reminder",
  "FreeQuranEducation",
  "Digital Mimbar",
  "One Islam Productions",
  "Muslim Central",
  "Merciful Servant",
  "The Prophets Path",
  "EPIC Masjid",
  "Al Jazeera English",

  // Quran reciters
  "Quran Recitation",
  "Al-Quran Karim",
  "Fatih Seferagic",
  "Omar Hisham Al Arabi",

  // Nasheeds
  "Maher Zain",
  "Sami Yusuf",

  // Education & self-improvement
  "Ali Abdaal",
  "Matt D'Avella",
  "Thomas Frank",
  "TED",
  "TEDx Talks",
  "Khan Academy",
  "CrashCourse",
  "Kurzgesagt",

  // Clean business/finance
  "Graham Stephan",
  "The Futur",
  "GaryVee",

  // Clean podcasts
  "The Mad Mamluks",
  "Fresh Muslim Guide",
  "Islam Channel",
];

export function isTrustedChannel(channelTitle: string): boolean {
  const lower = channelTitle.toLowerCase();
  return TRUSTED_CHANNELS.some((c) => lower.includes(c.toLowerCase()));
}
