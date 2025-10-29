/* =========================================
   ULTRA-LUXURY HEADER - CLEAN FINAL JS
========================================= */
(function () {
    const NAV_ITEMS = [
        { id: 'home', label: { en: 'Home', ar: 'الصفحة الرئيسية' }, href: '#home' },
        { id: 'menu', label: { en: 'Menu', ar: 'القائمة' }, href: '#menu' },
        { id: 'about', label: { en: 'About', ar: 'عنّا' }, href: '#about' },
        { id: 'contact', label: { en: 'Contact', ar: 'تواصل' }, href: '#contact' }
    ];

    const DEFAULT_LANG = localStorage.getItem('luxury_lang') || 'en';

    const header = document.querySelector('.site-header') || createHeader();
    if (!header.id) header.id = 'mainHeader';

    // ===== Clear old content =====
    header.innerHTML = '';

    // ===== Inject Logo =====
    function injectLogo() {
        const logoWrapper = document.createElement('div');
        logoWrapper.className = 'logo-wrapper';
        logoWrapper.style.display = 'flex';
        logoWrapper.style.alignItems = 'center';
        logoWrapper.style.gap = '10px';
        logoWrapper.innerHTML = `
            <div class="logo-circle" style="width:50px;height:50px;border:2px solid #000;border-radius:50%;overflow:hidden;">
                <img src="images/logo.jpg" alt="Logo" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="logo-text" style="display:flex;flex-direction:column;font-weight:700;color:#000;">
                <span class="luxury-slogan">Moments Begin with Coffee</span>
                <span class="luxury-slogan-sub" style="font-weight:500;font-size:0.85rem;">Where Comfort Meets Flavor</span>
            </div>
        `;
        header.appendChild(logoWrapper);
    }
    injectLogo();

    // ===== Nav Links =====
    const navLinks = document.createElement('div');
    navLinks.className = 'nav-links';
    navLinks.style.display = 'flex';
    navLinks.style.gap = '20px';
    header.appendChild(navLinks);

    function buildNav(lang = DEFAULT_LANG) {
        navLinks.innerHTML = '';
        NAV_ITEMS.forEach(item => {
            const a = document.createElement('a');
            a.href = item.href;
            a.className = 'nav-link';
            a.textContent = item.label[lang] || item.label.en;
            navLinks.appendChild(a);
        });
    }
    buildNav(DEFAULT_LANG);

    // ===== Right Controls: Cart, Profile, Language =====
    const controls = document.createElement('div');
    controls.className = 'header-controls';
    controls.style.display = 'flex';
    controls.style.alignItems = 'center';
    controls.style.gap = '12px';
    header.appendChild(controls);

    // Cart
    const cartBtn = document.createElement('div');
    cartBtn.className = 'cart-icon';
    cartBtn.innerHTML = `🛒 <span class="cart-count">0</span>`;
    cartBtn.style.cursor = 'pointer';
    controls.appendChild(cartBtn);

    // Profile
    const profileBtn = document.createElement('button');
    profileBtn.className = 'profile-icon';
    profileBtn.textContent = '👤';
    profileBtn.style.background = 'none';
    profileBtn.style.border = 'none';
    profileBtn.style.cursor = 'pointer';
    profileBtn.style.color = '#000';
    controls.appendChild(profileBtn);

    // Language toggle
    const langBtn = document.createElement('button');
    langBtn.className = 'lang-toggle';
    langBtn.textContent = '🌐';
    langBtn.style.background = 'none';
    langBtn.style.border = 'none';
    langBtn.style.cursor = 'pointer';
    langBtn.style.color = '#000';
    controls.appendChild(langBtn);
    langBtn.addEventListener('click', () => {
        const newLang = (localStorage.getItem('luxury_lang') || DEFAULT_LANG) === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    });

    // ===== Mobile Menu =====
    let mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobileMenu';
        mobileMenu.className = 'mobile-menu';
        document.body.appendChild(mobileMenu);
    }
    function buildMobileMenu(lang = DEFAULT_LANG) {
        mobileMenu.innerHTML = '';
        NAV_ITEMS.forEach(item => {
            const a = document.createElement('a');
            a.href = item.href;
            a.className = 'mobile-link';
            a.textContent = item.label[lang] || item.label.en;
            a.addEventListener('click', () => closeMobileMenu());
            mobileMenu.appendChild(a);
        });
    }
    buildMobileMenu(DEFAULT_LANG);

    let hamburger = document.getElementById('hamburger');
    if (!hamburger) {
        hamburger = document.createElement('button');
        hamburger.id = 'hamburger';
        hamburger.className = 'hamburger';
        hamburger.innerHTML = `<span class="bar"></span><span class="bar"></span><span class="bar"></span>`;
        header.appendChild(hamburger);
    }
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
    });

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileMenu.style.display = 'flex';
        mobileMenu.style.flexDirection = 'column';
        mobileMenu.style.position = 'absolute';
        mobileMenu.style.top = '100%';
        mobileMenu.style.left = '0';
        mobileMenu.style.width = '100%';
        mobileMenu.style.backgroundColor = '#fff';
        mobileMenu.style.transition = 'max-height 0.4s ease, opacity 0.4s ease';
        mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
        mobileMenu.style.opacity = '1';
    }
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenu.style.maxHeight = '0';
        mobileMenu.style.opacity = '0';
        setTimeout(() => mobileMenu.style.display = 'none', 400);
    }

    // ===== Language Switch =====
    function setLanguage(lang) {
        localStorage.setItem('luxury_lang', lang);
        buildNav(lang);
        buildMobileMenu(lang);
        const slogan = document.querySelector('.luxury-slogan');
        if (slogan) slogan.textContent = (lang === 'ar') ? 'اللحظات تبدأ بالقهوة' : 'Moments Begin with Coffee';
    }

    // ===== Cart Count =====
    window.cart = window.cart || [];
    function updateCartCount() {
        const total = window.cart.reduce((sum, i) => sum + (i.qty || 0), 0);
        const span = cartBtn.querySelector('.cart-count');
        if (span) span.textContent = total;
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

    // ===== Helper =====
    function createHeader() {
        const h = document.createElement('header');
        h.className = 'site-header';
        document.body.prepend(h);
        return h;
    }
})();
