import Chart from "chart.js/auto";
import type {
  ChartConfiguration,
  ChartData as JsChartData,
  ChartOptions as JsChartOptions,
  ChartType as JsChartType,
  Plugin as JsChartPlugin,
} from "chart.js";
import {
  formatValue,
  formatDateTick,
  formatDateFull,
  isISODate,
  isMonthlySeries,
  slugify,
  withAlpha,
  type ChartData,
  type ChartType,
  type YFormat,
} from "./schema";

interface ChartPayload {
  type: ChartType;
  data: ChartData;
  title?: string;
  subtitle?: string;
  caption?: string;
  description?: string;
  handle: string;
}

interface ThemeColors {
  palette: string[];
  grid: string;
  axis: string;
  tick: string;
  ink: string;
  inkStrong: string;
  inkFaint: string;
  inkMuted: string;
  surface: string;
  line: string;
  accent: string;
}

interface ChartEntry {
  fig: HTMLElement;
  payload: ChartPayload;
  chart: Chart;
}

const FONT_TITLE = '"F5.6", sans-serif';
const FONT_MONO = '"JetBrains Mono", monospace';
const FONT_TEXT = '"Merriweather", serif';
const PALETTE_SIZE = 8;

function cssVar(el: HTMLElement, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

function resolveColors(fig: HTMLElement): ThemeColors {
  const palette = Array.from({ length: PALETTE_SIZE }, (_, i) =>
    cssVar(fig, `--chart-${i + 1}`),
  );
  return {
    palette,
    grid: cssVar(fig, "--chart-grid"),
    axis: cssVar(fig, "--chart-axis"),
    tick: cssVar(fig, "--chart-tick"),
    ink: cssVar(fig, "--color-ink"),
    inkStrong: cssVar(fig, "--color-ink-strong"),
    inkFaint: cssVar(fig, "--color-ink-faint"),
    inkMuted: cssVar(fig, "--color-ink-muted"),
    surface: cssVar(fig, "--color-surface-raised"),
    line: cssVar(fig, "--color-line"),
    accent: cssVar(fig, "--color-accent"),
  };
}

function seriesBaseColor(
  series: ChartData["series"][number],
  index: number,
  colors: ThemeColors,
): string {
  const pinned = series.color;
  if (pinned) {
    if (pinned.startsWith("--")) {
      const v = cssVar(document.documentElement, pinned);
      if (v) return v;
    }
    return pinned;
  }
  return colors.palette[index % PALETTE_SIZE];
}

function chartJsType(type: ChartType): JsChartType {
  switch (type) {
    case "pie":
      return "doughnut";
    case "scatter":
      return "scatter";
    case "line":
    case "multi-line":
      return "line";
    default:
      return "bar";
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isDateAxis(data: ChartData): boolean {
  const labels = data.labels ?? [];
  return (
    data.formatX === "date" || (labels.length > 0 && labels.every(isISODate))
  );
}

/** Maps normalized data → Chart.js datasets (colors included, for init + re-theme). */
function buildDatasets(
  payload: ChartPayload,
  colors: ThemeColors,
): Record<string, unknown>[] {
  const { type, data } = payload;

  if (type === "pie") {
    const series = data.series[0];
    const slices = (data.labels ?? []).map(
      (_, i) => Number(series?.values[i] ?? 0) || 0,
    );
    const highlight = series?.highlight;
    const highlightArr = Array.isArray(highlight)
      ? highlight
      : slices.map(() => highlight === true);
    return [
      {
        label: series?.name ?? "",
        data: slices,
        backgroundColor: (data.labels ?? []).map(
          (_, i) => colors.palette[i % PALETTE_SIZE],
        ),
        borderColor: colors.surface,
        borderWidth: 2,
        hoverOffset: 8,
        offset: highlightArr.map((h) => (h ? 12 : 0)),
      },
    ];
  }

  if (type === "scatter") {
    return data.series.map((s, i) => {
      const base = seriesBaseColor(s, i, colors);
      return {
        label: s.name,
        data: s.values.map((v) =>
          typeof v === "object" && v !== null
            ? {
                x: typeof v.x === "string" ? Date.parse(v.x) : v.x,
                y: v.y,
              }
            : { x: 0, y: null },
        ),
        backgroundColor: withAlpha(base, 0.65),
        borderColor: base,
        pointRadius: 4,
        pointHoverRadius: 5.5,
        borderWidth: 1.5,
        showLine: false,
      };
    });
  }

  const isBar = type === "bar" || type === "stacked-bar";
  return data.series.map((s, i) => {
    const base = seriesBaseColor(s, i, colors);
    if (isBar) {
      return {
        label: s.name,
        data: s.values,
        backgroundColor: withAlpha(base, 0.65),
        borderColor: base,
        borderWidth: 2,
        borderRadius: 3,
        maxBarThickness: 42,
      };
    }
    const many = s.values.length > 30;
    return {
      label: s.name,
      data: s.values,
      borderColor: base,
      backgroundColor: "transparent",
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: many ? 0 : 2,
      pointHoverRadius: 4,
      pointBackgroundColor: base,
      borderDash: s.dashed ? [6, 4] : undefined,
    };
  });
}

/** Chart.js config for the given payload + resolved theme colors. */
function buildConfig(
  payload: ChartPayload,
  colors: ThemeColors,
): {
  type: JsChartType;
  data: JsChartData;
  options: JsChartOptions;
} {
  const { type, data } = payload;
  const labels = data.labels ?? [];
  const yFmt = data.formatY;
  const isBar = type === "bar" || type === "stacked-bar";
  const isPie = type === "pie";
  const isScatter = type === "scatter";

  const scatterDateX = isScatter && scatterXIsDate(data);
  let monthlyScatter = false;
  if (scatterDateX) {
    const xs = data.series
      .flatMap((s) => s.values)
      .map((v) =>
        typeof v === "object" && v !== null
          ? typeof v.x === "string"
            ? Date.parse(v.x)
            : Number(v.x)
          : Number.NaN,
      )
      .filter((n) => !Number.isNaN(n));
    monthlyScatter = monthlyScatterSpan(xs);
  }
  const dateAxis = isScatter ? scatterDateX : isDateAxis(data);
  const monthly = isScatter
    ? monthlyScatter
    : dateAxis &&
      labels.length > 0 &&
      labels.every((l) => /^\d{4}-\d{2}-01$/.test(l));

  const tooltipBase = {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    titleColor: colors.inkStrong,
    bodyColor: colors.inkMuted,
    titleFont: { family: FONT_MONO, size: 11, weight: 500 as const },
    bodyFont: { family: FONT_MONO, size: 11 },
    padding: 10,
    cornerRadius: 8,
    boxPadding: 4,
    usePointStyle: true,
  };

  if (isPie) {
    const total = labels.reduce(
      (sum, _, i) => sum + (Number(data.series[0]?.values[i]) || 0),
      0,
    );
    return {
      type: "doughnut",
      data: {
        labels,
        datasets: buildDatasets(
          payload,
          colors,
        ) as unknown as JsChartData["datasets"],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        animation: prefersReducedMotion() ? false : { duration: 500 },
        interaction: { mode: "nearest", intersect: true },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipBase,
            displayColors: true,
            callbacks: {
              label: (item: { dataIndex: number; parsed: number }) => {
                const value = Number(
                  data.series[0]?.values[item.dataIndex] ?? 0,
                );
                const pct =
                  total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                return ` ${labels[item.dataIndex] ?? ""}: ${formatValue(value, yFmt)} (${pct}%)`;
              },
            },
          },
        },
      } as unknown as JsChartOptions,
    };
  }

  const cartesianData: JsChartData = {
    labels,
    datasets: buildDatasets(
      payload,
      colors,
    ) as unknown as JsChartData["datasets"],
  };

  const tooltipCallbacks = isScatter
    ? {
        title: (items: { parsed: { x: number | string } }[]) => {
          const first = items[0];
          if (!first) return "";
          const x = first.parsed.x;
          if (typeof x === "number" && dateAxis) {
            return formatDateFull(isoFromMs(x), monthly);
          }
          return String(x);
        },
        label: (item: {
          dataset: { label?: string };
          parsed: { x: number; y: number | null };
        }) =>
          ` ${item.dataset.label ?? ""}: (${item.parsed.x}, ${formatValue(Number(item.parsed.y), yFmt)})`,
      }
    : {
        title: (items: { dataIndex: number }[]) => {
          const first = items[0];
          if (!first) return "";
          const label = labels[first.dataIndex] ?? "";
          if (dateAxis && isISODate(label))
            return formatDateFull(label, monthly);
          return label;
        },
        label: (item: {
          dataIndex: number;
          datasetIndex: number;
          parsed: { y: number };
        }) => {
          const s = data.series[item.datasetIndex];
          return ` ${s?.name ?? ""}: ${formatValue(item.parsed.y, yFmt)}`;
        },
      };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReducedMotion() ? false : { duration: 400 },
    interaction: {
      mode: isScatter ? ("nearest" as const) : ("index" as const),
      intersect: isScatter,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipBase,
        displayColors: true,
        callbacks: tooltipCallbacks,
      },
    },
    scales: {
      x: {
        stacked: type === "stacked-bar",
        grid: { display: false },
        border: { color: colors.axis },
        ticks: {
          color: colors.tick,
          font: { family: FONT_MONO, size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          callback(this: unknown, value: string | number, index: number) {
            if (isScatter) {
              return scatterDateX
                ? formatDateTick(isoFromMs(Number(value)), monthlyScatter)
                : formatValue(Number(value));
            }
            const label = labels[index] ?? "";
            if (dateAxis && isISODate(label))
              return formatDateTick(label, monthly);
            return label;
          },
        },
      },
      y: {
        stacked: type === "stacked-bar",
        beginAtZero: isBar,
        grid: { color: colors.grid },
        border: { display: false },
        ticks: {
          color: colors.tick,
          font: { family: FONT_MONO, size: 10 },
          maxTicksLimit: 6,
          callback: (value: string | number) =>
            formatValue(Number(value), yFmt),
        },
      },
    },
  };

  return {
    type: chartJsType(type),
    data: cartesianData,
    options: options as JsChartOptions,
  };
}

