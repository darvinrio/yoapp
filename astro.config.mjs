// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeTableWrap from "./src/plugins/rehype-table-wrap";

// https://astro.build/config
export default defineConfig({
  site: "https://mayonas.vercel.app",
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeTableWrap],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
