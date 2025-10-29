// ===== GLOBAL JS (Luxury Header + PWA Ready) =====
(function () {
    // ===== Config =====
    const NAV_ITEMS = [
        { id: 'home', label: { en: 'Home', ar: 'الصفحة الرئيسية' }, href: '#home' },
        { id: 'menu', label: { en: 'Menu', ar: 'القائمة' }, href: '#menu' },
        { id: 'about', label: { en: 'About', ar: 'عنّا' }, href: '#about' },
        { id: 'contact', label: { en: 'Contact', ar: 'تواصل' }, href: '#contact' }
    ];

    const SOCIALS = [
        { id: 'instagram', label: 'Instagram', href: 'https://instagram.com', icon: '📸' },
        { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/', icon: '💬' },
        { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com', icon: '🎵' },
        { id: 'facebook', label: 'Facebook', href: 'https://facebook.com', icon: 'f' }
    ];

    const DEFAULT_LANG = localStorage.getItem('luxury_lang') || 'en';

    // ===== Element References =====
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const siteHeader = document.querySelector('.site-header');
    const navLinkItems = document.querySelectorAll('.nav-links a');
    const scrollElements = document.querySelectorAll('.animate-on-scroll');

    // ===== Hamburger / Mobile Menu Toggle =====
    if (hamburger && mobileMenu) {
        const openMobileMenu = () => {
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
            hamburger.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeMobileMenu = () => {
            mobileMenu.classList.remove('active');
            mobileMenu.style.maxHeight = '0';
            mobileMenu.style.opacity = '0';
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        };

        hamburger.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) closeMobileMenu();
            else openMobileMenu();
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) closeMobileMenu();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMobileMenu();
        });
    }

    // ===== Sticky Header =====
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) siteHeader.classList.add('scrolled');
        else siteHeader.classList.remove('scrolled');
    });

    // ===== Smooth Scroll & Highlight Active =====
    const sections = document.querySelectorAll('section[id]');
    navLinkItems.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
            if (mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 80;
            const sectionId = section.getAttribute('id');
            const link = document.querySelector('.nav-links a[href*=' + sectionId + ']');
            if (!link) return;
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) link.classList.add('active');
            else link.classList.remove('active');
        });
    });

    // ===== Scroll Reveal =====
    const elementInView = (el, dividend = 1) => el.getBoundingClientRect().top <= (window.innerHeight / dividend);
    const handleScrollAnimation = () => {
        scrollElements.forEach(el => {
            if (elementInView(el, 1.2)) el.classList.add('visible');
            else el.classList.remove('visible');
        });
    };
    window.addEventListener('scroll', handleScrollAnimation);


    // ===== Responsive Menu Grid =====
    const adjustMenuGrid = () => {
        const menuContainer = document.getElementById("menu-container");
        if (!menuContainer) return;
        if (window.innerWidth <= 600) menuContainer.style.gridTemplateColumns = "1fr";
        else if (window.innerWidth <= 900) menuContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
        else if (window.innerWidth <= 1200) menuContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
        else menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
    };
    window.addEventListener("resize", adjustMenuGrid);
    window.addEventListener("DOMContentLoaded", adjustMenuGrid);

    // ===== Service Worker =====
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.error('SW registration failed:', err));
    }

    // ===== PWA Install =====
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const btn = document.createElement('button');
        btn.textContent = 'Install CoffeeLife App';
        btn.className = 'btn-install';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: '1000',
            padding: '15px 25px',
            backgroundColor: '#b85c38',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
        });
        document.body.appendChild(btn);
        btn.addEventListener('click', async () => {
            btn.style.display = 'none';
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
        });
    });

    // ===== WhatsApp Button =====
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const phone = '+256709691395';
            const message = encodeURIComponent('Hello CoffeeLife, I want to place an order.');
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        });
    }

})();
