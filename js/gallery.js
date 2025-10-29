/* ===== COFFEE LIFE GALLERY JS (FINAL PRO) ===== */

document.addEventListener("DOMContentLoaded", () => {
  /* =============================
     1. SCROLL REVEAL ANIMATION
  ==============================*/
  const galleryItems = document.querySelectorAll(".gallery-item");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
          const video = entry.target.querySelector("video");
          if (video) video.play().catch(() => { });
        }
      });
    },
    { threshold: 0.2 }
  );

  galleryItems.forEach(item => observer.observe(item));

  /* =============================
     2. LIGHTBOX FUNCTIONALITY
  ==============================*/
  const allGalleryMedia = document.querySelectorAll(".gallery-item img, .gallery-item video");
  const lightbox = document.createElement("div");
  lightbox.classList.add("lightbox");
  lightbox.innerHTML = `
    <div class="lightbox-content"></div>
    <span class="lightbox-close">&times;</span>
  `;
  document.body.appendChild(lightbox);

  const lightboxContent = lightbox.querySelector(".lightbox-content");
  const lightboxClose = lightbox.querySelector(".lightbox-close");

  allGalleryMedia.forEach(media => {
    media.addEventListener("click", () => {
      lightbox.classList.add("open");
      if (media.tagName === "IMG") {
        lightboxContent.innerHTML = `<img src="${media.src}" alt="Expanded view">`;
      } else if (media.tagName === "VIDEO") {
        const src = media.querySelector("source")?.src || media.currentSrc || media.src;
        lightboxContent.innerHTML = `<video src="${src}" controls autoplay loop playsinline></video>`;
      }
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightboxContent.innerHTML = "";
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

  /* =============================
     3. MOVING VIDEO TEXT EFFECT
  ==============================*/
  document.querySelectorAll(".video-text h3").forEach(text => {
    text.addEventListener("animationiteration", () => {
      text.style.animation = "none";
      void text.offsetWidth;
      text.style.animation = null;
    });
  });

  /* =============================
     4. AUTO-PLAY AND HOVER AMBIENCE
  ==============================*/
  document.querySelectorAll(".gallery-item video").forEach(video => {
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.style.opacity = "1";
    video.addEventListener("canplay", () => video.play().catch(() => { }));

    const audio = new Audio("assets/cafe-ambience.mp3");
    audio.loop = true;
    audio.volume = 0.15;

    video.addEventListener("mouseenter", () => audio.play().catch(() => { }));
    video.addEventListener("mouseleave", () => audio.pause());
  });

  /* =============================
     5. PARALLAX MOVEMENT ON SCROLL
  ==============================*/
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    document.querySelectorAll(".video-overlay").forEach(overlay => {
      const speed = 0.2;
      overlay.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });

  /* =============================
     6. LIGHTBOX SMOOTH SCROLL
  ==============================*/
  lightboxContent.addEventListener("wheel", e => {
    e.preventDefault();
    lightboxContent.scrollBy({ top: e.deltaY, behavior: "smooth" });
  });

  /* =============================
     7. MOBILE TOUCH SUPPORT
  ==============================*/
  document.addEventListener("touchstart", () => { }, { passive: true });

  /* =============================
     8. FILTERABLE GALLERY
  ==============================*/
  const filterButtons = document.querySelectorAll(".filter-buttons button");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll(".gallery-item").forEach(item => {
        if (filter === "all") item.style.display = "block";
        else if (item.classList.contains(filter)) item.style.display = "block";
        else item.style.display = "none";
      });
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
});
