export interface TocEntry {
  slug: string;
  text: string;
}

export interface TocGroup extends TocEntry {
  children: TocEntry[];
}

export interface Toc {
  groups: TocGroup[];
  /** Total links, not group count — the render threshold is about how much the
   *  reader is navigating, and a post of 2 groups and 9 children is not thin. */
  count: number;
}

/** Below this many links a table of contents is noise rather than navigation —
 *  a two-item list restates the page and takes space the prose wants. */
export const MIN_TOC_ENTRIES = 3;

/**
 * Normalise a post's heading list into the two-level tree a table of contents
 * renders, or null when the post is too short to deserve one.
 *
 * Depth is resolved relative to the shallowest heading the post actually uses,
 * never against a hardcoded level. Posts are inconsistent: most open at `##`,
 * but apollo-dao, orion-money and stuck open at `###` with no `##` at all, and
 * filtering on a fixed depth would hand those three an empty contents list.
 *
 * Only one level below that minimum is kept. Beyond two levels the rail is a
 * column of near-identical small text — hyphen-avalance's `####` rows add
 * three lines that no one scans for.
 */
export function buildToc(
  headings: readonly { depth: number; slug: string; text: string }[],
): Toc | null {
  if (headings.length === 0) return null;

  const minDepth = Math.min(...headings.map((heading) => heading.depth));
  const groups: TocGroup[] = [];
  let current: TocGroup | undefined;

  for (const heading of headings) {
    // A heading that arrives before the post's first shallow one has no group to
    // nest under — b-asset-peg opens with two `###` rows ahead of its first
    // `##`. Promoting them to groups keeps them reachable; dropping them would
    // silently remove real sections from the contents.
    if (heading.depth <= minDepth || current === undefined) {
      current = { slug: heading.slug, text: heading.text, children: [] };
      groups.push(current);
      continue;
    }

    // Exactly one level below the post's own top level, and no deeper. The four
    // `####` rows in hyphen-avalance are sub-subsections: they add rows to a
    // 13rem column without adding anything a reader navigates by.
    if (heading.depth === minDepth + 1) {
      current.children.push({ slug: heading.slug, text: heading.text });
    }
  }

  const count = groups.reduce(
    (total, group) => total + 1 + group.children.length,
    0,
  );

  return count >= MIN_TOC_ENTRIES ? { groups, count } : null;
}
