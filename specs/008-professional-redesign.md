# Professional Redesign

Full-site visual redesign, executed on branch `spec/008-professional-redesign` (forked from `main`), to make the site read as a polished, professional analytics-engineering portfolio rather than a personal blog. Shell-first: design tokens, typography and layout chrome are rebuilt before any page interior, so every later page inherits a correct system.

The single most damaging defect found is measured, not aesthetic: the existing accent `#14b8a6` renders at **2.49:1** against white — every teal link and label in light mode fails WCAG AA. The redesign fixes that first.

Decisions locked in the interview (2026-10-08): full-site shell-first scope; **neutral + single teal accent** (teal becomes functional-only — links, active state, focus rings — and stops decorating prose); keep F5.6 and Merriweather, rebuild the type system around them, and add **Bricolage Grotesque as a runtime-toggleable alternative display face**; keep `/texture.png` but halve it and confine it to dark mode; **include OG images in scope** so link previews match the site; spec filed in `specs/` per repo convention.

## Adjacent Tasks

- `specs/005-seo-geo-agent-friendly.md` — `llms.txt` and structured data are already in place; this redesign must not regress them.
- `specs/006-per-post-og-images.md` — per-post OG PNGs exist. This spec only restyles their palette (Task 9); it does not change their routing or title-bucketing.
- `specs/007-visualizations-gallery.md` — the gallery is functionally complete. Task 8 restyles its chrome only; lightbox, filtering and keyboard behaviour are frozen.
- **Parked, not in scope:** replacing the 110 screenshot-style `src/assets/blog-images/` files with curated assets; a `/now` page; per-post OG following the display-font toggle; Astro view transitions; site search; any new npm dependency.

## Root Causes This Spec Addresses

| Defect                                                                                          | Location                                            | Consequence                                                                                         |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Accent `#14b8a6` on white = **2.49:1**                                                          | `src/styles/theme.css:18`                           | Every teal link/label in light mode fails WCAG AA. The primary reason the site reads as unpolished. |
| Dark mode elevation inverted — `surface` `#27272a` is _lighter_ than `surface-raised` `#18181b` | `src/styles/theme.css:27-28`                        | Raised surfaces visually sink below the page. Reads as a rendering bug.                             |
| `accent-soft` collapses to neutral gray `#3f3f46` in dark mode                                  | `src/styles/theme.css:41`                           | All tag chips lose their brand identity in dark mode.                                               |
| No blocking `<head>` theme script                                                               | `src/components/BaseHead.astro`, `DarkToggle.astro` | Dark-mode users get a white flash on every load.                                                    |
| `/texture.png` overlay duplicated and layered over content at `z-index:0`                       | `Layout.astro:28-31` **and** `Navbar.astro:16-19`   | Grain doubles up under the nav; extra paint cost over the whole viewport.                           |
| No site footer                                                                                  | site-wide                                           | Every page terminates abruptly.                                                                     |
| Home page uses `LandingLayout`, which omits the navbar                                          | `src/layouts/LandingLayout.astro`                   | `/` has no navigation except three bare text links.                                                 |
| No active-route state in nav                                                                    | `src/components/Navbar.astro`                       | Users cannot tell where they are. No `aria-current`.                                                |
| Flat type hierarchy — `text-2xl` eyebrow beside `text-3xl` name                                 | `src/components/Welcome.astro:8-13`                 | No visual hierarchy on the landing page.                                                            |
| 17 near-duplicate color tokens; pure `#000` on `#fff`                                           | `src/styles/theme.css`                              | Unmaintainable palette, harsh contrast.                                                             |
| No prose measure; blog renders at 1024px full width                                             | `src/layouts/PostLayout.astro`                      | Long-form MDX lines far exceed a comfortable measure.                                               |
| Dead `tailwind.config.mjs`, never loaded (no `@config` directive)                               | repo root                                           | Misleading config that will drift.                                                                  |
| Deprecated `markdown.remarkPlugins` / `rehypePlugins`                                           | `astro.config.mjs:14-15`                            | Build emits a deprecation warning on every run.                                                     |

## Key Constants

**Fonts** — all self-hosted from `public/fonts/`; no third-party requests at runtime.

