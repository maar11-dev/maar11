// Selector de tema claro / oscuro
(function () {
  const root = document.documentElement;
  const opts = document.querySelectorAll("[data-theme-set]");

  function sync() {
    const current = root.getAttribute("data-theme") || "light";
    opts.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.themeSet === current))
    );
  }

  opts.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.themeSet;
      root.setAttribute("data-theme", theme);
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {}
      sync();
    });
  });

  sync();
})();

// Menú desplegable en móvil
(function () {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#nav-main");
  if (!btn || !nav) return;

  function setOpen(open) {
    btn.setAttribute("aria-expanded", String(open));
    if (open) nav.setAttribute("data-open", "true");
    else nav.removeAttribute("data-open");
  }

  btn.addEventListener("click", () => {
    setOpen(btn.getAttribute("aria-expanded") !== "true");
  });

  // Al elegir un destino, se cierra
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      btn.focus();
    }
  });

  // Si se vuelve a escritorio, el panel deja de tener sentido
  window.matchMedia("(min-width: 641px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();

// Selector de idioma ES / EN (el español vive en el HTML; aquí solo el inglés)
(function () {
  const root = document.documentElement;

  const EN = {
    // Navegación
    "skip": "Skip to content",
    "nav.about": "about",
    "nav.xp": "experience",
    "nav.projects": 'projects <span class="nav-drop__caret" aria-hidden="true">▾</span>',
    "nav.ai": "applied ai",
    "nav.web": "web development",
    "nav.games": "games",
    "nav.skills": "tools",
    "nav.contact": "contact",

    // Hero
    "hero.role":
      "Software Engineer at InferIA. I design the data layer of AI assistants, and I've built web development and game projects.",
    "hero.cta1": "View projects",
    "hero.cta2": "Get in touch",
    "hero.cta3": "Download CV",

    
    // Sobre mí
    "about.title": "About me",
    "about.p1":
      "I have a degree in Multimedia Engineering. Since October 2026 I've worked as a Software Engineer at InferIA, where I design the data layer of an AI conversational assistant. Before that I did a data and AI engineering internship there, from June to September 2026.",
    "about.p2":
      "My bachelor's thesis was a pipeline to train image-generation models with LoRA and Dreambooth. I've also built a web platform on the MEAN stack, a C++ shooter with a custom OpenGL engine and a puzzle game in assembly for the Game Boy.",
    "about.p3":
      "Right now I focus on data and applied AI: PostgreSQL modelling, ingestion of public data sources and RAG systems.",

    // Experiencia
    "xp.title": "Experience",
    "xp.span": "Jun 2026–present · 2 roles",
    "xp.now": "Current role",
    "xp.more": "What I did",
    "xp.less": "Hide details",
    "xp.swe.date": "Oct 2026–present",
    "xp.swe.role": "Software Engineer",
    "xp.swe.desc":
      "Data layer for an AI conversational assistant on WhatsApp and an open website (hybrid RAG architecture) that gives access to a municipality's health and wellbeing resources.",
    "xp.swe.d1":
      "Data model in PostgreSQL, PostGIS and pgvector for geolocated places, schedules and events that change over time, and content for semantic search.",
    "xp.swe.d2":
      "Recurring schedules, seasons and exceptions modelled so the assistant answers accurately depending on the date and time.",
    "xp.swe.d3":
      "Ingestion process with traceability of every record back to its source, duplicate detection and incremental updates, over public sources prioritized by update frequency and technical complexity.",
    "xp.swe.d4":
      "Database environment with Docker and the repository's working conventions.",
    "xp.inferia.date": "Jun–Sep 2026",
    "xp.inferia.role":
      "Data & AI Engineering Internship",
    "xp.inferia.desc":
      "Data and AI pipelines to collect, process and structure information from public data sources.",
    "xp.inferia.d1":
      "Scrapers with requests and BeautifulSoup that extract the profiles of more than 400 research groups from two universities and their projects, respecting robots.txt, with on-disk caching and retries with exponential backoff.",
    "xp.inferia.d2":
      "Ingestion of company registries, patent and trademark offices, scientific repositories and public procurement portals (XML, JSON and CSV), loaded into PostgreSQL/PostGIS through versioned Alembic migrations.",
    "xp.inferia.d3":
      "Orchestration with Apache Airflow on Docker Compose on a GPU server: DAGs with dependencies, scheduled semi-annual runs and pools to limit concurrency over the model.",
    "xp.inferia.d4":
      "Filtering, classification and extraction of structured information with local LLMs (Ollama/Llama 3.1), normalized against a controlled catalogue.",

    // Proyectos
    "projects.title": "Projects",
    "cat.ai": "Artificial intelligence",
    "cat.web": "Web development",
    "cat.games": "Games",

    // TFG
    "tfg.cap": "Images generated by the model trained with LoRA",
    "tfg.date": "Jan–Jul 2026",
    "tfg.title": "Generative image-model training pipeline",
    "tfg.sub": "Bachelor's thesis",
    "tfg.d1":
      "A complete workflow to train image-generation models under predetermined artistic styles: from the raw dataset to the fine-tuned model. Data preparation and labeling, fine-tuning with LoRA and Dreambooth on diffusion models, and stylistic-coherence evaluation at every iteration.",

    // m.ai
    "mai.cap": "The bot in production, inside WhatsApp",
    "mai.date": "Jun 2026",
    "mai.title": "m.ai",
    "mai.sub": "Note assistant on WhatsApp",
    "mai.d1":
      "A personal assistant that saves notes by text, voice or image, answers natural-language semantic searches and generates weekly summaries, all inside WhatsApp. It transcribes audio with Whisper, auto-tags with an LLM and uses a vector database with re-ranking by recency and semantic relevance.",

    // RenderBox
    "rb.cap": "The platform in production, deployed on Vercel",
    "rb.date": "Feb–May 2025",
    "rb.sub": "Web platform for digital assets",
    "rb.d1":
      "A site to centralize the publishing, management and discovery of creative resources — 2D, 3D, video and audio. Full MEAN stack with media file handling via Cloudinary and Multer, deployed on Vercel.",

    // Dopamine Chasers
    "dc.cap": "Shooter gameplay, running on a custom OpenGL engine",
    "dc.date": "Sep 2025–May 2026",
    "dc.sub": "Wave-based FPS with a custom C++ engine",
    "dc.d1":
      "A wave-based FPS shooter with escape-room-style progression, inspired by Call of Duty Zombies. Group project for the fourth year of Multimedia Engineering, built under the Project-Based Learning methodology.",
    "dc.d2":
      "Made from scratch in C++ with an ECS architecture for the game logic. It started using Raylib for rendering and was later migrated, through a facade, to a custom engine based on OpenGL.",

    // Preflop
    "pf.cap": "Title screen and gameplay in pixel art for the Game Boy",
    "pf.date": "Oct–Nov 2025",
    "pf.badge": "Audience award, GBRetroDev 2025",
    "pf.sub": "Assembly puzzles for the Game Boy",
    "pf.d1":
      "A level-based puzzle game for the Game Boy, programmed in assembly language: mechanics design, collision system, efficient tilemap rendering, state machines, scene management and enemy AI. All low-level and tuned to the real limitations of the console.",
    "pf.d2": "Audience award at GBRetroDev 2025 (Heroes of Assembly 2).",
    "pf.stack":
      "Assembly, Game Boy",

    // TRAMFIGHT
    "tf.cap": "Poster and gameplay, with original pixel art",
    "tf.date": "Jul 2025",
    "tf.badge": "Finalist, Level Up Game Jam 2025",
    "tf.sub": "Jam game built with Godot in 8 days",
    "tf.d1":
      "A complete, playable game built in Godot in just 8 days, with team version control under the real pressure of a jam. Finalist of the Level Up Game Jam 2025.",

    // Habilidades
    "skills.title": "Tools",
    "tools.data": "Data & AI",
    "tools.data.p":
      "Python, PostgreSQL, PostGIS, pgvector, Alembic, pandas, SQLite, Apache Airflow and Docker. RAG, agents, local LLMs with Ollama, vector databases, dataset creation and labeling, and fine-tuning of diffusion models with PyTorch, Diffusers and ai-toolkit.",
    "tools.web": "Web",
    "tools.web.p":
      "HTML, CSS, JavaScript, React, Angular, Node.js, Express, MongoDB, FastAPI, WhatsApp Cloud API (Meta) and Git.",
    "tools.games": "Games & graphics",
    "tools.games.p":
      "C++, OpenGL, Raylib, FMOD Studio, Godot, Unreal Engine and Game Boy assembly.",
    "tools.design": "Design",
    "tools.design.p": "Photoshop, Figma and Blender.",

    // Contacto
    "contact.title": "Contact",
    "contact.big": "If you want to talk about a project, write to me.",
    "contact.cv":
      "CV",

    // Enlaces de proyecto
    "link.play": "Play on itch.io",
    "link.repo": "View repository",

    // Textos alternativos de las imágenes
    "alt.portrait": "Portrait of Miguel Ángel Arroyo Romero de Ávila",
    "alt.tfg1": "Image generated by the thesis model: anime-style character in front of the sea",
    "alt.tfg2": "Image generated by the thesis model: anime-style portrait with dramatic lighting",
    "alt.mai1": "Conversation with m.ai on WhatsApp: saving notes and a weekly summary",
    "alt.mai2": "m.ai analysing an image and transcribing a voice note on WhatsApp",
    "alt.rb2": "Asset detail page in RenderBox, with description, tags and downloads",
    "alt.rb1": "Favourite assets gallery in RenderBox",
    "alt.dc1": "Dopamine Chasers gameplay: wave-based FPS shooter",
    "alt.dc2": "Dopamine Chasers screenshot: combat and escape-room-style progression",
    "alt.pf1": "Preflop screenshot: puzzle screen with a tilemap in the Game Boy green palette",
    "alt.pf2": "Preflop screenshot: level with enemies and puzzle mechanics on the Game Boy",
    "alt.tf1": "TRAMFIGHT: L2 Smackdown pixel art poster, with a tram and characters fighting",
    "alt.tf2": "TRAMFIGHT gameplay: a fight inside the tram in pixel art",

    // Pie
    "footer.by": "Miguel Ángel Arroyo, 2026",
  };

  const TITLE = {
    es: "Miguel Ángel Arroyo — Ingeniero de Software",
    en: "Miguel Ángel Arroyo — Software Engineer",
  };

  const nodes = document.querySelectorAll("[data-i18n]");
  const es = new Map();
  nodes.forEach((el) => es.set(el, el.innerHTML));

  // Textos alternativos: el español vive en el atributo alt
  const alts = document.querySelectorAll("[data-i18n-alt]");
  const esAlt = new Map();
  alts.forEach((el) => esAlt.set(el, el.getAttribute("alt")));

  // Enlaces con versión propia en inglés (el CV): se guarda el destino español
  const links = document.querySelectorAll("[data-href-en]");
  const esHref = new Map();
  links.forEach((el) => esHref.set(el, el.getAttribute("href")));

  const opts = document.querySelectorAll("[data-lang-set]");

  function apply(lang) {
    nodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (lang === "en" && EN[key] != null) el.innerHTML = EN[key];
      else el.innerHTML = es.get(el);
    });
    alts.forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      el.setAttribute("alt", lang === "en" && EN[key] != null ? EN[key] : esAlt.get(el));
    });
    links.forEach((el) => {
      el.setAttribute(
        "href",
        lang === "en" ? el.dataset.hrefEn : esHref.get(el)
      );
    });
    root.setAttribute("lang", lang);
    document.title = TITLE[lang] || TITLE.es;
    opts.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.langSet === lang))
    );
  }

  let saved = "es";
  try {
    saved = localStorage.getItem("lang") || "es";
  } catch (e) {}

  opts.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.langSet;
      try {
        localStorage.setItem("lang", lang);
      } catch (e) {}
      apply(lang);
    });
  });

  apply(saved);
})();

