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

    const header = document.getElementById('mainHeader');
    if (!header) return;

    const logo = header.querySelector('.logo img');
    const title = header.querySelector('.luxury-title');
    const slogan = header.querySelector('.luxury-slogan');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const cartIcon = header.querySelector('.cart-count-badge');
    const navLinks = header.querySelectorAll('.nav-link');

    const DEFAULT_LANG = localStorage.getItem('luxury_lang') || 'en';

    // ==================== CART MANAGEMENT ====================
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
        const active = mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        mobileMenu.style.display = active ? 'flex' : 'none';
        hamburger.setAttribute('aria-expanded', active);
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
        });
    });

    // ==================== 3D NAV BUTTON ANIMATION ====================
    function animateNavButtons() {
        navLinks.forEach((link, idx) => {
            link.style.transition = `transform 0.8s ease ${idx*0.1}s, box-shadow 0.3s ease`;
            link.style.transform = 'translateY(-15px) rotateX(15deg)';
            setTimeout(() => {
                link.style.transform = 'translateY(0) rotateX(0)';
            }, 100);
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-3px) rotateX(5deg) scale(1.05)';
                link.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) rotateX(0) scale(1)';
                link.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            });
        });
    }

    // ==================== HEADER ELEMENTS ANIMATION ====================
    function animateHeaderElements() {
        // Logo
        if (logo) logo.style.transform = 'translateY(0) scale(1)';
        // Title & slogan opacity
        if (title) title.style.opacity = 1;
        if (slogan) slogan.style.opacity = 1;
        animateNavButtons();
    }
    animateHeaderElements();
    window.addEventListener('scroll', animateHeaderElements);

    // ==================== TV-STYLE TITLE SLIDE ====================
    let pos = 0, dir = 1;
    function animateTitleSlide() {
        if (!title) return;
        const maxSlide = 20; // horizontal movement in pixels
        pos += dir * 0.6; // speed
        if (pos > maxSlide || pos < -maxSlide) dir *= -1;
        title.style.transform = `translateX(${pos}px)`;
        requestAnimationFrame(animateTitleSlide);
    }
    animateTitleSlide();

})();
