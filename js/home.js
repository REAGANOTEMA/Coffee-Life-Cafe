/* =========================================
   ULTRA-LUXURY CINEMATIC HEADER - FINAL JS
   TITLE SLIDES LIKE TV, SLOGAN STATIC
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

    const logo = header.querySelector('.logo img');
    const title = header.querySelector('.luxury-title');
    const slogan = header.querySelector('.luxury-slogan');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const cartIcon = header.querySelector('.cart-icon .cart-count-badge');
    const navLinks = header.querySelectorAll('.nav-link');

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
        navLinks.forEach((link, idx) => link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en);
        mobileMenu.querySelectorAll('.mobile-link').forEach((link, idx) => link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en);
        if (title) title.textContent = (lang === 'ar') ? 'قهوة الحياة' : 'Coffee Life';
        if (slogan) slogan.textContent = (lang === 'ar') ? 'كل. اجتمع. اعمل.' : 'Eat. Meet. Work.';
    }
    setLanguage(DEFAULT_LANG);

    // ==================== MOBILE MENU TOGGLE ====================
    hamburger.addEventListener('click', () => {
        const isActive = mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        mobileMenu.style.display = isActive ? 'flex' : 'none';
        hamburger.setAttribute('aria-expanded', isActive);
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            hamburger.classList.remove('active');
            mobileMenu.style.display = 'none';
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // ==================== SMOOTH SCROLL ====================
    document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(el => {
        el.addEventListener('click', e => {
            const href = el.getAttribute('href');
            if (!href.includes('#')) return;
            e.preventDefault();
            const target = document.getElementById(href.split('#')[1]);
            if (target) window.scrollTo({ top: target.offsetTop - header.offsetHeight, behavior: 'smooth' });
            else window.location.href = href;
        });
    });

    // ==================== TV-STYLE TITLE SLIDE ====================
    let position = 0;
    let direction = 1;
    function animateTitleSlide() {
        if (!title) return;

        // Determine width dynamically
        const titleWidth = title.offsetWidth;
        const headerWidth = header.offsetWidth;

        // Move title left and right, loop if out of screen
        position += direction * 0.7; // speed
        if (position > (headerWidth - titleWidth) / 2 || position < -(headerWidth - titleWidth) / 2) direction *= -1;
        title.style.transform = `translateX(${position}px)`; // horizontal slide only

        requestAnimationFrame(animateTitleSlide);
    }
    animateTitleSlide();

})();
