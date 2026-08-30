# Chart Component

A reusable `<Chart>` Astro component for embedding charts in blog posts (MDX) and pages. Charts render as a styled card (title, legend, plot, caption footer, handle) with hover tooltips, PNG export of the full card, and automatic dark-mode sync.

## Scope

- One new Astro component: `src/components/Chart.astro`
- One client module: `src/components/charts/chart-client.ts`
- One shared schema/format module: `src/components/charts/schema.ts`
- One new stylesheet: `src/styles/chart.css` (beside `theme.css`, imported by the component)
- One demo page: `src/pages/charts.astro`
- Demo data: `src/data/charts/*.json`
- New dependency: `chart.js` (^4.5)
- No changes to `global.css`, `theme.css`, layouts, or the blog collection schema

## Rendering engine

Chart.js v4, loaded via the component's `<script>` (Astro dedupes the module per page). No framework. The component ships static HTML (card chrome, legend, fallback table) and a JSON payload; `chart-client.ts` hydrates each `[data-chart]` figure on load.

## Data

Normalized JSON lives in `src/data/charts/*.json` and is imported into MDX/pages. The schema is library-agnostic — Chart.js mapping happens in code, never in the data files.

### Schema

```jsonc
{
  "labels": ["2023-01-01", "2023-02-01"], // cartesian charts; ISO dates auto-formatted
  "series": [
    {
      "name": "TVL",
      "values": [123, 456], // numbers; {x, y} pairs for scatter
      "color": "--chart-3", // optional: palette token or raw hex
      "highlight": true, // donut only: pop-out slice + center label
      "dashed": false, // optional dashed line
    },
  ],
  "formatX": "date", // optional: "date" | "plain"
  "formatY": "currency", // optional: "plain" | "compact" | "currency" | "percent"
}
```

- `bar` / `stacked-bar` / `line` / `multi-line`: `labels` + one or more series of numbers
- `pie`: `labels` + a single series of numbers; per-slice colors come from the palette; `"highlight": true` marks a slice (or array of booleans aligned to values)
- `scatter`: each series' `values` are `{x, y}` pairs (x numeric or ISO date string)
- The `type` may also live in the JSON; the component prop wins

## Component Props

| Prop          | Type                                                         | Required         | Notes                                                              |
| ------------- | ------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------ |
| `data`        | `ChartData`                                                  | Yes              | Imported JSON                                                      |
| `type`        | `bar \| stacked-bar \| line \| multi-line \| pie \| scatter` | Yes (or in JSON) | `line`/`multi-line` map identically; `stacked` sets stacked scales |
| `title`       | `string`                                                     | No               | F5.6, ink-strong                                                   |
| `subtitle`    | `string`                                                     | No               | Merriweather, ink-faint, under title                               |
| `caption`     | `string`                                                     | No               | Takeaway line, footer left                                         |
| `description` | `string`                                                     | No               | Caveat/disclaimer line, smaller + fainter, under caption           |
| `handle`      | `string`                                                     | No               | Footer-right attribution, default `maybeYonas` (two-tone)          |
| `height`      | `number`                                                     | No               | Plot height in px, default 320                                     |

## Card anatomy (matches sketch)

```
┌──────────────────────────────────────────────┐
│ Title                                   [⬇]  │  ← F5.6 title, export icon top-right
│ subtitle                                     │
│ ────────────────────────────────────────────│  ← border-b (line)
│ ● Legend  ● goes  ● here                    │  ← custom HTML legend (row)…
│ ┌──────────────────────────────────────────┐ │
│ │                 plot                     │ │  ← <canvas>, height prop
│ └──────────────────────────────────────────┘ │
│ ────────────────────────────────────────────│  ← border-t (line)
│ caption: takeaway text          │ maybeYonas │  ← footer: caption+description left,
│ smaller caveat                  │            │     vertical divider, two-tone handle right
└──────────────────────────────────────────────┘
```

- Pie/donut uses **side layout**: donut left, vertical legend column right (dot + label per slice).
- Card: `<figure>`, `rounded-xl border border-line bg-surface-raised`.

## Legend

Custom HTML (Chart.js built-in legend disabled). Dots use `var(--chart-N)` so they re-theme instantly with dark mode. Click toggles series visibility (`setDatasetVisibility` for cartesian, `toggleDataVisibility` for pie). Inactive items dim their dot and fade the label. Export redraws the legend manually.

## Palette (`src/styles/chart.css`)

`--chart-1..8`, `--chart-1` is the teal accent. Light values tuned for white surfaces, `.dark` overrides brightened for zinc-900. Companion tokens: `--chart-grid`, `--chart-axis`, `--chart-tick`. Series auto-assign by index (mod 8); a series may pin `"color": "--chart-4"` or a raw hex.

