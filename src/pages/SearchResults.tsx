import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const { data: videos, isLoading, error } = useYouTubeVideos("All", query || undefined);

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

        <div className="mb-6 flex items-center gap-3">
          <Search className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Results for "{query}"
            </h1>
            <p className="text-sm text-muted-foreground">
              Only halal-verified content is shown
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Searching halal content…</p>
          </div>
        )}

        {error && (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-destructive">Search failed. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && videos && videos.length > 0 && (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v, i) => (
              <YouTubeVideoCard key={v.id} video={v} index={i} />
            ))}
          </div>
        )}

        {!isLoading && !error && videos?.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No halal-compliant content found for "{query}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
