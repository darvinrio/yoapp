# Visualizations Gallery

Add a `/visualizations` gallery page displaying data visualizations as a masonry grid. Clicking a tile opens a lightbox showing the full image with caption, optional date, and tags. Tags filter the grid. Metadata lives in a single TS data file; no new dependencies.

Decisions locked in the interview (2026-09-16): TS data file (not content collection); lightbox modal (not detail pages); route `/visualizations` with nav label "Visuals"; CSS-columns masonry; curated array order; single-select tag toggle; lightbox prev/next follows the active filter; lightbox tags display-only; subtle hover zoom; placeholders first, real images swapped by the human later.

## Scope

- One new data file: `src/data/visualizations.ts`
- One new asset folder: `src/assets/visualizations/` + one `.gitattributes` line extending Git LFS to it
- One new component: `src/components/VisualGallery.astro` (grid, filter bar, lightbox, vanilla `<script>` state)
- One new page: `src/pages/visualizations.astro`
- One existing file touched: `src/components/Navbar.astro` (links array, desktop + mobile menu)
- No new packages; no changes to `Layout.astro`, `BlogImage.astro`, `blog.css`, theme files, or any blog page
- Styling uses existing theme tokens from `src/styles/theme.css` (`surface`, `line`, `ink`, `ink-muted`, `accent` `#14b8a6`, `accent-soft`); dark mode adapts automatically via the class-based `dark` variant

## Data File

**Path:** `src/data/visualizations.ts`

Named export `visualizations` — an array of objects:

```ts
export interface Visualization {
  image: ImageMetadata; // imported from src/assets/visualizations/
  caption: string; // doubles as alt text
  date?: string; // ISO date string, e.g. "2026-03-01" — optional
  tags: string[]; // lowercase, kebab-case; default []
}
```

### Data File Rules

- `image` is a static import from `src/assets/visualizations/` so Astro type-checks the path and `astro:assets` optimization applies.
- `caption` is plain text, rendered as-is; it also serves as the image `alt`.
- `date` is an optional ISO string. When absent, the lightbox simply shows no date.
- `tags` use the same vocabulary as blog post tags where applicable; array order defines chip order.
- Array order is the display order (curated by hand, not date-sorted). Add new entries at the top.
- The page must render correctly with an empty array (just the filter bar and grid container, no error).

## Placeholder Assets

**Path:** `src/assets/visualizations/`

- Three simple hand-made SVG placeholder charts with descriptive kebab-case names (e.g. `placeholder-01.svg`). SVG stays in plain git (LFS rule below targets raster formats); real PNG/JPEG drops later are covered automatically.
- Placeholder captions/tags are realistic (e.g. tags like `defi`, `dao`, `metrics`) so the filter and lightbox are testable before real content arrives.

**`.gitattributes`** — extend LFS to the new folder for raster binaries:

```
src/assets/visualizations/**/*.{png,jpg,jpeg,gif,webp,avif} filter=lfs diff=lfs merge=lfs -text
```

## Component

**Path:** `src/components/VisualGallery.astro`

Receives the `visualizations` array as a prop (or imports the data file directly — pick one, keep the page thin). Three concerns in one component: masonry grid, tag filter bar, lightbox. State is vanilla JS in a single component-scoped `<script>` (pattern used by `Navbar.astro` / `DarkToggle.astro`); no framework hydration.

### Grid (masonry)

- CSS multi-column masonry: 1 column mobile, 2 columns `sm`, 3 columns `lg` (via Tailwind `columns-*` utilities); tiles use `break-inside-avoid` + bottom margin gap.
- Each tile is a `<button>` wrapping the `astro:assets` `<Image>` at native aspect ratio (no cropping) with the caption available for a11y (alt text).
- Hover: subtle scale-up + `cursor-zoom-in`, consistent with the existing `.img-zoom` feel in `src/styles/blog.css` (new scoped styles in the component, not edits to `blog.css`).

### Tag filter bar

- A chip row above the grid: an `All` chip (default active) followed by one chip per unique tag (union of all entries, in first-seen order).
- Single-select toggle: clicking a tag filters the grid to entries carrying that tag; clicking the active tag again or `All` clears the filter.
- Active chip styled with `accent`/`accent-soft`; inactive chips use `line`/`ink-muted`.
- Filtering hides non-matching tiles (CSS class toggle, no re-render); the masonry reflows naturally.
- With no filter active, no "no results" state is possible (All shows everything); a tag with a single entry is valid and shows one tile.

### Lightbox

- Opens on tile click: fixed overlay (`bg-black/80`-style, above content) showing the full image plus a caption block — caption (primary text), date (muted, formatted `Mon YYYY`, omitted when absent), tags (static pills, not clickable).
- Prev/next arrows cycle the currently visible (filtered) subset only; at the ends, wrap around is optional — pick one behavior and keep it consistent.
- Close via: `X` button, click on the backdrop, or `Esc`.
- Keyboard: `←`/`→` for prev/next, `Esc` to close; buttons are focusable; opening lightbox focuses the close button.
- While open, background page scroll is locked.
- Accessible minimum: `role="dialog"` + `aria-modal="true"` + `aria-label` from the caption; overlay click target must not swallow clicks on the image/controls.

### Behavior Checklist

