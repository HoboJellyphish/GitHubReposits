// Generates the PWA icons (navy circle with a white "M") with zero dependencies.
// Runs automatically before `dev` and `build` (see package.json).
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "icons");

const NAVY = [15, 45, 86]; // #0f2d56
const WHITE = [255, 255, 255];

// CRC32 (PNG chunk checksums)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function buildPng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  // "M" stroke geometry
  const padX = size * 0.27;
  const x0 = padX;
  const x1 = size - padX;
  const yTop = size * 0.33;
  const yBot = size * 0.67;
  const midX = size / 2;
  const midY = size * 0.6;
  const half = size * 0.055; // half stroke width
  const segs = [
    [x0, yBot, x0, yTop],
    [x0, yTop, midX, midY],
    [midX, midY, x1, yTop],
    [x1, yTop, x1, yBot],
  ];

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const idx = rowStart + 1 + x * 4;
      const inCircle = (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
      if (!inCircle) {
        raw[idx] = raw[idx + 1] = raw[idx + 2] = raw[idx + 3] = 0; // transparent
        continue;
      }
      let onM = false;
      for (const [ax, ay, bx, by] of segs) {
        if (distToSegment(x, y, ax, ay, bx, by) <= half) {
          onM = true;
          break;
        }
      }
      const [rr, gg, bb] = onM ? WHITE : NAVY;
      raw[idx] = rr;
      raw[idx + 1] = gg;
      raw[idx + 2] = bb;
      raw[idx + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(resolve(OUT_DIR, `icon-${size}.png`), buildPng(size));
}
// A small maskable-friendly apple touch icon reuses the 192 output name.
console.log("✓ Generated PWA icons in public/icons");
