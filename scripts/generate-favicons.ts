import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SVG_PATH = join(ROOT, "public", "favicon.svg");
const OUT_DIR = join(ROOT, "public");

const ICO_SIZES = [16, 32, 48];
const PNG_SIZES: Array<{ name: string; size: number }> = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

const svg = readFileSync(SVG_PATH, "utf8");

function renderPng(size: number): Buffer {
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  return Buffer.from(png);
}

function packIco(pngs: Array<{ size: number; data: Buffer }>): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  const entries: Buffer[] = [];
  const blobs: Buffer[] = [];
  let offset = 6 + pngs.length * 16;

  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size < 256 ? size : 0, 0); // width
    entry.writeUInt8(size < 256 ? size : 0, 1); // height
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
    blobs.push(data);
  }

  return Buffer.concat([header, ...entries, ...blobs]);
}

const ico = packIco(ICO_SIZES.map((size) => ({ size, data: renderPng(size) })));
writeFileSync(join(OUT_DIR, "favicon.ico"), ico);

for (const { name, size } of PNG_SIZES) {
  writeFileSync(join(OUT_DIR, name), renderPng(size));
  console.log(`generated public/${name} (${size}x${size})`);
}

console.log(
  `generated public/favicon.ico (${ICO_SIZES.join("/")} px PNG-in-ICO)`,
);
