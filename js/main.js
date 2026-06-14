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

// Selector de idioma ES / EN (el español vive en el HTML; aquí solo el inglés)
(function () {
  const root = document.documentElement;

  const EN = {
    // Navegación
    "nav.about": "about",
    "nav.projects": 'projects <span class="nav-drop__caret" aria-hidden="true">▾</span>',
    "nav.ai": '<span class="nav-drop__dot nav-drop__dot--ai" aria-hidden="true"></span>applied ai',
    "nav.web": '<span class="nav-drop__dot nav-drop__dot--web" aria-hidden="true"></span>web development',
    "nav.games": '<span class="nav-drop__dot nav-drop__dot--game" aria-hidden="true"></span>games',
    "nav.skills": "skills",
    "nav.contact": "contact",

    // Hero
    "hero.role":
      '<strong class="hero__role-lead">Multimedia Engineer.</strong> I build <em class="accent-ink">applied AI</em> systems, <em class="accent-ink">web</em> experiences and <em class="accent-ink">games</em> where the tech serves the aesthetics.',
    "hero.status": "available for work and internships",
    "hero.cta1": 'View projects <span aria-hidden="true">↓</span>',
    "hero.cta2": 'Get in touch <span aria-hidden="true">↗</span>',
    "hero.stamp": "multimedia<br/>eng.",

    // Marquesina
    "marquee":
      "applied ai ✺ rag &amp; agents ✺ fine-tuning ✺ web development ✺ games ✺ digital art ✺ prompt engineering ✺ mean / mern ✺ godot &amp; unreal ✺&nbsp;",

    // Sobre mí
    "about.title": "<em>About</em> me",
    "about.lead":
      "I'm finishing my <strong>Multimedia Engineering</strong> degree. I move along the exact line between code and art: the place where you get the best results and scalable products with real impact.",
    "about.p2":
      "I come from web development and games, and over the last few months I've specialized in <strong>applied AI</strong>: RAG architectures, agents, dataset creation and labeling, and fine-tuning diffusion models with LoRA and Dreambooth. I'm not interested in AI as a demo: I'm interested in it as a production tool that solves real problems.",
    "about.p3":
      'I learn autonomously, fast and with aesthetic judgment. I\'m looking for a team where I can bring that dual technical and visual vision — <a class="link-accent" href="#contacto">as an intern or in my first role</a>.',

    // Datos rápidos
    "fact.role.k": "role",
    "fact.role.v": "multimedia engineer",
    "fact.focus.k": "focus",
    "fact.focus.v": "applied ai · web · games",
    "fact.status.k": "status",
    "fact.status.v": "thesis in progress",
    "fact.seek.k": "seeking",
    "fact.seek.v": "internship / job",
    "fact.base.k": "base",
    "fact.base.v": "spain",

    // Proyectos
    "projects.title": "Featured <em>projects</em>",
    "cat.ai": '<span class="projects__cat-dot projects__cat-dot--ai" aria-hidden="true"></span>Artificial <em>intelligence</em>',
    "cat.web": '<span class="projects__cat-dot projects__cat-dot--web" aria-hidden="true"></span>Web <em>development</em>',
    "cat.games": '<span class="projects__cat-dot projects__cat-dot--game" aria-hidden="true"></span><em>Games</em>',

    // TFG
    "tfg.cap": "real model outputs — style trained with LoRA",
    "tfg.date": "2026 · ongoing",
    "tfg.badge": "training",
    "tfg.title": "Generative image-model training pipeline",
    "tfg.sub": "bachelor's degree thesis",
    "tfg.d1":
      "A complete workflow to train image-generation models under predetermined artistic styles: from the raw dataset to the fine-tuned model. Data preparation and labeling, fine-tuning with LoRA and Dreambooth on diffusion models, and stylistic-coherence evaluation at every iteration.",
    "tfg.d2":
      "The goal: making a specific style reproducible and controllable, instead of relying on the randomness of the prompt.",

    // m.ai
    "mai.cap": "the bot in production, inside WhatsApp",
    "mai.date": "june 2026",
    "mai.badge": "deployed",
    "mai.title": "m.ai — note assistant over WhatsApp",
    "mai.sub": "bot with a full rag architecture",
    "mai.d1":
      "A personal assistant that saves notes by text, voice or image, answers natural-language semantic searches and generates smart summaries, all inside WhatsApp. It transcribes audio with Whisper, auto-tags with an LLM and uses a vector database with re-ranking by recency and semantic relevance.",
    "mai.d2":
      "Notes you can't find again are useless: I wanted queryable memory, not another notes app.",

    // RenderBox
    "rb.cap": "the platform in production, deployed on Vercel",
    "rb.date": "feb — may 2025",
    "rb.badge": "completed",
    "rb.sub": "web platform for digital assets",
    "rb.d1":
      "A site to centralize the publishing, management and discovery of creative resources — 2D, 3D, video and audio. Full MEAN stack with media file handling via Cloudinary and Multer, deployed on Vercel.",
    "rb.d2":
      "Creative assets live scattered across a thousand places; I wanted to build the one spot to find them.",

    // Dopamine Chasers
    "dc.cap": "shooter gameplay — custom engine over OpenGL",
    "dc.date": "sep 2025 — may 2026",
    "dc.badge": "PBL Multimedia Engineering",
    "dc.sub": "wave-based fps with a custom c++ engine",
    "dc.d1":
      "A wave-based FPS shooter with escape-room-style progression, inspired by Call of Duty Zombies. Group project for the fourth year of Multimedia Engineering, built under the Project-Based Learning methodology.",
    "dc.d2":
      "Made from scratch in C++ with an ECS architecture for the game logic. It started using Raylib for rendering and was later migrated, through a facade, to a custom engine based on OpenGL.",

    // Preflop
    "pf.cap": "title screen and gameplay — pixel art for Game Boy",
    "pf.date": "oct — nov 2025",
    "pf.badge": "audience award",
    "pf.sub": "assembly puzzles for Game Boy",
    "pf.d1":
      "A level-based puzzle game for the Game Boy, programmed in assembly language: mechanics design, collision system, efficient tilemap rendering, state machines, scene management and enemy AI. All low-level and tuned to the real limitations of the console.",
    "pf.d2":
      "Audience award at GBRetroDev 2025 — Heroes of Assembly 2. Working with the Game Boy's bare resources forces you to truly understand the machine: every byte and every cycle counts.",
    "pf.tag.asm": "Assembly",
    "pf.tag.low": "Low-level",

    // TRAMFIGHT
    "tf.cap": "poster and gameplay, original pixel art",
    "tf.date": "july 2025",
    "tf.badge": "finalist",
    "tf.sub": "finalist — level up game jam 2025",
    "tf.d1":
      "A complete, playable game built in Godot in just 8 days, with team version control under the real pressure of a jam. Finalist of the Level Up Game Jam 2025.",
    "tf.d2":
      "A jam is the best test of scope, priorities and delivery: either you ship it, or there's no game.",
    "tf.tag.days": "8 days",

    // Habilidades
    "skills.title": "<em>Skills</em> dataset",
    "skill.ai": '<span class="skillset__dot skillset__dot--ai" aria-hidden="true"></span>applied_ai',
    "skill.web": '<span class="skillset__dot skillset__dot--web" aria-hidden="true"></span>web_development',
    "skill.game": '<span class="skillset__dot skillset__dot--game" aria-hidden="true"></span>games',
    "skill.art": '<span class="skillset__dot skillset__dot--art" aria-hidden="true"></span>design_and_art',
    "skill.soft": '<span class="skillset__dot skillset__dot--soft" aria-hidden="true"></span>soft_skills',
    "sk.ai.agents": "Agents",
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
    "contact.big":
      'Looking for someone who understands <em>the model</em> and <em>the canvas</em>? <span class="contact__cta">Let\'s talk.</span>',
    "contact.note":
      '<span class="status-dot" aria-hidden="true"></span> fast replies · open to work and internships',

    // Pie
    "footer.by": "designed and built by miguel ángel arroyo — 2026",
  };

  const TITLE = {
    es: "Miguel Ángel Arroyo — Ingeniero Multimedia · IA, Web y Videojuegos",
    en: "Miguel Ángel Arroyo — Multimedia Engineer · AI, Web & Games",
  };

  const nodes = document.querySelectorAll("[data-i18n]");
  const es = new Map();
  nodes.forEach((el) => es.set(el, el.innerHTML));

  const opts = document.querySelectorAll("[data-lang-set]");

  function apply(lang) {
    nodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (lang === "en" && EN[key] != null) el.innerHTML = EN[key];
      else el.innerHTML = es.get(el);
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
