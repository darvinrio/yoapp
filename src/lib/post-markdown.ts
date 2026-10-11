import { getImage, type ImageMetadata } from "astro:assets";
import type { CollectionEntry } from "astro:content";

// A post's markdown, as text.
//
// The source of truth is `post.body` — the raw file content Astro's glob
// loader keeps after stripping frontmatter — and not the rendered HTML. Three
// of these posts carry `$$` display math, which rehype-katex has already turned
// into nested span soup by the time HTML exists, and two carry GFM tables that a
// naive HTML-to-markdown pass mangles. Raw source keeps the LaTeX, the tables
// and the code fences byte-identical to what was authored.
//
// What raw source does NOT keep is MDX: the `import` statements are build-time
// plumbing, and `<Image src={img001} …/>` is a component call, not markdown.
// Those are the only two MDX constructs any post in this collection uses, so
// rewriting exactly them is a complete conversion — no parser required, and
// nothing to break when a post uses something new.

type BlogPost = CollectionEntry<"blog">;

// Eager would pull every image in the collection into every build of this
// module. Vite turns a lazy glob into a map of dynamic imports, so only the
// images a post actually references are ever loaded.
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/blog-images/**/*.{png,jpg,jpeg,gif,webp,avif,svg}",
);

const FALLBACK_FILE_PATH = "src/content/blog/post.mdx";

// MDX hoists every import to the top of the file, so imports are stripped from
// the leading block only. A global line filter would also eat an `import` line
// quoted inside a fenced code block, which some post could legitimately have.
const IMPORT_LINE = /^import\s+[A-Za-z_$][\w$]*\s+from\s+"[^"]+";?[ \t]*$/;

/** `import img001 from "../../assets/…"` → identifier → built asset URL. */
async function collectImportUrls(
  post: BlogPost,
  dir: string,
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();

  for (const line of post.body?.split("\n") ?? []) {
    const match =
      /^import\s+([A-Za-z_$][\w$]*)\s+from\s+"([^"]+)";?[ \t]*$/.exec(line);
    if (!match) continue;

    const [, identifier, specifier] = match;
    if (!specifier.startsWith(".")) continue;

    const url = await resolveAssetUrl(dir, specifier);
    if (url) urls.set(identifier, url);
  }

  return urls;
}

// Three images in the collection are authored as plain markdown with a path
// relative to the .mdx file, not as an <Image /> component. Astro's image
// plugin rewrites those to hashed URLs when it renders the page; passing them
// through verbatim would leave a served .md pointing at `../../assets/…`,
// which a reader resolves against the post URL and 404s on.
const MARKDOWN_IMAGE = /!\[([^\]]*)\]\((\.\.?\/[^)\s]+)\)/g;

async function rewriteMarkdownImages(body: string, dir: string) {
  const resolved = new Map<string, string>();
  for (const [, , specifier] of body.matchAll(MARKDOWN_IMAGE)) {
    if (resolved.has(specifier)) continue;
    const url = await resolveAssetUrl(dir, specifier);
    // An unresolvable path is left exactly as authored: a wrong link the author
    // can see and fix beats one silently dropped from a published post.
    if (url) resolved.set(specifier, url);
  }
  if (!resolved.size) return body;

  return body.replace(
    MARKDOWN_IMAGE,
    (match, alt: string, specifier: string) =>
      resolved.has(specifier)
        ? `![${escapeAlt(alt)}](${resolved.get(specifier)})`
        : match,
  );
}

/** A specifier as written inside a post → the asset's built URL. */
function resolveAssetUrl(dir: string, specifier: string) {
  const segments = [...dir.split("/").filter(Boolean)];
  for (const part of specifier.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") segments.pop();
    else segments.push(part);
  }
  return resolveImageUrl(`/${segments.join("/")}`);
}