| #   | Light            | Dark      |
| --- | ---------------- | --------- |
| 1   | `#14b8a6` teal   | `#2dd4bf` |
| 2   | `#f59e0b` amber  | `#fbbf24` |
| 3   | `#38bdf8` sky    | `#7dd3fc` |
| 4   | `#f43f5e` rose   | `#fb7185` |
| 5   | `#a78bfa` violet | `#c4b5fd` |
| 6   | `#84cc16` lime   | `#a3e635` |
| 7   | `#fb923c` orange | `#fdba74` |
| 8   | `#94a3b8` slate  | `#cbd5e1` |

## Visual treatment

- **Bars**: fill at 65% alpha, 2px solid border in the series color, top corners rounded (3px). Stacked bars share the same treatment.
- **Lines**: `tension 0.35`, 2px stroke, no fill; points hidden above 30 values (hover point only).
- **Pie**: donut (cutout 62%), slice borders in card surface color for separation, right-side legend. `"highlight": true` offsets the slice ~12px and renders its name + formatted value in the donut hole (name small mono faint, value bold mono ink).
- **Grid/axes**: horizontal grid only (`--chart-grid`), no vertical grid; x-axis border visible (`--chart-axis`), y-axis border hidden; tick labels mono in `--chart-tick`.
- **Scatter**: points only (semi-fill + solid border), `nearest` tooltip.
- **Tooltips**: cartesian charts use `mode: "index", intersect: false` — all series compared at the hovered x. Styled like the card: raised surface, 1px line border, mono body, colored point markers.

## Typography

Title = F5.6; axis ticks + tooltip + legend labels = JetBrains Mono; caption/description = Merriweather. Card handle = JetBrains Mono, `maybe` ink / `Yonas` accent.

## Dark mode sync

All palette/axis colors come from CSS vars resolved via `getComputedStyle` at init. A `MutationObserver` on `<html>` `class` (the DarkToggle pattern) re-resolves and `chart.update("none")` on change. Legend dots and card chrome theme automatically (pure CSS vars).

## Export (PNG)

Top-right icon button in the title row, always visible (`text-ink-faint`, hover accent). Downloads a **2× PNG of the full card** drawn on an offscreen canvas: rounded surface-raised card, title, subtitle, legend (dots + mono labels), the live chart canvas blitted in, footer divider, caption + wrapped description, vertical divider, two-tone `maybeYonas` handle. Uses the **current theme** (colors read at click time). Filename: slugified title. Waits for `document.fonts.ready` before drawing.

## Formatting presets

`plain` (`1,234,567`), `compact` (`1.2M`), `currency` (`$1.2M`), `percent` (value × 100 → `12.3%`). Presets map to `Intl.NumberFormat` in `schema.ts` (JSON can't hold functions). Applied to y-axis ticks + tooltips; `formatX: "date"` (or auto-detection of ISO `YYYY-MM-DD` labels) formats ticks as `Jan '23` (all-days-are-01 → monthly) or `Jan 15`, and tooltip titles as `Jan 15, 2023`.

## Accessibility / no-JS fallback

Card is a `<figure>` containing a visually-hidden `<table>` built from the same JSON (label × series grid; x/y pairs for scatter). Canvas gets `role="img"` + `aria-label` from title/caption. Legend toggles are real `<button>`s with `aria-pressed`.

## File map

```
specs/005-chart-component.md
src/components/Chart.astro             card markup, legend, hidden table, payload JSON, styles
src/components/charts/schema.ts        types, palette count/token resolution, formatters, date utils, slug
src/components/charts/chart-client.ts  Chart.js init/mapping, tooltips, dark-sync observer, donut center plugin, export
src/styles/chart.css                   --chart-1..8 + grid/axis/tick tokens, .dark overrides
src/data/charts/*.json                 demo datasets
src/pages/charts.astro                 demo page (all 6 types)
```

## MDX usage

```mdx
import Chart from "../../components/Chart.astro";
import twap from "../../data/charts/univ3-twap.json";

<Chart
  data={twap}
  type="multi-line"
  title="TWAP deviation, weekly"
  subtitle="Uniswap v3 vs Chainlink"
  caption="Deviation stays under 15bps outside extreme volatility."
  description="Sources: on-chain TWAP observations; Chainlink aggregator rounds."
/>
```

## Non-goals (v1)

- Selective/recolor-per-point data, annotations beyond the donut highlight
- Combined bar+line charts (each card is one type)
- Server-side PNG generation / OG images
- Chart editor UI — data files are hand-authored JSON
- Non-blog placements beyond the demo page (component is generic, but v1 targets `.prose` widths)
