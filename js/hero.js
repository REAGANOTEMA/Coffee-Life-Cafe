// ==================== LUXURY HERO - FINAL CINEMATIC SLIDES ====================
(() => {
  const SLIDE_INTERVAL = 8000; // 8s per slide
  const SHAKE_INTERVAL = 3000;
  const SHAKE_DURATION = 900;
  const LIGHT_INTERVAL = 4000;
  const ZOOM_SCALE = 1.05; // subtle zoom-in effect on slide

  const hero = document.querySelector(".hero");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const heroBtn = hero.querySelector(".hero-btn.order-btn");
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
    s.style.transition = "opacity 1.5s ease-in-out, transform 8s ease-in-out";
    s.dataset.slideIndex = i;
    s.setAttribute("aria-hidden", "true");
  });

  const showSlide = (i) => {
    slides.forEach((s, idx) => {
      const text = s.querySelector(".hero-slide-text");
      if (idx === i) {
        s.style.opacity = "1";
        s.style.zIndex = "2";
        s.style.transform = `scale(${ZOOM_SCALE})`;
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

        // Move slide text to hero-inner below title
        if (heroTitle && text) {
          if (!heroTitle.nextElementSibling || !heroTitle.nextElementSibling.classList.contains('current-slide-text')) {
            const cloneText = text.cloneNode(true);
            cloneText.classList.add('current-slide-text');
            // Remove old
            const oldText = hero.querySelector('.current-slide-text');
            if (oldText) oldText.remove();
            heroTitle.parentElement.appendChild(cloneText);
          }
        }
      } else {
        s.style.opacity = "0";
        s.style.zIndex = "1";
        s.style.transform = "scale(1)";
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

  // ==================== PARALLAX EFFECT ====================
  document.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    if (heroTitle) heroTitle.style.transform = `translate(${x / 3}px,${y / 3}px)`;
    const currentText = hero.querySelector('.current-slide-text');
    if (currentText) currentText.style.transform = `translate(${x / 6}px,${y / 6}px)`;
  });

  // ==================== ORDER BUTTON ====================
  if (heroBtn) {
    heroBtn.addEventListener("click", e => {
      e.preventDefault();
      const menu = document.querySelector("#menu-title"); // link to menu section
      if (menu) menu.scrollIntoView({ behavior: "smooth" });
    });

    setInterval(() => addThenRemove(heroBtn, "btn-shake", SHAKE_DURATION), SHAKE_INTERVAL);
    setInterval(() => addThenRemove(heroBtn, "btn-light", 1200), LIGHT_INTERVAL);
  }

  // ==================== MOBILE HAMBURGER NAV ====================
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const mobileNav = document.querySelector(".mobile-nav");
  const navClose = document.querySelector(".nav-close");

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener("click", () => {
      mobileNav.style.display = "flex";
      mobileNav.style.zIndex = "9999"; // above hero
    });
  }

  if (navClose && mobileNav) {
    navClose.addEventListener("click", () => {
      mobileNav.style.display = "none";
    });
  }

})();
