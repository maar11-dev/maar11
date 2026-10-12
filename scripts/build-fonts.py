"""Genera las fuentes autoalojadas del portfolio en fonts/ (woff2, subconjunto latino).

Uso:
    pip install fonttools brotli
    python scripts/build-fonts.py

Qué hace:
  1. Descarga los originales de google/fonts (licencia OFL) a scripts/.font-cache/.
  2. Recorta los ejes variables a los pesos que usa la web:
       Bodoni Moda normal  -> wght 400-700, con el eje de tamaño óptico (opsz) completo
       Bodoni Moda itálica -> estática en wght 600 y opsz 20 (solo el logotipo)
       Jost                -> wght 400-500
       Federo              -> estática
  3. Deja solo el subconjunto latino (ASCII, Latin-1 con acentos, ñ, ¿, ¡, ·, comillas,
     guiones, …, €) más los símbolos que aparecen en la web, en woff2 y sin hinting.
  4. Imprime los descriptores de las fuentes de respaldo (size-adjust, ascent-override,
     descent-override, line-gap-override) calculados contra Times New Roman y Arial.

Si se añade un peso o un estilo en el CSS, hay que ajustar FONTS y volver a ejecutarlo.
"""

import io
import os
import re
import shutil
import urllib.request
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / ".font-cache"
OUT = ROOT / "fonts"
GF = "https://raw.githubusercontent.com/google/fonts/main/ofl/"

# Latín básico + Latin-1 (acentos, ñ, ¿, ¡, ·, «») + puntuación tipográfica + símbolos de la web
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + [0x152, 0x153, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E,
       0x2022, 0x2026, 0x20AC, 0x2122, 0x25BE, 0x2600, 0x263E]
)

# salida, origen, ejes a fijar o recortar (None = estática)
FONTS = [
    ("bodoni-moda.woff2", "bodonimoda/BodoniModa%5Bopsz,wght%5D.ttf", {"wght": (400, 700)}),
    # Solo el logotipo, siempre a 18-22 px: estática en wght 600 y tamaño óptico 20
    ("bodoni-moda-italic-600.woff2", "bodonimoda/BodoniModa-Italic%5Bopsz,wght%5D.ttf", {"wght": 600, "opsz": 20}),
    ("jost.woff2", "jost/Jost%5Bwght%5D.ttf", {"wght": (400, 500)}),
    ("federo.woff2", "federo/Federo-Regular.ttf", None),
]
LICENSES = {"bodonimoda": "OFL-BodoniModa.txt", "jost": "OFL-Jost.txt", "federo": "OFL-Federo.txt"}

# Respaldo: fuente de sistema cuyas métricas se ajustan a cada familia
FALLBACKS = {
    "Bodoni Moda": ("bodoni-moda.woff2", {"wght": 500, "opsz": 48}, "Times New Roman", ["times.ttf", "Times New Roman.ttf"]),
    "Jost": ("jost.woff2", {"wght": 400}, "Arial", ["arial.ttf", "Arial.ttf"]),
    "Federo": ("federo.woff2", None, "Arial", ["arial.ttf", "Arial.ttf"]),
}
SYSTEM_FONT_DIRS = [Path("C:/Windows/Fonts"), Path("/Library/Fonts"), Path("/System/Library/Fonts/Supplemental")]



def page_text():
    """Texto visible de la web (ES en index.html y EN en js/main.js) para medir anchos reales."""
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.S)
    html = re.sub(r"<head>.*?</head>", " ", html, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", html)
    js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")
    en = re.findall(r'^ {4}"[\w.]+":\s*["\'](.*?)["\'],?$', js, flags=re.M)
    return re.sub(r"\s+", " ", text + " " + " ".join(en)).strip()


def fetch(path):
    CACHE.mkdir(parents=True, exist_ok=True)
    dest = CACHE / path.replace("%5B", "[").replace("%5D", "]").replace("/", "__")
    if not dest.exists():
        print("descargando", path)
        urllib.request.urlretrieve(GF + path, dest)
    return dest


def build(name, src, axes):
    font = TTFont(fetch(src), lazy=False)
    if axes:
        # Se guarda y se reabre para que el subconjunto parta de tablas ya resueltas
        buf = io.BytesIO()
        instancer.instantiateVariableFont(font, axes).save(buf)
        buf.seek(0)
        font = TTFont(buf, lazy=False)
    opts = Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "clig", "calt", "ccmp", "locl", "mark", "mkmk"]
    opts.hinting = False
    opts.desubroutinize = True
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    sub = Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    font.flavor = "woff2"
    font.save(OUT / name)
    covered = sorted(set(font.getBestCmap()))
    missing = [f"U+{u:04X}" for u in (0x25BE, 0x2600, 0x263E) if u not in covered]
    print(f"{name:30} {os.path.getsize(OUT / name) / 1024:6.1f} KB  {len(covered)} glifos"
          + (f"  (sin {', '.join(missing)}: usan la fuente del sistema)" if missing else ""))


def avg_width(font, text):
    cmap, hmtx = font.getBestCmap(), font["hmtx"]
    widths = [hmtx[cmap[ord(c)]][0] for c in text if ord(c) in cmap]
    return sum(widths) / len(widths) / font["head"].unitsPerEm


def find_system_font(names):
    for d in SYSTEM_FONT_DIRS:
        for n in names:
            if (d / n).exists():
                return d / n
    return None


def fallback_metrics():
    sample = page_text()
    print("\nDescriptores para las fuentes de respaldo:")
    for family, (file, axes, local, names) in FALLBACKS.items():
        sys_path = find_system_font(names)
        if not sys_path:
            print(f"  {family}: no se encontró {local} en este sistema")
            continue
        target = TTFont(OUT / file)
        if axes and "fvar" in target:
            target = instancer.instantiateVariableFont(target, axes)
        system = TTFont(sys_path)
        size_adjust = avg_width(target, sample) / avg_width(system, sample)
        upm, hhea = target["head"].unitsPerEm, target["hhea"]
        pct = lambda v: f"{abs(v) / upm / size_adjust * 100:.2f}%"
        print(f"  {family} <- {local}: size-adjust: {size_adjust * 100:.2f}%; "
              f"ascent-override: {pct(hhea.ascent)}; descent-override: {pct(hhea.descent)}; "
              f"line-gap-override: {pct(hhea.lineGap)};")


def main():
    OUT.mkdir(exist_ok=True)
    for name, src, axes in FONTS:
        build(name, src, axes)
    for folder, dest in LICENSES.items():
        shutil.copyfile(fetch(f"{folder}/OFL.txt"), OUT / dest)
    fallback_metrics()


if __name__ == "__main__":
    main()
