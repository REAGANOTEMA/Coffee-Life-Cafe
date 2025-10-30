// ==================== LUXURY HERO - FINAL IMAGE SLIDES JS ====================
(() => {
  const SLIDE_INTERVAL = 20000;       // 20 seconds per slide
  const SHAKE_INTERVAL = 3000;        // shake every 3s
  const SHAKE_DURATION = 900;
  const LIGHT_INTERVAL = 5000;        // glow every 5s
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
  const heroSubtitle = heroSection.querySelector(".hero-subtitle");
  const subtitleWords = heroSection.querySelectorAll(".hero-subtitle span, .hero-subtitle .slide-text");
  const heroNoteEl = heroSection.querySelector(".hero-note");

  // ==================== UTILITY ====================
  const addThenRemove = (el, cls, duration) => { if (!el) return; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), duration); };

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

  let slideIndex = 0, slideTimer = null;

  function showSlide(i) {
    slides.forEach((s, idx) => {
      if (idx === i) {
        s.style.opacity = "1";
        s.style.zIndex = "2";
        s.style.transform = "translateY(0)";
        s.setAttribute("aria-hidden", "false");

        // Animate slide text
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

  function startSlideshow() {
    if (!slides.length) return;
    showSlide(slideIndex);
    slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { clearInterval(slideTimer); slideTimer = null; }
      else if (!slideTimer) { slideTimer = setInterval(nextSlide, SLIDE_INTERVAL); }
    });
  }
  startSlideshow();

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
    if (heroSubtitle) heroSubtitle.style.transform = `translate(${x / 6}px,${y / 6}px)`;
  });

  // ==================== HERO SUBTITLE ANIMATION ====================
  subtitleWords.forEach(w => {
    w.style.display = "inline-block";
    w.style.whiteSpace = "nowrap";
    w.style.transition = "all 1s ease-in-out";
  });
  function animateSubtitleGradient() {
    subtitleWords.forEach(w => {
      w.style.background = `linear-gradient(90deg,#ffffff,#ffffff)`;
      w.style.webkitBackgroundClip = "text";
      w.style.backgroundClip = "text";
      w.style.color = "transparent";
    });
  }
  animateSubtitleGradient();
  setInterval(animateSubtitleGradient, 2500);

  let slideDir = 1;
  setInterval(() => {
    subtitleWords.forEach(w => {
      const curr = w.dataset.offset ? parseFloat(w.dataset.offset) : 0;
      let next = curr + (5 * slideDir);
      if (Math.abs(next) > 15) slideDir *= -1;
      w.dataset.offset = next;
      w.style.transform = `translateX(${next}px)`;
    });
  }, 2500);

  // ==================== HERO NOTE ROTATOR ====================
  const heroNotes = [
    "Indulge in the perfect bite, delight in every dish, and savor moments of pure culinary joy.",
    "Savor handcrafted meals, premium drinks, and experiences that leave unforgettable memories.",
    "Every flavor, every texture, every aroma – Coffee Life Cafe welcomes you.",
    "Relax, enjoy, and experience gourmet dishes served with passion and love."
  ];
  let currentNote = 0;
  function showNextHeroNote() {
    if (!heroNoteEl) return;
    heroNoteEl.style.opacity = "0";
    setTimeout(() => {
      heroNoteEl.textContent = heroNotes[currentNote];
      heroNoteEl.style.opacity = "1";
      currentNote = (currentNote + 1) % heroNotes.length;
    }, 600);
  }
  if (heroNoteEl) setInterval(showNextHeroNote, 10000);

  // ==================== ORDER NOW BUTTON ====================
  if (heroBtn) {
    // Smooth scroll to menu header
    heroBtn.addEventListener("click", e => {
      e.preventDefault();
      const menu = document.querySelector("#menu");
      if (menu) menu.scrollIntoView({ behavior: "smooth" });
    });

    // Shake animation
    setInterval(() => addThenRemove(heroBtn, "btn-shake", SHAKE_DURATION), SHAKE_INTERVAL);

    // Glow animation
    setInterval(() => addThenRemove(heroBtn, "btn-light", 1200), LIGHT_INTERVAL);
  }

})();
