import fs from "node:fs";
import path from "node:path";

interface Env {
  blogSourceDir: string;
  outputDir: string;
  userAgent: string;
  openaiApiKey: string;
  openaiEndpoint: string;
  openaiLabelModel: string;
  openaiLabelMaxTokens: number;
  openaiLabelConcurrency: number;
  downloadRetries: number;
  labelRetries: number;
}

function parseEnv(): Env {
  let manualVars: Record<string, string> = {};
  const envFile = path.resolve(".env");
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key) manualVars[key] = value;
    }
  }
  const resolve = (key: string, fallback: string): string =>
    process.env[key] ?? manualVars[key] ?? fallback;
  const resolveInt = (key: string, fallback: number): number => {
    const v = resolve(key, String(fallback));
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  return {
    blogSourceDir: resolve("BLOG_SOURCE_DIR", "src/content/blog/"),
    outputDir: resolve("OUTPUT_DIR", "src/assets/blog-images/"),
    userAgent: resolve("HTTP_USER_AGENT", "yoapp-blog-migrator/1.0"),
    openaiApiKey: resolve("OPENAI_API_KEY", ""),
    openaiEndpoint: resolve("OPENAI_ENDPOINT", "https://api.openai.com/v1").replace(/\/+$/, ""),
    openaiLabelModel: resolve("OPENAI_LABEL_MODEL", "gpt-4o-mini"),
    openaiLabelMaxTokens: resolveInt("OPENAI_LABEL_MAX_TOKENS", 50),
    openaiLabelConcurrency: resolveInt("OPENAI_LABEL_CONCURRENCY", 4),
    downloadRetries: resolveInt("DOWNLOAD_RETRIES", 3),
    labelRetries: resolveInt("LABEL_RETRIES", 3),
  };
}

const MIRO_RE = /https:\/\/miro\.medium\.com\/v2\/resize:fit:\d+\/format:\w+\/[^)\s]+/g;

type IndexedMatch = { url: string; ext: string; index: number };

function extractExt(url: string): string {
  const lastSlash = url.lastIndexOf("/");
  const segment = lastSlash >= 0 ? url.slice(lastSlash + 1) : url;
  const dotIdx = segment.lastIndexOf(".");
  return dotIdx >= 0 ? segment.slice(dotIdx + 1).toLowerCase() : "png";
}

function findBlogFiles(blogSourceDir: string): string[] {
  const absDir = path.resolve(blogSourceDir);
  if (!fs.existsSync(absDir)) {
    console.error(`Blog source directory not found: ${absDir}`);
    process.exit(1);
  }
  const entries = fs.readdirSync(absDir);
  const mdFiles: string[] = [];
  for (const entry of entries) {
    const full = path.join(absDir, entry);
    const stat = fs.statSync(full);
    if (stat.isFile() && entry.endsWith(".md")) mdFiles.push(full);
  }
  mdFiles.sort();
  return mdFiles;
}

async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  retries: number,
): Promise<Response> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers, redirect: "follow" });
      if (res.ok) return res;
      if (res.status >= 500 || res.status === 429) {
        const delay = attempt === 0 ? 1000 : attempt === 1 ? 2000 : 4000;
        await new Promise((r) => setTimeout(r, delay));
        lastErr = new Error(`HTTP ${res.status}`);
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        const delay = attempt === 0 ? 1000 : attempt === 1 ? 2000 : 4000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr ?? new Error("download failed");
}

async function downloadImage(
  url: string,
  dest: string,
  userAgent: string,
  retries: number,
): Promise<boolean> {
  if (fs.existsSync(dest)) {
    const stat = fs.statSync(dest);
    if (stat.size > 1024) return true;
  }
  const headers: Record<string, string> = { "User-Agent": userAgent };
  let res: Response;
  try {
    res = await fetchWithRetry(url, headers, retries);
  } catch {
    return false;
  }
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length <= 1024) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return true;
}

interface LabelledImage {
  localPath: string;
  ext: string;
  counter: number;
}

