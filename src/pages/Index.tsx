import { useState, useMemo } from "react";
import { Video, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilter from "@/components/CategoryFilter";
import VideoCard from "@/components/VideoCard";
import AudioSection from "@/components/AudioSection";
import AudioPlayer from "@/components/AudioPlayer";
import { videos, type VideoCategory } from "@/data/videos";
import { cn } from "@/lib/utils";

type MainTab = "videos" | "listen";

const Index = () => {
  const [mainTab, setMainTab] = useState<MainTab>("videos");
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>("All");

  const filteredVideos = useMemo(
    () =>
      selectedCategory === "All"
        ? videos
        : videos.filter((v) => v.category === selectedCategory),
    [selectedCategory]
  );

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
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
          <main className="mx-auto max-w-[1800px] px-4 py-6 md:px-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredVideos.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} />
              ))}
            </div>
            {filteredVideos.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-lg font-medium text-muted-foreground">No videos found in this category yet.</p>
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
