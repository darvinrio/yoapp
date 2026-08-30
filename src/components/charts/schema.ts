export type ChartType =
  "bar" | "stacked-bar" | "line" | "multi-line" | "pie" | "scatter";

export type XFormat = "date" | "plain";
export type YFormat = "plain" | "compact" | "currency" | "percent";

export type PointValue = { x: number | string; y: number | null };

export interface ChartSeries {
  name: string;
  values: (number | null | PointValue)[];
  color?: string;
  highlight?: boolean | (boolean | null)[];
  dashed?: boolean;
}

export interface ChartData {
  labels?: string[];
  series: ChartSeries[];
  type?: ChartType;
  formatX?: XFormat;
  formatY?: YFormat;
}

export const CHART_COLOR_COUNT = 8;

export function defaultColorToken(index: number): string {
  return `--chart-${(index % CHART_COLOR_COUNT) + 1}`;
}

/** "color" may be a palette token ("--chart-4") or a raw CSS color. */
export function isPaletteToken(color: string): boolean {
  return color.startsWith("--");
}

const nfPlain = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const nfCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});
const nfPercent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatValue(value: number, preset?: YFormat): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  switch (preset) {
    case "compact":
      return nfCompact.format(value);
    case "currency":
      return `$${nfCompact.format(value)}`;
    case "percent":
      return nfPercent.format(value);
    default:
      return nfPlain.format(value);
  }
}

const ISO_RE = /^\d{4}-\d{2}(-\d{2})?$/;

export function isISODate(value: unknown): value is string {
  return typeof value === "string" && ISO_RE.test(value);
}

export function isMonthlySeries(labels: string[]): boolean {
  return labels.length > 0 && labels.every((l) => /^\d{4}-\d{2}-01$/.test(l));
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface ISODate {
  y: number;
  m: number;
  d: number;
}

function parseISO(iso: string): ISODate {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d: d ?? 1 };
}

/** Tick label: "Jan '23" for monthly data, otherwise "Jan 15". */
export function formatDateTick(iso: string, monthly: boolean): string {
  const { y, m, d } = parseISO(iso);
  return monthly
    ? `${MONTHS[m - 1]} '${String(y).slice(2)}`
    : `${MONTHS[m - 1]} ${d}`;
}

/** Tooltip title: "Jan 15, 2023" or "Jan 2023". */
export function formatDateFull(iso: string, monthly: boolean): string {
  const { y, m, d } = parseISO(iso);
  return monthly ? `${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatXLabel(
  value: string,
  xFormat: XFormat,
  monthly: boolean,
): string {
  if (xFormat === "date" && isISODate(value)) {
    return formatDateTick(value, monthly);
  }
  return value;
}

export function formatXTitle(value: string, xFormat: XFormat): string {
  if (xFormat === "date" && isISODate(value)) {
    const monthly = isMonthlySeries([value]);
    return formatDateFull(value, monthly);
  }
  return value;
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "chart"
  );
}

/** #rgb → #rrggbb, so alpha can be appended safely. */
export function normalizeHex(color: string): string {
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color;
}

/** "#14b8a6", 0.65 → "rgba(20, 184, 166, 0.65)" */
export function withAlpha(color: string, alpha: number): string {
  const hex = normalizeHex(color);
  if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}
