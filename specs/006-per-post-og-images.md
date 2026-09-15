# Per-Post OG Images

Give every blog post its own Open Graph card image instead of the shared site-wide `public/og.png`. Cards are generated at build time by a prerendered Astro endpoint (satori + resvg, already in the dependency tree), share one brand module with the existing site card generator, and flow through the existing `BaseHead` `image` prop. `og:image` meta is enriched with width/height/alt. Fully static output — zero Vercel functions — consistent with the Vercel free-tier constraint from spec 005.

This is the parked future work listed in specs/005-seo-geo-agent-friendly.md (Non-goals: "Per-post OG images (future: build endpoint or `src/assets/` route)").

## Decisions (locked during interview)

| Decision           | Value                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Scope              | Per-post OG images only — full og/twitter meta set already exists (spec 005)                                                     |
| Mechanism          | Prerendered Astro endpoint `src/pages/og/[slug].png.ts` → stable `/og/<slug>.png` URLs, rendered during `astro build`            |
| Rejected options   | Extending `scripts/generate-og.ts` (silent stale-image failure mode, git binary churn); `src/assets/` hashed URLs (breaks social caches) |
| Card design        | Brand frame identical to site card; post title as headline (wrap ≤3 lines, size step-down, ellipsis clamp); footer = `date · tags`; no description |
| Template home      | `src/lib/og-brand.ts` shared brand module; `scripts/generate-og.ts` migrated to import it in the same task (single source of brand truth) |
| Schema             | No change to `src/content.config.ts`; `BaseHead`'s `image` prop remains the page-level escape hatch                              |
| RSS                | No per-item enclosure (kept text-only per spec 005 minimalism)                                                                   |
| og:image meta      | Add `og:image:width`, `og:image:height`, `og:image:alt` to `BaseHead.astro`                                                       |
| Slug source        | `post.id` (same slug as the blog route)                                                                                          |

## Adjacent Tasks

- **specs/005-seo-geo-agent-friendly.md** — this spec consumes its `BaseHead` component (`image` prop), its satori/resvg toolchain, its vendored TTFs, and its locked brand constants. No overlap conflicts; 005 is fully executed and merged (PR #10).
- **Future (not in this spec):** optional `ogImage` frontmatter override field for hand-made art; RSS `<enclosure>` per item; migrating other script-local constants.

## Key Constants & Config

| Constant            | Value                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Endpoint route      | `/og/[slug].png` (prerendered; slug = `post.id`)                                          |
| Card dimensions     | 1200 × 630                                                                                |
| Background          | `#18181b`                                                                                 |
| Accent              | `#2dd4bf` (top bar, flag glyph, wordmark dot)                                             |
| Text primary        | `#f1eef7` (wordmark, title)                                                               |
| Text muted          | `#a1a1aa` (footer)                                                                        |
| Divider             | `#3f3f46` (2px above footer)                                                              |
| Headline font       | Merriweather Bold — `scripts/fonts/Merriweather-Bold.ttf` (weight 700)                    |
| Footer font         | JetBrains Mono Regular — `scripts/fonts/JetBrainsMono-Regular.ttf` (weight 400)           |
| Brand frame         | 8px top accent bar; 72×72 flag glyph + `maybeYonas.` wordmark (44px); divider + mono footer (24px) — identical geometry to the site card |
| Title fitting       | Default 64px; step down for long titles (tunable buckets, e.g. >60 chars → 48px, >110 chars → 38px); hard clamp at 3 lines with ellipsis so nothing overflows the frame |
| Footer content      | `<Mon DD, YYYY> · <tag1> · <tag2>…` (date only when a post has no tags)                   |
| New meta tags       | `og:image:width` = 1200, `og:image:height` = 630, `og:image:alt` = page title             |
| New packages        | None — satori + @resvg/resvg already installed                                            |
| New files           | `src/lib/og-brand.ts`, `src/pages/og/[slug].png.ts`                                       |
| Touched files       | `scripts/generate-og.ts` (imports shared module), `src/components/BaseHead.astro` (3 meta lines), `src/pages/blog/[slug].astro` (pass `image` prop) |

## TODO

| Task | Scope                                                                                                                                                                                                                                                                                         | Human reviewer criterion                                                                                                                                                                                                 | Commit    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| 1    | Create `src/lib/og-brand.ts`: brand constants (colors, dimensions), flag glyph, header/footer builders, font loader, satori→PNG render helper. Refactor `scripts/generate-og.ts` to import from it — pure refactor, zero behavior change, no new packages.                                      | `bun scripts/generate-og.ts` regenerates `public/og.png` rendering pixel-identical to the committed version (diff visually or by file hash); site card unchanged everywhere it is referenced (home, blog index, work, resume, 404) | `306ec0f` |
| 2    | Create `src/pages/og/[slug].png.ts` prerendered endpoint: `getStaticPaths` over the blog collection, per-card layout (brand frame + wrapped title via fitting buckets + `date · tags` footer). Wire `image={/og/<id>.png}` in `src/pages/blog/[slug].astro`. Add `og:image:width/height/alt` to `BaseHead.astro`. | Dev server: `/og/<each-slug>.png` renders a correct card for all 13 posts (short titles, the 48-char longest title, tag-less posts); post page HTML head shows absolute `og:image` + width/height/alt; non-post pages still use `/og.png`; `bun build` emits `dist/og/<slug>.png` ×13 with zero functions | _pending_ |

Commit hashes are recorded after each task's human-approved commit (todo auto-updates the hash when asked to continue with the next task).

## Verification

1. `bun scripts/generate-og.ts` after Task 1 — `public/og.png` unchanged visually.
2. Dev server after Task 2 — spot-check `/og/polymarket-ledger.png`, `/og/stuck.png` (5-char title), `/og/dune-compound-v3-patch.png` (long title), and one tag-less post if any.
3. `bun build` — `dist/og/` contains exactly 13 PNGs; a built post's HTML shows `og:image` = `https://mayonas.vercel.app/og/<slug>.png` plus width/height/alt; `dist/index.html` still references `/og.png`.
4. External check (optional, post-deploy): paste a post URL into the X/Slack/Discord preview debuggers.
5. `bun format` before commit.

## Non-goals

- `ogImage` frontmatter override field (add when a post actually needs hand-made art)
- RSS `<enclosure>` per item
- Migrating the site card template text/copy (unchanged from spec 005)
- Per-post images for non-blog pages (home/work/resume keep the site default)
- Dynamic/edge rendering (`@vercel/og`) — stays build-time only