function scatterXIsDate(data: ChartData): boolean {
  const first = data.series
    .flatMap((s) => s.values)
    .find((v) => typeof v === "object" && v !== null);
  return (
    typeof first === "object" && first !== null && typeof first.x === "string"
  );
}

function monthlyScatterSpan(xs: number[]): boolean {
  if (xs.length < 2) return false;
  return Math.max(...xs) - Math.min(...xs) > 300 * 86400e3;
}

function isoFromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Donut center label for the highlighted slice ("highlight": true). */
interface Highlight {
  index: number;
  label: string;
  valueText: string;
}

interface ChartWithState extends Chart {
  $colors?: ThemeColors;
  $highlight?: Highlight | null;
}

const donutCenterPlugin: JsChartPlugin = {
  id: "donutCenter",
  afterDraw(chart) {
    const state = chart as Chart & {
      $highlight?: Highlight;
      $colors?: ThemeColors;
    };
    const hl = state.$highlight;
    const colors = state.$colors;
    if (!hl || !colors) return;
    if (!chart.getDataVisibility(hl.index)) return;
    const meta = chart.getDatasetMeta(0);
    if (!meta.data[hl.index]) return;
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 10px ${FONT_MONO}`;
    ctx.fillStyle = colors.inkFaint;
    ctx.fillText(hl.label, cx, cy - 10);
    ctx.font = `700 15px ${FONT_MONO}`;
    ctx.fillStyle = colors.inkStrong;
    ctx.fillText(hl.valueText, cx, cy + 10);
    ctx.restore();
  },
};

export function initCharts(): void {
  const figures = document.querySelectorAll<HTMLElement>("[data-chart]");
  const entries: ChartEntry[] = [];

  figures.forEach((fig) => {
    const dataEl = fig.querySelector<HTMLScriptElement>("[data-chart-data]");
    const canvas = fig.querySelector<HTMLCanvasElement>("[data-chart-canvas]");
    if (!dataEl || !canvas) return;

    let payload: ChartPayload;
    try {
      payload = JSON.parse(dataEl.textContent ?? "") as ChartPayload;
    } catch {
      return;
    }

    const colors = resolveColors(fig);
    const config = buildConfig(payload, colors);
    const chart = new Chart(canvas, {
      ...config,
      ...(payload.type === "pie" ? { plugins: [donutCenterPlugin] } : {}),
    } as ChartConfiguration);

    const entry: ChartEntry = { fig, payload, chart };
    (chart as Chart & { $colors?: ThemeColors }).$colors = colors;
    (chart as Chart & { $highlight?: Highlight | null }).$highlight =
      pieHighlight(payload);

    wireLegend(entry);
    wireExport(entry);
    entries.push(entry);
  });

  if (entries.length === 0) return;

  const themeObserver = new MutationObserver(() => {
    entries.forEach((entry) => {
      const colors = resolveColors(entry.fig);
      (entry.chart as Chart & { $colors?: ThemeColors }).$colors = colors;
      retheme(entry, colors);
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  document.fonts?.ready.then(() => {
    entries.forEach((entry) => entry.chart.update("none"));
  });
}

function pieHighlight(payload: ChartPayload): Highlight | null {
  if (payload.type !== "pie") return null;
  const series = payload.data.series[0];
  const highlight = series?.highlight;
  if (!highlight) return null;
  const flags = Array.isArray(highlight)
    ? highlight
    : (payload.data.labels ?? []).map(() => highlight === true);
  const index = flags.findIndex((f) => f === true);
  if (index < 0) return null;
  const value = Number(series?.values?.[index] ?? 0);
  return {
    index,
    label: payload.data.labels?.[index] ?? series?.name ?? "",
    valueText: formatValue(value, payload.data.formatY),
  };
}

function wireLegend(entry: ChartEntry): void {
  const { fig, payload, chart } = entry;
  const legendEl = fig.querySelector<HTMLElement>("[data-chart-legend]");
  if (!legendEl) return;

  legendEl
    .querySelectorAll<HTMLButtonElement>(".chart-legend-item")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.seriesIndex);
        const visible = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", String(!visible));
        if (payload.type === "pie") {
          chart.toggleDataVisibility(index);
        } else {
          chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));
        }
        chart.update();
      });
    });
}

function retheme(entry: ChartEntry, colors: ThemeColors): void {
  const { payload, chart } = entry;
  chart.data.datasets = buildDatasets(
    entry.payload,
    colors,
  ) as unknown as JsChartData["datasets"];
  const rebuilt = buildConfig(entry.payload, colors);
  chart.options = rebuilt.options;
  chart.update("none");
}

function wireExport(entry: ChartEntry): void {
  const btn = entry.fig.querySelector<HTMLButtonElement>("[data-chart-export]");
  btn?.addEventListener("click", () => void exportPng(entry));
}

/* ------------------------------ PNG export ------------------------------ */

const PAD = 20;
const PAD_BOTTOM = 16;

const TITLE_FONT = `400 17px ${FONT_TITLE}`;
const SUBTITLE_FONT = `400 12.5px ${FONT_TEXT}`;
const CAPTION_FONT = `400 12px ${FONT_TEXT}`;
const DESC_FONT = `400 11px ${FONT_TEXT}`;
const LEGEND_FONT = `400 11px ${FONT_MONO}`;
const HANDLE_FONT = `400 12px ${FONT_MONO}`;
const EXPORT_SCALE = 2;

interface LegendEntry {
  index: number;
  label: string;
  color: string;
}

interface LegendRow {
  items: LegendEntry[];
  width: number;
}

function legendEntriesFor(
  payload: ChartPayload,
  colors: ThemeColors,
): LegendEntry[] {
  if (payload.type === "pie") {
    return (payload.data.labels ?? []).map((label, i) => ({
      index: i,
      label,
      color: colors.palette[i % PALETTE_SIZE],
    }));
  }
  return payload.data.series.map((s, i) => ({
    index: i,
    label: s.name,
    color: seriesBaseColor(s, i, colors),
  }));
}

function legendItemWidth(
  m: CanvasRenderingContext2D,
  item: LegendEntry,
): number {
  return 13 + m.measureText(item.label).width + 16;
}

function layoutLegendRows(
  m: CanvasRenderingContext2D,
  items: LegendEntry[],
  maxWidth: number,
): LegendRow[] {
  const rows: LegendRow[] = [];
  let row: LegendEntry[] = [];
  let rowW = 0;
  for (const item of items) {
    const w = legendItemWidth(m, item);
    if (rowW + w > maxWidth && row.length > 0) {
      rows.push({ items: row, width: rowW });
      row = [];
      rowW = 0;
    }
    row.push(item);
    rowW += w;
  }
  if (row.length > 0) rows.push({ items: row, width: rowW });
  return rows;
}

function wrapText(
  m: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || m.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s*\S*$/, "")}…`;
  }
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.closePath();
}

