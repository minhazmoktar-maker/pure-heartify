import { useQuery } from "@tanstack/react-query";
import { fetchMultiQueryVideos, fetchHalalVideos, type YouTubeVideo, type HalalCategory } from "@/services/youtube";

export function useYouTubeVideos(category: HalalCategory, searchQuery?: string) {
  return useQuery<YouTubeVideo[]>({
    queryKey: ["youtube-halal", category, searchQuery],
    queryFn: async () => {
      const videos = searchQuery
        ? await fetchHalalVideos(searchQuery, 24)
        : await fetchMultiQueryVideos(24);

      if (category === "All") return videos;
      return videos.filter((video) => video.category === category);
    },
    staleTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
