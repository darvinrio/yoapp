# Work Experience Page

Add a maintainable work-experience section to `src/pages/work.astro` backed by a single JSON data file, with date formatting rendered as `mm yyyy to mm yyyy` and a fixed set of role-type enums for consistency.

## Scope

- One new data file: `src/data/work.ts`
- One new Astro component: `src/components/WorkItem.astro`
- One existing page touched: `src/pages/work.astro`
- No changes to `global.css`, `astro.config.mjs`, `Layout.astro`, `Navbar.astro`, or any existing component

---

## Data File

**Path:** `src/data/work.ts`

Named export `workEntries` — an array of objects. Each object has the following shape:

```ts
export interface WorkEntry {
  company: string;
  title: string;
  roleType: RoleType;
  start: string;   // ISO date string, e.g. "2021-03-01"
  end: string;     // ISO date string, e.g. "2023-08-31" or "" for current role
  description: string;
}

export type RoleType = "full-time" | "part-time" | "contract" | "internship" | "freelance";

export const workEntries: WorkEntry[] = [ ... ];
```

### Data File Rules

- `roleType` must be one of the five enum values listed above; no free-text values.
- `start` and `end` are stored as ISO date strings (`YYYY-MM-DD`). When `end` is an empty string, the entry represents a current/ongoing role.
- `description` is plain text; the component renders it as-is (no Markdown parsing required for v1).
- Order of entries in the array determines render order; most recent role should be first.

---

## Component File

**Path:** `src/components/WorkItem.astro`

A self-contained card that accepts all six fields as props and renders a single work entry.

### Props Interface (TypeScript)

```ts
interface Props {
  company: string;
  title: string;
  roleType: RoleType;
  start: string;
  end: string;
  description: string;
}
```

### Date Formatting Logic

Dates are formatted on the server via Astro's frontmatter (no client-side JS required). Use a small inline helper:

```ts
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
```

Display format: `"Mar 2021 to Aug 2023"`.

- If `end` is an empty string, display `"Mar 2021 to Present"`.
- Leading zeros are never shown (always `"Jan"`, never `"01"`).
- UTC methods are used intentionally to avoid timezone-shift bugs when the ISO string has no time component.

### Role Type Display

Map the enum to a human-readable, title-cased label for display:

| `roleType`     | Display Label  |
| -------------- | -------------- |
| `"full-time"`  | `"Full-time"`  |
| `"part-time"`  | `"Part-time"`  |
| `"contract"`   | `"Contract"`   |
| `"internship"` | `"Internship"` |
| `"freelance"`  | `"Freelance"`  |

The label is rendered as a small inline badge / tag within the card (e.g. a `<span>` with subtle background and rounded corners), styled with existing Tailwind utility classes.

### Render Behaviour

The component is a single vertical card per entry. Suggested layout order within each card:

1. **Company name** — largest text, acts as the card heading.
2. **Title** — bold, directly below company.
3. **Date range** — `"Mar 2021 to Aug 2023"`, muted colour, below title.
4. **Role type badge** — inline with or just below the date range; a small pill/tag.
5. **Description** — paragraph below a subtle divider, normal body text.

All styling uses Tailwind utility classes consistent with the project's existing teal/dark palette (e.g. `text-teal-500`, `dark:text-zinc-200`, etc.). No new CSS files are introduced.

### Markup Output (example)

```astro
<article class="border-l-2 border-teal-500 pl-4 py-2">
  <h2 class="text-xl font-semibold text-teal-500">Acme Corp</h2>
  <p class="font-medium">Senior Engineer</p>
  <p class="text-sm text-zinc-500 dark:text-zinc-400">
    Mar 2021 to Aug 2023
    <span
      class="ml-2 inline-block rounded bg-teal-500/10 px-2 py-0.5 text-xs text-teal-500"
    >
      Full-time
    </span>
  </p>
  <div class="my-3 border-t border-zinc-200 dark:border-zinc-700"></div>
  <p class="text-zinc-700 dark:text-zinc-300">
    Led a team of 5 engineers rebuilding the payments platform...
  </p>
</article>
```

Exact class names may vary; the above is a reference for structure, not a locked-in design token list.

---

## Page File

**File:** `src/pages/work.astro`

### Frontmatter

Import the data file and the component:

```ts
import Layout from "../layouts/Layout.astro";
import WorkItem from "../components/WorkItem.astro";
import { workEntries } from "../data/work";
```

Cast the imported data so Astro knows the shape (or rely on the `define` typing in the component — either approach is acceptable):

```ts
const entries = workEntries;
```

### Render Body

Keep the existing `<Layout>` wrapper and the `<h1>Work Experience</h1>` heading intact. Below the heading, map over `entries` and render one `<WorkItem>` per entry:

```astro
{entries.map((entry) => <WorkItem {...entry} />)}
```

Wrap the mapped list in the same `max-w-4xl mx-auto px-4 py-12` container already present, adding a vertical gap between cards (e.g. `space-y-8` on the wrapper).

### No other changes

- No new stylesheet imports.
- No changes to `Layout.astro` or any layout file.
- The page remains server-rendered; no client-side hydration is needed.

---

## Behaviour Checklist

| Scenario                         | Behaviour                                                        |
| -------------------------------- | ---------------------------------------------------------------- |
| Data file has 2+ entries         | All entries rendered in array order                              |
| `end` is empty string            | Date range shows `"to Present"`                                  |
| `end` has valid ISO date         | Date range shows `"to Mon YYYY"`                                 |
| All five `roleType` enum values  | Each renders with correct human-readable badge label             |
| Unknown `roleType` value in data | Undefined — data file is the source of truth; no runtime guard   |
| Dark mode                        | Card text and borders adapt via existing `.dark` Tailwind vars   |
| Responsive width                 | Parent `max-w-4xl` container handles mobile-to-desktop naturally |

---

## Non-goals

- Inline Markdown rendering in `description` (v1 is plain text only)
- Sort / filter controls in the UI
- Pagination or "show more" for large work histories
- Editable form — data is maintained only by editing the TS data file directly
- Animation or transition effects on entry cards
