/* =========================================
   ULTRA-LUXURY CAFÉ HEADER - FINAL JS
   - White/light header
   - Black links bold
   - Dark yellow slogan
   - Hamburger works on mobile
   - Cart bubble shows counts dynamically
========================================= */

const header = document.getElementById("mainHeader") || document.querySelector("header");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
let cartCount = document.getElementById("cart-count");

// ===== REMOVE ALL ORDER BUTTONS =====
document.querySelectorAll('.btn-cta, [href*="order"]').forEach(el => el.remove());

// ===== INJECT LOGO + CINEMATIC SLOGAN =====
(function injectLogo() {
    const prev = document.getElementById('luxury-logo-wrapper');
    if (prev) prev.remove();

    const logoWrapper = document.createElement('div');
    logoWrapper.id = "luxury-logo-wrapper";
    logoWrapper.setAttribute('aria-hidden', 'false');
    logoWrapper.innerHTML = `
      <div class="luxury-logo-inner" role="img" aria-label="Cafe logo">
        <div class="luxury-logo-circle">
            <img src="images/logo.jpg" alt="Cafe Logo" class="luxury-logo-img" />
        </div>
        <div class="luxury-copy">
          <div class="luxury-slogan">Moments Begin with Coffee</div>
          <div class="luxury-slogan-sub">Where Comfort Meets Flavor</div>
        </div>
      </div>
    `;
    if (header) header.prepend(logoWrapper);
})();

// ===== HAMBURGER MENU TOGGLE =====
if (hamburger) {
    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('aria-controls', mobileMenu ? mobileMenu.id : '');
    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        if (mobileMenu) mobileMenu.classList.toggle('active', isActive);
        hamburger.setAttribute('aria-expanded', String(isActive));
    });

    document.addEventListener('click', e => {
        if (!mobileMenu) return;
        if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// ===== CART MODEL =====
window.cart = window.cart || [];

function updateCartCountDisplay() {
    cartCount = cartCount || document.getElementById('cart-count');
    const count = window.cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.textContent = count;
}

// ===== ADD / REMOVE ITEMS FROM CART =====
function addToCart(item) {
    if (!item?.id) return;
    const existing = window.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else window.cart.push({ ...item, qty: 1 });
    updateCartCountDisplay();
}

function removeFromCart(itemId) {
    const existing = window.cart.find(i => i.id === itemId);
    if (!existing) return;
    existing.qty--;
    if (existing.qty <= 0) window.cart = window.cart.filter(i => i.id !== itemId);
    updateCartCountDisplay();
}

window.globalAddToCart = addToCart;
window.globalRemoveFromCart = removeFromCart;

// ===== FLOATING CART BUBBLE =====
(function setupFloatingCart() {
    const bubble = document.createElement('div');
    bubble.className = 'floating-cart-bubble';
    bubble.innerHTML = `
      <button class="floating-cart-btn" aria-label="Open cart" type="button">
        🛒 <span class="bubble-count">0</span>
      </button>
    `;
    document.body.appendChild(bubble);

    const btn = bubble.querySelector('.floating-cart-btn');
    btn.addEventListener('click', () => {
        alert('Cart is managed dynamically. Count only.');
    });
})();

// ===== SITE-WIDE ADD TO CART LISTENER =====
document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    const id = btn.dataset.id || btn.getAttribute('data-id') || btn.getAttribute('data-item-id');
    const title = btn.dataset.title || btn.getAttribute('data-title') || btn.innerText || 'Item';
    const price = Number(btn.dataset.price || btn.getAttribute('data-price') || '0') || 0;
    if (!id) return;
    addToCart({ id, title, price });
    btn.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 180, easing: 'ease' });
});

// ===== CINEMATIC SLOGAN SLIDER =====
(function cinematicSlider() {
    const slogans = [
        "Moments Begin with Coffee",
        "Where Comfort Meets Flavor",
        "Live the Aroma • Love the Experience",
        "Your Daily Dose of Perfection",
        "Coffee Life Café, Brewing Happiness",
        "A Cup That Inspires Your Day"
    ];
    const sloganEl = document.querySelector('.luxury-slogan');
    if (!sloganEl) return;
    let index = 0;

    function animateText() {
        sloganEl.textContent = slogans[index];
        index = (index + 1) % slogans.length;
    }

    animateText();
    setInterval(animateText, 6500);
})();
