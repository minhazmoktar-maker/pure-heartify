import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Handles native deep links (heartify://watch/<id>, heartify://channel/<handle>)
 * and universal links to the web domain.
 */
export function useDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("appUrlOpen", ({ url }) => {
          try {
            const u = new URL(url);
            const host = u.host || u.hostname;
            const segs = u.pathname.split("/").filter(Boolean);
            if (host === "watch" && segs[0]) navigate(`/watch/${segs[0]}`);
            else if (host === "channel" && segs[0])
              navigate(`/channels?handle=${encodeURIComponent(segs[0])}`);
            else navigate(u.pathname + u.search + u.hash);
          } catch (e) {
            console.warn("Deep link parse failed", url, e);
          }
        });
        cleanup = () => handle.remove();
      } catch {
        /* web only */
      }
    })();
    return () => cleanup?.();
  }, [navigate]);
}
