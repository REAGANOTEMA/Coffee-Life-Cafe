// ================= FINAL MENU.JS (MAGICAL VERSION) =================
(() => {
  'use strict';

  const STORAGE_KEY = 'COFFEE_CART';
  let cart = [];

  // ======= LOAD CART FROM LOCALSTORAGE =======
  const loadCart = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    cart = saved ? JSON.parse(saved) : [];
  };

  const saveCart = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  };

  const formatUGX = (v) => (Number(v) || 0).toLocaleString() + ' UGX';

  // ======= TOAST =======
  const toastEl = document.createElement('div');
  toastEl.id = 'magic-toast';
  Object.assign(toastEl.style, {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
    background: '#ffb300', color: '#000', padding: '10px 18px',
    borderRadius: '25px', fontWeight: 'bold', opacity: 0, transition: '0.5s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  });
  document.body.appendChild(toastEl);
  const showToast = (msg) => {
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    setTimeout(() => toastEl.style.opacity = '0', 2500);
  };

  // ======= ADD ITEM TO CART =======
  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...item, qty: 1 });
    saveCart();
    renderCart();
    showToast(`${item.name} added!`);
    animateCartBadge();
    showGoToPaymentPointer();
    launchConfetti();
  };

  // ======= REMOVE ITEM =======
  const removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  };

  // ======= CART BADGE ANIMATION =======
  const animateCartBadge = () => {
    let badge = document.querySelector('#cartBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'cartBadge';
      Object.assign(badge.style, {
        position: 'fixed', top: '20px', right: '20px', background: 'red',
        color: '#fff', width: '28px', height: '28px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '14px', zIndex: '9999', transition: '0.3s'
      });
      document.body.appendChild(badge);
    }
    badge.textContent = cart.reduce((a, b) => a + b.qty, 0);
    badge.style.transform = 'scale(1.3)';
    setTimeout(() => badge.style.transform = 'scale(1)', 300);
  };

  // ======= RENDER CART =======
  const renderCart = () => {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    if (!cart.length) {
      cartContainer.innerHTML = `<p style="padding:12px;color:#555;">Your cart is empty.</p>`;
      document.getElementById('cartSubtotal') && (document.getElementById('cartSubtotal').textContent = '0 UGX');
      document.getElementById('cartTotal') && (document.getElementById('cartTotal').textContent = '0 UGX');
      return;
    }

    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.qty;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.marginBottom = '10px';
      div.style.opacity = 0;
      div.style.transform = 'translateX(50px)';
      div.style.transition = 'all 0.6s ease';

      div.innerHTML = `
        <img src="${item.img}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;margin-right:10px;">
        <div style="flex:1">
          <strong>${item.name}</strong>
          <p>${formatUGX(item.price)} x ${item.qty}</p>
        </div>
        <div>
          <button class="qty-btn minus" data-id="${item.id}">-</button>
          <span style="margin:0 5px;">${item.qty}</span>
          <button class="qty-btn plus" data-id="${item.id}">+</button>
          <button class="remove" data-id="${item.id}">Remove</button>
        </div>
      `;
      cartContainer.appendChild(div);

      setTimeout(() => { div.style.opacity = 1; div.style.transform = 'translateX(0)'; }, 50);

      // Event listeners
      div.querySelector('.minus').addEventListener('click', () => {
        item.qty -= 1;
        if (item.qty <= 0) removeFromCart(item.id);
        else { saveCart(); renderCart(); animateCartBadge(); }
      });
      div.querySelector('.plus').addEventListener('click', () => {
        item.qty += 1;
        saveCart(); renderCart(); animateCartBadge();
      });
      div.querySelector('.remove').addEventListener('click', () => { removeFromCart(item.id); animateCartBadge(); });
    });

    // Update totals
    const deliveryFee = parseInt(document.getElementById('deliveryFeeSummary')?.textContent.replace(/,/g, '').replace(' UGX', '')) || 0;
    document.getElementById('cartSubtotal') && (document.getElementById('cartSubtotal').textContent = formatUGX(subtotal));
    document.getElementById('cartTotal') && (document.getElementById('cartTotal').textContent = formatUGX(subtotal + deliveryFee));
  };

  // ======= ATTACH ADD BUTTONS =======
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const parentArticle = btn.closest('.menu-item');
      if (!parentArticle) return;

      const item = {
        id: parentArticle.dataset.id,
        name: parentArticle.dataset.name,
        price: parseInt(parentArticle.dataset.price),
        img: parentArticle.querySelector('img')?.src || ''
      };

      addToCart(item);
    });
  });

  // ======= CHECKOUT POINTER MAGIC =======
  const showGoToPaymentPointer = () => {
    let pointer = document.querySelector('#goToPaymentPointer');
    if (!pointer) {
      pointer = document.createElement('div');
      pointer.id = 'goToPaymentPointer';
      pointer.innerHTML = `<div class="pointer-bubble">👉 <strong>Checkout Now!</strong></div>`;
      document.body.appendChild(pointer);

      Object.assign(pointer.style, {
        position: 'fixed', bottom: '80px', right: '20px', zIndex: '9999', cursor: 'pointer'
      });
      const bubble = pointer.querySelector('.pointer-bubble');
      Object.assign(bubble.style, {
        background: '#ffb300', color: '#000', fontWeight: 'bold', padding: '10px 16px',
        borderRadius: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', animation: 'pulse 1.2s infinite'
      });

      bubble.addEventListener('click', () => {
        window.location.href = 'payment.html';
      });

      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
      `;
      document.head.appendChild(style);
    }

    pointer.style.display = 'block';
    setTimeout(() => { pointer.style.display = 'none'; }, 7000);
  };

  // ======= CONFETTI MAGIC WHEN ITEM ADDED =======
  const launchConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9998';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = '-10px';
      confetti.style.opacity = 0.8;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.transition = 'all 1s linear';
      confettiContainer.appendChild(confetti);

      setTimeout(() => {
        confetti.style.top = `${window.innerHeight + 20}px`;
        confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
      }, 50);

      setTimeout(() => confetti.remove(), 1200);
    }

    setTimeout(() => confettiContainer.remove(), 1500);
  };

  // ======= INIT =======
  loadCart();
  renderCart();
  animateCartBadge();

  window.CoffeeLifeCart = { addToCart, removeFromCart, renderCart, cart };
})();