async function labelWithOpenAI(
  imagePath: string,
  ext: string,
  env: Env,
  retries: number,
): Promise<string | null> {
  const imageBytes = fs.readFileSync(imagePath);
  const base64 = imageBytes.toString("base64");
  const dataUrl = `data:image/${ext};base64,${base64}`;
  const url = `${env.openaiEndpoint}/chat/completions`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: env.openaiLabelModel,
          max_tokens: env.openaiLabelMaxTokens,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Describe this image in a few words. Return only the label — no quotes, no markdown, no explanation.",
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });
      if (res.ok) {
        const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        return body.choices?.[0]?.message?.content?.trim() ?? "";
      }
      if (res.status >= 500 || res.status === 429) {
        const delay = attempt === 0 ? 1000 : attempt === 1 ? 2000 : 4000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return null;
    } catch (err) {
      if (attempt < retries) {
        const delay = attempt === 0 ? 1000 : attempt === 1 ? 2000 : 4000;
        await new Promise((r) => setTimeout(r, delay));
      } else {
        break;
      }
    }
  }
  return null;
}

async function runLabelling(
  images: Array<{ localPath: string; ext: string }>,
  env: Env,
): Promise<void> {
  const maxC = env.openaiLabelConcurrency;
  let active = 0;
  let idx = 0;

  const next = async (): Promise<void> => {
    if (idx >= images.length) return;
    const current = idx++;
    const { localPath, ext } = images[current];
    const labelFile = `${localPath}.label.txt`;
    if (fs.existsSync(labelFile)) return;

    active++;
    try {
      const label = await labelWithOpenAI(localPath, ext, env, env.labelRetries);
      if (label !== null) {
        fs.writeFileSync(labelFile, label + "\n");
      }
    } finally {
      active--;
      await next();
    }
  };

  const starters: Promise<void>[] = [];
  for (let i = 0; i < maxC; i++) {
    starters.push(next());
  }
  await Promise.all(starters);
  while (active > 0) {
    await new Promise((r) => setTimeout(r, 50));
  }
}

interface FileResult {
  file: string;
  slug: string;
  imageCount: number;
  failed: number;
}

async function main() {
  const env = parseEnv();
  const blogSourceDir = path.resolve(env.blogSourceDir);
  const outputDir = path.resolve(env.outputDir);
  const files = findBlogFiles(blogSourceDir);
  const results: FileResult[] = [];
  let totalFailed = 0;

  for (const file of files) {
    const slug = path.basename(file, ".md");
    const content = fs.readFileSync(file, "utf-8");
    const matches: IndexedMatch[] = [];
    for (const rawMatch of content.matchAll(MIRO_RE)) {
      matches.push({
        url: rawMatch[0],
        ext: extractExt(rawMatch[0]),
        index: rawMatch.index ?? 0,
      });
    }

    if (matches.length === 0) {
      results.push({ file, slug, imageCount: 0, failed: 0 });
      continue;
    }

    const slugDir = path.join(outputDir, slug);
    fs.mkdirSync(slugDir, { recursive: true });

    let failed = 0;
    const successes: Array<{ start: number; end: number; newUrl: string; counter: number; ext: string; localPath: string }> = [];

    for (let i = 0; i < matches.length; i++) {
      const counter = String(i + 1).padStart(3, "0");
      const localName = `${counter}.${matches[i].ext}`;
      const localPath = path.join(slugDir, localName);
      const ok = await downloadImage(
        matches[i].url,
        localPath,
        env.userAgent,
        env.downloadRetries,
      );

      if (!ok) {
        failed++;
        console.error(`[FAIL] ${file}: ${matches[i].url}`);
      } else {
        successes.push({
          start: matches[i].index,
          end: matches[i].index + matches[i].url.length,
          newUrl: `../../assets/blog-images/${slug}/${localName}`,
          counter: i + 1,
          ext: matches[i].ext,
          localPath,
        });
      }
    }

    let updated = content;
    for (let i = successes.length - 1; i >= 0; i--) {
      const s = successes[i];
      updated = updated.slice(0, s.start) + s.newUrl + updated.slice(s.end);
    }
    fs.writeFileSync(file, updated);
    results.push({ file, slug, imageCount: matches.length, failed });
    totalFailed += failed;

    if (env.openaiApiKey?.length > 0 && successes.length > 0) {
      await runLabelling(
        successes.map((s) => ({ localPath: s.localPath, ext: s.ext })),
        env,
      );
    }
  }

  console.log("\n=== Migration Summary ===");
  for (const r of results) {
    const suffix = r.failed > 0 ? ` (${r.failed} FAILED)` : "";
    console.log(`${r.slug}: ${r.imageCount} images${suffix}`);
  }
  console.log(`Total failed: ${totalFailed}`);

  if (totalFailed > 0) {
    process.stderr.write("\nWARNING: some downloads failed.\n");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
