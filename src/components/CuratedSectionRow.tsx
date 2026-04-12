import { useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { type CuratedSection } from "@/data/curatedSections";
import { useCuratedSection } from "@/hooks/useCuratedSection";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";
import { isTrustedChannel } from "@/data/trustedChannels";
import { Badge } from "@/components/ui/badge";

interface Props {
  section: CuratedSection;
}

const CuratedSectionRow = ({ section }: Props) => {
  const { data: videos, isLoading } = useCuratedSection(section);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="py-6">
        <h2 className="text-lg font-bold text-foreground">{section.icon} {section.title}</h2>
        <div className="mt-3 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </section>
    );
  }

  if (!videos?.length) return null;

  return (
    <section className="py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{section.icon} {section.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button onClick={() => scroll("left")} className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll("right")} className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
      >
        {videos.map((v, i) => (
          <div key={v.id} className="w-[280px] shrink-0 sm:w-[300px]">
            <YouTubeVideoCard video={v} index={i} />
            {isTrustedChannel(v.channelTitle) && (
              <Badge variant="secondary" className="mt-1.5 gap-1 text-[10px]">
                <ShieldCheck className="h-3 w-3 text-primary" />
                Trusted Channel
              </Badge>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CuratedSectionRow;
