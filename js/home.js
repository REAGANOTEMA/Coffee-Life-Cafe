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
const headerPattern = header.querySelector('.header-pattern');

// ===== HIDE HEADER IMAGE COMPLETELY =====
if (headerPattern) {
headerPattern.style.display = 'none';
headerPattern.style.opacity = '0';
headerPattern.style.visibility = 'hidden';
}

// ===== CART MANAGEMENT =====
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

// ===== LANGUAGE SWITCH =====
const langBtn = header.querySelector('.lang-toggle');
if (langBtn) {
langBtn.addEventListener('click', () => {
const newLang = (localStorage.getItem('luxury_lang') || DEFAULT_LANG) === 'en' ? 'ar' : 'en';
setLanguage(newLang);
});
}

function setLanguage(lang) {
localStorage.setItem('luxury_lang', lang);
navLinks.forEach((link, idx) => link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en);
if (mobileMenu) {
mobileMenu.querySelectorAll('.mobile-link').forEach((link, idx) => {
link.textContent = NAV_ITEMS[idx].label[lang] || NAV_ITEMS[idx].label.en;
});
}
if (title) title.textContent = (lang === 'ar') ? 'قهوة الحياة' : 'Coffee Life';
if (slogan) slogan.textContent = (lang === 'ar') ? 'كل. اجتمع. اعمل.' : 'Eat. Meet. Work.';
}
setLanguage(DEFAULT_LANG);

// ===== MOBILE MENU =====
if (hamburger && mobileMenu) {
hamburger.addEventListener('click', () => {
const isActive = mobileMenu.classList.toggle('active');
hamburger.classList.toggle('active', isActive);
hamburger.setAttribute('aria-expanded', isActive);
mobileMenu.setAttribute('aria-hidden', !isActive);
});

```
mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});
```

}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('.nav-link, .mobile-link, .logo').forEach(el => {
el.addEventListener('click', e => {
const href = el.getAttribute('href');
if (!href || !href.includes('#')) return;
e.preventDefault();
const target = document.getElementById(href.split('#')[1]);
if (target) window.scrollTo({ top: target.offsetTop - header.offsetHeight, behavior: 'smooth' });
else window.location.href = href;
});
});

// ===== CINEMATIC NAV LINKS =====
navLinks.forEach((link, idx) => {
link.style.transition = `transform 0.8s ease ${idx * 0.1}s, opacity 0.8s ease ${idx * 0.1}s, box-shadow 0.3s ease`;
link.style.transform = 'translateY(-15px) rotateX(15deg)';
link.style.opacity = '0';
setTimeout(() => {
link.style.transform = 'translateY(0) rotateX(0)';
link.style.opacity = '1';
}, 100);

```
link.addEventListener('mouseenter', () => {
  link.style.transform = 'translateY(-3px) rotateX(5deg) scale(1.05)';
  link.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
});
link.addEventListener('mouseleave', () => {
  link.style.transform = 'translateY(0) rotateX(0) scale(1)';
  link.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
});
```

});

// ===== LOGO VISIBILITY (STATIC) =====
if (logo) {
logo.style.display = 'block';
logo.style.opacity = '1';
logo.style.visibility = 'visible';
logo.style.zIndex = '9999';
logo.style.position = 'relative';
logo.style.objectFit = 'contain';
logo.style.filter = 'brightness(1.2) contrast(1.1)';
logo.style.transformOrigin = 'center center';
logo.style.background = '#fff';
logo.style.borderRadius = '12%';
logo.style.border = '2px solid rgba(255,255,255,0.8)';
logo.style.boxShadow = '0 0 25px rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.5)';
logo.style.transform = 'none'; // no rotation
}

// ===== CART ANIMATION =====
if (cartIcon) {
cartIcon.style.transition = 'transform 0.5s ease';
cartIcon.style.transform = 'scale(0.7)';
setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
}

// ===== TITLE & SLOGAN VISIBILITY =====
if (title) {
title.style.color = '#fff';
title.style.opacity = '1';
title.style.position = 'relative';
title.style.zIndex = '100';
title.style.textShadow = '2px 2px 12px rgba(0,0,0,1), 0 0 10px rgba(255,255,255,0.5)';
}
if (slogan) {
slogan.style.color = '#fff';
slogan.style.opacity = '1';
slogan.style.position = 'relative';
slogan.style.zIndex = '100';
slogan.style.textShadow = '1px 1px 10px rgba(0,0,0,1)';
}

// ===== HORIZONTAL TITLE ANIMATION =====
let position = 0, direction = 1;
function animateTitleSlide() {
if (!title) return;
const maxSlide = 20;
position += direction * 0.6;
if (position > maxSlide || position < -maxSlide) direction *= -1;
title.style.transform = `translateX(${position}px)`;
requestAnimationFrame(animateTitleSlide);
}
animateTitleSlide();

// ===== MOBILE OPTIMIZATION =====
function adjustHeaderForMobile() {
const screenWidth = window.innerWidth;
if (screenWidth <= 768) {
header.style.padding = '10px 15px';
header.style.minHeight = '60px';
if (logo) { logo.style.width = '55px'; logo.style.height = '55px'; }
if (title) title.style.fontSize = '1.2rem';
if (slogan) slogan.style.fontSize = '0.8rem';
} else {
header.style.padding = '20px 40px';
header.style.minHeight = '100px';
if (logo) { logo.style.width = '85px'; logo.style.height = '85px'; }
if (title) title.style.fontSize = '2rem';
if (slogan) slogan.style.fontSize = '1rem';
}
}
window.addEventListener('resize', adjustHeaderForMobile);
adjustHeaderForMobile();
})();
