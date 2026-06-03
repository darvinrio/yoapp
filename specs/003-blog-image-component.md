# Blog Image Component

Add a reusable `<Image>` Astro component to give blog authors per-image control over sizing, captions, and click-to-zoom — without requiring them to manage width, height, or aspect-ratio manually.

## Scope

- One new Astro component: `src/components/Image.astro`
- One new stylesheet: `src/styles/blog.css`
- One existing file touched: `src/pages/blog/[slug].astro` (stylesheet import only)
- No changes to `global.css`, `astro.config.mjs`, `Layout.astro`, `PostLayout.astro`, or any collection schema

Images rendered using the standard `prose` class from `@tailwindcss/typography` in `src/pages/blog/[slug].astro` (line 55) must remain unaffected by these additions — the new stylesheet is scoped to the `.img-zoom` class and therefore does not leak.

## Component File

**Path:** `src/components/Image.astro`

### Props

| Prop      | Type     | Required | Notes                                                                                                                                        |
| --------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`     | `string` | Yes      | Path to image (relative to project root)                                                                                                     |
| `alt`     | `string` | Yes      | HTML `alt` attribute for accessibility                                                                                                       |
| `size`    | `string` | No       | Width constraint, e.g. `"50%"`, `"75%"`. Applied as an inline `style="width: {size}"` on the `<img>`. No height or aspect-ratio mangling.    |
| `caption` | `string` | No       | Optional caption text. When present the image is wrapped in a `<figure>` / `<figcaption>` pair. When absent a plain `<div>` wrapper is used. |

### Props Interface (TypeScript)

```ts
interface Props {
  src: string;
  alt: string;
  size?: string;
  caption?: string;
}
```

### Render Behaviour

- **Default state (no `size`, no `caption`):** Image is centered, full container width, clickable for zoom.
- **With `size`:** The `width: {size}` inline style is applied to the `<img>` element. No other dimensions are touched — the browser preserves the image's intrinsic height and aspect-ratio.
- **With `caption`:** A `<figure>` element is rendered. The `<img>` is followed by a `<figcaption>`. The image is centered within the figure.
- **All images are center-aligned** by default via `class="block mx-auto"` applied to the `<img>` in both branches.
- The outer wrapper of both branches receives `class="img-zoom"` — this is the CSS hook for all styling and behaviour.

### Markup Output

**Without caption:**

```html
<div class="img-zoom">
  <img
    src="/assets/blog-images/apollo-dao/001.jpeg"
    alt="Apollo command module in lunar orbit"
    class="block mx-auto"
  />
</div>
```

**With caption:**

```html
<div class="img-zoom">
  <figure>
    <img
      src="/assets/blog-images/apollo-dao/001.jpeg"
      alt="Apollo command module"
      style="width: 50%"
      class="block mx-auto"
    />
    <figcaption>The command module in lunar orbit</figcaption>
  </figure>
</div>
```

### Zoom Overlay (client-side, inline `<script>`)

Self-contained — no external dependencies, no separate component needed.

On `DOMContentLoaded`:

1. Query all `.img-zoom img` elements currently in the document.
2. Attach a `click` listener to each.
3. On click:
   - Check if `#img-zoom-overlay` already exists in the DOM.
   - If not, create it and append to `<body>`.
   - Set the overlay's inner `<img>` `src` and `alt` to match the clicked image.
   - Remove the `hidden` class (or equivalent) to show the overlay.
   - Add a `click` listener on the overlay itself to remove it from the DOM on dismiss.

The overlay is a fixed-position full-screen element. It is created lazily on first click and destroyed on dismiss — it does not exist in the initial page HTML.

---

## Stylesheet File

**Path:** `src/styles/blog.css`

Pure CSS — no Tailwind utilities. Wrapped in a single `@layer components` block.

```css
@layer components {
  .img-zoom img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    cursor: zoom-in;
    transition: transform 0.15s ease;
  }
  .img-zoom img:hover {
    transform: scale(1.02);
  }
  .img-zoom figcaption {
    text-align: center;
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.5rem;
    cursor: default;
  }
  .dark .img-zoom figcaption {
    color: #a1a1aa;
  }
}
```

