import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const WORDMARK = "maybeYonas.";
const HEADLINE_LINE_1 = "Analytics Engineer,";
const HEADLINE_LINE_2 = "reconciling data to the last share.";
const FOOTER = "on-chain data · prediction markets · open research";

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  background: "#18181b",
  accent: "#2dd4bf",
  textPrimary: "#f1eef7",
  textMuted: "#a1a1aa",
  divider: "#3f3f46",
};

const FONTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "fonts");

const fonts = [
  {
    name: "Merriweather",
    data: readFileSync(join(FONTS_DIR, "Merriweather-Bold.ttf")),
    weight: 700,
    style: "normal" as const,
  },
  {
    name: "JetBrains Mono",
    data: readFileSync(join(FONTS_DIR, "JetBrainsMono-Regular.ttf")),
    weight: 400,
    style: "normal" as const,
  },
];

const flagGlyph = {
  type: "svg",
  props: {
    width: 72,
    height: 72,
    viewBox: "0 0 64 64",
    children: [
      {
        type: "line",
        props: {
          x1: 19,
          y1: 9,
          x2: 19,
          y2: 55,
          stroke: COLORS.accent,
          "stroke-width": 6,
          "stroke-linecap": "round",
        },
      },
      {
        type: "path",
        props: { d: "M23 12 L50 20 L23 28 Z", fill: COLORS.accent },
      },
    ],
  },
};

const element = {
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: COLORS.background,
    },
    children: [
      {
        type: "div",
        props: {
          style: {
            width: "100%",
            height: "8px",
            flexShrink: 0,
            backgroundColor: COLORS.accent,
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            flex: "1",
            display: "flex",
            flexDirection: "column",
            padding: "56px 80px 48px 80px",
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "28px",
                },
                children: [
                  {
                    type: "div",
                    props: { style: { display: "flex" }, children: flagGlyph },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        fontFamily: "Merriweather",
                        fontWeight: 700,
                        fontSize: "44px",
                        color: COLORS.textPrimary,
                      },
                      children: [
                        {
                          type: "span",
                          props: { style: {}, children: WORDMARK.slice(0, -1) },
                        },
                        {
                          type: "span",
                          props: {
                            style: { color: COLORS.accent },
                            children: ".",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
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
            {
              type: "div",
              props: {
                style: {
                  marginTop: "auto",
                  display: "flex",
                  flexDirection: "column",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        width: "100%",
                        height: "2px",
                        marginBottom: "24px",
                        backgroundColor: COLORS.divider,
                      },
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        fontFamily: "JetBrains Mono",
                        fontWeight: 400,
                        fontSize: "24px",
                        color: COLORS.textMuted,
                      },
                      children: FOOTER,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
};

const svg = await satori(element as never, {
  width: WIDTH,
  height: HEIGHT,
  fonts,
});

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: WIDTH },
  font: { loadSystemFonts: false },
})
  .render()
  .asPng();

writeFileSync(join(dirname(FONTS_DIR), "..", "public", "og.png"), png);
console.log(`generated public/og.png (${WIDTH}x${HEIGHT})`);
