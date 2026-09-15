import type { APIContext, CollectionEntry } from "astro";
import { getCollection } from "astro:content";
import {
  COLORS,
  footer,
  frame,
  header,
  loadFonts,
  renderPng,
} from "../../lib/og-brand";

export const prerender = true;

export async function getStaticPaths() {
  const posts: CollectionEntry<"blog">[] = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

function titleFontSize(title: string): number {
  if (title.length > 110) return 38;
  if (title.length > 60) return 48;
  return 64;
}

export async function GET({ props }: APIContext) {
  const { post } = props as { post: CollectionEntry<"blog"> };

  const date = post.data.date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const footerText = [date, ...post.data.tags].join(" · ");

  const element = frame([
    header(),
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          marginTop: "64px",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontFamily: "Merriweather",
                fontWeight: 700,
                fontSize: `${titleFontSize(post.data.title)}px`,
                lineHeight: "1.2",
                color: COLORS.textPrimary,
                lineClamp: 3,
              },
              children: post.data.title,
            },
          },
        ],
      },
    },
    footer(footerText),
  ]);

  const png = await renderPng(element, loadFonts());

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}
