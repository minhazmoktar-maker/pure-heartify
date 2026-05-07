import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard service worker: never run inside Lovable preview iframes.
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
} else if ("serviceWorker" in navigator) {
  // Lazy register the auto-generated SW from vite-plugin-pwa in production builds.
  import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
