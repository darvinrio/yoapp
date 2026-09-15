import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

export const WIDTH = 1200;
export const HEIGHT = 630;

export const COLORS = {
  background: "#18181b",
  accent: "#2dd4bf",
  textPrimary: "#f1eef7",
  textMuted: "#a1a1aa",
  divider: "#3f3f46",
} as const;

export const WORDMARK = "maybeYonas.";

export const FONTS_DIR = join(process.cwd(), "scripts", "fonts");

type Style = Record<string, string | number>;

type OgElement = {
  type: string;
  props: {
    style?: Style;
    children?: OgElement | OgElement[] | string;
    [key: string]: unknown;
  };
};

type SatoriFonts = {
  name: string;
  data: Buffer;
  weight: number;
  style: "normal" | "italic";
}[];

export function loadFonts(fontsDir: string = FONTS_DIR): SatoriFonts {
  return [
    {
      name: "Merriweather",
      data: readFileSync(join(fontsDir, "Merriweather-Bold.ttf")),
      weight: 700,
      style: "normal",
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(fontsDir, "JetBrainsMono-Regular.ttf")),
      weight: 400,
      style: "normal",
    },
  ];
}

export function flagGlyph(): OgElement {
  return {
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
}

function wordmark(): OgElement {
  return {
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
  };
}

export function header(): OgElement {
  return {
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
          props: { style: { display: "flex" }, children: flagGlyph() },
        },
        wordmark(),
      ],
    },
  };
}

export function footer(text: string): OgElement {
  return {
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
            children: text,
          },
        },
      ],
    },
  };
}

export function frame(children: OgElement[]): OgElement {
  return {
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
            children,
          },
        },
      ],
    },
  };
}

export async function renderPng(
  element: OgElement,
  fonts: SatoriFonts,
): Promise<Buffer> {
  const svg = await satori(element as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: fonts as never,
  });

  return new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
}
