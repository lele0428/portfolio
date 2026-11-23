(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var scrollProgress = document.getElementById("scrollProgress");
  var nav = document.getElementById("nav");
  var toast = document.getElementById("toast");
  var toastTimer = null;

  /* Theme */
  function currentTheme() {
    var saved = null;
    try { saved = localStorage.getItem("portfolio-theme"); } catch (e) {}
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", theme === "light" ? "#f7f7fb" : "#08080d");
  }

  applyTheme(currentTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("portfolio-theme", next); } catch (e) {}
    });
  }

  /* Scroll progress + nav state */
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (scrollProgress) scrollProgress.style.width = (ratio * 100).toFixed(2) + "%";
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Reveal on scroll */
  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index * 40, 240) + "ms";
      revealObserver.observe(el);
    });
  } else {
    revealItems.forEach(function (el) { el.classList.add("in"); });
  }

  /* Active nav link */
  var sections = ["about", "projects", "experience", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var isActive = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("active", isActive);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* Project card glow follows pointer */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".project-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (event.clientX - rect.left) + "px");
        card.style.setProperty("--my", (event.clientY - rect.top) + "px");
      });
    });
  }

  /* Toast */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  /* Copy email */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email") || "";
      var done = function () { showToast("已复制：" + email); };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(done).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var input = document.createElement("textarea");
        input.value = email;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(input);
        showToast(ok ? "已复制：" + email : "请手动复制：" + email);
      }
    });
  }

  /* Year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
