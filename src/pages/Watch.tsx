import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Shield, ChevronRight, Heart, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";

const Watch = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { data: videos } = useYouTubeVideos("All");
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const currentVideo = videos?.find((v) => v.id === videoId);
  const relatedVideos = videos?.filter((v) => v.id !== videoId).slice(0, 8) ?? [];
  const isEmbeddableVideo = !!videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);

  const currentIndex = videos?.findIndex((v) => v.id === videoId) ?? -1;
  const nextVideo = videos && currentIndex >= 0 ? videos[(currentIndex + 1) % videos.length] : null;

  useEffect(() => {
    if (!user || !videoId || !currentVideo) return;
    supabase.from("watch_history").insert({
      user_id: user.id,
      video_id: videoId,
      video_title: currentVideo.title,
      thumbnail_url: currentVideo.thumbnailUrl,
    }).then(() => {});
  }, [user, videoId, currentVideo]);

  const handleNext = () => {
    if (nextVideo) navigate(`/watch/${nextVideo.id}`, { replace: true });
  };

  const liked = videoId ? isFavorite(videoId) : false;

  const handleBookmark = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!currentVideo || !videoId) return;
    toggleFavorite.mutate({
      videoId,
      title: currentVideo.title,
      channel: currentVideo.channelTitle,
      thumbnail: currentVideo.thumbnailUrl,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-[1800px] px-4 py-4 md:px-6 lg:flex lg:gap-6">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => navigate("/")}
            className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to browse
          </button>

          {isEmbeddableVideo ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1&iv_load_policy=3&disablekb=0&fs=1`}
                title={currentVideo?.title ?? "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-border bg-card px-6 text-center">
              <p className="text-lg font-semibold text-foreground">Direct playback is unavailable for this item.</p>
              <p className="mt-2 text-sm text-muted-foreground">Open it on YouTube to continue watching.</p>
              {currentVideo && (
                <a
                  href={currentVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Download className="h-4 w-4" />
                  Open on YouTube
                </a>
              )}
            </div>
          )}

          <div className="mt-4 space-y-2">
            <h1 className="text-lg font-bold text-foreground md:text-xl">
              {currentVideo?.title ?? "Loading…"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {currentVideo && (
                <>
                  <span className="font-medium text-foreground">{currentVideo.channelTitle}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    <Shield className="h-3 w-3" />
                    Halal {currentVideo.halalScore}%
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{currentVideo.category}</span>
                  <button
                    onClick={handleBookmark}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                    {liked ? "Bookmarked" : "Bookmark"}
                  </button>
                  <a
                    href={currentVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Open on YouTube
                  </a>
                </>
              )}
            </div>
          </div>

          {nextVideo && (
            <button
              onClick={handleNext}
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Up next</p>
                <p className="truncate text-sm font-semibold text-foreground">{nextVideo.title}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </button>
          )}
        </div>

        <aside className="mt-6 shrink-0 lg:mt-0 lg:w-[380px] xl:w-[420px]">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            More Halal Content
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {relatedVideos.map((video, index) => (
              <YouTubeVideoCard key={video.id} video={video} index={index} inApp />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Watch;