| Role                | Family              | Weights          | File                                         | Notes                                                            |
| ------------------- | ------------------- | ---------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| Display (default)   | F5.6                | 400 only         | `F5.6-Regular.woff2`                         | **Cannot render bold.** Headings must not depend on weight here. |
| Display (alternate) | Bricolage Grotesque | 200–800 variable | `bricolage-grotesque-latin-var.woff2`        | New. 76,868 bytes.                                               |
| Body                | Merriweather        | 300/400/700/900  | `merriweather-latin-{300,400,700,900}.woff2` | Kept; 13 long-form MDX posts depend on its reading comfort.      |
| Mono                | JetBrains Mono      | 400/500/700      | `jetbrains-mono-latin-{400,500,700}.woff2`   | Kept for meta, eyebrows, code.                                   |

Bricolage Grotesque source (latin subset, variable `wght` 200–800, `opsz` 12–96):

```
https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGIInHWVyNJ.woff2
```

Deliberately **not preloaded** — declared with `font-display: swap` so the browser fetches it only once the human opts in, keeping default page weight unchanged.

**Palette** — neutral surfaces, teal strictly functional. All values below verified with a WCAG 2.1 relative-luminance script; ratios recorded.

Light (`surface` `#fafafa`):

| Token             | Value     | Verified ratio                                          |
| ----------------- | --------- | ------------------------------------------------------- |
| `surface`         | `#fafafa` | page background                                         |
| `surface-raised`  | `#ffffff` | cards, navbar, footer                                   |
| `surface-sunken`  | `#f4f4f5` | wells, code blocks, table zebra                         |
| `surface-hover`   | `#f4f4f5` | hover                                                   |
| `ink-strong`      | `#09090b` | 19.06:1                                                 |
| `ink`             | `#18181b` | 16.97:1                                                 |
| `ink-muted`       | `#52525b` | 7.41:1                                                  |
| `ink-faint`       | `#68686f` | 5.30:1 surface · **4.91:1 worst case** on `accent-soft` |
| `line`            | `#e4e4e7` | 1.22:1 vs surface (non-text, ok)                        |
| `line-strong`     | `#d4d4d8` | emphasis borders                                        |
| `accent`          | `#0f766e` | **5.24:1** — was `#14b8a6` at 2.49:1                    |
| `accent-bright`   | `#0d9486` | decorative only, never text                             |
| `accent-soft`     | `#ccfbf1` | tag pill background                                     |
| `accent-soft-ink` | `#0f766e` | 4.86:1 on `accent-soft`                                 |
| `on-accent`       | `#ffffff` | 5.47:1 on `#0f766e`                                     |

Dark (`surface` `#18181b` — raised is now correctly _lighter_):

| Token             | Value                      | Verified ratio                                |
| ----------------- | -------------------------- | --------------------------------------------- |
| `surface`         | `#18181b`                  | page background                               |
| `surface-raised`  | `#27272a`                  | cards, navbar, footer                         |
| `surface-sunken`  | `#0f0f11`                  | wells                                         |
| `surface-hover`   | `#3f3f46`                  | hover                                         |
| `ink-strong`      | `#fafafa`                  | 16.97:1                                       |
| `ink`             | `#e4e4e7`                  | 13.96:1 — was `#e8e5ef`, a muddy purple       |
| `ink-muted`       | `#a1a1aa`                  | 6.91:1                                        |
| `ink-faint`       | `#94949d`                  | 4.95:1 on raised — `#8b8b93` was 4.41:1, FAIL |
| `line`            | `#2e2e34`                  | 1.43:1 vs surface                             |
| `line-strong`     | `#3f3f46`                  | emphasis borders                              |
| `accent`          | `#2dd4bf`                  | 9.52:1                                        |
| `accent-bright`   | `#5eead4`                  | decorative only                               |
| `accent-soft`     | `rgba(45, 212, 191, 0.12)` | was `#3f3f46`, which erased chip identity     |
| `accent-soft-ink` | `#2dd4bf`                  |                                               |
| `on-accent`       | `#0f172a`                  | text on a teal fill                           |

**Type scale** — replace ad-hoc `text-2xl`/`text-3xl` pairs with named tokens.

| Token            | Size / line-height | Use                   |
| ---------------- | ------------------ | --------------------- |
| `--text-display` | 3.5rem / 1.05      | landing hero only     |
| `--text-h1`      | 2.25rem / 1.15     | page title            |
| `--text-h2`      | 1.5rem / 1.25      | section heading       |
| `--text-h3`      | 1.125rem / 1.35    | subsection            |
| `--text-body`    | 1rem / 1.65        | prose                 |
| `--text-meta`    | 0.8125rem / 1.5    | dates, tags, captions |

