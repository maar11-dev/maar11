# maar.11 — Portfolio

Portfolio personal de **Miguel Ángel Arroyo Romero de Ávila**, Ingeniero de Software
en InferIA. Proyectos de datos e IA, desarrollo web y videojuegos.

**→ [maar11-dev.github.io/maar11](https://maar11-dev.github.io/maar11/)**

![Portada del portfolio](images/og-cover.jpg)

## Qué hay dentro

| Sección | Contenido |
| --- | --- |
| Sobre mí | Contexto profesional y enfoque de trabajo |
| Experiencia | Ingeniero de Software en InferIA (y prácticas previas de Ingeniería de Datos e IA) |
| Proyectos | IA aplicada (TFG, m.ai), web (RenderBox) y videojuegos (Dopamine Chasers, Preflop, TRAMFIGHT) |
| Herramientas | Tecnologías agrupadas por área |
| Contacto | Email, LinkedIn, GitHub y CV |

## Stack

HTML, CSS y JavaScript sin dependencias ni paso de compilación. Se sirve tal cual
desde GitHub Pages.

- **Estilo:** Art Deco en negro y oro; el ornamento vive en la portada y el resto es sobrio
- **Tipografías:** Bodoni Moda (títulos), Federo (rótulos), Jost (texto), autoalojadas en `fonts/`
  como subconjunto latino en woff2; se regeneran con `python scripts/build-fonts.py`
- **Temas:** claro y oscuro, con la preferencia guardada en `localStorage` y aplicada
  antes del primer pintado para evitar parpadeo
- **Idiomas:** español e inglés; el español vive en el HTML y las traducciones en
  `js/main.js`, enlazadas por atributos `data-i18n`
- **Animaciones:** aparición al hacer scroll con `IntersectionObserver`, respetando
  `prefers-reduced-motion`

## Estructura

```
index.html          Todo el contenido y las traducciones al español
css/styles.css      Estilos, tokens de color y responsive
js/main.js          Tema, idioma, menú móvil y animaciones de entrada
images/             Capturas de proyectos, logos y portada para compartir
```

## Desarrollo

No hace falta instalar nada. Para verlo en local con rutas absolutas correctas:

```bash
python -m http.server 8000
```

Y abrir <http://localhost:8000>.

## Imágenes

Las imágenes se sirven con `<picture>`: AVIF y WebP en varios anchos (`images/opt/`) y el
original como respaldo. Para añadir una imagen nueva:

1. Copia el original en `images/`.
2. Añade su entrada en `scripts/images.json` con los anchos que necesite
   (`"widths": [400, 800]`). Si es pixel art, analízala primero:
   `npm run optimize-images -- --detect images/nueva.png` y pega la entrada que propone.
3. Ejecuta `npm install` (solo la primera vez) y `npm run optimize-images`. El script
   imprime el `srcset` de cada imagen para el `<picture>`.

El pixel art se escala solo por múltiplos enteros con vecino más próximo, sin pérdida, y en
la página lleva la clase `pixel` (`image-rendering: pixelated`). Su AVIF se descarta cuando
pesa más que el WebP.

El logotipo de InferIA de Experiencia se pinta con dos máscaras PNG
(`images/inferia-logo-ink.png` e `images/inferia-logo-accent.png`) para tomar los colores
del tema. Se generan desde `images/inferia-logo-final.jpg` con `python scripts/build-logo.py`.

Añadiendo `?capture` a la URL se desactivan las animaciones de entrada, útil para
hacer capturas de pantalla.