async function resolveImageUrl(key: string): Promise<string | null> {
  const load = imageModules[key];
  if (!load) return null;

  try {
    const { default: image } = await load();
    if (!image) return null;
    // getImage rather than reading `image.src` directly: it is the documented
    // accessor for a local image and returns the emitted URL in both dev and a
    // production build, where a bare `src` is only correct in one of the two.
    const { src } = await getImage({ src: image });
    return src;
  } catch {
    // An unreadable or unsupported asset drops the image from the export. It
    // must never fail the build — a broken picture is worth far less than a
    // published post.
    return null;
  }
}

// Quote-aware so a `>` inside an alt or caption cannot terminate the match early.
const IMAGE_TAG = /<Image\b((?:"[^"]*"|'[^']*'|[^>"'])*?)\/>/g;
const SRC_PROP = /\bsrc=\{([^}]+)\}/;
const SRC_STRING = /\bsrc="([^"]+)"/;

function attribute(attributes: string, name: string): string | undefined {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(attributes);
  return match?.[1];
}

/**
 * Rebuild a post as markdown: frontmatter, then the source with MDX removed.
 */
export async function toPostMarkdown(post: BlogPost): Promise<string> {
  const filePath = post.filePath ?? FALLBACK_FILE_PATH;
  // filePath is documented as relative to the site root, which is the same
  // frame import.meta.glob's keys live in — but a specifier written inside the
  // post is relative to the post, not to the root.
  const dir = filePath.slice(0, filePath.lastIndexOf("/") + 1);

  const imageUrls = await collectImportUrls(post, dir);

  let body = post.body ?? "";
  const lines = body.split("\n");

  let index = 0;
  while (
    index < lines.length &&
    (IMPORT_LINE.test(lines[index]) || !lines[index].trim())
  ) {
    index += 1;
  }
  body = lines.slice(index).join("\n").trim();

  // Pass 1 rewrites every tag that carries an alt, a caption, or both. What
  // pass 1 leaves behind is an <Image /> with neither — and an image with no
  // alt and no caption has nothing to say, so pass 2 deletes the whole line
  // rather than leaving an empty `![]()` that renders as a broken icon.
  body = body.replace(IMAGE_TAG, (tag, attributes: string) => {
    const source =
      SRC_PROP.exec(attributes)?.[1] ?? SRC_STRING.exec(attributes)?.[1];
    const url = source ? imageUrls.get(source) : undefined;
    const alt = attribute(attributes, "alt")?.trim();
    const caption = attribute(attributes, "caption")?.trim();

    // A captioned image is usually written with the caption copied into the
    // alt, because that is what a screen reader announces. Emitting both would
    // print the same sentence twice, so when they are identical the image
    // carries the text on its own.
    const captionLine = caption && caption !== alt ? `*${caption}*` : null;

    const parts: string[] = [];
    if (url && alt) parts.push(`![${escapeAlt(alt)}](${url})`);
    else if (url && caption) parts.push(`![${escapeAlt(caption)}](${url})`);
    if (captionLine) parts.push(captionLine);

    return parts.join("\n\n");
  });

  body = body.replace(/^[ \t]*<Image\b[^>]*\/>[ \t]*\n?/gm, "");

  body = await rewriteMarkdownImages(body, dir);

  return `${frontmatter(post)}\n${body.trim()}\n`;
}

// A bracket inside alt text closes the image syntax early and swallows the URL
// into the label. Escaping the two characters markdown actually reserves there
// is enough; backslashes and parens in a path need nothing.
function escapeAlt(alt: string): string {
  return alt.replace(/([[\]])/g, "\\$1");
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function frontmatter(post: BlogPost): string {
  const { title, date, description, tags } = post.data;
  return [
    "---",
    `title: ${quote(title)}`,
    `date: ${date.toISOString().slice(0, 10)}`,
    `description: ${quote(description)}`,
    `tags: [${tags.map(quote).join(", ")}]`,
    "---",
  ].join("\n");
}