**Layout constants**

| Constant            | Value                                                        |
| ------------------- | ------------------------------------------------------------ |
| `--container-width` | `1024px` (content)                                           |
| `--container-wide`  | `1280px` (gallery only — 3 columns are cramped at 1024px)    |
| `--container-prose` | `57ch` (**new** — blog reading measure; see Verification §5) |
| Texture opacity     | `0.05` → `0.03`, dark mode only, single instance             |
| Container gutter    | `1.25rem` mobile / `2rem` ≥ `md`                             |

**State persistence**

| Key                        | Values                | Default                |
| -------------------------- | --------------------- | ---------------------- |
| `localStorage.theme`       | `light` \| `dark`     | `prefers-color-scheme` |
| `localStorage.displayFont` | `f5.6` \| `bricolage` | `f5.6`                 |

Display-font toggle mechanics: `:root` sets `--font-title: "F5.6", sans-serif`; `html.font-bricolage` overrides to `--font-title: "Bricolage Grotesque", sans-serif`. One class on `<html>`, mirroring the existing `.dark` strategy — no rebuild needed to switch.

## Scope

- **Rewritten:** `src/styles/theme.css`, `src/styles/global.css`
- **New:** `src/components/SiteFooter.astro`, `src/components/DisplayFontToggle.astro`, `public/fonts/bricolage-grotesque-latin-var.woff2`
- **Rewritten:** `src/layouts/Layout.astro`, `src/layouts/PostLayout.astro`; `src/layouts/LandingLayout.astro` deleted (home moves to `Layout`, gaining the navbar)
- **Rewritten:** `src/components/Navbar.astro`, `Welcome.astro`, `Contacts.astro`, `ContactItem.astro`, `PageTitle.astro`, `WorkItem.astro`, `BaseHead.astro`
- **Restyled:** `src/pages/{index,work,resume,blog,visualizations,404}.astro`, `src/pages/blog/[slug].astro`, `src/components/VisualGallery.astro`, `src/styles/blog.css`
- **Restyled to the new palette:** `src/lib/og-brand.ts`, `public/og.png`, `public/favicon.svg`
- **New data file:** `src/data/resume.ts` — extracts the 226-line inline resume frontmatter so theme and layout can be restyled without editing content
- **Deleted:** `tailwind.config.mjs` (dead — never loaded without `@config`), `src/assets/{astro,background}.svg` (unused starter leftovers)
- **Explicitly unaffected:** all 13 `src/content/blog/*.mdx`, `src/data/visualizations.ts`, `src/data/work.ts`, `src/plugins/rehype-table-wrap.ts`, `src/components/BlogImage.astro`, `scripts/fonts/`, and every route URL

## TODO

Function before theme. Tasks 1–2 rebuild the system before any page interior changes, and each task ends at a route the human can open and judge.

