<script>
(function() {
  const NAV_ITEMS = [
    { id: 'home', label: { en: 'Home', ar: 'الصفحة الرئيسية' }, href: 'index.html#home' },
    { id: 'menu', label: { en: 'Menu', ar: 'القائمة' }, href: 'index.html#menu' },
    { id: 'gallery', label: { en: 'Gallery', ar: 'معرض' }, href: 'index.html#gallery' },
    { id: 'contact', label: { en: 'Contact', ar: 'تواصل' }, href: 'index.html#contact' }
  ];

  const DEFAULT_LANG = localStorage.getItem('luxury_lang') || 'en';
  const header = document.getElementById('mainHeader');
  if (!header) return;

  const logo = header.querySelector('.luxury-logo-circle');
  const title = header.querySelector('.luxury-title');
  const slogan = header.querySelector('.luxury-slogan');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const cartIcon = header.querySelector('.cart-icon .cart-count-badge');
  const navLinks = header.querySelectorAll('.nav-link');

  // ===== CART MANAGEMENT =====
  window.cart = window.cart || [];
  function updateCartCount() {
    const total = window.cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    if (cartIcon) cartIcon.textContent = total;
  }
  updateCartCount();

  window.globalAddToCart = function(item) {
    const existing = window.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else window.cart.push({ ...item, qty: 1 });
    updateCartCount();
  };

  window.globalRemoveFromCart = function(id) {
    const index = window.cart.findIndex(i => i.id === id);
    if (index === -1) return;
    window.cart[index].qty--;
    if (window.cart[index].qty <= 0) window.cart.splice(index, 1);
    updateCartCount();
  };

  // ===== LANGUAGE SWITCH =====
  const langBtn = header.querySelector('.lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const newLang = (localStorage.getItem('luxury_lang') || DEFAULT_LANG) === 'en' ? 'ar' : 'en';
      setLanguage(newLang);
    });
  }

  function setLanguage(lang) {
    localStorage.setItem('luxury_lang', lang);
    navLinks.forEach((link, idx) => link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en);
    if (mobileMenu) {
      mobileMenu.querySelectorAll('.mobile-link').forEach((link, idx) => {
        link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en;
      });
    }
    if (title) title.textContent = (lang === 'ar') ? 'قهوة الحياة' : 'COFFEE LIFE RESTAURANT';
    if (slogan) slogan.textContent = (lang === 'ar') ? 'كل. اجتمع. اعمل.' : 'Eat. Meet. Work.';
  }
  setLanguage(DEFAULT_LANG);

  // ===== NAV BUTTON ANIMATIONS =====
  function addNavEffects() {
    document.querySelectorAll('.nav-link, .mobile-link').forEach(btn => {
      btn.style.transition = 'all 0.3s ease';
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.08)';
        btn.style.textShadow = '0 0 10px gold';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.textShadow = 'none';
      });
      btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.95)');
      btn.addEventListener('mouseup', () => btn.style.transform = 'scale(1.08)');
    });
  }
  addNavEffects();

  // ===== MOBILE MENU =====
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isActive = mobileMenu.classList.toggle('active');
      hamburger.classList.toggle('active', isActive);
      hamburger.setAttribute('aria-expanded', isActive);
      mobileMenu.setAttribute('aria-hidden', !isActive);
      mobileMenu.style.display = isActive ? 'flex' : 'none';
      mobileMenu.style.opacity = isActive ? '1' : '0';
      mobileMenu.style.transition = 'opacity 0.3s ease';
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.style.opacity = '0';
        setTimeout(() => (mobileMenu.style.display = 'none'), 300);
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        if (mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
          mobileMenu.style.opacity = '0';
          setTimeout(() => (mobileMenu.style.display = 'none'), 300);
        }
      }
    });
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(el => {
    el.addEventListener('click', e => {
      const href = el.getAttribute('href');
      if (!href || !href.includes('#')) return;
      e.preventDefault();
      const target = document.getElementById(href.split('#')[1]);
      if (target) window.scrollTo({ top: target.offsetTop - header.offsetHeight, behavior: 'smooth' });
      else window.location.href = href;
    });
  });

  // ===== TITLE SLIDE =====
  let position = 0, direction = 1;
  function animateTitleSlide() {
    if (!title || !logo) return;
    const logoRect = logo.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const leftBoundary = logoRect.right + 30; // spacing from logo
    const rightBoundary = window.innerWidth - titleRect.width - 40;
    position += direction * 0.4;
    if (titleRect.left + position < leftBoundary || titleRect.left + position > rightBoundary) {
      direction *= -1;
    }
    title.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animateTitleSlide);
  }
  animateTitleSlide();

  // ===== RESPONSIVE HEADER =====
  function adjustHeaderForMobile() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      header.style.padding = '10px 15px';
      if (logo) Object.assign(logo.style, { width: '90px', height: '90px' });
      if (title) title.style.fontSize = '1.4rem';
      if (slogan) slogan.style.fontSize = '0.8rem';
    } else if (screenWidth <= 1024) {
      header.style.padding = '15px 25px';
      if (logo) Object.assign(logo.style, { width: '110px', height: '110px' });
      if (title) title.style.fontSize = '2rem';
      if (slogan) slogan.style.fontSize = '0.9rem';
    } else {
      header.style.padding = '20px 30px';
      if (logo) Object.assign(logo.style, { width: '130px', height: '130px' });
      if (title) title.style.fontSize = '2.8rem';
      if (slogan) slogan.style.fontSize = '1.1rem';
    }
  }
  window.addEventListener('resize', adjustHeaderForMobile);
  adjustHeaderForMobile();
})();
</script>
