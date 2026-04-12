import { useQuery } from "@tanstack/react-query";
import { fetchHalalVideos, type YouTubeVideo } from "@/services/youtube";
import { type CuratedSection } from "@/data/curatedSections";
import { isTrustedChannel } from "@/data/trustedChannels";

export function useCuratedSection(section: CuratedSection) {
  return useQuery<YouTubeVideo[]>({
    queryKey: ["curated", section.id],
    queryFn: async () => {
      const allResults: YouTubeVideo[] = [];
      const seenIds = new Set<string>();
      const perQuery = Math.ceil(section.maxResults / section.queries.length);

      // Fetch in parallel batches of 2
      for (let i = 0; i < section.queries.length; i += 2) {
        const batch = section.queries.slice(i, i + 2);
        const results = await Promise.all(
          batch.map((q) => fetchHalalVideos(q, perQuery + 4).catch(() => [] as YouTubeVideo[]))
        );
        for (const videos of results) {
          for (const v of videos) {
            if (!seenIds.has(v.id) && v.halalScore >= section.minScore) {
              seenIds.add(v.id);
              allResults.push(v);
            }
          }
        }
        if (allResults.length >= section.maxResults) break;
      }

      // Prioritize trusted channels
      return allResults
        .sort((a, b) => {
          const aTrust = isTrustedChannel(a.channelTitle) ? 1 : 0;
          const bTrust = isTrustedChannel(b.channelTitle) ? 1 : 0;
          if (bTrust !== aTrust) return bTrust - aTrust;
          return b.halalScore - a.halalScore;
        })
        .slice(0, section.maxResults);
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
