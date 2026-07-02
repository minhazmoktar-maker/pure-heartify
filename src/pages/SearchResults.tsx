import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import InfiniteVideoGrid from "@/components/InfiniteVideoGrid";
import SearchSuggestions from "@/components/SearchSuggestions";
import EmptyState from "@/components/EmptyState";
import { addRecentSearch } from "@/lib/recentSearches";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = (searchParams.get("q") || "").trim();

  useEffect(() => {
    if (query) addRecentSearch(query);
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <div className="mx-auto max-w-[1800px] px-4 py-6 md:px-6">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        {query ? (
          <>
            <div className="mb-6 flex items-center gap-3">
              <Search className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Results for "{query}"</h1>
                <p className="text-sm text-muted-foreground">Only halal-verified content is shown</p>
              </div>
            </div>

            <InfiniteVideoGrid
              search={query}
              fallbackMessage={`No halal-compliant content found for "${query}".`}
            />
          </>
        ) : (
          <>
            <div className="mb-6 flex items-start gap-3 sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground sm:text-xl">Search Heartify</h1>
                <p className="text-xs text-muted-foreground sm:text-sm">Discover trusted creators, topics, and reminders</p>
              </div>
            </div>
            <SearchSuggestions />
            <div className="mt-8 sm:mt-10">
              <EmptyState
                title="Type a topic, surah, or creator name"
                description="Every result passes our halal review pipeline — up to 85% halal score."
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
