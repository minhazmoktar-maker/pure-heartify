import { useState, useMemo } from "react";
import { Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { usePlayer } from "@/contexts/PlayerContext";
import PlaylistCard from "@/components/PlaylistCard";
import TrackRow from "@/components/TrackRow";
import { playlists, tracks, audioCategories, type AudioCategory } from "@/data/audio";
import { cn } from "@/lib/utils";

const AudioSection = () => {
  const { isPremiumUser, togglePremium } = usePlayer();
  const [audioCat, setAudioCat] = useState<AudioCategory>("All");

  const filteredTracks = useMemo(
    () => (audioCat === "All" ? tracks : tracks.filter((t) => t.category === audioCat)),
    [audioCat]
  );

  return (
    <section className="mx-auto max-w-[1800px] px-4 py-8 md:px-6">
      {/* Premium banner */}
      {!isPremiumUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 overflow-hidden rounded-2xl bg-gradient-hero p-6 md:p-8"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold" />
                <h2 className="font-heading text-xl font-bold text-cream">HalalTube Premium</h2>
              </div>
              <p className="mt-1 text-sm text-cream/70">
                Ad-free listening, exclusive lectures, offline downloads, and premium nasheeds.
              </p>
            </div>
            <button
              onClick={togglePremium}
              className="shrink-0 rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-accent-foreground shadow-lg transition-all hover:brightness-110"
            >
              <Sparkles className="mr-1.5 inline h-4 w-4" />
              Try Premium Free
            </button>
          </div>
        </motion.div>
      )}

      {isPremiumUser && (
        <div className="mb-6 flex items-center gap-2">
          <Crown className="h-5 w-5 text-gold" />
          <span className="text-sm font-semibold text-gold">Premium Active</span>
          <button onClick={togglePremium} className="ml-2 text-xs text-muted-foreground underline">
            Switch to Free
          </button>
        </div>
      )}

      {/* Playlists */}
      <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Featured Playlists</h2>
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {playlists.map((pl, i) => (
          <PlaylistCard key={pl.id} playlist={pl} index={i} />
        ))}
      </div>

      {/* Tracks */}
      <h2 className="mb-4 font-heading text-xl font-bold text-foreground">All Tracks</h2>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {audioCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setAudioCat(cat)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-all",
              audioCat === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-0.5">
        {filteredTracks.map((track, i) => (
          <TrackRow key={track.id} track={track} index={i} />
        ))}
      </div>
    </section>
  );
};

export default AudioSection;
