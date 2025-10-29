(() => {
    'use strict';

    const STORAGE_KEY = 'COFFEE_CART';
    let cart = [];

    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));

    const cartContainer = qs('#cartItems');
    const cartSubtotalEl = qs('#cartSubtotal');
    const cartTotalEl = qs('#cartTotal');
    const deliveryFeeEl = qs('#deliveryFeeSummary');
    const toastEl = qs('#toast');

    const DELIVERY_FEE = parseInt(deliveryFeeEl?.textContent.replace(/,/g, '').replace(' UGX', '')) || 0;

    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';

    const showToast = (msg, duration = 2000) => {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';
        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(-20px)';
        }, duration);
    };

    const loadCart = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        cart = saved ? JSON.parse(saved) : [];
    };

    const persistCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

    const calcSubtotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCart = () => {
        if (!cartContainer) return;
        cartContainer.innerHTML = '';

        if (!cart.length) {
            cartContainer.innerHTML = `<p style="padding:12px;color:#fff;">Cart is empty. Go back to <a href="index.html#menu" style="color:#ffb300;">menu</a></p>`;
            cartSubtotalEl.textContent = cartTotalEl.textContent = formatUGX(0);
            return;
        }

        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'space-between';
            div.style.margin = '10px 0';
            div.style.padding = '12px';
            div.style.background = 'rgba(255,255,255,0.05)';
            div.style.borderRadius = '10px';
            div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            div.innerHTML = `
                <img src="${item.img || 'menu-images/placeholder.jpg'}" alt="${item.name}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin-right:10px;">
                <div style="flex:1; margin-right:10px;">
                    <strong style="display:block;font-size:1rem;color:#fff;">${item.name}</strong>
                    <span style="color:#ffb300;">${formatUGX(item.price)} x ${item.qty}</span>
                </div>
                <div class="cart-controls">
                    <button class="qty-btn minus" data-id="${item.id}" style="padding:6px 12px;margin:0 2px;cursor:pointer;">-</button>
                    <span style="margin:0 6px;color:#fff;font-weight:bold;">${item.qty}</span>
                    <button class="qty-btn plus" data-id="${item.id}" style="padding:6px 12px;margin:0 2px;cursor:pointer;">+</button>
                    <button class="remove" data-id="${item.id}" style="padding:6px 12px;margin-left:5px;background:#ff3b3b;color:#fff;border:none;border-radius:6px;cursor:pointer;">Remove</button>
                </div>
            `;
            cartContainer.appendChild(div);

            // Effects
            div.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.1)');
                btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
                btn.style.transition = 'all 0.3s ease';
            });

            div.querySelector('.minus').addEventListener('click', () => {
                const it = cart.find(i => i.id === item.id);
                if (!it) return;
                it.qty -= 1;
                if (it.qty <= 0) cart = cart.filter(i => i.id !== it.id);
                persistCart(); renderCart(); showToast('Quantity decreased');
            });

            div.querySelector('.plus').addEventListener('click', () => {
                const it = cart.find(i => i.id === item.id);
                if (!it) return;
                it.qty += 1;
                persistCart(); renderCart(); showToast('Quantity increased');
            });

            div.querySelector('.remove').addEventListener('click', () => {
                cart = cart.filter(i => i.id !== item.id);
                persistCart(); renderCart(); showToast('Item removed');
            });
        });

        const subtotal = calcSubtotal();
        cartSubtotalEl.textContent = formatUGX(subtotal);
        cartTotalEl.textContent = formatUGX(subtotal + DELIVERY_FEE);
    };

    window.CoffeeLifeCart = { cart, renderCart };

    // Init
    loadCart();
    renderCart();
})();
