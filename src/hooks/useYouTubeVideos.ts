import { useQuery } from "@tanstack/react-query";
import { fetchMultiQueryVideos, fetchHalalVideos, type YouTubeVideo, type HalalCategory } from "@/services/youtube";

export function useYouTubeVideos(category: HalalCategory, searchQuery?: string) {
  return useQuery<YouTubeVideo[]>({
    queryKey: ["youtube-halal", category, searchQuery],
    queryFn: async () => {
      let videos: YouTubeVideo[];
      if (searchQuery) {
        videos = await fetchHalalVideos(searchQuery, 24);
      } else {
        videos = await fetchMultiQueryVideos(24);
      }
      if (category === "All") return videos;
      return videos.filter((v) => v.category === category);
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 1,
  });
}
