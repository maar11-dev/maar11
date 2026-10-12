"""Separa el logotipo de InferIA en dos máscaras con transparencia para colorearlas desde CSS.

Uso:
    python scripts/build-logo.py

El original (images/inferia-logo-final.jpg) es azul marino y azul claro sobre blanco. Cada
píxel es una mezcla de blanco con uno de los dos colores, así que:
  - el tono se reconoce por (B - R) / (255 - R), que no cambia al mezclar con blanco
    (≈0.2 en el marino, ≈0.8 en el azul claro);
  - la cobertura sale de cuánto se aleja R del blanco.
Genera images/inferia-logo-ink.png ("Infer" y la barra) e images/inferia-logo-accent.png
("IA" y la flecha), blancas con canal alfa, recortadas al contorno del logotipo.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images" / "inferia-logo-final.jpg"
NAVY_R, BLUE_R = 13, 94  # canal rojo de cada color del original
NOISE = 0.05  # por debajo, ruido del JPEG sobre el blanco
PAD = 4


def main():
    im = Image.open(SRC).convert("RGB")
    w, h = im.size
    ink = Image.new("L", (w, h))
    accent = Image.new("L", (w, h))
    src, a_ink, a_acc = im.load(), ink.load(), accent.load()
    for y in range(h):
        for x in range(w):
            r, _, b = src[x, y]
            if r >= 255:
                continue
            hue = (b - r) / (255 - r)
            if hue > 0.5:
                cov = (255 - r) / (255 - BLUE_R)
                target = a_acc
            else:
                cov = (255 - r) / (255 - NAVY_R)
                target = a_ink
            cov = min(max(cov, 0.0), 1.0)
            if cov > NOISE:
                target[x, y] = round(cov * 255)

    left, top, right, bottom = Image.merge("LA", (ink, accent)).getbbox() or (0, 0, w, h)
    box = (max(left - PAD, 0), max(top - PAD, 0), min(right + PAD, w), min(bottom + PAD, h))
    for name, alpha in (("ink", ink), ("accent", accent)):
        out = Image.new("RGBA", (box[2] - box[0], box[3] - box[1]), (255, 255, 255, 0))
        out.putalpha(alpha.crop(box))
        dest = ROOT / "images" / f"inferia-logo-{name}.png"
        out.save(dest, optimize=True)
        print(f"{dest.relative_to(ROOT)}  {out.size[0]}x{out.size[1]}  {dest.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
