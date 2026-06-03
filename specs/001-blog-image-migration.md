# Blog Image Migration

Migrate all `miro.medium.com` image references in blog Markdown files from hot-linked URLs into locally stored, Astro-optimized assets.

## Scope

| File                                 | miro.medium Images |
| ------------------------------------ | ------------------ |
| `src/content/blog/near-standards.md` | 0 (no-op)          |
| `src/content/blog/orion-money.md`    | 11                 |
| `src/content/blog/apollo-dao.md`     | 10                 |
| **Total**                            | **21**             |

Slugs are derived from filenames (Astro Content Collections default, no explicit `slug` field in frontmatter):

| Filename            | Slug             |
| ------------------- | ---------------- |
| `near-standards.md` | `near-standards` |
| `orion-money.md`    | `orion-money`    |
| `apollo-dao.md`     | `apollo-dao`     |

## Target Directory Shape

```
src/assets/blog-images/
├── near-standards/          (empty — no images)
├── orion-money/
│   ├── 001.png
│   ├── 002.png
│   └── ...
└── apollo-dao/
    ├── 001.jpeg
    ├── 002.png
    └── 015.gif              ← only .gif in the project
```

One sub-folder per blog post, named with the post's slug. Images are zero-padded sequential (`001…`) preserving the original extension from the URL.

## Image URL Format

All URLs follow the pattern:

```
https://miro.medium.com/v2/resize:fit:{width}/format:{fmt}/{hash}.{ext}
```

- `{width}` — varies per image (376, 764, 856, 858, 942, 1050, 1078, 1200, 1400, 2000)
- `{fmt}` — `webp` or `gif`
- `{ext}` — `png`, `jpeg`, or `gif`

Note: the URL format uses `webp` for `{fmt}` but the actual file extension in `{ext}` may be `png` or `jpeg`. The local file extension must match `{ext}`, not `{fmt}`.

## Rewrite Path (Optimization Path)

The rewrite uses a **relative path into `src/assets/blog-images/`** so Astro's asset pipeline processes the image through `<Image />` / `astro:assets` with whatever global `image.layout` is configured.

Derivation from any `src/content/blog/{slug}.md` file:

```
{slug}.md  →  ../../assets/blog-images/{slug}/{counter}.{ext}
```

Example:

```markdown
<!-- Before: orion-money.md line 10 -->

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*RWZu33UH6wDdvwmgtxZ1hA.png)

<!-- After -->

![captionless image](../../assets/blog-images/orion-money/001.png)
```

This works because Astro resolves relative paths in Markdown files under `src/` through the project root. With `image.layout` configured globally, the `<Content />` renderer in `src/pages/blog/[slug].astro` line 56 will produce optimized `<img>` output automatically — no template changes required.

## Script Design

Script location: `scripts/migrate-blog-images.ts`

### CONFIG Object (passed at start)

All runtime configuration is gathered into a single `CONFIG` object at script entry.

**Only three values ever come from `.env` / `process.env`:**

| Key          | Env var              | Notes                                                                   |
| ------------ | -------------------- | ----------------------------------------------------------------------- |
| `API_KEY`    | `OPENAI_API_KEY`     | Enables labelling; if set, `ENDPOINT` and `MODEL_NAME` must also be set |
| `ENDPOINT`   | `OPENAI_ENDPOINT`    |                                                                         |
| `MODEL_NAME` | `OPENAI_LABEL_MODEL` |                                                                         |

**Every other field is an internal default, never overridden from `.env`:**

| Key                 | Default                   | Notes                               |
| ------------------- | ------------------------- | ----------------------------------- |
| `LABEL_MAX_TOKENS`  | `50`                      |                                     |
| `LABEL_CONCURRENCY` | `4`                       | Max parallel labelling requests     |
| `DOWNLOAD_RETRIES`  | `3`                       | Exponential back-off                |
| `LABEL_RETRIES`     | `3`                       | Exponential back-off for API calls  |
| `HTTP_USER_AGENT`   | `yoapp-blog-migrator/1.0` | Polite identification to Medium CDN |
| `BLOG_SOURCE_DIR`   | `src/content/blog/`       |                                     |
| `OUTPUT_DIR`        | `src/assets/blog-images/` |                                     |

