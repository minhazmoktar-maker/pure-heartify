import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import InfiniteVideoGrid from "@/components/InfiniteVideoGrid";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

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

        <InfiniteVideoGrid
          search={query || undefined}
          fallbackMessage={`No halal-compliant content found for "${query}".`}
        />
      </div>
    </div>
  );
};

export default SearchResults;
