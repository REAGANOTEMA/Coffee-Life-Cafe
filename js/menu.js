// ================= FINAL MENU.JS =================
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

  // ======= ADD ITEM TO CART =======
  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    saveCart();
    renderCart();
  };

  // ======= REMOVE ITEM =======
  const removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  };

  // ======= RENDER CART FOR DISPLAY =======
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

      // Event listeners
      div.querySelector('.minus').addEventListener('click', () => {
        item.qty -= 1;
        if (item.qty <= 0) removeFromCart(item.id);
        else { saveCart(); renderCart(); }
      });
      div.querySelector('.plus').addEventListener('click', () => {
        item.qty += 1;
        saveCart(); renderCart();
      });
      div.querySelector('.remove').addEventListener('click', () => removeFromCart(item.id));
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

  // ======= OPTIONAL: SMOOTH SCROLL FOR CATEGORY TABS =======
  document.querySelectorAll('.menu-cat').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(tab.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // ======= MAGICAL MENU ORGANIZER =======
  const organizeMenu = () => {
    const categoryMap = {
      'goat-stew': 'local-food',
      'chicken-stew': 'local-food',
      'beef-stew-local': 'local-food',
      'beans-or-peas': 'local-food',
      'chicken-pilau': 'local-food',
      'goats-pilau': 'local-food',
      'beef-pilau-local': 'local-food',

      'special-festival-pizza': 'pizzas',

      'vegetable-curry': 'curries',
      'chicken-curry': 'curries',
      'beef-curry': 'curries',
      'fish-curry': 'curries',
      'thai-peanut-chicken-curry': 'curries',

      'chicken-burger': 'burgers',
      'beef-burger': 'burgers',
      'vegan-burger': 'burgers',

      'vegetable-sandwich': 'sandwiches',
      'beef-steak-sandwich': 'sandwiches',
      'chicken-sandwich': 'sandwiches',
      'chicken-mayo-sandwich': 'sandwiches',
      'cheese-sandwich': 'sandwiches',
      'original-club-sandwich': 'sandwiches',

      'carrot-ginger-soup': 'lunch-dinner',
      'tomato-soup': 'lunch-dinner',
      'vegetable-soup': 'lunch-dinner',
      'coffee-life-platter': 'lunch-dinner',
      'burger-promotion': 'lunch-dinner',
      'whole-chicken': 'lunch-dinner',
      'chicken-goat-biryani': 'lunch-dinner',

      'house-coffee': 'beverages',
      'espresso': 'beverages',
      'americano': 'beverages',
      'latte': 'beverages',
      'cappuccino': 'beverages',
      'mocha': 'beverages',
      'vanilla-latte': 'beverages',
      'white-chocolate': 'beverages',
      'african-tea': 'beverages',
      'hot-chocolate': 'beverages',
      'iced-mocha': 'beverages',
      'regular-juice': 'beverages',
      'signature-apple-juice': 'beverages',
      'banana-caramel': 'beverages',
      'mango-smoothie': 'beverages',
      'soda': 'beverages',
      'water': 'beverages'
    };

    // Ensure each category has a .menu-grid
    document.querySelectorAll('.menu-category').forEach(cat => {
      if (!cat.querySelector('.menu-grid')) {
        const grid = document.createElement('div');
        grid.classList.add('menu-grid');
        cat.appendChild(grid);
      }
    });

    // Move items to their target categories with fade-in
    document.querySelectorAll('.menu-item').forEach(item => {
      const id = item.dataset.id;
      for (let key in categoryMap) {
        if (id.startsWith(key)) {
          const targetCat = document.getElementById(categoryMap[key]);
          if (targetCat) {
            const grid = targetCat.querySelector('.menu-grid');
            grid.appendChild(item);
            item.style.transition = 'all 0.8s ease';
            item.style.opacity = 0;
            setTimeout(() => item.style.opacity = 1, 100 + Math.random() * 300); // stagger fade
          }
          break;
        }
      }
    });

    // Sort items inside each category by price descending
    document.querySelectorAll('.menu-category').forEach(cat => {
      const grid = cat.querySelector('.menu-grid');
      const items = Array.from(grid.querySelectorAll('.menu-item'));
      items.sort((a, b) => parseInt(b.dataset.price) - parseInt(a.dataset.price));
      items.forEach(i => grid.appendChild(i));
    });

    // Highlight specials
    const specialIds = ['burger-promotion', 'coffee-life-platter', 'whole-chicken'];
    specialIds.forEach(id => {
      const el = document.querySelector(`.menu-item[data-id="${id}"]`);
      if (el) {
        el.style.border = '2px solid gold';
        el.style.boxShadow = '0 0 20px gold';
        el.style.transition = 'all 1s ease';
      }
    });

    console.log("✨ Magical Menu Organizer activated! ✨");
  };

  // ======= INIT =======
  loadCart();
  renderCart();
  organizeMenu();

  // Make cart globally accessible if needed
  window.CoffeeLifeCart = { addToCart, removeFromCart, renderCart, cart };

})();
