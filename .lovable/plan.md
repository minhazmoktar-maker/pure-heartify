# Heartify MVP Audit & Upgrade Plan

This is a large, multi-area request. To do it well without breaking the working catalog (157k+ videos, ingestion, moderation, auth, PiP), I'll do it in reviewable phases instead of one giant change. Please confirm the phase order — I'll start with Phase 1 right after you approve.

## Audit Findings (current MVP)

**Strengths**
- Strong halal moderation pipeline (keyword + regex + vision + emoji + female-presenter rules) running server-side before `curated_videos`.
- 1,325 trusted channels, dual YouTube API keys with rotation, uploads-playlist incremental fetch.
- Auth, profiles, favorites, watch_history, user_roles with `has_role()` SECURITY DEFINER, RLS locked down.
- Audit edge function + admin dashboard + Playwright sweep already exist.

**Gaps blocking a "world-class intentional" feel**
1. **No Daily Dose product.** Home is a Browse/For You/Listen tab trio — pure feed. No daily limit, no completion, no celebration, no streak surface.
2. **Onboarding is missing** — no interest capture, so personalization can't be weighted 70/20/10.
3. **Streaks/achievements** — not implemented end-to-end; no milestone cards, no share assets.
4. **Saved page is flat** — just a favorites list, no Continue Watching / By Category / Most Beneficial.
5. **Search is minimal** — single query box, no trending/recent/suggested/creators.
6. **Trust badges** not surfaced on cards (Reviewed by Heartify, Educational, Halal-Friendly, etc.).
7. **Empty states** are generic muted text.
8. **Referral system** does not exist.
9. **Premium scaffold** does not exist (entitlements table, feature flags).
10. **Analytics** — moderation/ingestion logs exist, but no product analytics (DD completion, watch time, streak retention, referral conversion).
11. **Design polish** — cards, spacing, typography are functional but not yet calm/premium. Heading font is Space Grotesk (fine), but hierarchy and whitespace need a pass.
12. **Perf** — feed already cached 2min; no thumbnail CDN sizing, no route-level code splitting audit, no LCP preload.

## Phased Implementation

### Phase 1 — Daily Dose (Hero Product) + Streaks
- New tables: `daily_dose` (user_id, date, video_ids[], total_minutes, completed_count), `streaks` (user_id, current, longest, last_completed_date), `user_interests` (primary, secondary, exploration), `dose_completions`.
- Edge function `generate-daily-dose`: picks 3 videos using 70/20/10 weighting from `user_interests`, capped at ~18min, dedup'd vs `watch_history`.
- New `<DailyDoseHero>` component on `/` — top of page, shows 3-card stack, "X/3 completed", progress ring, estimated time.
- Completion detection in `Watch.tsx` (≥85% watched) → mark dose item complete → if all 3 done → celebration modal ("Alhamdulillah 🌿") + streak bump + confetti-free calm animation.
- Streak milestone modals (3/7/14/30/60/100/365) with shareable card (html2canvas).

### Phase 2 — Onboarding + Personalization
- `/onboarding` route (gated after signup if `user_interests` missing).
- 3-step flow: pick Primary, Secondary, Exploration from existing curated section taxonomy.
- Wire into Daily Dose generator + For You ranking.

### Phase 3 — Trust Badges + Card Polish
- Add `trust_tags` text[] column to `curated_videos` (default derived from section: Islamic→["Reviewed","Halal-Friendly"], Science→["Educational","Science-Based"], etc.).
- Backfill via SQL based on existing section_ids.
- `<TrustBadges>` chip row on `YouTubeVideoCard` + Watch page.

### Phase 4 — Saved Upgrade + Search Upgrade + Empty States
- Profile/Saved page tabs: Continue Watching (from `watch_history` where progress 5–95%), Recently Saved, By Category, Most Beneficial (highest moderation score), Favorites.
- Search page: Trending (aggregate from `search_queries` table), Recent (localStorage), Suggested (category chips), Popular Creators (top `channel_title` by `curated_videos` count).
- Replace every empty state with a calm, copy-driven component.

### Phase 5 — Referral + Premium Scaffold + Analytics
- `referrals` table (code, inviter_id, invitee_id, status), invite UI unlocked at 7-day & 30-day streaks.
- `entitlements` table (user_id, plan, features jsonb) — schema only, no UI.
- `analytics_events` table + `track()` helper; admin `/admin/analytics` dashboard with DD completion %, avg watch time, streak retention curve, referral conversion.

### Phase 6 — Design Polish + Performance
- Tighten spacing scale, soften shadows (`--shadow-soft`), increase card radius consistency, refine typography hierarchy (display 32/24/18, body 14/13).
- Preload LCP hero, lazy-load below-fold sections, add `loading="lazy"` + `decoding="async"` to thumbnails, code-split Audit/Moderation routes.

## Technical Notes
- All new tables follow project rules: `GRANT` block + RLS + `has_role()` for admin tables.
- No client-side role checks; all admin endpoints re-verify via JWT + `has_role`.
- Daily Dose generation runs on-demand (edge function) with a 24h cache row, plus a nightly cron pre-generates for active users.
- Watch-progress tracking reuses existing `watch_history` table — add `progress_seconds` if missing.
- No infinite-scroll changes to home in Phase 1 — Daily Dose sits *above* existing tabs; intentional consumption is reinforced by it being the first thing and the only thing the celebration congratulates.

## What I'd like confirmed
1. Approve phased rollout (Phase 1 first this turn, others in follow-ups)?
2. OK to add the listed new tables (`daily_dose`, `streaks`, `user_interests`, `dose_completions`, later `referrals`, `entitlements`, `analytics_events`, `search_queries`)?
3. Keep existing Browse/Listen tabs intact below Daily Dose? (recommended — don't remove what works)
