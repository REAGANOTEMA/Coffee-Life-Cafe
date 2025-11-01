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

    const logo = header.querySelector('.logo img');
    const title = header.querySelector('.luxury-title');
    const slogan = header.querySelector('.luxury-slogan');
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
        if (title) title.textContent = (lang === 'ar') ? 'قهوة الحياة' : 'Coffee Life';
        if (slogan) slogan.textContent = (lang === 'ar') ? 'كل. اجتمع. اعمل.' : 'Eat. Meet. Work.';
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
            hamburger.classList.remove('active');
            mobileMenu.style.display = 'none';
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
            if (target) window.scrollTo({ top: target.offsetTop - header.offsetHeight, behavior: 'smooth' });
            else window.location.href = href;
        });
    }
    document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(smoothScrollToTarget);

    // ==================== CINEMATIC ANIMATIONS ====================
    function animateHeaderElements() {
        // Nav links 3D HD
        const navLinks = header.querySelectorAll('.nav-link');
        navLinks.forEach((link, idx) => {
            link.style.transition = `transform 0.8s ease ${idx * 0.1}s, opacity 0.8s ease ${idx * 0.1}s`;
            link.style.transform = 'translateY(-15px) rotateX(15deg)';
            link.style.opacity = '0';
            setTimeout(() => {
                link.style.transform = 'translateY(0) rotateX(0)';
                link.style.opacity = '1';
            }, 100);
        });

        // Logo animation
        if (logo) {
            logo.style.transition = 'transform 0.7s ease';
            logo.style.transform = 'translateY(-5px) scale(0.95)';
            setTimeout(() => logo.style.transform = 'translateY(0) scale(1)', 300);
        }

        // Cart
        if (cartIcon) {
            cartIcon.style.transition = 'transform 0.5s ease';
            cartIcon.style.transform = 'scale(0.7)';
            setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
        }

        // Title & Slogan cinematic
        if (title) {
            title.style.transition = 'transform 0.7s ease, opacity 0.7s ease';
            title.style.transform = 'translateY(-10px)';
            title.style.opacity = '0';
            setTimeout(() => {
                title.style.transform = 'translateY(0)';
                title.style.opacity = '1';
            }, 200);
        }
        if (slogan) {
            slogan.style.transition = 'transform 0.7s ease, opacity 0.7s ease';
            slogan.style.transform = 'translateY(-5px)';
            slogan.style.opacity = '0';
            setTimeout(() => {
                slogan.style.transform = 'translateY(0)';
                slogan.style.opacity = '1';
            }, 400);
        }
    }
    animateHeaderElements();
    window.addEventListener('scroll', animateHeaderElements);

    // ==================== TV-STYLE TITLE SLIDE ====================
    let position = 0, direction = 1;
    function animateTitleSlide() {
        if (!title) return;
        const maxSlide = 15; // TV style sliding
        position += direction * 0.6; // speed
        if (position > maxSlide || position < -maxSlide) direction *= -1;
        title.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animateTitleSlide);
    }
    animateTitleSlide();
})();
(function () {
    const header = document.getElementById('mainHeader');
    const title = header.querySelector('.luxury-title');
    const slogan = header.querySelector('.luxury-slogan');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        const active = mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        mobileMenu.style.display = active ? 'flex' : 'none';
        hamburger.setAttribute('aria-expanded', active);
    });

    // Mobile link click
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            hamburger.classList.remove('active');
            mobileMenu.style.display = 'none';
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Smooth scroll
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

    // TV-style title slide
    let pos = 0, dir = 1;
    function animateTitle() {
        if (!title) return;
        const maxSlide = 15; // pixels
        pos += dir * 0.5;
        if (pos > maxSlide || pos < -maxSlide) dir *= -1;
        title.style.transform = `translateX(${pos}px)`;
        requestAnimationFrame(animateTitle);
    }
    animateTitle();
})();
