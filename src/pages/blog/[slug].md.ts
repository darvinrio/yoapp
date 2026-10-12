import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { toPostMarkdown } from "../../lib/post-markdown";

// `/blog/<slug>.md` — the same text the Copy markdown button puts on the
// clipboard, so there is exactly one definition of "this post as markdown" and
// the button can never drift from the file a reader opens.
//
// Prerendered like every other route here, which keeps the site on the Vercel
// free tier: no function, no edge runtime, one static file per post.
export const prerender = true;

export async function getStaticPaths() {
  const posts: CollectionEntry<"blog">[] = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: CollectionEntry<"blog"> };

  return new Response(await toPostMarkdown(post), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};
