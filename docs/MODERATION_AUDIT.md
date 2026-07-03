# Content Moderation Audit Report

_Last updated: this release_

## Policy

The platform enforces a strict **halal-only** content policy. No content may be
rendered to a user before passing moderation. Moderation is applied uniformly to
every creator and every content surface — no per-account exceptions.

## Where the bypass occurred

During QA, videos from **Mia Yilin**, **Leila Hormozi**, and **Mehreen Khan**
were still surfacing on the home feed and search results, even though those
creators were listed in `BLOCKED_CREATORS` inside
`supabase/functions/ingest-videos/index.ts`.

Root cause: the ingestion-time blocklist only prevented *new* inserts. It did
not (a) purge rows already in `curated_videos`, (b) block direct SQL inserts
from other paths (backfill scripts, one-off admin queries, the
`refresh-sections` job), or (c) filter at read time. The `feed` edge function
read the table verbatim and served the stale rows.

## What changed

### 1. Database — trigger-enforced blocklist (defense in depth #1)

- New `blocked_creators` table (name TEXT, added_at TIMESTAMPTZ).
- New trigger `trg_enforce_blocked_creators` runs `BEFORE INSERT OR UPDATE` on
  `curated_videos`. Any row whose `channel_title` or `title` matches a blocked
  name (case-insensitive substring) is rejected with an exception.
- Trigger function permissions locked down: `EXECUTE` revoked from `public` and
  `authenticated`. It only runs via the trigger.
- One-shot data purge: all existing rows matching blocked names were deleted.
  Verified count = 0 post-purge.

### 2. Feed edge function — read-time filter (defense in depth #2)

`supabase/functions/feed/index.ts` now appends explicit
`channel_title=not.ilike.*<name>*` and `title=not.ilike.*<name>*` predicates
for every blocked pattern on every query. Even if a race or manual insert ever
lands a blocked row, it can never be served.

### 3. Ingestion edge function — insertion-time filter (defense in depth #3)

`supabase/functions/ingest-videos/index.ts` retains its `BLOCKED_CREATORS`
check plus keyword/thumbnail moderation (Gemini vision) before inserting.

### 4. Search, recommendations, related, notifications

All of these query `curated_videos` through either the `feed` function or the
same table, so they inherit the trigger + read-time filters. There is no
separate index or cache that can serve blocked content.

### 5. Client-side and service-worker caches

The service worker (`vite-plugin-pwa`) caches API responses under a
`NetworkFirst` strategy with a 1-hour max age. On deploy, `workbox`
auto-invalidates the runtime cache because the precache manifest hash changes.
Users pick up the cleaned data on next visit. No manual CDN purge is needed
because API responses are not statically CDN-cached.

## Automated tests

`tests/e2e/capacitor-smoke.spec.ts` now includes:

1. **`blocked creators never appear on any surface`** — visits `/`,
   `/channels`, and two search terms known to previously surface blocked
   creators, then asserts none of the blocked names appear anywhere in the
   rendered DOM text.
2. **`video playback uses embedded in-app player and never navigates away`** —
   installs a `framenavigated` + `popup` guard that fails the test if the top
   frame ever loads a `youtube.com/watch` or `youtu.be` URL, even after slow
   loads or retries.
3. **`home feed loads more videos on scroll without leaving the app`** —
   scrolls the infinite grid and re-asserts the guard.

These tests run in the `cap-smoke` GitHub Actions workflow on every PR and
gate the `mobile-release` workflow. iOS TestFlight and Play Internal uploads
cannot start unless the smoke tests pass.

## How to add a new blocked creator

```sql
INSERT INTO blocked_creators (name) VALUES ('lowercased creator name');
-- The trigger will reject any future inserts. Also run:
DELETE FROM curated_videos
 WHERE channel_title ILIKE '%lowercased creator name%'
    OR title         ILIKE '%lowercased creator name%';
```

Then add the same lowercased string to the `BLOCKED_PATTERNS` array in
`supabase/functions/feed/index.ts` (read-time guard) and redeploy.

## Confirmation

- Trigger active on `curated_videos`: **yes**.
- Rows matching Mia Yilin / Leila Hormozi / Mehreen post-purge: **0**.
- `feed` function filters applied on every query: **yes**.
- E2E test asserting zero blocked creators on rendered surfaces: **passing**.
- CI gate on TestFlight + Play Internal releases: **enforced**.
