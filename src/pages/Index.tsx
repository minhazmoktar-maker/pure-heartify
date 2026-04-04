import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilter from "@/components/CategoryFilter";
import VideoCard from "@/components/VideoCard";
import { videos, type VideoCategory } from "@/data/videos";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>("All");

  const filteredVideos = useMemo(
    () =>
      selectedCategory === "All"
        ? videos
        : videos.filter((v) => v.category === selectedCategory),
    [selectedCategory]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      <main className="mx-auto max-w-[1800px] px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No videos found in this category yet.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-[1800px] px-4 text-center md:px-6">
          <p className="text-sm text-muted-foreground">
            © 2026 HalalTube — Curated halal content for the Ummah ✦
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
