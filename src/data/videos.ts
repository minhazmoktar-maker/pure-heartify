import thumbQuran from "@/assets/thumb-quran.jpg";
import thumbLecture from "@/assets/thumb-lecture.jpg";
import thumbNasheed from "@/assets/thumb-nasheed.jpg";
import thumbFamily from "@/assets/thumb-family.jpg";
import thumbHistory from "@/assets/thumb-history.jpg";
import thumbCooking from "@/assets/thumb-cooking.jpg";

export type VideoCategory = "All" | "Quran" | "Lectures" | "Nasheeds" | "Family" | "History" | "Halal Cooking" | "Dua & Dhikr";

export interface Video {
  id: string;
  title: string;
  channel: string;
  views: string;
  uploadedAt: string;
  duration: string;
  thumbnail: string;
  category: VideoCategory;
  verified: boolean;
}

export const categories: VideoCategory[] = [
  "All", "Quran", "Lectures", "Nasheeds", "Family", "History", "Halal Cooking", "Dua & Dhikr"
];

export const videos: Video[] = [
  {
    id: "1",
    title: "Surah Al-Mulk — Beautiful Recitation with Translation",
    channel: "Quran Weekly",
    views: "2.4M views",
    uploadedAt: "3 days ago",
    duration: "12:34",
    thumbnail: thumbQuran,
    category: "Quran",
    verified: true,
  },
  {
    id: "2",
    title: "The Power of Patience in Islam — Friday Khutbah",
    channel: "Sheikh Ahmad",
    views: "890K views",
    uploadedAt: "1 week ago",
    duration: "45:12",
    thumbnail: thumbLecture,
    category: "Lectures",
    verified: true,
  },
  {
    id: "3",
    title: "Ya Nabi Salam Alayka — Heart Touching Nasheed",
    channel: "Nasheed World",
    views: "5.1M views",
    uploadedAt: "2 weeks ago",
    duration: "6:48",
    thumbnail: thumbNasheed,
    category: "Nasheeds",
    verified: false,
  },
  {
    id: "4",
    title: "Teaching Kids About Ramadan — Family Guide",
    channel: "Muslim Family",
    views: "320K views",
    uploadedAt: "5 days ago",
    duration: "18:22",
    thumbnail: thumbFamily,
    category: "Family",
    verified: true,
  },
  {
    id: "5",
    title: "The Golden Age of Islam — Full Documentary",
    channel: "Islamic Heritage",
    views: "1.7M views",
    uploadedAt: "1 month ago",
    duration: "1:24:05",
    thumbnail: thumbHistory,
    category: "History",
    verified: true,
  },
  {
    id: "6",
    title: "Authentic Lamb Biryani — Halal Recipe",
    channel: "Halal Kitchen",
    views: "450K views",
    uploadedAt: "4 days ago",
    duration: "22:15",
    thumbnail: thumbCooking,
    category: "Halal Cooking",
    verified: false,
  },
  {
    id: "7",
    title: "Morning Adhkar — Start Your Day Right",
    channel: "Daily Dhikr",
    views: "3.2M views",
    uploadedAt: "2 days ago",
    duration: "15:40",
    thumbnail: thumbQuran,
    category: "Dua & Dhikr",
    verified: true,
  },
  {
    id: "8",
    title: "Understanding Surah Al-Kahf — Tafseer Series",
    channel: "Quran Weekly",
    views: "1.1M views",
    uploadedAt: "6 days ago",
    duration: "38:50",
    thumbnail: thumbLecture,
    category: "Quran",
    verified: true,
  },
  {
    id: "9",
    title: "Ottoman Empire — Rise and Legacy",
    channel: "Islamic Heritage",
    views: "2.8M views",
    uploadedAt: "3 weeks ago",
    duration: "58:30",
    thumbnail: thumbHistory,
    category: "History",
    verified: true,
  },
  {
    id: "10",
    title: "Halal Chicken Shawarma at Home",
    channel: "Halal Kitchen",
    views: "780K views",
    uploadedAt: "1 week ago",
    duration: "16:45",
    thumbnail: thumbCooking,
    category: "Halal Cooking",
    verified: false,
  },
  {
    id: "11",
    title: "Maher Zain — Assalamu Alayka (Live)",
    channel: "Nasheed World",
    views: "8.3M views",
    uploadedAt: "1 month ago",
    duration: "5:20",
    thumbnail: thumbNasheed,
    category: "Nasheeds",
    verified: true,
  },
  {
    id: "12",
    title: "How to Pray Salah — Complete Beginner Guide",
    channel: "Muslim Family",
    views: "4.5M views",
    uploadedAt: "2 months ago",
    duration: "25:10",
    thumbnail: thumbFamily,
    category: "Family",
    verified: true,
  },
];
