import albumQuran from "@/assets/album-quran.jpg";
import albumNasheed from "@/assets/album-nasheed.jpg";
import albumDua from "@/assets/album-dua.jpg";
import albumLecture from "@/assets/album-lecture.jpg";

export type AudioCategory = "All" | "Quran" | "Nasheeds" | "Dua & Dhikr" | "Lectures" | "Podcasts";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  category: AudioCategory;
  isPremium: boolean;
  plays: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  cover: string;
  trackCount: number;
  isPremium: boolean;
}

export const audioCategories: AudioCategory[] = [
  "All", "Quran", "Nasheeds", "Dua & Dhikr", "Lectures", "Podcasts"
];

export const playlists: Playlist[] = [
  {
    id: "p1",
    title: "Peaceful Quran Recitations",
    description: "Beautiful tilawat for daily reflection",
    cover: albumQuran,
    trackCount: 30,
    isPremium: false,
  },
  {
    id: "p2",
    title: "Top Nasheeds 2026",
    description: "Most popular halal nasheeds this year",
    cover: albumNasheed,
    trackCount: 25,
    isPremium: false,
  },
  {
    id: "p3",
    title: "Morning Adhkar Collection",
    description: "Start every day with remembrance of Allah",
    cover: albumDua,
    trackCount: 15,
    isPremium: false,
  },
  {
    id: "p4",
    title: "Islamic Lectures — Premium",
    description: "Exclusive in-depth lectures from top scholars",
    cover: albumLecture,
    trackCount: 40,
    isPremium: true,
  },
  {
    id: "p5",
    title: "Ramadan Special Mix",
    description: "Curated for the blessed month",
    cover: albumNasheed,
    trackCount: 20,
    isPremium: false,
  },
  {
    id: "p6",
    title: "Premium Tafseer Series",
    description: "Deep dive into Quranic interpretation",
    cover: albumQuran,
    trackCount: 60,
    isPremium: true,
  },
];

export const tracks: Track[] = [
  {
    id: "t1",
    title: "Surah Ar-Rahman — Full Recitation",
    artist: "Mishary Rashid Alafasy",
    album: "Peaceful Quran Recitations",
    duration: "12:45",
    cover: albumQuran,
    category: "Quran",
    isPremium: false,
    plays: "45M",
  },
  {
    id: "t2",
    title: "Surah Yasin — Heart Softening",
    artist: "Abdul Rahman Al-Sudais",
    album: "Peaceful Quran Recitations",
    duration: "23:10",
    cover: albumQuran,
    category: "Quran",
    isPremium: false,
    plays: "32M",
  },
  {
    id: "t3",
    title: "Assalamu Alayka Ya Rasool Allah",
    artist: "Maher Zain",
    album: "Top Nasheeds 2026",
    duration: "5:22",
    cover: albumNasheed,
    category: "Nasheeds",
    isPremium: false,
    plays: "120M",
  },
  {
    id: "t4",
    title: "Tala'al Badru Alayna",
    artist: "Mesut Kurtis",
    album: "Top Nasheeds 2026",
    duration: "4:18",
    cover: albumNasheed,
    category: "Nasheeds",
    isPremium: false,
    plays: "88M",
  },
  {
    id: "t5",
    title: "Ya Hanana — Live Performance",
    artist: "Habib Syech",
    album: "Top Nasheeds 2026",
    duration: "6:35",
    cover: albumNasheed,
    category: "Nasheeds",
    isPremium: false,
    plays: "55M",
  },
  {
    id: "t6",
    title: "Morning Adhkar — Complete",
    artist: "Sheikh Saad Al-Ghamdi",
    album: "Morning Adhkar Collection",
    duration: "18:40",
    cover: albumDua,
    category: "Dua & Dhikr",
    isPremium: false,
    plays: "28M",
  },
  {
    id: "t7",
    title: "Evening Adhkar — Full",
    artist: "Sheikh Saad Al-Ghamdi",
    album: "Morning Adhkar Collection",
    duration: "16:55",
    cover: albumDua,
    category: "Dua & Dhikr",
    isPremium: false,
    plays: "22M",
  },
  {
    id: "t8",
    title: "Dua for Protection — Ayatul Kursi",
    artist: "Mishary Rashid Alafasy",
    album: "Morning Adhkar Collection",
    duration: "3:12",
    cover: albumDua,
    category: "Dua & Dhikr",
    isPremium: false,
    plays: "67M",
  },
  {
    id: "t9",
    title: "The Story of Prophet Yusuf (AS)",
    artist: "Mufti Menk",
    album: "Islamic Lectures — Premium",
    duration: "1:02:30",
    cover: albumLecture,
    category: "Lectures",
    isPremium: true,
    plays: "15M",
  },
  {
    id: "t10",
    title: "Purification of the Heart",
    artist: "Hamza Yusuf",
    album: "Islamic Lectures — Premium",
    duration: "48:15",
    cover: albumLecture,
    category: "Lectures",
    isPremium: true,
    plays: "12M",
  },
  {
    id: "t11",
    title: "Hasbi Rabbi Jallallah",
    artist: "Sami Yusuf",
    album: "Top Nasheeds 2026",
    duration: "4:50",
    cover: albumNasheed,
    category: "Nasheeds",
    isPremium: false,
    plays: "95M",
  },
  {
    id: "t12",
    title: "Surah Al-Mulk — Melodious Recitation",
    artist: "Hazza Al Balushi",
    album: "Peaceful Quran Recitations",
    duration: "8:30",
    cover: albumQuran,
    category: "Quran",
    isPremium: false,
    plays: "40M",
  },
  {
    id: "t13",
    title: "Understanding Qadr — Exclusive",
    artist: "Nouman Ali Khan",
    album: "Premium Tafseer Series",
    duration: "55:00",
    cover: albumLecture,
    category: "Lectures",
    isPremium: true,
    plays: "8M",
  },
  {
    id: "t14",
    title: "The Muslim Podcast — Ep. 42",
    artist: "The Muslim Podcast",
    album: "Weekly Episodes",
    duration: "1:15:00",
    cover: albumLecture,
    category: "Podcasts",
    isPremium: false,
    plays: "3M",
  },
  {
    id: "t15",
    title: "Barakah Culture — Interview Series",
    artist: "Barakah Culture",
    album: "Premium Podcasts",
    duration: "45:20",
    cover: albumLecture,
    category: "Podcasts",
    isPremium: true,
    plays: "2M",
  },
];
