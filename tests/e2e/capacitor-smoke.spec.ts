/**
 * Capacitor pre-build smoke test.
 *
 * Verifies the three flows we cannot afford to ship broken to a native shell:
 *   1. Login page renders and the auth form is interactive
 *   2. Home feed loads curated video content
 *   3. A video route mounts the embedded player (no external YouTube redirect)
 *
 * Run automatically via `npm run cap:smoke` before `npx cap sync`.
 */
import { test, expect } from "../../playwright-fixture";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:8080";

test.describe("Capacitor smoke", () => {
  test("login page is interactive", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await expect(page.getByPlaceholder("Email address")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  });

  test("home feed loads curated videos", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    // Wait for at least one video thumbnail (curated sections or infinite grid)
    const thumb = page.locator('img[src*="ytimg.com"], img[src*="youtube.com"]').first();
    await expect(thumb).toBeVisible({ timeout: 30_000 });
    // Confirm at least a few video cards rendered
    const count = await page.locator('img[src*="ytimg.com"], img[src*="youtube.com"]').count();
    expect(count).toBeGreaterThan(3);
  });

  test("video playback uses embedded in-app player", async ({ page }) => {
    // Navigate via home to pick a real video id
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const firstCard = page.locator('a[href^="/watch/"]').first();
    await firstCard.waitFor({ state: "visible", timeout: 30_000 });
    await firstCard.click();
    await page.waitForURL(/\/watch\/.+/, { timeout: 15_000 });

    const iframe = page.locator('iframe[src*="youtube-nocookie.com/embed/"]');
    await expect(iframe).toBeVisible({ timeout: 15_000 });
    const src = await iframe.getAttribute("src");
    expect(src).toContain("rel=0");
    expect(src).toContain("modestbranding=1");
    // Must NOT be a redirect to youtube.com watch page
    expect(page.url()).not.toContain("youtube.com/watch");
  });
});
