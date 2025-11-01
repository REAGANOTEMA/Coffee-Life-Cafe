/* ========================================= 
   ULTRA-LUXURY CINEMATIC HEADER - FINAL JS
========================================= */
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

    const logo = header.querySelector('.logo');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const cartIcon = header.querySelector('.cart-icon .cart-count-badge');
    const patternLayer = header.querySelector('.header-pattern-layer');
    const slogan = header.querySelector('.luxury-slogan');

    // ==================== CART MANAGEMENT ====================
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

    // ==================== LANGUAGE SWITCH ====================
    const langBtn = header.querySelector('.lang-toggle');
    langBtn.addEventListener('click', () => {
        const newLang = (localStorage.getItem('luxury_lang') || DEFAULT_LANG) === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    });

    function setLanguage(lang) {
        localStorage.setItem('luxury_lang', lang);
        const navLinks = header.querySelectorAll('.nav-link');
        navLinks.forEach((link, idx) => {
            link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en;
        });
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
        mobileLinks.forEach((link, idx) => {
            link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en;
        });
        slogan.textContent = (lang === 'ar') ? 'كُل. قابل. اعمل.' : 'Eat. Meet. Work.';
    }
    setLanguage(DEFAULT_LANG);

    // ==================== MOBILE MENU TOGGLE ====================
    hamburger.addEventListener('click', () => {
        const isActive = mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        mobileMenu.style.display = isActive ? 'flex' : 'none';
        mobileMenu.setAttribute('aria-hidden', !isActive);
        hamburger.setAttribute('aria-expanded', isActive);
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenu.style.display = 'none';
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // ==================== SMOOTH SCROLL ====================
    function smoothScrollToTarget(el) {
        el.addEventListener('click', e => {
            const href = el.getAttribute('href');
            if (!href.includes('#')) return;
            e.preventDefault();
            const targetId = href.split('#')[1];
            const target = document.getElementById(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - header.offsetHeight,
                    behavior: 'smooth'
                });
            } else {
                window.location.href = href;
            }
        });
    }
    document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(smoothScrollToTarget);

    // ==================== CINEMATIC ANIMATIONS ====================
    function animateHeader() {
        // Floating background pattern like live TV
        if (patternLayer) {
            const offsetX = Math.sin(Date.now() / 2000) * 10;
            const offsetY = Math.cos(Date.now() / 3000) * 10;
            patternLayer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }

        // Logo floating animation
        if (logo) {
            const floatY = Math.sin(Date.now() / 1500) * 2;
            logo.style.transform = `translateY(${floatY}px)`;
        }

        // Nav links 3D hover effect
        const navLinks = header.querySelectorAll('.nav-link');
        navLinks.forEach((link, idx) => {
            link.style.transition = `transform 0.5s ease ${idx * 0.05}s, opacity 0.5s ease ${idx * 0.05}s`;
            link.style.transform = 'translateZ(0px)';
            link.style.opacity = '1';
        });

        // Title moving like live TV
        if (slogan) {
            const tvMove = Math.sin(Date.now() / 500) * 1.5; // slight horizontal jitter
            slogan.style.transform = `translateX(${tvMove}px)`;
        }

        requestAnimationFrame(animateHeader);
    }
    animateHeader();
})();
