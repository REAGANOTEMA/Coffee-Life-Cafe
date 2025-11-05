(() => {
'use strict';

const STORAGE_KEY = 'COFFEE_CART';
let cart = [];

// ======= LOAD / SAVE CART =======
const loadCart = () => {
const saved = localStorage.getItem(STORAGE_KEY);
cart = saved ? JSON.parse(saved) : [];
};
const saveCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';

// ======= VOICE GUIDANCE =======
const speak = text => {
if (!('speechSynthesis' in window)) return;
const u = new SpeechSynthesisUtterance(text);
u.rate = 1.05;
u.pitch = 1;
u.lang = 'en-US';
window.speechSynthesis.speak(u);
};

// Welcome Message
window.addEventListener('load', () => speak('Welcome! Browse our menu and select your items.'));

// ======= TOAST SYSTEM =======
const toastEl = document.createElement('div');
toastEl.id = 'magic-toast';
Object.assign(toastEl.style, {
position: 'fixed', bottom: '20px', right: '20px', left: '20px', textAlign: 'center',
zIndex: 9999, background: '#ffb300', color: '#000', padding: '12px 18px',
borderRadius: '25px', fontWeight: 'bold', opacity: 0, transition: 'opacity 0.5s, transform 0.5s',
transform: 'translateY(20px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
});
document.body.appendChild(toastEl);
const showToast = msg => {
toastEl.textContent = msg;
toastEl.style.opacity = '1';
toastEl.style.transform = 'translateY(0)';
setTimeout(() => {
toastEl.style.opacity = '0';
toastEl.style.transform = 'translateY(20px)';
}, 2500);
speak(msg);
};

// ======= ADD ITEM WITH COMPANION PROMPT =======
const addToCart = async item => {
let companion = prompt(`Which companion do you want for "${item.name}"?`);
companion = companion ? companion.trim() : 'No companion';

```
const existing = cart.find(i => i.id === item.id && i.companion === companion);
existing ? existing.qty++ : cart.push({ ...item, qty: 1, companion });

saveCart();
renderCart();
animateCartBadge();
showToast(`Added ${item.name} (${companion}) to your cart!`);
showGoToPaymentPointer();
launchConfetti();
```

};

// ======= REMOVE ITEM =======
const removeFromCart = id => {
const removedItem = cart.find(i => i.id === id);
cart = cart.filter(i => i.id !== id);
saveCart();
renderCart();
animateCartBadge();
removedItem && speak(`${removedItem.name} removed from your cart.`);
};

// ======= CART BADGE =======
const animateCartBadge = () => {
let badge = document.querySelector('#cartBadge');
if (!badge) {
badge = document.createElement('div');
badge.id = 'cartBadge';
Object.assign(badge.style, {
position: 'fixed', top: '16px', right: '18px', background: 'red', color: '#fff',
width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px',
zIndex: 9999, transition: 'transform 0.3s'
});
document.body.appendChild(badge);
}
badge.textContent = cart.reduce((a, b) => a + b.qty, 0);
badge.style.transform = 'scale(1.3)';
setTimeout(() => badge.style.transform = 'scale(1)', 300);
};

// ======= RENDER CART =======
const renderCart = () => {
const container = document.getElementById('cartItems');
if (!container) return;

```
container.innerHTML = '';
if (!cart.length) {
  container.innerHTML = `<p style="padding:12px;color:#555;">Your cart is empty.</p>`;
  ['cartSubtotal', 'cartTotal'].forEach(id => document.getElementById(id) && (document.getElementById(id).textContent = '0 UGX'));
  return;
}

let subtotal = 0;
cart.forEach(item => {
  subtotal += item.price * item.qty;

  const div = document.createElement('div');
  div.className = 'cart-item';
  div.style.cssText = 'display:flex;align-items:center;margin-bottom:0.2rem;padding:0.2rem;transition:all 0.4s ease;opacity:0;transform:translateX(40px)';

  div.innerHTML = `
    <img src="${item.img}" alt="${item.name}" style="width:55px;height:55px;object-fit:cover;border-radius:50%;margin-right:0.2rem;cursor:pointer;">
    <div style="flex:1;font-size:0.85rem;line-height:1.1;margin-right:0.2rem">
      <strong>${item.name}</strong> (${item.companion})
      <p>${formatUGX(item.price)} x ${item.qty}</p>
    </div>
    <div style="display:flex;gap:0.2rem;align-items:center;">
      <button class="qty-btn minus" data-id="${item.id}">-</button>
      <span>${item.qty}</span>
      <button class="qty-btn plus" data-id="${item.id}">+</button>
      <button class="remove" data-id="${item.id}">x</button>
    </div>
  `;
  container.appendChild(div);

  // Image preview
  div.querySelector('img').addEventListener('click', () => {
    const preview = document.createElement('div');
    preview.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
    preview.innerHTML = `<img src="${item.img}" alt="${item.name}" style="max-width:90%;max-height:90%;border-radius:12px;"><span style="position:absolute;top:20px;right:30px;font-size:30px;color:#fff;cursor:pointer;">&times;</span>`;
    document.body.appendChild(preview);
    preview.querySelector('span').addEventListener('click', () => preview.remove());
  });

  setTimeout(() => { div.style.opacity = 1; div.style.transform = 'translateX(0)'; }, 30);

  // Quantity & remove buttons
  div.querySelector('.minus').addEventListener('click', () => {
    item.qty--; 
    item.qty <= 0 ? removeFromCart(item.id) : (saveCart(), renderCart(), animateCartBadge());
  });
  div.querySelector('.plus').addEventListener('click', () => {
    item.qty++; 
    saveCart(); 
    renderCart(); 
    animateCartBadge(); 
    speak(`You have ${item.qty} ${item.name} in your cart.`);
  });
  div.querySelector('.remove').addEventListener('click', () => removeFromCart(item.id));
});

const deliveryFee = parseInt(document.getElementById('deliveryFeeSummary')?.textContent.replace(/,/g, '').replace(' UGX', '')) || 0;
document.getElementById('cartSubtotal') && (document.getElementById('cartSubtotal').textContent = formatUGX(subtotal));
document.getElementById('cartTotal') && (document.getElementById('cartTotal').textContent = formatUGX(subtotal + deliveryFee));
```

};

// ======= ATTACH ADD BUTTONS =======
document.querySelectorAll('.btn-add').forEach(btn => {
btn.addEventListener('click', e => {
e.preventDefault();
const a = btn.closest('.menu-item');
if (!a) return;
const item = { id: a.dataset.id, name: a.dataset.name, price: parseInt(a.dataset.price), img: a.querySelector('img')?.src || 'menu-images/default.webp' };
addToCart(item);
speak(`Excellent choice! ${item.name} added. Please select a companion.`);
});
});

// ======= POINTER TO PAYMENT =======
const showGoToPaymentPointer = () => {
let pointer = document.getElementById('goToPaymentPointer');
if (!pointer) {
pointer = document.createElement('div');
pointer.id = 'goToPaymentPointer';
pointer.innerHTML = `<div class="pointer-bubble">👉 <strong>Checkout Now!</strong></div>`;
document.body.appendChild(pointer);
const bubble = pointer.querySelector('.pointer-bubble');
Object.assign(bubble.style, { background: '#ffb300', color: '#000', fontWeight: 'bold', padding: '10px 16px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', animation: 'pulse 1.2s infinite', cursor: 'pointer' });
bubble.addEventListener('click', () => { speak('Redirecting you to checkout.'); window.location.href = 'payment.html'; });
const style = document.createElement('style');
style.textContent = `@keyframes pulse{0%{transform:scale(1);opacity:0.9}50%{transform:scale(1.1);opacity:1}100%{transform:scale(1);opacity:0.9}}`;
document.head.appendChild(style);
}
pointer.style.display = 'block';
setTimeout(() => pointer.style.display = 'none', 7000);
};

// ======= CONFETTI =======
const launchConfetti = () => {
const c = document.createElement('div');
Object.assign(c.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9998 });
document.body.appendChild(c);
for (let i = 0; i < 20; i++) {
const f = document.createElement('div');
Object.assign(f.style, { position: 'absolute', width: '10px', height: '10px', background: `hsl(${Math.random() * 360},100%,50%)`, left: `${Math.random() * 100}%`, top: '-10px', opacity: 0.8, transform: `rotate(${Math.random() * 360}deg)`, transition: 'all 1s linear' });
c.appendChild(f);
setTimeout(() => { f.style.top = `${window.innerHeight + 20}px`; f.style.transform = `rotate(${Math.random() * 720}deg)` }, 50);
setTimeout(() => f.remove(), 1200);
}
setTimeout(() => c.remove(), 1500);
};

// ======= INIT =======
loadCart();
renderCart();
animateCartBadge();
window.CoffeeLifeCart = { addToCart, removeFromCart, renderCart, cart };
})();
