#!/usr/bin/env node
// Genera versiones AVIF y WebP de las imágenes del portfolio en images/opt/.
//
// Uso:
//   npm run optimize-images            procesa todo lo que hay en scripts/images.json
//   npm run optimize-images -- --force   regenera aunque las salidas estén al día
//   npm run optimize-images -- --detect images/nueva.png
//                                      analiza si una imagen es pixel art escalado y
//                                      propone su entrada para images.json
//
// Cada entrada de scripts/images.json es una de estas dos:
//   { "src": "foto.jpg", "widths": [400, 800] }
//       Foto o captura: se reduce a cada ancho (nunca se amplía) con compresión con pérdida.
//   { "src": "juego.png", "pixel": { "scale": 4, "offset": [3, 2] }, "factors": [2, 3, 4] }
//       Pixel art: se recorta a la rejilla, se lleva a su resolución nativa (÷ scale) con
//       vecino más próximo y se amplía solo por factores enteros, sin pérdida. El AVIF solo
//       se conserva si pesa menos que el WebP en todos los anchos.
//       Con "scale": 1 la imagen no se reescala (pixel art ya escalado de forma irregular).
//
// Al terminar imprime el srcset de cada imagen para pegarlo en el <picture>.

import { readFile, mkdir, stat, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = path.join(root, "images");
const outDir = path.join(imagesDir, "opt");

const LOSSY = { avif: { quality: 52, effort: 6 }, webp: { quality: 80, effort: 6 } };
const LOSSLESS = { avif: { lossless: true, effort: 6 }, webp: { lossless: true, effort: 6 } };

const args = process.argv.slice(2);
const force = args.includes("--force");

const base = (src) => path.basename(src, path.extname(src)).toLowerCase();

async function isFresh(input, outputs) {
  if (force) return false;
  const { mtimeMs } = await stat(input);
  try {
    const times = await Promise.all(outputs.map((o) => stat(o).then((s) => s.mtimeMs)));
    return times.every((t) => t >= mtimeMs);
  } catch {
    return false;
  }
}

async function writeFormats(pipeline, name, width, encoders) {
  const files = [];
  for (const [fmt, opts] of Object.entries(encoders)) {
    const file = path.join(outDir, `${name}-${width}.${fmt}`);
    await pipeline.clone()[fmt](opts).toFile(file);
    files.push(file);
  }
  return files;
}

// Foto o captura: un tamaño por ancho pedido, sin ampliar nunca el original
async function processPhoto(entry) {
  const input = path.join(imagesDir, entry.src);
  const { width: orig } = await sharp(input).metadata();
  const widths = [...new Set(entry.widths.map((w) => Math.min(w, orig)))].sort((a, b) => a - b);
  const name = base(entry.src);
  const outputs = widths.flatMap((w) => ["avif", "webp"].map((f) => path.join(outDir, `${name}-${w}.${f}`)));
  if (!(await isFresh(input, outputs))) {
    for (const w of widths) {
      await writeFormats(sharp(input).resize({ width: w, kernel: "lanczos3" }), name, w, LOSSY);
    }
  }
  return { name, widths, formats: ["avif", "webp"] };
}

// Pixel art: resolución nativa exacta y ampliaciones enteras con vecino más próximo
async function processPixel(entry) {
  const input = path.join(imagesDir, entry.src);
  const { scale = 1, offset = [0, 0] } = entry.pixel;
  const meta = await sharp(input).metadata();
  const nativeW = Math.floor((meta.width - offset[0]) / scale);
  const nativeH = Math.floor((meta.height - offset[1]) / scale);
  const factors = entry.factors ?? [1];
  const name = base(entry.src);
  const widths = factors.map((f) => nativeW * f);
  const outputs = widths.flatMap((w) => ["avif", "webp"].map((f) => path.join(outDir, `${name}-${w}.${f}`)));

  const webps = outputs.filter((o) => o.endsWith(".webp"));
  if (!(await isFresh(input, webps))) {
    const native = await sharp(input)
      .extract({ left: offset[0], top: offset[1], width: nativeW * scale, height: nativeH * scale })
      .resize({ width: nativeW, height: nativeH, kernel: "nearest" })
      .png()
      .toBuffer();
    for (const f of factors) {
      const pipeline = sharp(native).resize({ width: nativeW * f, height: nativeH * f, kernel: "nearest" });
      await writeFormats(pipeline, name, nativeW * f, LOSSLESS);
    }
    // En colores planos el AVIF sin pérdida suele pesar más que el WebP: solo se queda si gana en todos los anchos
    const sizes = await Promise.all(outputs.map((o) => stat(o).then((s) => s.size)));
    const avifWins = widths.every((_, i) => sizes[i * 2] < sizes[i * 2 + 1]);
    if (!avifWins) await Promise.all(outputs.filter((o) => o.endsWith(".avif")).map((o) => rm(o)));
  }
  const hasAvif = await stat(outputs[0]).then(() => true, () => false);
  return { name, widths, formats: hasAvif ? ["avif", "webp"] : ["webp"] };
}

// Busca el tamaño de "píxel lógico" y el desplazamiento de la rejilla de una imagen
async function detect(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const same = (a, b) => data[a] === data[b] && data[a + 1] === data[b + 1] && data[a + 2] === data[b + 2];
  let best = null;
  for (let k = 12; k >= 2; k--) {
    for (let ox = 0; ox < k; ox++) {
      for (let oy = 0; oy < k; oy++) {
        let bad = 0, total = 0;
        for (let by = oy; by + k <= h; by += k) {
          for (let bx = ox; bx + k <= w; bx += k) {
            const first = (by * w + bx) * c;
            total++;
            outer: for (let j = 0; j < k; j++) {
              for (let i = 0; i < k; i++) {
                if (!same(first, ((by + j) * w + bx + i) * c)) { bad++; break outer; }
              }
            }
          }
        }
        const ratio = bad / total;
        if (ratio < 0.01 && (!best || k > best.k)) best = { k, ox, oy, ratio };
      }
    }
    if (best) break;
  }
  const src = path.relative(imagesDir, file).split(path.sep).join("/");
  if (!best) {
    console.log(`${src}: no hay una rejilla entera. Si es pixel art, no se reescala:`);
    console.log(JSON.stringify({ src, pixel: { scale: 1 }, factors: [1] }));
  } else {
    console.log(`${src}: píxel lógico de ${best.k} px, desplazamiento [${best.ox}, ${best.oy}] (${(best.ratio * 100).toFixed(2)} % de bloques irregulares)`);
    console.log(JSON.stringify({ src, pixel: { scale: best.k, offset: [best.ox, best.oy] }, factors: [2, 3, 4] }));
  }
}

async function main() {
  const detectIdx = args.indexOf("--detect");
  if (detectIdx !== -1) {
    for (const f of args.slice(detectIdx + 1).filter((a) => !a.startsWith("--"))) await detect(path.resolve(f));
    return;
  }

  const manifest = JSON.parse(await readFile(path.join(root, "scripts", "images.json"), "utf8"));
  await mkdir(outDir, { recursive: true });

  for (const entry of manifest.images) {
    const r = entry.pixel ? await processPixel(entry) : await processPhoto(entry);
    const srcset = (fmt) => r.widths.map((w) => `images/opt/${r.name}-${w}.${fmt} ${w}w`).join(", ");
    console.log(`\n${entry.src}${entry.pixel ? " (pixel art)" : ""}`);
    for (const fmt of r.formats) console.log(`  ${fmt}: ${srcset(fmt)}`);
    if (!r.formats.includes("avif")) console.log("  (sin AVIF: el WebP sin pérdida pesa menos)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
