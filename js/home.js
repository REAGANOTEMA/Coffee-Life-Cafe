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
        // Desktop nav
        const navLinks = header.querySelectorAll('.nav-link');
        navLinks.forEach((link, idx) => {
            link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en;
        });
        // Mobile nav
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
        mobileLinks.forEach((link, idx) => {
            link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en;
        });
        // Logo slogans
        const slogan = header.querySelector('.luxury-slogan');
        const subSlogan = header.querySelector('.luxury-slogan-sub');
        if (slogan) slogan.textContent = (lang === 'ar') ? 'اللحظات تبدأ بالقهوة' : 'Moments Begin with Coffee';
        if (subSlogan) subSlogan.textContent = (lang === 'ar') ? 'حيث الراحة تلتقي بالنكهة' : 'Where Comfort Meets Flavor';
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
            } else window.location.href = href;
        });
    }
    document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(smoothScrollToTarget);

    // ==================== CINEMATIC ANIMATIONS ====================
    function animateHeaderCinematic() {
        const navLinks = header.querySelectorAll('.nav-link');
        navLinks.forEach((link, idx) => {
            link.style.transition = `transform 0.8s ease ${idx * 0.1}s, opacity 0.8s ease ${idx * 0.1}s`;
            link.style.transform = 'translateY(-10px)';
            link.style.opacity = '0';
            setTimeout(() => { link.style.transform = 'translateY(0)'; link.style.opacity = '1'; }, 100);
        });
        if (cartIcon) { cartIcon.style.transition = 'transform 0.5s ease'; cartIcon.style.transform = 'scale(0.7)'; setTimeout(() => cartIcon.style.transform = 'scale(1)', 200); }
        if (logo) { logo.style.transition = 'transform 0.7s ease'; logo.style.transform = 'translateY(-5px)'; setTimeout(() => logo.style.transform = 'translateY(0)', 300); }
        const slogans = header.querySelectorAll('.luxury-slogan, .luxury-slogan-sub');
        slogans.forEach((s, idx) => {
            s.style.transition = `transform 0.7s ease ${idx * 0.1}s, opacity 0.7s ease ${idx * 0.1}s`;
            s.style.transform = 'translateY(-10px)';
            s.style.opacity = '0';
            setTimeout(() => { s.style.transform = 'translateY(0)'; s.style.opacity = '1'; }, 300);
        });
    }
    animateHeaderCinematic();
    window.addEventListener('scroll', animateHeaderCinematic);

    // ==================== HEADER PATTERN FLOATING IMAGES ====================
    const patternContainer = document.createElement('div');
    patternContainer.className = 'header-pattern-layer';
    header.appendChild(patternContainer);

    const PATTERN_COUNT = 30;
    const patternImgSrc = 'images/header.webp';
    const patterns = [];

    for (let i = 0; i < PATTERN_COUNT; i++) {
        const img = document.createElement('img');
        img.src = patternImgSrc;
        img.className = 'pattern-tile';
        const size = Math.random() * 25 + 20;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
        img.style.top = `${Math.random() * 100}%`;
        img.style.left = `${Math.random() * 100}%`;
        img.style.opacity = Math.random() * 0.5 + 0.3;
        img.style.position = 'absolute';
        img.style.transition = 'transform 5s ease-in-out';
        patternContainer.appendChild(img);
        patterns.push(img);
    }

    function animatePatterns() {
        patterns.forEach(img => {
            const offsetX = Math.random() * 40 - 20;
            const offsetY = Math.random() * 40 - 20;
            const rotation = Math.random() * 360;
            img.style.transform = `translate(${offsetX}px,${offsetY}px) rotate(${rotation}deg)`;
        });
        requestAnimationFrame(animatePatterns);
    }
    animatePatterns();

})();
