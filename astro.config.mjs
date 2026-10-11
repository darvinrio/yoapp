// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeTableWrap from "./src/plugins/rehype-table-wrap";
import { unified } from "@astrojs/markdown-remark";

// https://astro.build/config
export default defineConfig({
  site: "https://mayonas.vercel.app",
  integrations: [mdx(), sitemap()],
  markdown: {
    // Plugins hang off the processor, not off `markdown` directly: the top-level
    // remarkPlugins / rehypePlugins keys are deprecated since Astro 6.4 and
    // warned on every build. `unified()` is Astro's own default processor, so
    // passing it explicitly changes nothing else in the pipeline.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeTableWrap],
    }),
    // Dual theme, no default colour. Shiki's default is a single `github-dark`
    // pass, which wrote `background-color:#24292e` into an inline style on every
    // <pre> in BOTH themes. An inline declaration outranks every stylesheet, so
    // `--tw-prose-pre-bg` in blog.css had no way to take effect — light mode
    // still got a dark code block. Two themes plus `defaultColor: false` make
    // Shiki emit only `--shiki-light` / `--shiki-dark` custom properties and no
    // `color` or `background-color` at all, which lets blog.css pick the pair
    // from `.dark` and puts the block background back on --color-surface-sunken.
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