Scoping rationale:

- Every selector is prefixed with `.img-zoom` so existing `.prose img` styles from `@tailwindcss/typography` are not overridden.
- Dark-mode caption colour uses `.dark` variant which the project already enables via `@custom-variant dark` in `src/styles/global.css` — no extra config needed.

---

## Blog Page Integration

**File:** `src/pages/blog/[slug].astro`

Add a single stylesheet import to the frontmatter:

```ts
import "../styles/blog.css";
```

No other changes required. The existing `<div class="prose dark:prose-invert max-w-none text-justify">` wrapper at line 55 is left untouched. The new CSS layer coexists with Tailwind's prose defaults because it is scoped to `.img-zoom` which is only present when `<Image>` is used.

---

## MDX Usage

Authors import the component once per MDX file:

```mdx
import Image from "../../components/Image.astro";
```

Then use it anywhere an image is needed:

```mdx
<!-- Baseline: centered, full width, zoomable -->

<Image
  src="../../assets/blog-images/orion-money/003.png"
  alt="Orion interface dashboard"
/>

<!-- With size % -->

<Image
  src="../../assets/blog-images/orion-money/007.png"
  alt="Transaction history"
  size="50%"
/>

<!-- With caption -->

<Image
  src="../../assets/blog-images/apollo-dao/001.jpeg"
  alt="Apollo command module"
  caption="The command module in lunar orbit, 1969"
/>

<!-- All props together -->

<Image
  src="../../assets/blog-images/apollo-dao/009.png"
  alt="Lunar surface view"
  size="60%"
  caption="Looking back at the landing site"
/>
```

---

## Migration of Existing Blog Images

Existing `![]()` markdown images must be converted to `<Image>` components manually per post.

Before (standard markdown):

```mdx
![Apollo command module](../../assets/blog-images/apollo-dao/001.jpeg)
```

After (using the component):

```mdx
<Image
  src="../../assets/blog-images/apollo-dao/001.jpeg"
  alt="Apollo command module"
/>
```

Conversion rules:

- The `![]()` `alt` text becomes the `alt` prop.
- The `![]()` URL becomes the `src` prop.
- Any existing caption or sizing intent must be added explicitly as new `caption` / `size` props.
- Plain images with no caption or sizing need only the `src` and `alt` props — identical rendering behaviour to markdown, plus the zoom affordance as a free bonus.

---

## Behaviour Checklist

| Scenario                  | Behaviour                                                                        |
| ------------------------- | -------------------------------------------------------------------------------- |
| No `size`, no `caption`   | Centered `<img>`, full width, zoomable                                           |
| `size` without `caption`  | Centered `<img>`, `width` set to value, zoomable                                 |
| `caption` without `size`  | `<figure>`, centered `<img>`, `<figcaption>` below, zoomable                     |
| Both `size` and `caption` | `<figure>`, centered `<img>` with explicit width, `<figcaption>` below, zoomable |
| Click image               | Full-screen overlay appears with same image at native resolution                 |
| Click overlay background  | Overlay is removed from the DOM                                                  |
| Dark mode                 | Caption text colour adjusts via `.dark .img-zoom figcaption`                     |
| Image hover               | Gentle 2% scale-up via CSS `transform`                                           |
| No `global.css` changes   | `global.css` is untouched; all new styles live in `blog.css`                     |

## Non-goals

- Automatic migration of existing markdown images (done manually by author)
- Adding image fields to frontmatter (cover images, og:image, etc.)
- Lazy-loading behaviour (left to Astro's built-in asset pipeline which already handles this for paths under `src/assets/`)
- Image cropping, filters, or other transformations
- Support for `width` and `height` props (intentionally excluded — the `size` prop using `%` is the entire point)
- Keyboard accessibility for zoom overlay (not in scope for minimal v1)
