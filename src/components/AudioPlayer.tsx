import { Play, Pause, SkipBack, SkipForward, Volume2, Crown } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { motion, AnimatePresence } from "framer-motion";

const AudioPlayer = () => {
  const { currentTrack, isPlaying, togglePlay } = usePlayer();

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl"
        >
          <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between gap-4 px-4 md:px-6">
            {/* Track info */}
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="h-12 w-12 shrink-0 rounded-md object-cover shadow-card"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {currentTrack.title}
                  {currentTrack.isPremium && (
                    <Crown className="ml-1 inline h-3.5 w-3.5 text-gold" />
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-4">
                <button className="text-muted-foreground transition-colors hover:text-foreground">
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                </button>
                <button className="text-muted-foreground transition-colors hover:text-foreground">
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
              {/* Progress bar */}
              <div className="flex w-full max-w-xs items-center gap-2">
                <span className="text-[10px] text-muted-foreground">1:23</span>
                <div className="relative h-1 flex-1 rounded-full bg-muted">
                  <div className="absolute left-0 top-0 h-full w-1/3 rounded-full bg-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">{currentTrack.duration}</span>
              </div>
            </div>

            {/* Volume (hidden on mobile) */}
            <div className="hidden items-center gap-2 sm:flex">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div className="relative h-1 w-20 rounded-full bg-muted">
                <div className="absolute left-0 top-0 h-full w-3/4 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AudioPlayer;
