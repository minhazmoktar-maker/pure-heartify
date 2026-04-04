import { createContext, useContext, useState, type ReactNode } from "react";
import type { Track } from "@/data/audio";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPremiumUser: boolean;
  play: (track: Track) => void;
  togglePlay: () => void;
  togglePremium: () => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  const play = (track: Track) => {
    if (track.isPremium && !isPremiumUser) return;
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying((p) => !p);
  const togglePremium = () => setIsPremiumUser((p) => !p);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, isPremiumUser, play, togglePlay, togglePremium }}>
      {children}
    </PlayerContext.Provider>
  );
};
