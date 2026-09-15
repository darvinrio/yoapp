import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COLORS,
  footer,
  frame,
  header,
  loadFonts,
  renderPng,
  HEIGHT,
  WIDTH,
} from "../src/lib/og-brand";

const HEADLINE_LINE_1 = "Analytics Engineer,";
const HEADLINE_LINE_2 = "reconciling data to the last share.";
const FOOTER = "on-chain data · prediction markets · open research";

const FONTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "fonts");

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
              display: "flex",
              fontFamily: "Merriweather",
              fontWeight: 700,
              fontSize: "58px",
              lineHeight: "1.2",
              color: COLORS.textPrimary,
            },
            children: HEADLINE_LINE_1,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontFamily: "Merriweather",
              fontWeight: 700,
              fontSize: "58px",
              lineHeight: "1.2",
              color: COLORS.textMuted,
            },
            children: HEADLINE_LINE_2,
          },
        },
      ],
    },
  },
  footer(FOOTER),
]);

const png = await renderPng(element, loadFonts(FONTS_DIR));

writeFileSync(join(dirname(FONTS_DIR), "..", "public", "og.png"), png);
console.log(`generated public/og.png (${WIDTH}x${HEIGHT})`);
