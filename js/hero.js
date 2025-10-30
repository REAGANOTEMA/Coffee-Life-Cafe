// ==================== LUXURY HERO - FINAL IMAGE SLIDES JS ====================
(() => {
  const SLIDE_INTERVAL = 10000;       // 10 seconds per slide
  const SHAKE_INTERVAL = 3000;        // shake every 3s
  const SHAKE_DURATION = 900;
  const LIGHT_INTERVAL = 4000;        // glow every 4s
  const SPARKLE_COUNT = 35;
  const FOOD_ICON_COUNT = 20;

  const heroSection = document.querySelector(".hero");
  if (!heroSection) return;

  const slideshowWrap = heroSection.querySelector(".hero-slideshow");
  const slides = slideshowWrap ? Array.from(slideshowWrap.querySelectorAll(".hero-slide")) : [];
  const heroBtn = heroSection.querySelector(".hero-btn.order-btn");
  const sparkleLayer = heroSection.querySelector(".hero-luxury-glow");
  const heroBg = heroSection.querySelector(".hero-background");
  const heroTitle = heroSection.querySelector(".hero-title");
  const subtitleWords = heroSection.querySelectorAll(".hero-slide-text");
  const heroNoteEl = heroSection.querySelector(".hero-note");

  // ==================== UTILITY ====================
  const addThenRemove = (el, cls, duration) => {
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), duration);
  };

  // ==================== SLIDESHOW ====================
  slides.forEach((s, i) => {
    s.style.position = "absolute";
    s.style.top = "0";
    s.style.left = "0";
    s.style.width = "100%";
    s.style.height = "100%";
    s.style.backgroundSize = "cover";
    s.style.backgroundPosition = "center";
    s.style.opacity = "0";
    s.style.transition = "opacity 1.5s ease-in-out, transform 12s ease-in-out";
    s.dataset.slideIndex = i;
    s.setAttribute("aria-hidden", "true");
  });

  let slideIndex = 0;

  function showSlide(i) {
    slides.forEach((s, idx) => {
      if (idx === i) {
        s.style.opacity = "1";
        s.style.zIndex = "2";
        s.style.transform = "translateY(0)";
        s.setAttribute("aria-hidden", "false");

        const textEl = s.querySelector(".hero-slide-text");
        if (textEl) {
          textEl.style.opacity = "0";
          textEl.style.transform = "translateY(20px)";
          setTimeout(() => {
            textEl.style.transition = "all 1.5s ease-in-out";
            textEl.style.opacity = "1";
            textEl.style.transform = "translateY(0)";
          }, 300);
        }
      } else {
        s.style.opacity = "0";
        s.style.zIndex = "1";
        s.setAttribute("aria-hidden", "true");
      }
    });
  }

  function nextSlide() {
    if (slides.length) {
      slideIndex = (slideIndex + 1) % slides.length;
      showSlide(slideIndex);
    }
  }

  showSlide(slideIndex);
  setInterval(nextSlide, SLIDE_INTERVAL);

  // ==================== SPARKLES ====================
  if (sparkleLayer && !sparkleLayer.dataset.initialized) {
    sparkleLayer.dataset.initialized = "true";
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const sp = document.createElement("div");
      sp.className = "hero-sparkle";
      sp.style.top = `${Math.random() * 100}%`;
      sp.style.left = `${Math.random() * 100}%`;
      sp.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
      sparkleLayer.appendChild(sp);
    }
  }

  // ==================== FLOATING FOOD ICONS ====================
  if (heroBg && !heroBg.dataset.iconsInit) {
    heroBg.dataset.iconsInit = "true";
    const icons = ["☕", "🍰", "🥐", "🍩", "🍪", "🥞"];
    for (let i = 0; i < FOOD_ICON_COUNT; i++) {
      const d = document.createElement("div");
      d.className = "hero-food-decor";
      d.textContent = icons[Math.floor(Math.random() * icons.length)];
      d.style.top = `${Math.random() * 100}%`;
      d.style.left = `${Math.random() * 100}%`;
      d.style.fontSize = `${Math.random() * 25 + 20}px`;
      d.style.opacity = (0.2 + Math.random() * 0.4).toString();
      heroBg.appendChild(d);
    }
    setInterval(() => {
      heroBg.querySelectorAll(".hero-food-decor").forEach(e => {
        e.style.transform = `translateY(${Math.random() * 10 - 5}px) translateX(${Math.random() * 6 - 3}px)`;
      });
    }, 7000);
  }

  // ==================== MOUSE PARALLAX ====================
  document.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * 15;
    if (heroTitle) heroTitle.style.transform = `translate(${x / 3}px,${y / 3}px)`;
    subtitleWords.forEach(s => {
      s.style.transform = `translate(${x / 6}px,${y / 6}px)`;
    });
  });

  // ==================== ORDER NOW BUTTON ====================
  if (heroBtn) {
    heroBtn.addEventListener("click", e => {
      e.preventDefault();
      const menu = document.querySelector("#menu");
      if (menu) menu.scrollIntoView({ behavior: "smooth" });
    });

    setInterval(() => addThenRemove(heroBtn, "btn-shake", SHAKE_DURATION), SHAKE_INTERVAL);
    setInterval(() => addThenRemove(heroBtn, "btn-light", 1200), LIGHT_INTERVAL);
  }

})();
