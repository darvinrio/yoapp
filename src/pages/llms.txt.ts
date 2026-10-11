import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const url = (path: string) => new URL(path, site).toString();

  const pages = [
    [
      "Home",
      url("/"),
      "Analytics Engineer — on-chain data, prediction markets, open research",
    ],
    ["Writings", url("/blog"), "All published posts"],
    ["Work", url("/work"), "Work experience"],
    ["Resume", url("/resume"), "Resume"],
    ["RSS", url("/rss.xml"), "Feed of new posts"],
    [
      "Markdown",
      url("/blog/ezeth-depeg.md"),
      "Any post is available as raw markdown at its URL + `.md`",
    ],
  ];

  const lines = [
    "# maybeYonas",
    "",
    "> Analytics Engineer with 4 years of blockchain data experience. On-chain data, prediction markets, open research.",
    "",
    "Analytics engineering, DeFi analytics research, and prediction-market forensics by Yonas (maybeYonas).",
    "",
    "## Pages",
    "",
    ...pages.map(([label, href, desc]) => `- [${label}](${href}): ${desc}`),
    "",
    "## Writings",
    "",
    // Each entry carries its own markdown URL rather than making the reader
    // append `.md` to the human URL: an agent following this file should never
    // have to guess at a convention.
    ...posts.map(
      (post) =>
        `- [${post.data.title}](${url(`/blog/${post.id}`)}): ${post.data.date.toISOString().slice(0, 10)} — ${post.data.description} ([markdown](${url(`/blog/${post.id}.md`)}))`,
    ),
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