| Scenario                                        | Behaviour                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Empty data array                                | Page renders filter bar (`All` only) + empty grid, no errors                  |
| No filter active                                | Grid shows all entries in array order; prev/next cycles everything            |
| Filter active                                   | Grid shows only matching tiles; lightbox prev/next cycles the filtered subset |
| Tag active, entry opened, tag cleared via `All` | Lightbox (if open) closes; grid returns to full set                           |
| Entry has no `date`                             | Caption block shows caption + tags only                                       |
| Entry has empty `tags`                          | Entry appears under `All` only; contributes no chip                           |
| Last image, press next                          | Wraps to first of the current subset (or stops — one behavior, consistently)  |
| `Esc` pressed                                   | Lightbox closes, scroll unlocks, focus returns to the tile that opened it     |
| Dark mode                                       | Overlay, chips, caption block adapt via theme tokens                          |
| Mobile                                          | 1-column masonry, chips wrap, lightbox image fits viewport width              |

## Page

**Path:** `src/pages/visualizations.astro`

- Follows the house pattern: `Layout` (props: `title="Visuals"`, description) → `<main class="container-max px-4 py-12">` → `PageTitle` (title "Visuals", no back link) → `<VisualGallery />`.
- Static route; `@astrojs/sitemap` picks it up automatically; OG image stays the site default `/og.png` (no per-item OG in v1).
- Renders server-side; the only client JS is the gallery's own script.

## Navbar

**Path:** `src/components/Navbar.astro`

- Add `{ href: "/visualizations", label: "Visuals" }` to the links array — renders on desktop nav and inside the mobile dropdown (both derive from the same array).
- Placement: after "Work", before "Writings" (visuals sit between work output and writing).

## TODO

| Task | Scope                                                                                                                                                                                                                                                                                   | Human reviewer criterion                                                                                                                                                                       | Commit |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | Create `src/assets/visualizations/` with 3 placeholder SVGs + `.gitattributes` LFS line; create `src/data/visualizations.ts` with 3 placeholder entries; create `src/components/VisualGallery.astro` (masonry grid only — no filter, no lightbox) and `src/pages/visualizations.astro`. | Dev server: `/visualizations` renders the masonry grid with 3 placeholder images in array order; 1/2/3 columns at mobile/`sm`/`lg`; hover zoom works; dark mode correct; `bun build` succeeds. |        |
| 2    | Add the lightbox to `VisualGallery.astro`: full image + caption/date/tags block, prev/next + `←`/`→`, `Esc`/backdrop/`X` close, scroll lock, focus handling, `role="dialog"`.                                                                                                           | Dev server: click opens lightbox with correct caption/date/tags; arrows cycle all entries; `Esc`/backdrop/`X` close; page scroll locked while open; keyboard-only pass works.                  |        |
| 3    | Add the tag filter bar: `All` + unique-tag chips, single-select toggle, hide/show tiles; lightbox prev/next switches to the filtered subset.                                                                                                                                            | Dev server: clicking a chip filters the grid; clicking again or `All` clears; with a filter active, lightbox next/prev only reaches matching entries.                                          |        |
| 4    | Add `{ href: "/visualizations", label: "Visuals" }` to `Navbar.astro` links (desktop + mobile).                                                                                                                                                                                         | Nav shows "Visuals" on every page with the standard layout, desktop and mobile dropdown; link lands on `/visualizations`.                                                                      |        |
| 5    | Human drops real visualization PNGs into `src/assets/visualizations/`, replaces placeholder entries in `src/data/visualizations.ts`, deletes placeholder SVGs.                                                                                                                          | Gallery shows real visualizations end-to-end: grid, filter per real tag, lightbox metadata correct; LFS stores the new binaries (`git lfs ls-files` lists them).                               |        |

Commit hashes are recorded after each task's human-approved commit (todo auto-updates the hash when asked to continue with the next task). Function before theme: Task 1 is deliberately plain (grid only) so routing/data bugs surface before overlay/keyboard complexity lands in Tasks 2–3.

## Verification

1. `bun dev` after each task — verify the reviewer criterion above on `/visualizations`.
2. After Task 3: keyboard-only pass (Tab to tile, Enter, arrows, Esc); toggle dark mode mid-lightbox.
3. After Task 4: `bun build` — `dist/visualizations/index.html` exists; sitemap output includes the route; `dist/_astro/` contains optimized gallery images.
4. After Task 5: `git lfs ls-files` includes the new PNGs; page still renders post-swap.
5. `bun format` before each commit.

## Key Constants

| Constant             | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| Route                | `/visualizations`                                      |
| Data file            | `src/data/visualizations.ts` (`visualizations` export) |
| Asset folder         | `src/assets/visualizations/`                           |
| Nav label / position | "Visuals", between Work and Writings                   |
| Grid columns         | 1 (mobile) / 2 (`sm`) / 3 (`lg`)                       |
| Accent color         | `#14b8a6` (`accent` token)                             |
| Date format          | `Mon YYYY` (e.g. `Mar 2026`), omitted when absent      |
| Tags format          | lowercase kebab-case                                   |
| New dependencies     | none                                                   |

## Non-goals

- Per-visualization detail pages / shareable lightbox deep links (e.g. `#slug` URLs)
- Multi-select tag filtering, tag counts, search
- Swipe gestures / focus-trap library / any lightbox package
- Clickable tags inside the lightbox
- Reusing gallery images inside blog posts or cross-linking blog ↔ visuals
- Sorting controls (array order is manual curation)
