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
      "Software Engineer at InferIA since October 2026. I design the data layer of AI assistants, and I've built web development and game projects.",
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
    "xp.swe.date": "october 2026 — present",
    "xp.swe.role": "Software Engineer",
    "xp.swe.desc":
      "I design the data layer of an AI conversational assistant on WhatsApp and an open website (hybrid RAG architecture), aimed at giving access to a municipality's health and wellbeing resources.",
    "xp.swe.d1":
      "Data model design on PostgreSQL, PostGIS and pgvector for heterogeneous information: geolocated places, schedules and events that change over time, and content for semantic search.",
    "xp.swe.d2":
      "Modelling of recurring schedules, seasons and exceptions, so the assistant answers accurately depending on the date and time.",
    "xp.swe.d3":
      "Planning the collection of multiple public data sources, prioritized by update frequency and technical complexity.",
    "xp.swe.d4":
      "Ingestion process design: traceability of every record back to its source, duplicate detection and incremental updates.",
    "xp.swe.d5":
      "Setting up the database environment with Docker and defining the repository's working conventions.",
    "xp.inferia.date": "june — september 2026",
    "xp.inferia.role": "Internship — Data & AI Engineer",
    "xp.inferia.desc":
      "Development of data and artificial intelligence pipelines for the collection, processing and structuring of information coming from public data sources.",
    "xp.inferia.d1":
      "Design and implementation of ingestion processes that integrate a range of public data sources (company registries, patent and trademark offices, scientific repositories and public procurement portals) in heterogeneous formats (XML, JSON, CSV).",
    "xp.inferia.d2":
      "Orchestration of the full workflow with Apache Airflow deployed via Docker Compose on a GPU server: DAGs with task dependencies, scheduled semi-annual runs and concurrency control over the model through pools.",
    "xp.inferia.d3":
      "Development of web scrapers with requests and BeautifulSoup to extract the profiles of more than 400 research groups from two universities along with their projects, respecting robots.txt and rate-limiting requests, with on-disk caching and retries with exponential backoff.",
    "xp.inferia.d4":
      "Application of local language models (LLMs) with Ollama/Llama 3.1 to filter, classify and extract structured information, normalizing it against a controlled catalogue.",
    "xp.inferia.d5":
      "Development of robust data-engineering processes: batch processing of large volumes, resumable caches and idempotent loads.",
    "xp.inferia.d6":
      "Data modelling and loading into PostgreSQL/PostGIS through versioned migrations with Alembic.",
    "xp.inferia.d7":
      "Feasibility studies of data sources and technical documentation of the processes developed.",

    // Proyectos
    "projects.title": "Projects",
    "cat.ai": "Artificial intelligence",
    "cat.web": "Web development",
    "cat.games": "Games",

    // TFG
    "tfg.cap": "real model outputs — style trained with LoRA",
    "tfg.date": "jan — jul 2026",
    "tfg.title": "Generative image-model training pipeline",
    "tfg.sub": "bachelor's degree thesis",
    "tfg.d1":
      "A complete workflow to train image-generation models under predetermined artistic styles: from the raw dataset to the fine-tuned model. Data preparation and labeling, fine-tuning with LoRA and Dreambooth on diffusion models, and stylistic-coherence evaluation at every iteration.",

    // m.ai
    "mai.cap": "the bot in production, inside WhatsApp",
    "mai.date": "june 2026",
    "mai.title": "m.ai — note assistant over WhatsApp",
    "mai.sub": "bot with a full rag architecture",
    "mai.d1":
      "A personal assistant that saves notes by text, voice or image, answers natural-language semantic searches and generates smart summaries, all inside WhatsApp. It transcribes audio with Whisper, auto-tags with an LLM and uses a vector database with re-ranking by recency and semantic relevance.",

    // RenderBox
    "rb.cap": "the platform in production, deployed on Vercel",
    "rb.date": "feb — may 2025",
    "rb.sub": "web platform for digital assets",
    "rb.d1":
      "A site to centralize the publishing, management and discovery of creative resources — 2D, 3D, video and audio. Full MEAN stack with media file handling via Cloudinary and Multer, deployed on Vercel.",

    // Dopamine Chasers
    "dc.cap": "shooter gameplay — custom engine over OpenGL",
    "dc.date": "sep 2025 — may 2026",
    "dc.sub": "wave-based fps with a custom c++ engine",
    "dc.d1":
      "A wave-based FPS shooter with escape-room-style progression, inspired by Call of Duty Zombies. Group project for the fourth year of Multimedia Engineering, built under the Project-Based Learning methodology.",
    "dc.d2":
      "Made from scratch in C++ with an ECS architecture for the game logic. It started using Raylib for rendering and was later migrated, through a facade, to a custom engine based on OpenGL.",

    // Preflop
    "pf.cap": "title screen and gameplay — pixel art for Game Boy",
    "pf.date": "oct — nov 2025",
    "pf.badge": "Audience award, GBRetroDev 2025",
    "pf.sub": "assembly puzzles for Game Boy",
    "pf.d1":
      "A level-based puzzle game for the Game Boy, programmed in assembly language: mechanics design, collision system, efficient tilemap rendering, state machines, scene management and enemy AI. All low-level and tuned to the real limitations of the console.",
    "pf.d2": "Audience award at GBRetroDev 2025 (Heroes of Assembly 2).",
    "pf.tag.asm": "Assembly",
    "pf.tag.low": "Low-level",

    // TRAMFIGHT
    "tf.cap": "poster and gameplay, original pixel art",
    "tf.date": "july 2025",
    "tf.badge": "Finalist, Level Up Game Jam 2025",
    "tf.sub": "jam game built with Godot in 8 days",
    "tf.d1":
      "A complete, playable game built in Godot in just 8 days, with team version control under the real pressure of a jam. Finalist of the Level Up Game Jam 2025.",
    "tf.tag.days": "8 days",

    // Habilidades
    "skills.title": "Tools",
    "skill.ai": "Applied AI",
    "skill.data": "Data engineering",
    "skill.web": "Web development",
    "skill.game": "Games",
    "skill.art": "Design &amp; art",
    "skill.soft": "Soft skills",
    "sk.ai.agents": "Agents",
    "sk.ai.local": "Local LLMs · Ollama",
    "sk.ai.vector": "Vector databases",
    "sk.data.pipelines": "Ingestion pipelines",
    "sk.data.batch": "Batch processing",
    "sk.ai.prompt": "Technical prompt engineering",
    "sk.ai.dataset": "Dataset creation",
    "sk.ai.labeling": "Data labeling",
    "sk.web.meta": "Meta cloud API",
    "sk.game.asm": "Assembly",
    "sk.soft.agile": "Agile methodologies",
    "sk.soft.auto": "Self-directed learning",
    "sk.soft.aesthetic": "Aesthetic sense",
    "sk.soft.problem": "Technical problem-solving",

    // Contacto
    "contact.title": "Contact",
    "contact.big": "If you want to talk about a project, write to me.",
    "contact.cv": "Download CV",

    // Enlaces de proyecto
    "link.play": "play on itch.io",
    "link.repo": "view repository",

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

// Movimiento: el retrato sigue al ratón, los rayos se desplazan con el scroll
// y los paneles deco se iluminan donde está el puntero
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

  if (fine) {
    document.querySelectorAll(".deco-card, .skillset, .about__facts").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }
})();

// Orden de aparición de las fichas de tecnologías
document.querySelectorAll(".skillset").forEach((set) => {
  set.querySelectorAll(".tech").forEach((tile, i) => tile.style.setProperty("--i", i));
});
