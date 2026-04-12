import { useState } from "react";
import { Video, Headphones, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HalalCategoryFilter from "@/components/HalalCategoryFilter";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";
import AudioSection from "@/components/AudioSection";
import AudioPlayer from "@/components/AudioPlayer";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import { type HalalCategory } from "@/services/youtube";
import { cn } from "@/lib/utils";

type MainTab = "videos" | "listen";

const Index = () => {
  const [mainTab, setMainTab] = useState<MainTab>("videos");
  const [selectedCategory, setSelectedCategory] = useState<HalalCategory>("All");

  const { data: videos, isLoading, error } = useYouTubeVideos(selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      <HeroSection />

      {/* Main tabs */}
      <div className="sticky top-16 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center gap-0 px-4 md:px-6">
          <button
            onClick={() => setMainTab("videos")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors",
              mainTab === "videos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Video className="h-4 w-4" />
            Videos
          </button>
          <button
            onClick={() => setMainTab("listen")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors",
              mainTab === "listen"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Headphones className="h-4 w-4" />
            Listen
          </button>
        </div>
      </div>

      {mainTab === "videos" && (
        <>
          <HalalCategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
          <main className="mx-auto max-w-[1800px] px-4 py-6 md:px-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Fetching halal-verified videos…</p>
              </div>
            )}
            {error && (
              <div className="py-20 text-center">
                <p className="text-lg font-medium text-destructive">Failed to load videos. Please try again.</p>
                <p className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</p>
              </div>
            )}
            {!isLoading && !error && videos && (
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos.map((video, i) => (
                  <YouTubeVideoCard key={video.id} video={video} index={i} />
                ))}
              </div>
            )}
            {!isLoading && !error && videos?.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-lg font-medium text-muted-foreground">No halal-compliant content found for this category.</p>
              </div>
            )}
          </main>
        </>
      )}

      {mainTab === "listen" && <AudioSection />}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-[1800px] px-4 text-center md:px-6">
          <p className="text-sm text-muted-foreground">© 2026 HalalTube — Curated halal content for the Ummah ✦</p>
        </div>
      </footer>

      <AudioPlayer />
    </div>
  );
};

export default Index;