// Aparición al hacer scroll con escalonado por sección
(function () {
  const reveals = document.querySelectorAll(".reveal");

  // Modo captura (?capture): muestra todo sin animaciones, útil para snapshots
  if (window.location.search.includes("capture")) {
    document.documentElement.classList.add("capture");
    reveals.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  // Retraso escalonado entre hermanos .reveal visibles a la vez
  document.querySelectorAll("section").forEach((section) => {
    section.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${Math.min(i * 90, 360)}ms`);
    });
  });

  // Índice de cada hijo para las cascadas internas (párrafos, etiquetas, enlaces)
  document.querySelectorAll(".about__text, .xp__stack, .contact__links").forEach((list) => {
    Array.from(list.children).forEach((el, i) => el.style.setProperty("--i", i));
  });

  reveals.forEach((el) => observer.observe(el));
})();

// Puerta de entrada: al terminar de abrirse se libera el scroll
(function () {
  const root = document.documentElement;
  if (!root.classList.contains("intro")) return;
  try {
    sessionStorage.setItem("gate", "1");
  } catch (e) {}
  setTimeout(() => root.classList.add("gate-open"), 1450);
})();

// Cabecera compacta, barra de progreso y sección activa en el menú
(function () {
  const root = document.documentElement;
  const topbar = document.querySelector(".topbar");
  const links = Array.from(document.querySelectorAll('.topbar__nav > a[href^="#"], .nav-drop__trigger'));
  const targets = links
    .map((a) => [a, document.querySelector(a.getAttribute("href"))])
    .filter(([, el]) => el);

  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    topbar.classList.toggle("is-scrolled", y > 40);
    root.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);

    const probe = y + window.innerHeight * 0.35;
    let current = null;
    targets.forEach(([a, el]) => {
      if (el.offsetTop <= probe) current = a;
    });
    links.forEach((a) => a.classList.toggle("is-current", a === current));
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
})();

// Movimiento: el retrato sigue al ratón y los rayos se desplazan con el scroll
(function () {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (still) return;

  const hero = document.querySelector(".hero");
  const portrait = document.querySelector(".hero__portrait");
  const burst = document.querySelector(".sunburst");

  if (hero && portrait && fine) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      portrait.style.setProperty("--px", px.toFixed(3));
      portrait.style.setProperty("--py", py.toFixed(3));
    });
    hero.addEventListener("pointerleave", () => {
      portrait.style.setProperty("--px", 0);
      portrait.style.setProperty("--py", 0);
    });
  }

  if (burst) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = Math.min(window.scrollY, window.innerHeight);
        burst.style.setProperty("--sy", `${(y * 0.25).toFixed(1)}px`);
      });
    }, { passive: true });
  }

})();
