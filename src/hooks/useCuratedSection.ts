import { useQuery } from "@tanstack/react-query";
import { fetchHalalVideos, type YouTubeVideo } from "@/services/youtube";
import { type CuratedSection } from "@/data/curatedSections";
import { isTrustedChannel } from "@/data/trustedChannels";

const HOME_SECTION_QUERY_BUDGET = 1;
const EXPANDED_SECTION_QUERY_BUDGET = 3;

export function useCuratedSection(section: CuratedSection, enabled = true) {
  return useQuery<YouTubeVideo[]>({
    queryKey: ["curated", section.id, section.maxResults],
    enabled,
    queryFn: async () => {
      const allResults: YouTubeVideo[] = [];
      const seenIds = new Set<string>();
      const queryBudget = section.maxResults > 24 ? EXPANDED_SECTION_QUERY_BUDGET : HOME_SECTION_QUERY_BUDGET;
      const selectedQueries = section.queries.slice(0, queryBudget);
      const perQuery = Math.max(8, Math.ceil(section.maxResults / selectedQueries.length));

      for (const query of selectedQueries) {
        const videos = await fetchHalalVideos(query, perQuery);

        for (const video of videos) {
          if (!seenIds.has(video.id) && video.halalScore >= section.minScore) {
            seenIds.add(video.id);
            allResults.push(video);
          }
        }

        if (allResults.length >= section.maxResults) break;
      }

      return allResults
        .sort((a, b) => {
          const aTrust = isTrustedChannel(a.channelTitle) ? 1 : 0;
          const bTrust = isTrustedChannel(b.channelTitle) ? 1 : 0;
          if (bTrust !== aTrust) return bTrust - aTrust;
          return b.halalScore - a.halalScore;
        })
        .slice(0, section.maxResults);
    },
    staleTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
