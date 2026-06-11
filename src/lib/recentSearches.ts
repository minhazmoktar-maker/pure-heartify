const KEY = "heartify-recent-searches";
const MAX = 8;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  const q = query.trim();
  if (!q) return;
  try {
    const current = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
    const next = [q, ...current].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