async function exportPng(entry: ChartEntry): Promise<void> {
  const { fig, payload, chart } = entry;
  const colors = resolveColors(fig);
  try {
    await document.fonts.ready;
  } catch {
    /* fonts API unavailable */
  }
  if (!chart.canvas) return;

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return;

  const cardW = fig.offsetWidth;
  const contentW = cardW - PAD * 2;
  const canvasRect = chart.canvas.getBoundingClientRect();
  const plotW = canvasRect.width;
  const plotH = canvasRect.height;
  const isPie = payload.type === "pie";
  const legendEntries = legendEntriesFor(payload, colors);

  measure.font = TITLE_FONT;
  const titleLines = payload.title
    ? wrapText(measure, payload.title, contentW - 34, 2)
    : [];
  measure.font = SUBTITLE_FONT;
  const subtitleLines = payload.subtitle
    ? wrapText(measure, payload.subtitle, contentW, 2)
    : [];

  const handle = payload.handle ?? "";
  const handlePlain = handle.endsWith("Yonas") ? handle.slice(0, -5) : handle;
  const handleAccent = handle.endsWith("Yonas") ? "Yonas" : "";
  measure.font = HANDLE_FONT;
  const handleW =
    measure.measureText(handlePlain).width +
    measure.measureText(handleAccent).width;

  const footerTextW = Math.max(
    contentW - handleW - 30,
    Math.round(contentW * 0.5),
  );
  measure.font = CAPTION_FONT;
  const captionLines = payload.caption
    ? wrapText(measure, payload.caption, footerTextW, 2)
    : [];
  measure.font = DESC_FONT;
  const descLines = payload.description
    ? wrapText(measure, payload.description, footerTextW, 2)
    : [];

  const titleH = titleLines.length * 22;
  const subtitleH = subtitleLines.length ? 3 + subtitleLines.length * 16 : 0;
  const hasHeader = Boolean(payload.title || payload.subtitle);
  const headerH = hasHeader ? titleH + subtitleH + 12 + 1 + 12 : 0;

  const legendEl = fig.querySelector<HTMLElement>("[data-chart-legend]");
  const legendShown =
    Boolean(legendEl && legendEl.offsetParent !== null) &&
    legendEntries.length > 1;
  measure.font = LEGEND_FONT;
  const topRows =
    !isPie && legendShown
      ? layoutLegendRows(measure, legendEntries, contentW)
      : [];
  const legendBlockH = topRows.length ? topRows.length * 18 + 12 : 0;

  const footerTextH =
    captionLines.length * 17 +
    (descLines.length ? 4 + descLines.length * 15 : 0);
  const hasFooter = Boolean(captionLines.length || descLines.length || handle);
  const footerH = hasFooter ? 12 + 1 + 12 + Math.max(footerTextH, 16) : 0;

  const cardH = PAD + headerH + legendBlockH + plotH + footerH + PAD_BOTTOM;

  const out = document.createElement("canvas");
  out.width = Math.round(cardW * EXPORT_SCALE);
  out.height = Math.round(cardH * EXPORT_SCALE);
  const ctx = out.getContext("2d");
  if (!ctx) return;
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

  roundRect(ctx, 0.5, 0.5, cardW - 1, cardH - 1, 12);
  ctx.fillStyle = colors.surface;
  ctx.fill();
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let y = PAD;

  if (hasHeader) {
    if (titleLines.length) {
      ctx.font = TITLE_FONT;
      ctx.fillStyle = colors.inkStrong;
      titleLines.forEach((line, i) => ctx.fillText(line, PAD, y + 15 + i * 22));
    }
    y += titleH;
    if (subtitleLines.length) {
      y += 3;
      ctx.font = SUBTITLE_FONT;
      ctx.fillStyle = colors.inkFaint;
      subtitleLines.forEach((line, i) =>
        ctx.fillText(line, PAD, y + 11 + i * 16),
      );
      y += subtitleLines.length * 16;
    }
    y += 12;
    ctx.strokeStyle = colors.line;
    ctx.beginPath();
    ctx.moveTo(PAD, y + 0.5);
    ctx.lineTo(PAD + contentW, y + 0.5);
    ctx.stroke();
    y += 12;
  }

  if (topRows.length) {
    ctx.font = LEGEND_FONT;
    topRows.forEach((row) => {
      let x = PAD;
      row.items.forEach((item) => {
        const dim = isPie
          ? !chart.getDataVisibility(item.index)
          : !chart.isDatasetVisible(item.index);
        ctx.globalAlpha = dim ? 0.35 : 1;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(x + 4.5, y + 7.5, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.inkMuted;
        ctx.fillText(item.label, x + 13, y + 12);
        x += legendItemWidth(measure, item);
        ctx.globalAlpha = 1;
      });
      y += 18;
    });
    y += 12;
  }

  ctx.drawImage(chart.canvas, PAD, y, plotW, plotH);
  if (isPie && legendShown) {
    measure.font = LEGEND_FONT;
    const colX = PAD + plotW + 16;
    const listH = legendEntries.length * 20;
    let ly = y + (plotH - listH) / 2 + 8;
    legendEntries.forEach((item) => {
      ctx.globalAlpha = chart.getDataVisibility(item.index) ? 1 : 0.35;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(colX + 4.5, ly - 3.5, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.inkMuted;
      ctx.fillText(item.label, colX + 13, ly);
      ly += 20;
    });
  }
  y += plotH;

  if (hasFooter) {
    y += 12;
    ctx.strokeStyle = colors.line;
    ctx.beginPath();
    ctx.moveTo(PAD, y + 0.5);
    ctx.lineTo(PAD + contentW, y + 0.5);
    ctx.stroke();
    y += 12;

    const blockTop = y;
    ctx.font = CAPTION_FONT;
    ctx.fillStyle = colors.ink;
    captionLines.forEach((line, i) => ctx.fillText(line, PAD, y + 11 + i * 17));
    y += captionLines.length * 17;
    if (descLines.length) {
      y += 4;
      ctx.font = DESC_FONT;
      ctx.fillStyle = colors.inkFaint;
      descLines.forEach((line, i) => ctx.fillText(line, PAD, y + 10 + i * 15));
      y += descLines.length * 15;
    }
    const blockH = y - blockTop;

    if (handle) {
      ctx.font = HANDLE_FONT;
      const accentW = measure.measureText(handleAccent).width;
      const dividerX = PAD + contentW - handleW - 16;
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      ctx.moveTo(dividerX + 0.5, blockTop + 5);
      ctx.lineTo(dividerX + 0.5, blockTop + Math.max(blockH, 16) - 4);
      ctx.stroke();
      const baseline = blockTop + Math.max(blockH, 16) / 2 + 4;
      const rightX = PAD + contentW;
      ctx.textAlign = "right";
      ctx.fillStyle = colors.ink;
      ctx.fillText(handlePlain, rightX - accentW, baseline);
      ctx.fillStyle = colors.accent;
      ctx.fillText(handleAccent, rightX, baseline);
      ctx.textAlign = "left";
    }
  }

  out.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(payload.title ?? "chart")}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}