```ts
const CONFIG = {
  BLOG_SOURCE_DIR: "src/content/blog/",
  OUTPUT_DIR: "src/assets/blog-images/",
  HTTP_USER_AGENT: "yoapp-blog-migrator/1.0",
  DOWNLOAD_RETRIES: "3",
  LABEL_RETRIES: "3",
  API_KEY: process.env.OPENAI_API_KEY,
  ENDPOINT: process.env.OPENAI_ENDPOINT ?? "https://api.openai.com/v1",
  MODEL_NAME: process.env.OPENAI_LABEL_MODEL ?? "gpt-4o-mini",
  LABEL_MAX_TOKENS: "50",
  LABEL_CONCURRENCY: "4",
};
```

The script must use `require('dotenv').config()`. If the `dotenv` module is not installed in the project, the script must fail immediately with a clear message instructing the user to install it (e.g., `npm install dotenv` or `pnpm add dotenv`). No manual `.env` parsing fallback is permitted. After loading, the script must validate that all required env keys for the active features are present; if any are missing, it must fail with a descriptive error before processing begins.

### Step-by-step Logic

1. **Load environment** — Call `require('dotenv').config()` at the top of the script. If the `dotenv` module cannot be resolved, fail immediately with a clear message instructing the user to install it (e.g., `npm install dotenv`). After loading, validate that any env keys required for the active features are present; if any are missing, fail with a descriptive error before processing begins.

2. **Discover** — Glob `*.md` files in the blog source directory.

3. **Parse** — Regex-extract all `![alt](https://miro.medium.com/…)` per file, preserving alt text and occurrence order.

4. **Slug derivation** — Use the `.md` filename stem as the slug (e.g. `orion-money.md` → `orion-money`).

5. **Create output directory** — `mkdir -p src/assets/blog-images/{slug}`.

6. **Download** — For each matched URL, in source-file order:
   - Derive local filename: zero-padded counter within the post (`001.png`, `002.png`…).
   - Extension from the URL's path segment after the last `.` (`png`, `jpeg`, `gif`).
   - If file already exists on disk → skip download (idempotent).
   - HTTP GET with `User-Agent` header, 30s timeout, follow redirects.
   - Retry up to `DOWNLOAD_RETRIES` times with exponential back-off (1s → 2s → 4s).
   - After download: verify the file is > 1 KB (catches accidental HTML 404 pages saved as the image extension).
   - On failure after all retries: log to stderr, leave original URL in Markdown, add `# TODO: failed download — {url}` comment on the preceding blank line.

7. **Rewrite Markdown** — Replace each matched URL with the relative path:

   ```
   ../../assets/blog-images/{slug}/{counter}.{ext}
   ```

   Only rewrite if the download succeeded. If download failed, leave the original URL in place.

8. **Labelling** (optional, runs only if `OPENAI_API_KEY` is set) — After all downloads complete, batch-label images concurrently (pool of `OPENAI_LABEL_CONCURRENCY`):

   a. Read image bytes, base64-encode.
   b. POST `{OPENAI_ENDPOINT}/chat/completions` with:

   ```json
   {
     "model": "{OPENAI_LABEL_MODEL}",
     "max_tokens": {OPENAI_LABEL_MAX_TOKENS},
     "messages": [
       {
         "role": "user",
         "content": [
           {
             "type": "text",
             "text": "Describe this image in a few words. Return only the label — no quotes, no markdown, no explanation."
           },
           {
             "type": "image_url",
             "image_url": {
               "url": "data:image/{ext};base64,{base64_bytes}"
             }
           }
         ]
       }
     ]
   }
   ```

   c. Extract `choices[0].message.content`, trim whitespace.
   d. Write to sidecar file next to the image:

   ```
   src/assets/blog-images/{slug}/{counter}.{ext}.label.txt
   ```

   e. Failure handling per image: retry up to `LABEL_RETRIES` with exponential back-off on 429/5xx. Skip on 4xx (except 429) or auth errors. Labelling failure must not block or alter the Markdown rewrite.

   f. Label embedding in Markdown (optional enhancement — not required for correctness):
   - If the original alt text is empty or `"captionless image"`, replace the alt with the generated label.
   - Otherwise (meaningful alt text already present), leave alt unchanged — the label is stored in the sidecar `.label.txt` file for future use.

