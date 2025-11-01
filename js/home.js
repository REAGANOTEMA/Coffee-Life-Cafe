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
        header.querySelectorAll('.nav-link').forEach((link, idx) => link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en);
        mobileMenu.querySelectorAll('.mobile-link').forEach((link, idx) => link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en);
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
            const target = document.getElementById(href.split('#')[1]);
            if (target) window.scrollTo({ top: target.offsetTop - header.offsetHeight, behavior: 'smooth' });
            else window.location.href = href;
        });
    }
    document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(smoothScrollToTarget);

    // ==================== CINEMATIC HEADER ANIMATION ====================
    function animateHeaderCinematic() {
        const navLinks = header.querySelectorAll('.nav-link');
        navLinks.forEach((link, idx) => {
            link.style.transition = `transform 0.8s ease ${idx * 0.1}s, opacity 0.8s ease ${idx * 0.1}s`;
            link.style.transform = 'translateY(-15px) rotateX(10deg)';
            link.style.opacity = '0';
            setTimeout(() => { link.style.transform = 'translateY(0) rotateX(0)'; link.style.opacity = '1'; }, 100);
        });
        if (cartIcon) { cartIcon.style.transform = 'scale(0.7) rotateY(0deg)'; setTimeout(() => cartIcon.style.transform = 'scale(1) rotateY(0deg)', 200); }
        if (logo) { logo.style.transform = 'translateY(-5px) rotateY(0deg)'; setTimeout(() => logo.style.transform = 'translateY(0) rotateY(0deg)', 300); }
        const slogans = header.querySelectorAll('.luxury-slogan, .luxury-slogan-sub');
        slogans.forEach((s, idx) => {
            s.style.transform = 'translateY(-10px) rotateX(0deg)';
            s.style.opacity = '0';
            setTimeout(() => { s.style.transform = 'translateY(0) rotateX(0deg)'; s.style.opacity = '1'; }, 300);
        });
    }
    animateHeaderCinematic();
    window.addEventListener('scroll', animateHeaderCinematic);

    // ==================== HEADER PATTERN ANIMATION ====================
    const patternContainer = document.createElement('div');
    patternContainer.className = 'header-pattern-layer';
    header.appendChild(patternContainer);
    const patternCount = 100;
    const patternImages = [];
    for (let i = 0; i < patternCount; i++) {
        const img = document.createElement('img');
        img.src = 'images/header.png';
        img.className = 'pattern-tile';
        img.style.position = 'absolute';
        img.style.width = `${Math.random() * 25 + 20}px`;
        img.style.height = `${Math.random() * 25 + 20}px`;
        img.style.top = `${Math.random() * 100}%`;
        img.style.left = `${Math.random() * 100}%`;
        img.style.opacity = (0.05 + Math.random() * 0.4).toString();
        img.style.transition = 'transform 6s ease-in-out';
        patternContainer.appendChild(img);
        patternImages.push(img);
    }
    function animatePattern() {
        patternImages.forEach(img => {
            const dx = (Math.random() - 0.5) * 20;
            const dy = (Math.random() - 0.5) * 20;
            img.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 15 - 7}deg)`;
        });
    }
    setInterval(animatePattern, 3500);

    // ==================== SUBTLE LOGO & SLOGAN FLOAT ====================
    let floatDir = 1;
    setInterval(() => {
        if (logo) logo.style.transform = `translateY(${floatDir * 2}px)`;
        header.querySelectorAll('.luxury-slogan, .luxury-slogan-sub').forEach(s => s.style.transform = `translateY(${floatDir}px)`);
        floatDir *= -1;
    }, 2000);

})();
