/**
 * Halal-only surface coverage: verifies no blocked-creator or explicit terms
 * leak into search, recommendations (home / For You), trending suggestions,
 * channels directory, related content on watch pages, or bookmarks empty
 * state. Runs against every user-facing surface.
 */
import { test, expect, type Page } from "../playwright-fixture";

const BANNED = [
  "porn","nude","explicit","xxx","onlyfans","twerk","stripper","escort",
  "bikini","lingerie","sex tape","hookup","casino","gambling",
  // Newly blocked female-content patterns:
  "mia yilin","leila hormozi","layla hormozi","mehreen","haleh banani",
  "makeup tutorial","hijab tutorial","grwm","muslimah vlog",
];

async function assertClean(page: Page) {
  const text = (await page.locator("body").innerText()).toLowerCase();
  for (const term of BANNED) {
    expect(text, `banned term "${term}" leaked`).not.toContain(term);
  }
}

test.describe("halal-only across every surface", () => {
  test("home / For You feed", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2500);
    await assertClean(page);
  });

  test("search results — trending queries", async ({ page }) => {
    for (const q of ["quran", "ramadan", "seerah", "islamic finance"]) {
      await page.goto(`/search?q=${encodeURIComponent(q)}`);
      await page.waitForTimeout(1500);
      await assertClean(page);
    }
  });

  test("search with typos triggers fuzzy results, still halal-only", async ({ page }) => {
    await page.goto("/search?q=quraan");
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Results for/i)).toBeVisible();
    await assertClean(page);
  });

  test("channels directory", async ({ page }) => {
    await page.goto("/channels");
    await page.waitForTimeout(1500);
    await assertClean(page);
  });

  test("section / recommendations page", async ({ page }) => {
    await page.goto("/section/quran-recitation");
    await page.waitForTimeout(2000);
    await assertClean(page);
  });

  test("watch page + related videos", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2500);
    const href = await page
      .$eval("a[href^='/watch/']", (a) => (a as HTMLAnchorElement).getAttribute("href"))
      .catch(() => null);
    test.skip(!href, "no watch link discovered");
    await page.goto(href!);
    await page.waitForTimeout(2500);
    await assertClean(page);
  });

  test("bookmarks / favorites view is halal-safe when empty", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForTimeout(1500);
    await assertClean(page);
  });
});
