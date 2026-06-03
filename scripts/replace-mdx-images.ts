#!/usr/bin/env bun
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Config = {
  folder: string;
  ignoreExtensions: string[]; // e.g. ["gif", "svg"]
  dryRun: boolean;
};

const config: Config = {
  folder: process.argv[2] ?? "./src/content/blog",
  ignoreExtensions: ["gif"],
  dryRun: false,
};

const IMAGE_COMPONENT_IMPORT =
  'import Image from "../../components/BlogImage.astro";';

const MDX_EXTENSIONS = new Set([".mdx"]);
const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+(?:\s[^)]*)?)\)/g;

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function normalizeExt(ext: string): string {
  return ext.replace(/^\./, "").toLowerCase();
}

function shouldIgnoreImage(src: string, ignoreExtensions: string[]): boolean {
  const ext = normalizeExt(path.extname(src));
  return ignoreExtensions.map(normalizeExt).includes(ext);
}

function splitMdxSections(content: string): {
  frontmatter: string | null;
  importBlock: string;
  body: string;
} {
  if (!content.startsWith("---")) {
    return {
      frontmatter: null,
      importBlock: "",
      body: content,
    };
  }

  const frontmatterMatch = content.match(/^---\r?\n[\s\S]*?\r?\n---/);
  if (!frontmatterMatch) {
    return {
      frontmatter: null,
      importBlock: "",
      body: content,
    };
  }

  const frontmatter = frontmatterMatch[0];
  let rest = content.slice(frontmatter.length);

  if (rest.startsWith("\r\n")) rest = rest.slice(2);
  else if (rest.startsWith("\n")) rest = rest.slice(1);

  let importBlock = "";
  let body = rest;

  const secondFenceMatch = rest.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (secondFenceMatch) {
    importBlock = secondFenceMatch[1].trim();
    body = rest.slice(secondFenceMatch[0].length);
  }

  return { frontmatter, importBlock, body };
}

function rebuildMdx({
  frontmatter,
  importBlock,
  body,
}: {
  frontmatter: string | null;
  importBlock: string;
  body: string;
}): string {
  if (!frontmatter) {
    const imports = importBlock.trim();
    return imports ? `${imports}\n\n${body}` : body;
  }

  const imports = importBlock.trim();

  if (imports) {
    return `${frontmatter}\n\n${imports}\n\n---\n\n${body}`;
  }

  return `${frontmatter}\n\n${body}`;
}

function makeImportName(index: number): string {
  return `img${String(index).padStart(3, "0")}`;
}

function replaceImagesInBody(
  body: string,
  ignoreExtensions: string[],
  existingImportBlock: string,
): {
  nextBody: string;
  importLines: string[];
  changed: boolean;
} {
  const usedSrcToVar = new Map<string, string>();
  const existingVars = new Set<string>();

  const existingImportVarRe =
    /import\s+([A-Za-z_$][\w$]*)\s+from\s+["'][^"']+["'];?/g;
  for (const match of existingImportBlock.matchAll(existingImportVarRe)) {
    existingVars.add(match[1]);
  }

  let counter = 1;
  const importLines: string[] = [];
  let changed = false;

  const nextBody = body.replace(MARKDOWN_IMAGE_RE, (full, alt, rawSrc) => {
    let src = rawSrc.trim();
    try {
      src = decodeURI(src);
    } catch {
      src = rawSrc.trim();
    }

    if (!src.startsWith(".") && !src.startsWith("/")) {
      return full;
    }

    if (shouldIgnoreImage(src, ignoreExtensions)) {
      return full;
    }

    let varName = usedSrcToVar.get(src);
    if (!varName) {
      do {
        varName = makeImportName(counter++);
      } while (existingVars.has(varName));

      usedSrcToVar.set(src, varName);
      existingVars.add(varName);
      importLines.push(`import ${varName} from "${src}";`);
    }

    changed = true;

    const altText = String(alt ?? "").trim();
    if (altText && altText.toLowerCase() !== "captionless image") {
      return `\n<Image  src={${varName}}  alt=${JSON.stringify(altText)}/>`;
    }

    return `\n<Image  src={${varName}}  alt=""/>`;
  });

  return { nextBody, importLines, changed };
}

function mergeImports(
  existingImportBlock: string,
  newImportLines: string[],
): string {
  const lines = existingImportBlock
    ? existingImportBlock
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const set = new Set(lines);

  if (![...set].some((l) => l === IMAGE_COMPONENT_IMPORT)) {
    lines.unshift(IMAGE_COMPONENT_IMPORT);
    set.add(IMAGE_COMPONENT_IMPORT);
  }

  for (const line of newImportLines) {
    if (!set.has(line)) {
      lines.push(line);
      set.add(line);
    }
  }

  return lines.join("\n");
}

async function processFile(filePath: string) {
  const original = await readFile(filePath, "utf8");
  const { frontmatter, importBlock, body } = splitMdxSections(original);

  const { nextBody, importLines, changed } = replaceImagesInBody(
    body,
    config.ignoreExtensions,
    importBlock,
  );

  if (!changed) return { filePath, changed: false };

  const nextImportBlock = mergeImports(importBlock, importLines);
  const nextContent = rebuildMdx({
    frontmatter,
    importBlock: nextImportBlock,
    body: nextBody,
  });

  if (!config.dryRun) {
    await writeFile(filePath, nextContent, "utf8");
  }

  return { filePath, changed: true };
}

async function main() {
  const results: Array<{ filePath: string; changed: boolean }> = [];

  for await (const filePath of walk(config.folder)) {
    if (!MDX_EXTENSIONS.has(path.extname(filePath).toLowerCase())) continue;
    results.push(await processFile(filePath));
  }

  const changed = results.filter((r) => r.changed);
  console.log(
    JSON.stringify(
      {
        scanned: results.length,
        changed: changed.length,
        dryRun: config.dryRun,
        files: changed.map((r) => r.filePath),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
