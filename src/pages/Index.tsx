import { useState } from "react";
import { Video, Headphones, Loader2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HalalCategoryFilter from "@/components/HalalCategoryFilter";
import AudioSection from "@/components/AudioSection";
import AudioPlayer from "@/components/AudioPlayer";
import CuratedSectionRow from "@/components/CuratedSectionRow";
import InfiniteVideoGrid from "@/components/InfiniteVideoGrid";
import { type HalalCategory } from "@/services/youtube";
import { CURATED_SECTIONS } from "@/data/curatedSections";
import { cn } from "@/lib/utils";

type MainTab = "videos" | "listen" | "curated";

const Index = () => {
  const [mainTab, setMainTab] = useState<MainTab>("curated");
  const [selectedCategory, setSelectedCategory] = useState<HalalCategory>("All");

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      <HeroSection />

      {/* Main tabs */}
      <div className="sticky top-16 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center gap-0 px-4 md:px-6">
          <button
            onClick={() => setMainTab("curated")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors",
              mainTab === "curated"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            For You
          </button>
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
            Browse
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

      {/* Curated "For You" tab */}
      {mainTab === "curated" && (
        <main className="mx-auto max-w-[1800px] px-4 py-2 md:px-6">
          {CURATED_SECTIONS.map((section) => (
            <CuratedSectionRow key={section.id} section={section} />
          ))}
        </main>
      )}

      {mainTab === "videos" && (
        <>
          <HalalCategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
          <main className="mx-auto max-w-[1800px] px-4 py-6 md:px-6">
            <InfiniteVideoGrid category={selectedCategory} />
          </main>
        </>
      )}

      {mainTab === "listen" && <AudioSection />}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-[1800px] px-4 text-center md:px-6 space-y-2">
          <p className="text-sm text-muted-foreground">© 2026 HalalTube — Curated halal content for the Ummah ✦</p>
          <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground underline">Privacy Policy</a>
        </div>
      </footer>

      <AudioPlayer />
    </div>
  );
};

export default Index;
