import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Play, Shield } from "lucide-react";
import type { YouTubeVideo } from "@/services/youtube";

interface YouTubeVideoCardProps {
  video: YouTubeVideo;
  index: number;
  inApp?: boolean;
}

const YouTubeVideoCard = ({ video, index, inApp }: YouTubeVideoCardProps) => {
  const navigate = useNavigate();
  const timeAgo = formatTimeAgo(video.publishedAt);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/watch/${video.id}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Halal score badge */}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-primary/90 px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
          <Shield className="h-3 w-3" />
          {video.halalScore}%
        </span>
        {/* Category badge */}
        <span className="absolute top-2 right-2 rounded-md bg-foreground/70 px-1.5 py-0.5 text-xs font-medium text-background">
          {video.category}
        </span>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="h-10 w-10 text-primary-foreground drop-shadow-lg fill-primary-foreground" />
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {video.channelTitle[0]}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span>{video.channelTitle}</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
    </motion.article>
  );
};

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
}

export default YouTubeVideoCard;
