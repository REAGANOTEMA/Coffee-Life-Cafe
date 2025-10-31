// ==================== LUXURY HERO - CINEMATIC SLIDES & INTERACTIONS ====================
(() => {
  const SLIDE_INTERVAL = 8000;       // 8 seconds per slide
  const SHAKE_INTERVAL = 3000;       // shake every 3s
  const SHAKE_DURATION = 900;
  const LIGHT_INTERVAL = 4000;       // glow every 4s
  const SPARKLE_COUNT = 35;
  const FOOD_ICON_COUNT = 20;

  const hero = document.querySelector(".hero");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const heroBtn = hero.querySelector(".hero-btn.order-btn");
  const sparkleLayer = hero.querySelector(".hero-luxury-glow");
  const heroBg = hero.querySelector(".hero-background");
  const heroTitle = hero.querySelector(".hero-title");
  const slideTexts = hero.querySelectorAll(".hero-slide-text");

  let slideIndex = 0;

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

  const showSlide = (i) => {
    slides.forEach((s, idx) => {
      const text = s.querySelector(".hero-slide-text");
      if (idx === i) {
        s.style.opacity = "1";
        s.style.zIndex = "2";
        s.setAttribute("aria-hidden", "false");
        if (text) {
          text.style.opacity = "0";
          text.style.transform = "translateY(20px)";
          setTimeout(() => {
            text.style.transition = "all 1.5s ease-in-out";
            text.style.opacity = "1";
            text.style.transform = "translateY(0)";
          }, 300);
        }
      } else {
        s.style.opacity = "0";
        s.style.zIndex = "1";
        s.setAttribute("aria-hidden", "true");
      }
    });
  };

  const nextSlide = () => {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
  };

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
    const icons = ["☕", "🍰", "🥐", "🍩", "🍪", "🥞", "🍔", "🍕", "🥗", "🍟"];
    for (let i = 0; i < FOOD_ICON_COUNT; i++) {
      const d = document.createElement("div");
      d.className = "hero-food-decor";
      d.textContent = icons[Math.floor(Math.random() * icons.length)];
      d.style.top = `${Math.random() * 100}%`;
      d.style.left = `${Math.random() * 100}%`;
      d.style.fontSize = `${Math.random() * 30 + 20}px`;
      d.style.opacity = (0.2 + Math.random() * 0.5).toString();
      heroBg.appendChild(d);
    }
    setInterval(() => {
      heroBg.querySelectorAll(".hero-food-decor").forEach(e => {
        e.style.transform = `translateY(${Math.random() * 10 - 5}px) translateX(${Math.random() * 6 - 3}px) rotate(${Math.random() * 15 - 7}deg)`;
      });
    }, 7000);
  }

  // ==================== MOUSE PARALLAX ====================
  document.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    if (heroTitle) heroTitle.style.transform = `translate(${x / 3}px,${y / 3}px)`;
    slideTexts.forEach(s => {
      s.style.transform = `translate(${x / 6}px,${y / 6}px)`;
    });
  });

  // ==================== ORDER BUTTON ANIMATION ====================
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
