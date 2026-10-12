#!/usr/bin/env node
// Genera los logotipos de tecnologías como <symbol> en el sprite de index.html.
//
// Uso:
//   npm run build-icons
//
// Busca en index.html cada referencia <use href="#i-slug"> y escribe el símbolo de ese
// slug (de simple-icons, licencia CC0) entre los comentarios iconos:inicio e iconos:fin.
// Para añadir un logotipo basta con poner su <use> en la página y volver a ejecutarlo;
// los slugs están en https://simpleicons.org. Si un logotipo no está en simple-icons, se
// dibuja en scripts/icons/<slug>.svg (contenido de un viewBox 24×24, sin la etiqueta <svg>)
// y tiene prioridad sobre el de la librería.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as icons from "simple-icons";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "index.html");
const START = "<!-- iconos:inicio -->";
const END = "<!-- iconos:fin -->";

const html = await readFile(file, "utf8");
const a = html.indexOf(START);
const b = html.indexOf(END);
if (a === -1 || b === -1) throw new Error(`Faltan los comentarios ${START} / ${END} en index.html`);

const indent = html.slice(html.lastIndexOf("\n", a) + 1, a);
const slugs = [...new Set([...html.matchAll(/href="#i-([a-z0-9]+)"/g)].map((m) => m[1]))].sort();
const bySlug = Object.fromEntries(Object.values(icons).map((i) => [i.slug, i]));

// Logotipos propios (los que simple-icons no tiene), en 24×24 y sin la etiqueta <svg>
const customDir = path.join(root, "scripts", "icons");
const custom = async (slug) => {
  try {
    const raw = await readFile(path.join(customDir, `${slug}.svg`), "utf8");
    return raw.replace(/<!--[\s\S]*?-->/g, "").replace(/\s*\n\s*/g, "").trim();
  } catch {
    return null;
  }
};

const symbols = [];
for (const slug of slugs) {
  const own = await custom(slug);
  const icon = bySlug[slug];
  if (!own && !icon) throw new Error(`No hay logotipo para "${slug}": ni en simple-icons ni en scripts/icons/`);
  console.log(`${slug.padEnd(16)} ${own ? "scripts/icons/" + slug + ".svg" : icon.title}`);
  const body = own ?? `<path d="${icon.path}" />`;
  symbols.push(`${indent}<symbol id="i-${slug}" viewBox="0 0 24 24">${body}</symbol>`);
}

const out = html.slice(0, a + START.length) + "\n" + symbols.join("\n") + "\n" + indent + html.slice(b);
await writeFile(file, out);
console.log(`${symbols.length} logotipos en el sprite`);
