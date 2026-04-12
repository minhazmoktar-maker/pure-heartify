import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";

const Watch = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { data: videos } = useYouTubeVideos("All");

  const currentVideo = videos?.find((v) => v.id === videoId);
  const relatedVideos = videos?.filter((v) => v.id !== videoId).slice(0, 8) ?? [];

  const currentIndex = videos?.findIndex((v) => v.id === videoId) ?? -1;
  const nextVideo = videos && currentIndex >= 0 ? videos[(currentIndex + 1) % videos.length] : null;

  const handleNext = () => {
    if (nextVideo) navigate(`/watch/${nextVideo.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-[1800px] px-4 py-4 md:px-6 lg:flex lg:gap-6">
        {/* Main player column */}
        <div className="flex-1 min-w-0">
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to browse
          </button>

          {/* Embedded player — no YouTube exit paths */}
          <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1&iv_load_policy=3&disablekb=0&fs=1`}
              title={currentVideo?.title ?? "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>

          {/* Video info overlay */}
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
                </>
              )}
            </div>
          </div>

          {/* Next video button */}
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

        {/* Related videos sidebar */}
        <aside className="mt-6 lg:mt-0 lg:w-[380px] xl:w-[420px] shrink-0">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            More Halal Content
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {relatedVideos.map((v, i) => (
              <div key={v.id} onClick={() => navigate(`/watch/${v.id}`)} className="cursor-pointer">
                <YouTubeVideoCard video={v} index={i} inApp />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Watch;
