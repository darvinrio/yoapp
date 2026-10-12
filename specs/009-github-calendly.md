# Front-Page Calendly CTA

> **Outcome: partially shipped.** Task 1 (the Calendly CTA) is live in
> `b1a357e`. Task 2 (the GitHub activity section) was built, reviewed and
> dropped — see [Task 2 — dropped](#task-2--dropped).

One addition to the front page of the Astro portfolio: an outbound Calendly
booking link. Executed on branch `spec/009-github-calendly` (forked from
`main`).

This is an addition to `/`. It introduces no route, no dependency, and no
third-party runtime dependency.

Decisions locked with the human (2026-10-11): Calendly is an **outbound link,
never an embed**. Task 2's two donut shapes were prototyped side by side but
the whole section was then dropped; the metric was to have been **pushes, not
commits**, and on failure the section would have **degraded to static links**.

## Adjacent Tasks

- `specs/008-professional-redesign.md` — this spec inherits its shell. The load-bearing constraint is its rule that the site makes **no third-party runtime requests** (fonts are self-hosted for exactly this reason). Task 1 is therefore an outbound link, not a Calendly embed. Task 2, had it shipped, would have fetched only public JSON from `api.github.com` and shipped no third-party script.
- `specs/007-visualizations-gallery.md` — the gallery's lightbox, filtering and keyboard behaviour are frozen and are not touched here.
- `specs/005-seo-geo-agent-friendly.md` — `llms.txt` and structured data must not regress. **Neither task adds a route**, so `llms.txt`, `Navbar.astro`, `SiteFooter.astro` and the sitemap are all untouched by this spec.

## Constraints That Drive The Design

These were verified against the live API on 2026-10-11, not assumed. Each one
rules out an otherwise reasonable design. The GitHub half of this table is
retained because it is the reason Task 2 was dropped — **the first row alone
is enough to forbid a contribution-style chart.**

| Finding                                          | Evidence                                                                                                                                                                                                                                                | Consequence                                                                                                                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PushEvent.payload.commits` **no longer exists** | GitHub removed commit summaries from the Events API (changelog 2025-08-08, rolled out 2025-10-07). Verified absent on this repo's feed **and** on a high-traffic control account. Payload now carries only `repository_id, push_id, ref, head, before`. | **Commit counts are unobtainable without a server-side token.** The section is labelled _pushes_. Writing "commits" would put an unverifiable claim on the homepage.                                        |
| Events window is ~27 days, not a year            | This repo's feed returns 38 events spanning `2026-09-15 → 2026-10-11`, with no `Link` header and an empty page 2. The API caps at 300 events / 90 days.                                                                                                 | **No 53-week contribution calendar is buildable token-free.** A short heatmap would look broken next to a real GitHub profile. The ratio-based donut is unaffected — a ratio survives the cap.              |
| Unauthenticated limit is 60 req/hr **per IP**    | `x-ratelimit-limit: 60` on every call.                                                                                                                                                                                                                  | Two calls per page load is fine for personal traffic, but carrier CGNAT / corporate NAT shares an IP across many visitors. **Retry loops make this worse, not better** — hence a static fallback, no retry. |
| Attribution is clean                             | This repo's feed is 100% `actor: darvinrio`; `yo-hermes-bot`'s is 100% `actor: yo-hermes-bot`.                                                                                                                                                          | Bucketing by profile needs no heuristic and no commit-author parsing.                                                                                                                                       |

### Token-free inventory (what the visual may claim)

Available from `/users/{login}/events/public` — `Access-Control-Allow-Origin: *`, no token, `cache-control: max-age=300`:

- Pushes, with date (`type`, `created_at`, `ref`, `repo.name`)
- PRs opened/merged (`payload.action` survived the trim), PR reviews (`review.user.login`)
- Repos touched, avatars, profile stats

Unavailable: per-commit detail, commit-level authorship, per-day contribution _intensity_, anything past 90 days.

**Per-day push counts are available but far too sparse to chart.** Bucketing
the 39 live pushes by day gives 5 active days across a 27-day span — 81%
empty, with 74% of all pushes on two days. Measured, not estimated; see
[Task 2 — dropped](#task-2--dropped).

## Key Constants

**Calendly**

| Constant       | Value                            | Notes                                                                                            |
| -------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `CALENDLY_URL` | `https://calendly.com/darvinrio` | One named constant in `Welcome.astro`. Outbound, `target="_blank"`, `rel="noopener noreferrer"`. |

**GitHub** — dropped with Task 2. Retained for the record.

| Constant          | Value                                                             | Notes                                              |
| ----------------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `GITHUB_HUMAN`    | `darvinrio`                                                       | Teal segment.                                      |
| `GITHUB_AGENT`    | `yo-hermes-bot`                                                   | Neutral segment. bio `"Agent"`, name `"sudeep"`.   |
| `EVENTS_ENDPOINT` | `https://api.github.com/users/{login}/events/public?per_page=100` | `per_page=100`; page 2 is empty for both accounts. |

**Baseline numbers the build is verified against** (live, 2026-10-11):

| Quantity                         | Value                     |
| -------------------------------- | ------------------------- |
| Human pushes                     | `20`                      |
| Agent pushes                     | `19`                      |
| Total                            | `39`                      |
| Human share                      | **51.28%**                |
| Agent share                      | **48.72%**                |
| Window                           | `2026-09-15 → 2026-10-11` |
| Human all-events / repos touched | `38` / `4`                |

**Donut geometry** — both candidates share these:

| Constant         | Value                | Derivation                                  |
| ---------------- | -------------------- | ------------------------------------------- |
| `r`              | `46`                 | Ring radius in the SVG viewBox.             |
| Circumference    | `289.027`            | `2πr`.                                      |
| Human arc length | `148.22`             | `289.027 × 0.5128`.                         |
| Remainder arc    | `140.81`             | `289.027 × 0.4872`.                         |
| 25% tick         | `72.26`              | `289.027 × 0.25`.                           |
| 50% tick         | `144.51`             | `289.027 × 0.50`.                           |
| 75% tick         | `216.77`             | `289.027 × 0.75`.                           |
| Cutoff steps     | `0, 25, 50, 75, 100` | The four-segment split the human specified. |

**Palette** — no new tokens. This is the spec-008 system exactly:

| Segment | Token                    | Light     | Dark      |
| ------- | ------------------------ | --------- | --------- |
| Human   | `var(--color-accent)`    | `#0f766e` | `#2dd4bf` |
| Agent   | `var(--color-ink-faint)` | `#68686f` | `#94949d` |

Both are non-text graphical objects, so the 3:1 threshold applies rather than 4.5:1; both clear it on `--color-surface-raised` in both themes.

## Scope

- **Edited:** `src/components/Welcome.astro` (one constant, one array entry)
- **New:** nothing
- **Explicitly unaffected:** every route and URL, `Navbar.astro`, `SiteFooter.astro`, `llms.txt`, `rss.xml`, the sitemap, `theme.css`, all 13 `.mdx` posts, `src/data/*`, `VisualGallery.astro`

> **Task 2 was built, reviewed and then dropped on 2026-10-11.** The Calendly
> CTA shipped. The GitHub activity section did not. See
> [Task 2 — dropped](#task-2--dropped) for the evidence. Everything below that
> describes Task 2 is kept as the record of what was attempted and abandoned.

## TODO

Function before theme. Each task ends at a route the human can open and judge.

| Task | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Human reviewer criterion                                                                                                                                                                                                                                                                         | Commit                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| 1    | **Calendly CTA.** Add `const CALENDLY_URL = "https://calendly.com/darvinrio"` to `Welcome.astro`. Append `{ href: CALENDLY_URL, label: "Book a call", external: true }` to the existing `quickLinks` array, reusing the pill class already in that file. Emit `target="_blank" rel="noopener noreferrer"` for the external entry only. Zero new markup.                                                                                                                                                                                                                         | `/` shows a "Book a call" pill in the existing row beside View Resume / Work Experience / Writings, styled identically. Clicking opens Calendly in a new tab. Tab reaches it; focus ring is visible. **DevTools Network shows zero requests to `assets.calendly.com`** and no new cookie is set. | `b1a357e`                 |
| 2    | **GitHub activity section.** New `GitHubActivity.astro` mounted in `index.astro` between the hero and `Contacts`. Fetches both `events/public` endpoints in parallel, filters `type === "PushEvent"`, counts per profile, renders the human/agent ratio. **Build both candidate shapes side by side** — the 4-arc ring (r=46, ticks at 72.26/144.51/216.77) and the 2×2 square grid — in teal and neutral, with the numerals and the window label. Human picks one; **delete the loser in this same task.** Fetch failure or 403 degrades to two static GitHub links; no retry. | ~~`/` shows the section with both candidate shapes...~~                                                                                                                                                                                                                                          | **`dropped`** — see below |

### Task 2 — dropped

The section was built, verified against every criterion above, and put in
front of the human as two live side-by-side candidates. It was then dropped,
at the human's direction, on the grounds that the visual was not saying
anything true about the work.

The aggregate ratio was never the problem — `20 you / 19 agent` is exact,
reproducible and a good headline. What failed was the idea of breaking that
ratio into a chart. Bucket the 39 pushes every way the payload allows and no
axis produces a dense, honest grid:

| Bucket axis    | Shape of the data (live, 2026-10-11)                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Per day**    | 27-day span, **5 days with any push** — 81% empty. Counts `16, 13, 7, 2, 1`. **74% of all pushes landed on two days** (2026-09-15/16).                     |
| **Per week**   | 3 weeks, 1 empty → `55.2% / 100% / 33.3%`.                                                                                                                 |
| **Per repo**   | 4 buckets, but two of them are the _same repo_ (`darvinrio/yoapp` + `yo-hermes-bot/yoapp`, a fork pair). 3 of 4 cells resolve to a degenerate `100% / 0%`. |
| **Per branch** | 6 buckets, 3 of them one-push singletons, most already deleted upstream.                                                                                   |

A contributions chart was the natural fix — one cell per day, each cell a
miniature 4-segment donut or 2×2 ring carrying that day's human/agent split.
It was prototyped as a proposal and rejected, because on this data **three of
the five populated days encode a ratio derived from 1, 2, and 7 pushes**. A
donut that confidently claims "100% you" off a single push, floating in 22
blank cells, is worse than no chart: it puts a precise-looking number on the
homepage that the API cannot support. That is the failure mode this spec's
own constraint table predicted, and the "Non-goals" list below already named
a contributions heatmap as out of scope for exactly this reason.

The honest options were all weaker than the aggregate donut: encode cell
_volume_ instead of cell ratio (no longer the chart that was asked for),
collapse to 3 weekly cells (no longer a contributions chart at all), or drop
the section. The human chose to drop it.

**What survives:** the two `github.com` links already sit in `Contacts.astro`
on the front page, so nothing is lost to a reader. The Calendly CTA from
Task 1 is unaffected.

**If this is ever revived**, do not re-run Task 2 as written. It needs a
different data source — `/repos` for real per-repo push counts, or an
authenticated feed — not a different chart.

Commit hashes are recorded after each task's human-approved commit. One commit per task on `spec/009-github-calendly` — never merged into `main`; the branch is delivered as a pull request.

### Task dependency order

`1 → 2`, with 2 dropped. Task 2 no longer has an outcome.

### Reviewer criteria worth calling out

- **Task 1 is a pure add.** If the pill row reflows or any existing quick link moves, scope leaked.
- ~~Task 2 ships two shapes on purpose.~~ Obsolete — the task was dropped, so nothing ships.

## Verification

1. `bun dev`; confirm the Task 1 criterion on `/`.
2. `bun build` — must succeed.
3. **DevTools Network** filtered to `calendly` — expect zero hits. Application → Cookies — expect no new entry. This is the spec-008 no-third-party rule, checked rather than assumed.
4. `bun format` before every commit.

Steps 5–9 of the original plan (numerals, dark mode, offline degradation, Slow 3G, tab order) are void with Task 2. They were all run and passed against the prototype before it was dropped.

## Non-goals

Retained for the record — all of these describe the dropped Task 2, and the
only one this spec still delivers against is the Calendly embed rule.

- A Calendly embed, popup widget, or any `assets.calendly.com` request
- Any npm dependency, UI framework, or chart library — the donut is hand-built SVG
- A 53-week contribution heatmap, streak counter, or "N contributions this year" claim
- **A per-day contributions chart of any kind, including one whose cells are miniature donuts or rings.** This was requested on 2026-10-11 after the aggregate donut was built, prototyped as a proposal, and rejected: 5 of 27 days carry data and 3 of those 5 yield a ratio off 1, 2, or 7 pushes. See [Task 2 — dropped](#task-2--dropped).
- A new route (`/github`), and therefore any Navbar / SiteFooter / sitemap / `llms.txt` edit
- A `GITHUB_TOKEN`, a server endpoint, a build-time fetch, or an API proxy
- Counting PRs, reviews, forks or branch deletes — **pushes only**
- Calling any of this data "commits"
- Retry or backoff logic, `localStorage` caching, or a last-known-good cache
- Per-repo or language breakdowns (the `/repos` endpoint is deliberately not called)
- Avatar images from `avatars.githubusercontent.com` — the section links out instead
