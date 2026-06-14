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
