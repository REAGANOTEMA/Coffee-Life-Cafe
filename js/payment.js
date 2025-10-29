(() => {
    'use strict';

    /* ===========================
       CONFIG
    =========================== */
    const WA_NUMBER = '256709691395';
    const MTN_MERCHANT = '971714';
    const AIRTEL_MERCHANT = '4393386';
    const STORAGE_KEY = 'COFFEE_CART';
    const DELIVERY_AREAS = {
        "Jinja Town": 2000, "Milo Mbili": 2000, "Walukuba West": 2000,
        "Walukuba East": 3000, "Mafubira": 3000, "Mpumudde": 3000,
        "Bugembe": 3000, "Nile": 3000, "Makerere": 3000,
        "Kira Road": 3000, "Masese": 4000, "Wakitaka": 4000,
        "Namuleesa": 4000
    };
    const USSD_TEMPLATES = {
        mtn: amount => `*165*3*${MTN_MERCHANT}*${amount}#`,
        airtel: amount => `*185*9*${AIRTEL_MERCHANT}*${amount}#`
    };

    /* ===========================
       STATE
    =========================== */
    window.CoffeeLife = window.CoffeeLife || {};
    window.CoffeeLife.cart = window.CoffeeLife.cart || [];
    let DELIVERY_FEE = 0;
    let selectedProvider = null;

    /* ===========================
       DOM SELECTORS
    =========================== */
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));
    const deliverySelect = qs('#delivery-zone');
    const deliveryFeeEl = qs('#deliveryFee');
    const deliveryFeeSummaryEl = qs('#deliveryFeeSummary');
    const cartItemsContainer = qs('#cartItems');
    const cartSubtotalEl = qs('#cartSubtotal');
    const cartTotalEl = qs('#cartTotal');
    const paymentOptions = qsa('.payment-option');
    const paymentNumberInput = qs('#paymentNumber');
    const merchantProviderEl = qs('#merchantProvider');
    const merchantCodeEl = qs('#merchantCode');
    const copyMerchantBtn = qs('#copyMerchant');
    const copyIndividualBtns = qsa('.copy-individual');
    const showUSSDBtn = qs('#showUSSD');
    const whatsappBtn = qs('#whatsapp-confirm');
    const toastEl = qs('#toast');

    /* ===========================
       UTILS
    =========================== */
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';
    const persistCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(window.CoffeeLife.cart));
    const loadCart = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        window.CoffeeLife.cart = saved ? JSON.parse(saved) : [];
    };
    const showToast = (text, duration = 2500) => {
        if (!toastEl) return alert(text);
        toastEl.textContent = text;
        toastEl.style.display = 'block';
        toastEl.classList.add('toast-show');
        setTimeout(() => {
            toastEl.classList.remove('toast-show');
            toastEl.style.display = 'none';
        }, duration);
    };
    const copyToClipboard = async text => {
        try { await navigator.clipboard.writeText(text); return true; }
        catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return true;
        }
    };

    /* ===========================
       CART FUNCTIONS
    =========================== */
    const calcSubtotal = () => window.CoffeeLife.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCart = () => {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        const cart = window.CoffeeLife.cart;

        if (!cart.length) {
            cartItemsContainer.innerHTML = `<p style="padding:12px;color:#fff;">Your cart is empty. <a href="index.html#menu" style="color:#ffb300;">Add items</a></p>`;
        }

        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.img || 'menu-images/placeholder.jpg'}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <p>${formatUGX(item.price)} x ${item.qty}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn minus" data-id="${item.id}">-</button>
                    <span class="qty">${item.qty}</span>
                    <button class="qty-btn plus" data-id="${item.id}">+</button>
                    <button class="remove" data-id="${item.id}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);

            div.querySelector('.minus').addEventListener('click', () => {
                const it = window.CoffeeLife.cart.find(i => i.id === item.id);
                if (!it) return;
                it.qty -= 1;
                if (it.qty <= 0) window.CoffeeLife.cart = window.CoffeeLife.cart.filter(i => i.id !== it.id);
                persistCart(); renderCart(); showToast('Quantity decreased');
            });

            div.querySelector('.plus').addEventListener('click', () => {
                const it = window.CoffeeLife.cart.find(i => i.id === item.id);
                if (!it) return;
                it.qty += 1;
                persistCart(); renderCart(); showToast('Quantity increased');
            });

            div.querySelector('.remove').addEventListener('click', () => {
                window.CoffeeLife.cart = window.CoffeeLife.cart.filter(i => i.id !== item.id);
                persistCart(); renderCart(); showToast('Item removed');
            });
        });

        const subtotal = calcSubtotal();
        cartSubtotalEl.textContent = formatUGX(subtotal);
        cartTotalEl.textContent = formatUGX(subtotal + DELIVERY_FEE);
    };

    const addToCart = item => {
        if (!item || !item.id) return;
        const existing = window.CoffeeLife.cart.find(i => i.id === item.id);
        if (existing) existing.qty += 1;
        else window.CoffeeLife.cart.push({ ...item, qty: 1 });
        persistCart(); renderCart(); showToast(`${item.name} added`);
    };

    window.CoffeeLife.addToCart = addToCart;
    window.CoffeeLife.renderCart = renderCart;

    /* ===========================
       DELIVERY HANDLING
    =========================== */
    const updateDeliveryFee = () => {
        const area = deliverySelect?.value || '';
        DELIVERY_FEE = DELIVERY_AREAS[area] || 0;
        deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
        deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    };
    deliverySelect?.addEventListener('change', updateDeliveryFee);
    updateDeliveryFee();

    /* ===========================
       PAYMENT PROVIDER
    =========================== */
    const setSelectedProvider = provider => {
        selectedProvider = provider || null;
        merchantProviderEl.textContent = selectedProvider ? selectedProvider.toUpperCase() : 'None';
        merchantCodeEl.textContent = selectedProvider === 'mtn' ? `MTN: ${MTN_MERCHANT}` :
            selectedProvider === 'airtel' ? `Airtel: ${AIRTEL_MERCHANT}` :
                `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
        paymentOptions.forEach(b => b.classList.toggle('selected', b.dataset.provider === provider));
    };
    paymentOptions.forEach(btn => btn.addEventListener('click', () => setSelectedProvider(btn.dataset.provider)));

    /* ===========================
       COPY BUTTONS
    =========================== */
    copyMerchantBtn?.addEventListener('click', async () => {
        if (await copyToClipboard(merchantCodeEl.textContent)) showToast('Merchant code copied');
    });
    copyIndividualBtns.forEach(b => b.addEventListener('click', async () => {
        if (await copyToClipboard(b.dataset.code)) showToast(`${b.dataset.network} code copied`);
    }));
    showUSSDBtn?.addEventListener('click', () => {
        if (!selectedProvider) return showToast('Select a provider first');
        alert(`USSD Instruction: ${selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn('AMOUNT') : USSD_TEMPLATES.airtel('AMOUNT')}`);
    });

    /* ===========================
       WHATSAPP ORDER
    =========================== */
    whatsappBtn?.addEventListener('click', () => {
        if (!window.CoffeeLife.cart.length) return showToast('Cart is empty');
        if (!deliverySelect?.value) return showToast('Select delivery area');
        const name = prompt('Enter your full name:')?.trim();
        if (!name) return showToast('Name required');
        const message = encodeURIComponent(
            `✨ Coffee Life Order ✨\n👤 Customer: ${name}\n📍 Delivery Area: ${deliverySelect.value}\n💰 Payment: ${selectedProvider?.toUpperCase() || 'Cash'}\n\n` +
            `🛒 Items:\n${window.CoffeeLife.cart.map((it, i) => `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}`).join('\n')}` +
            `\n\n🧾 Subtotal: ${formatUGX(calcSubtotal())}\n🚚 Delivery: ${formatUGX(DELIVERY_FEE)}\n💰 Total: ${formatUGX(calcSubtotal() + DELIVERY_FEE)}\n\n☕ Coffee Life — Enjoy!`
        );
        window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
        window.CoffeeLife.cart = []; persistCart(); renderCart();
    });

    /* ===========================
       INITIALIZATION
    =========================== */
    loadCart();
    renderCart();

})();
