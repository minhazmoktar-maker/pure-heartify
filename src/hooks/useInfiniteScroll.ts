import { useEffect, useRef, useCallback } from "react";

/**
 * Hook that calls `onIntersect` when the sentinel element is near the viewport.
 */
export function useInfiniteScroll(
  onIntersect: () => void,
  enabled: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const stableOnIntersect = useCallback(onIntersect, [onIntersect]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stableOnIntersect();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, stableOnIntersect]);

  return sentinelRef;
}
