(function () {
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
  const logoImg = logo ? logo.querySelector('img') : null;
  const title = header.querySelector('.luxury-title');
  const slogan = header.querySelector('.luxury-slogan');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const cartIcon = header.querySelector('.cart-icon .cart-count-badge');
  const navLinks = header.querySelectorAll('.nav-link');

  // ====================
  // CART MANAGEMENT
  // ====================
  window.cart = window.cart || [];
  function updateCartCount() {
    const total = window.cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    if (cartIcon) cartIcon.textContent = total;
  }
  updateCartCount();
  window.globalAddToCart = function (item) {
    const existing = window.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else window.cart.push({ ...item, qty: 1 });
    updateCartCount();
  };
  window.globalRemoveFromCart = function (id) {
    const index = window.cart.findIndex(i => i.id === id);
    if (index === -1) return;
    window.cart[index].qty--;
    if (window.cart[index].qty <= 0) window.cart.splice(index, 1);
    updateCartCount();
  };

  // ====================
  // LANGUAGE SWITCH
  // ====================
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
    if (title) title.textContent = lang === 'ar' ? 'قهوة الحياة' : 'Coffee Life';
    if (slogan) slogan.textContent = lang === 'ar' ? 'كل. اجتمع. اعمل.' : 'Eat. Meet. Work.';
  }
  setLanguage(DEFAULT_LANG);

  // ====================
  // MOBILE MENU TOGGLE
  // ====================
  if (hamburger && mobileMenu) {
    const toggleMenu = (show) => {
      if (show) {
        mobileMenu.classList.add('active');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.style.display = 'flex';
        mobileMenu.style.opacity = '1';
      } else {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.style.opacity = '0';
        setTimeout(() => (mobileMenu.style.display = 'none'), 300);
      }
    };
    hamburger.addEventListener('click', () => toggleMenu(!mobileMenu.classList.contains('active')));
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) toggleMenu(false);
    });
  }

  // ====================
  // SMOOTH SCROLL
  // ====================
  document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(el => {
    el.addEventListener('click', e => {
      const href = el.getAttribute('href');
      if (!href || !href.includes('#')) return;
      e.preventDefault();
      const target = document.getElementById(href.split('#')[1]);
      if (target) {
        const headerOffset = header.offsetHeight;
        const top = target.offsetTop - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        window.location.href = href;
      }
    });
  });

  // ====================
  // CINEMATIC TITLE SLIDE
  // ====================
  let position = 0, direction = 1;
  function animateTitleSlide() {
    if (!title || !logo) return;
    const logoRect = logo.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const minX = logoRect.right + 40; 
    const maxX = headerRect.right - titleRect.width - 60; 

    position += direction * 0.2; // cinematic smooth speed
    if (titleRect.left + position <= minX) direction = 1;
    if (titleRect.left + position >= maxX) direction = -1;

    title.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animateTitleSlide);
  }
  animateTitleSlide();

  // ====================
  // RESPONSIVE HEADER + LOGO + TITLE/SLOGAN COLORS
  // ====================
  function adjustHeaderForMobile() {
    const screenWidth = window.innerWidth;

    if (logoImg) {
      logoImg.style.objectFit = 'contain'; // keep full image visible
      logoImg.style.width = '100%';
      logoImg.style.height = '100%';
      logoImg.style.transform = 'scale(1)'; // no zoom
    }

    if (screenWidth <= 768) {
      header.style.padding = '10px 15px';
      Object.assign(logo.style, { width: '220px', height: '70px' }); // shorter height, wider
      title.style.fontSize = '1.5rem';
      slogan.style.fontSize = '0.8rem';
    } else if (screenWidth <= 1024) {
      header.style.padding = '15px 25px';
      Object.assign(logo.style, { width: '240px', height: '80px' });
      title.style.fontSize = '1.8rem';
      slogan.style.fontSize = '0.9rem';
    } else {
      header.style.padding = '20px 30px';
      Object.assign(logo.style, { width: '280px', height: '90px' });
      title.style.fontSize = '2rem';
      slogan.style.fontSize = '1rem';
    }

    if (title) {
      title.style.color = '#FFFFFF';
      title.style.textShadow = '2px 2px 8px rgba(0,0,0,0.6)';
      title.style.fontFamily = "'Montserrat', sans-serif";
    }
    if (slogan) {
      slogan.style.color = '#FFD700';
      slogan.style.textShadow = '1px 1px 4px rgba(0,0,0,0.5)';
      slogan.style.fontFamily = "'Roboto', sans-serif";
    }
  }

  window.addEventListener('resize', adjustHeaderForMobile);
  adjustHeaderForMobile();
})();