| Task | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Human reviewer criterion                                                                                                                                                                                                                                                                                                    | Commit    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1    | Foundation plumbing, no restyle. Add `bricolage-grotesque-latin-var.woff2` to `public/fonts/`; declare `@font-face` in `global.css` (**no preload**); create `DisplayFontToggle.astro`; add the blocking `is:inline` head script in `BaseHead.astro` that applies both `.dark` and `.font-bricolage` before paint.                                                                                                                                                                                                                                                                                                                                                                                                                         | `/` loads with zero white flash when localStorage theme is `dark` (hard-reload and confirm). Display-font toggle in the nav switches the wordmark F5.6 ↔ Bricolage Grotesque and survives reload. Bricolage is **not** in the network panel until first toggle. Site otherwise looks identical to `main`.                   | `3906bbc` |
| 2    | Rewrite the palette in `theme.css` per Key Constants: fix accent to `#0f766e`/`#2dd4bf`, fix dark elevation inversion, restore `accent-soft` identity, neutralise the purple ink. Keep `ink-faintest` as a temporary alias so this diff stays inside one file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Hard-reload `/`, `/work`, `/blog`, `/resume`: teal links are now legible in light mode. Dark mode raised surfaces sit _above_ the page. Tag chips in `/visualizations` are tinted in both themes. Nothing is unreadable anywhere.                                                                                           | `b5284b9` |
| 3    | Shell: merge `LandingLayout` into `Layout` (home gains the navbar); add `SiteFooter.astro`; add skip-to-content link; apply the texture once, `opacity 0.03`, dark-only. Rebase prose/heading defaults in `global.css`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Every one of `/`, `/work`, `/blog`, `/resume`, `/visualizations`, `/404` shows navbar + footer. Tab once from page load → visible "skip to content" link that jumps past the nav. Grain appears in dark mode only, once, not doubled under the nav.                                                                         | `29ba1d8` |
| 4    | Rebuild `Navbar.astro`: active-route detection via `Astro.url.pathname`, `aria-current="page"`, theme + display-font toggles grouped in one controls cluster, mobile menu restyled and focus-managed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | On `/work`, "Work" is visibly active with `aria-current="page"`. Toggles sit together and both work. Mobile: menu opens/closes, closes on link click and on `Esc`, restores focus to the toggle.                                                                                                                            | `eba5f21` |
| 5    | Typography: add the `--text-*` scale and `--container-prose` to `global.css`; rewire `PageTitle.astro`, `WorkItem.astro` and headings onto tokens; set `PostLayout` prose to the `--container-prose` measure.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Open any blog post: line length is comfortable, roughly 65–75 characters, not full 1024px. `PageTitle` and every `h2` use scale tokens. Eyebrow/meta text is visibly smaller than headings — no two adjacent levels look alike.                                                                                             | `57916f0` |
| 6    | Home: rebuild `Welcome.astro` hero with a real display/hierarchy split; restyle `Contacts.astro` + `ContactItem.astro`; set the three quick links as a proper row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `/` opens: hero has clear hierarchy (small eyebrow → large display name → intro), navbar present, footer present, contact icons aligned on one baseline with brand colour only on hover. Reads as a professional landing.                                                                                                   | `717fd73` |
| 7    | Work + Resume + 404: extract resume data to `src/data/resume.ts`; restyle `WorkItem.astro` as a timeline with a year gutter; restyle `/resume` two-column layout; give `/404` real content and links.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `/work` shows a legible timeline with years aligned in a gutter. `/resume` is balanced two-column with the PDF link still working. `/404` has a title, explanation and links back — not a bare heading.                                                                                                                     | `799b3a1` |
| 8    | Blog + visualizations: restyle `/blog` index rows, `/blog/[slug]` header/meta, `blog.css` prose rules, and the `VisualGallery.astro` grid + chips chrome.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `/blog` index is scannable with clear date/title/description separation. A post's header shows title, date and tags with real hierarchy; math and tables still render. `/visualizations` grid uses `1280px`, chips are tinted in both themes, and the lightbox + tag filtering + keyboard nav still work exactly as before. | `6c7e758` |
| 9    | Brand assets: update `src/lib/og-brand.ts` `COLORS` to the new palette and re-render `public/og.png`; recolour `public/favicon.svg`; keep `WORDMARK` unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Run `bun build`; open `/og/<any-slug>.png` and `/og.png` — new neutral+teal palette, wordmark and title layout unchanged, no missing fonts. Favicon renders correctly on a light and dark browser tab.                                                                                                                      | `b7579b5` |
| 10   | Polish & regression: delete `tailwind.config.mjs` and the two unused starter SVGs; migrate `ink-faintest` → `ink-faint` call sites and drop the alias; move markdown plugins to `unified({...})` to clear the deprecation warning; add `focus-visible` rings and a `prefers-reduced-motion` guard; set `markdown.shikiConfig` so code blocks follow the theme instead of shipping Shiki's `github-dark` inline background in both themes (**added during Task 8** — the inline style cannot be beaten from CSS, so `--tw-prose-pre-bg` has no effect today); align the two `<meta name="theme-color">` values in `BaseHead.astro` with the new light/dark surfaces, which still advertise `#ffffff` / `#27272a` (**added during Task 9**). | `bun build` completes with **no** deprecation warnings. Tabbing through every page shows a visible teal focus ring on all interactive elements. With reduced motion emulated, no transitions fire. No `ink-faintest` references remain. A code block in any post matches the active theme in both light and dark.           | `dbea740` |

Commit hashes are recorded after each task's human-approved commit (todo auto-updates the hash when asked to continue with the next task). One commit per task on `spec/008-professional-redesign` — never merged into `main`; the branch is delivered as a pull request against `main`.

### Task dependency order

`1 → 2 → 3 → 4 → 5 → {6, 7, 8} → 9 → 10`

