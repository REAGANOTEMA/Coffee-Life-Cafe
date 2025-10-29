// ==================== LUXURY HERO - FINAL PRODUCTION JS ====================
(() => {
  const VIDEO_FILES = ["videos/hero-welcome.mp4"];
  const SLIDE_INTERVAL = 9000;       // slide images change every 6s
  const SHAKE_INTERVAL = 3000;       // shake every 3s
  const SHAKE_DURATION = 900;
  const LIGHT_INTERVAL = 5000;       // glow every 5s
  const SPARKLE_COUNT = 35;
  const FOOD_ICON_COUNT = 20;

  const heroSection = document.querySelector(".hero");
  if (!heroSection) return;

  const slideshowWrap = heroSection.querySelector(".hero-slideshow");
  const slides = slideshowWrap ? Array.from(slideshowWrap.querySelectorAll(".hero-slide")) : [];
  const heroContent = heroSection.querySelector(".hero-content");
  const heroBtn = heroSection.querySelector(".hero-btn.order-btn");
  const sparkleLayer = heroSection.querySelector(".hero-luxury-glow");
  const heroBg = heroSection.querySelector(".hero-background");
  const heroTitle = heroSection.querySelector(".hero-title");
  const heroSubtitle = heroSection.querySelector(".hero-subtitle");
  const subtitleWords = heroSection.querySelectorAll(".hero-subtitle span, .hero-subtitle .slide-text");
  const heroNoteEl = heroSection.querySelector(".hero-note");

  // ==================== UTILITY ====================
  const safePlay = v => { if (!v) return; v.play?.().catch(() => { }); };
  const addThenRemove = (el, cls, duration) => { if (!el) return; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), duration); };

  // ==================== VIDEO SETUP ====================
  const videoEls = heroSection.querySelectorAll("video.hero-video");
  let currentVideoIndex = 0;

  videoEls.forEach((v, i) => {
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    if (VIDEO_FILES[i]) v.src = VIDEO_FILES[i];
    v.style.opacity = i === 0 ? "1" : "0";
    v.style.transition = "opacity 1.2s ease-in-out";
    v.loop = false;

    v.addEventListener("ended", () => {
      currentVideoIndex = (i + 1) % videoEls.length;
      playVideoIndex(currentVideoIndex);
    });
  });

  function playVideoIndex(index) {
    videoEls.forEach((v, j) => {
      if (j === index) {
        v.style.opacity = "1";
        v.setAttribute("aria-hidden", "false");
        safePlay(v);
      } else {
        v.style.opacity = "0";
        v.pause();
        try { v.currentTime = 0; } catch (e) { }
        v.setAttribute("aria-hidden", "true");
      }
    });
  }
  if (videoEls.length) playVideoIndex(0);

  // ==================== SLIDESHOW ====================
  slides.forEach((s, i) => {
    s.style.position = "absolute";
    s.style.top = "0";
    s.style.left = "0";
    s.style.width = "100%";
    s.style.height = "100%";
    s.style.objectFit = "cover";
    s.style.opacity = "0";
    s.style.transition = "opacity 1s ease-in-out, transform 12s ease-in-out";
    s.dataset.slideIndex = i;
    s.setAttribute("aria-hidden", "true");
    const imgPreload = new Image();
    imgPreload.src = s.src || s.dataset.src;
  });

  let slideIndex = 0, slideTimer = null;
  function showSlide(i) {
    slides.forEach((s, idx) => {
      if (idx === i) {
        s.style.opacity = "1";
        s.style.zIndex = "2";
        s.style.transform = "translateY(0)";
        s.setAttribute("aria-hidden", "false");
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

  function startSlideshowFromVideo() {
    videoEls.forEach(v => { v.style.opacity = "0"; v.setAttribute("aria-hidden", "true"); });
    setTimeout(() => {
      if (slideshowWrap) slideshowWrap.style.opacity = "1";
      startSlideshow();
    }, 350);
  }

  if (videoEls.length) {
    const fallbackTimer = setTimeout(() => {
      const first = videoEls[0];
      if (!first || first.currentTime < 0.5) startSlideshowFromVideo();
    }, 15000);

    videoEls.forEach(v => v.addEventListener("ended", () => {
      clearTimeout(fallbackTimer);
      startSlideshowFromVideo();
    }));
  } else startSlideshow();

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
      w.style.background = `linear-gradient(90deg,#ffffff,#ffffff)`; // pure white for "order. savor. enjoy"
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
    "Indulge in the perfect cup, delight in every dessert, and cherish every moment.",
    "Savor handcrafted pastries, premium coffee, and moments that inspire.",
    "Every sip, every bite, every smile – Coffee Life Cafe awaits you.",
    "Relax, connect, and enjoy gourmet treats in a cozy atmosphere."
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
    // Link to menu section on index.html
    heroBtn.setAttribute("href", "index.html#menu");

    // Shake animation
    setInterval(() => addThenRemove(heroBtn, "btn-shake", SHAKE_DURATION), SHAKE_INTERVAL);

    // Glow animation
    setInterval(() => addThenRemove(heroBtn, "btn-light", 1200), LIGHT_INTERVAL);
  }

})();
