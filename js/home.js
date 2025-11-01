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
    const navLinks = header.querySelectorAll('.nav-link');

    /* ==================== CART MANAGEMENT ==================== */
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

    /* ==================== LANGUAGE SWITCH ==================== */
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

    /* ==================== MOBILE MENU TOGGLE ==================== */
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenu.style.display = 'none';
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
    hamburger.addEventListener('click', () => {
        const isActive = mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        mobileMenu.style.display = isActive ? 'flex' : 'none';
        hamburger.setAttribute('aria-expanded', isActive);
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    /* ==================== SMOOTH SCROLL ==================== */
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

    /* ==================== CINEMATIC HEADER ANIMATIONS ==================== */
    function animateHeaderElements() {
        // Nav links 3D HD buttons
        navLinks.forEach((link, idx) => {
            link.style.transition = `transform 0.6s ease ${idx*0.1}s, opacity 0.6s ease ${idx*0.1}s, box-shadow 0.3s ease`;
            link.style.transform = 'translateY(-15px) rotateX(10deg)';
            link.style.opacity = '0';
            setTimeout(() => {
                link.style.transform = 'translateY(0) rotateX(0)';
                link.style.opacity = '1';
            }, 100);

            // Hover and active effect
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-3px) rotateX(5deg) scale(1.05)';
                link.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) rotateX(0) scale(1)';
                link.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            });
            link.addEventListener('mousedown', () => {
                link.style.backgroundColor = '#c0392b'; // pressed red
                link.style.color = '#fff';
            });
            link.addEventListener('mouseup', () => {
                link.style.backgroundColor = '#bfa14f'; // dark gold
                link.style.color = '#111';
            });
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
            title.style.opacity = '1';
        }
        if (slogan) {
            slogan.style.transition = 'opacity 1s ease';
            slogan.style.opacity = '1';
        }
    }
    animateHeaderElements();
    window.addEventListener('scroll', animateHeaderElements);

    /* ==================== TV-STYLE TITLE SLIDE ==================== */
    let position = 0, direction = 1;
    function animateTitleSlide() {
        if (!title) return;
        const maxSlide = 25; // horizontal movement
        position += direction * 0.5;
        if (position > maxSlide || position < -maxSlide) direction *= -1;
        title.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animateTitleSlide);
    }
    animateTitleSlide();

})();