Tasks 1–5 are strictly sequential: each rebuilds part of the system the next one consumes. Tasks 6–8 are page interiors and are mutually independent once the shell is in place — any of the three can be reviewed and committed on its own. Task 9 is a separate integration (satori/resvg) and must not be bundled with page work, so a broken OG render is debugged in isolation. Task 10 is last because it deletes aliases that earlier tasks still reference.

### Reviewer criteria worth calling out

- **Task 1 is a no-op visually on purpose.** If the site looks different after Task 1, something is wrong. Its only job is to make later tasks safe.
- **Task 2 changes no layout.** Every element keeps its position; only colour moves. If positions shift, scope leaked into Task 3.
- **Task 8 must not change gallery behaviour.** Filter, lightbox, `←`/`→`, `Esc`, focus restore and scroll lock are explicitly frozen. If any of those regress, revert to Task 7's state and re-apply only the CSS.

## Verification

1. `bun dev` after every task; confirm the task's reviewer criterion on the named route.
2. `bun build` after Tasks 2, 5, 8, 9, 10 — must succeed; must emit no deprecation warnings after Task 10.
3. After Task 1: throttle to Slow 3G and confirm Bricolage is absent from the network panel until toggled.
4. After Task 2: run the WCAG contrast script over every `ink*`/`accent*` token against **all four** surfaces (`surface`, `surface-raised`, `surface-sunken`, `accent-soft`) in both themes; all text pairs ≥ 4.5:1.
   - **Deviation, Task 2:** the table originally specified `ink-faint` `#71717a` (4.63:1 on `surface`), verified only against `surface`/`surface-raised`. A full-matrix audit showed it fails at 4.40:1 on `surface-sunken` and 4.29:1 on `accent-soft`. Tightened to `#68686f`, which passes on all four. This matters because Tasks 5/8 use `surface-sunken` for code blocks, where faint comment text is a normal need.
   - **Carried to Task 4:** light `warning` `#eab308` is 1.84:1 on `surface` and is outside the neutral+teal system. It is currently never painted — the only two uses are `text-warning` on the toggle `<button>`s, both overridden by `text-ink` on the inner SVG. Task 4 drops that dead class rather than recolouring the token.
   - **Known trade-off, Task 6:** the contact chips tint to third-party brand ink on hover, as the spec's Task 6 criterion asks. Four of the six fall under the 3:1 non-text threshold in one theme (LinkedIn 1.97 dark, Telegram 2.31 light, Email 2.66 dark, Dune 2.93 light). Accepted deliberately: the affordance is never colour-only — the glyph shape carries the identity, every chip has an `aria-label`, and each sits in a 2.5rem bordered chip that renders in `ink-muted` (7.41:1) at rest. X and GitHub are additionally swapped to `ink-strong` in dark mode, since near-black brand ink on a dark surface reads as 2.01:1 and 1.21:1.
5. After Task 5: measure blog line length in devtools — 65–75 characters at 1024px viewport.
   - **Deviation, Task 5:** `--container-prose` was specified as `68ch`, which assumes one `ch` is about one character. In Merriweather it is not: `ch` is the advance of `0`, and Merriweather's `0` is far wider than its average glyph. Two independent measurements of the face put the ratio at **1.15–1.31 characters per ch** (one from the Light `hmtx`, one by parsing `Merriweather-Bold.ttf`), so `68ch` yields **78–89 characters**, well outside the 65–75 target. `57ch` is the only value inside that window under **both** estimates (**75** and **66** characters), so it is used instead. To return to `68ch`, change the one token in `global.css` and revert this note.
6. After Task 8: keyboard-only pass through gallery filter → lightbox → `←`/`→` → `Esc`, and confirm focus returns to the originating tile.
7. After Task 9: confirm all 13 per-post OG PNGs regenerate and `/og/<slug>.png` renders at 1200×630.
8. `bun format` before every commit.
9. Final: `bun build`, then diff `dist/` page count against `main` (19 pages) — must be identical.

## Non-goals

- Copywriting or content rewrites beyond what layout requires
- New npm dependencies — no font package, icon set, UI library or animation library
- Any route, URL or content-collection schema change
- Edits to the 13 `.mdx` posts or to `BlogImage.astro`
- New pages beyond restyling existing ones (`/now`, `/uses`, changelog are all out)
- Per-post OG following the display-font toggle (parked; OG stays on F5.6)
- Search, filtering or pagination on `/blog`
- View transitions or scroll-reveal animation
- Lighthouse/performance budget work beyond removing the duplicated texture paint
- Converting `src/components/` to a UI framework — Astro components stay Astro