9. **Idempotency** — Re-running the script must not double-number or corrupt paths. Detection: skip files that contain no `miro.medium.com` URLs. Already-downloaded images are skipped because the local file exists.

### File Naming Convention

```
src/assets/blog-images/{slug}/{counter}.{ext}
```

- `{counter}` — 3-digit zero-padded, increments per image within a single blog post in source order (001, 002, 003…).
- `{ext}` — from the URL's last path segment (`png`, `jpeg`, `gif`).

### Sidecar label file format

```
src/assets/blog-images/{slug}/{counter}.{ext}.label.txt   ← one line, the generated label text
```

If no label was generated (API not configured, call failed, or empty response), the `.label.txt` file is not created.

### Error Handling

| Scenario                       | Behaviour                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| HTTP 404 on download           | Log warning, leave original URL in Markdown, insert `# TODO: failed download` comment above the image line, exit non-zero at end |
| HTTP 4xx (not 404)             | Same as 404                                                                                                                      |
| HTTP 429 (rate limit)          | Back off and retry (already in retry loop)                                                                                       |
| HTTP 5xx                       | Retry with back-off, then treat as failure                                                                                       |
| Download succeeds, file < 1 KB | Treat as failure (likely HTML error page), log warning, same as HTTP failure                                                     |
| OpenAI API 429                 | Exponential back-off within labelling step, skip image after `LABEL_RETRIES` exhausted                                           |
| OpenAI API 4xx (not 429)       | Skip labelling for that image, do not block Markdown                                                                             |
| OpenAI API 5xx                 | Retry, then skip                                                                                                                 |
| Empty/blank label response     | Write `.label.txt` as empty string, do not block                                                                                 |
| Duplicate URLs within a file   | Sequential numbering handles naturally — each occurrence gets its own copy                                                       |
| Duplicate URLs across files    | Each file gets its own numbered copy — no deduplication                                                                          |

## Duplicate Handling

Confirmed: no cross-file duplicates exist in the current 21 URLs. Script does not deduplicate across files. Each occurrence in each file downloads independently into that file's own `{slug}` folder. This keeps the script simple and idempotent.

## Non-goals

- Removing support for any existing image CDN references beyond `miro.medium.com`.
- Changing blog frontmatter schema or slug derivation.
- Adding image fields to frontmatter (cover images, etc.).
- Transcoding `.gif` files to other formats.
- Reordering or restructuring non-image Markdown content.

## Verification Checklist

```bash
# 1. Zero mo.medium references remain in blog files
grep -r "miro.medium" src/content/blog/
# → (no output)

# 2. Three slug folders exist under src/assets/blog-images/
ls src/assets/blog-images/
# → near-standards  orion-money  apollo-dao

# 3. File counts match original link counts per post
# near-standards: 0 files
# orion-money: 11 files
# apollo-dao: 10 files (1 is .gif)

# 4. All downloaded files are > 1 KB
find src/assets/blog-images/ -type f -size -1k
# → (no output)

# 5. Blog renders correctly with optimized images
npm run dev
# Visit /blog/orion-money and /blog/apollo-dao — images visible, no 404s

# 6. Zero lint / typecheck errors
npm run lint   # or equivalent
```

## Environment Variables Reference

For `.env` setup:

```bash
# Optional — enables automatic image labelling
OPENAI_API_KEY=sk-...
OPENAI_ENDPOINT=https://api.openai.com/v1
OPENAI_LABEL_MODEL=gpt-4o-mini
OPENAI_LABEL_MAX_TOKENS=50
```

`.env` should be gitignored (verify `.gitignore` contains `.env`). No other project changes required for the script to run.
