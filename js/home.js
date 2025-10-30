/* ========================================= 
   ULTRA-LUXURY CINEMATIC HEADER - FINAL JS
========================================= */
(function () {
    const NAV_ITEMS = [
        { id: 'home', label: { en: 'Home', ar: 'الصفحة الرئيسية' }, href: '#home' },
        { id: 'menu', label: { en: 'Menu', ar: 'القائمة' }, href: '#menu' },
        { id: 'gallery', label: { en: 'Gallery', ar: 'معرض' }, href: '#gallery' },
        { id: 'contact', label: { en: 'Contact', ar: 'تواصل' }, href: '#contact' }
    ];

    const DEFAULT_LANG = localStorage.getItem('luxury_lang') || 'en';
    const header = document.querySelector('.site-header');
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
    const langBtn = document.createElement('button');
    langBtn.className = 'lang-toggle';
    langBtn.textContent = '🌐';
    langBtn.style.background = 'none';
    langBtn.style.border = 'none';
    langBtn.style.cursor = 'pointer';
    header.querySelector('.nav-actions').appendChild(langBtn);

    langBtn.addEventListener('click', () => {
        const newLang = (localStorage.getItem('luxury_lang') || DEFAULT_LANG) === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    });

    function setLanguage(lang) {
        localStorage.setItem('luxury_lang', lang);

        // Update desktop nav links
        const navLinks = header.querySelectorAll('.nav-link');
        navLinks.forEach((link, idx) => {
            link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en;
        });

        // Update mobile nav links
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
        mobileLinks.forEach((link, idx) => {
            link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en;
        });

        // Update logo slogan
        const slogan = header.querySelector('.luxury-slogan');
        if (slogan) slogan.textContent = (lang === 'ar') ? 'اللحظات تبدأ بالقهوة' : 'Moments Begin with Coffee';
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
            e.preventDefault();
            const targetId = el.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(smoothScrollToTarget);

    // ==================== CINEMATIC HEADER ANIMATIONS ====================
    function animateHeaderCinematic() {
        const navLinks = header.querySelectorAll('.nav-link');
        navLinks.forEach((link, idx) => {
            link.style.transition = `transform 0.8s ease ${idx * 0.1}s, opacity 0.8s ease ${idx * 0.1}s`;
            link.style.transform = 'translateY(-10px)';
            link.style.opacity = '0';
            setTimeout(() => {
                link.style.transform = 'translateY(0)';
                link.style.opacity = '1';
            }, 100);
        });

        // Animate cart icon
        if (cartIcon) {
            cartIcon.style.transition = 'transform 0.5s ease';
            cartIcon.style.transform = 'scale(0.7)';
            setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
        }

        // Animate logo
        if (logo) {
            logo.style.transition = 'transform 0.7s ease';
            logo.style.transform = 'translateY(-5px)';
            setTimeout(() => logo.style.transform = 'translateY(0)', 300);
        }
    }
    animateHeaderCinematic();

    // Optional: re-animate header on scroll for cinematic effect
    window.addEventListener('scroll', () => {
        animateHeaderCinematic();
    });

})();
