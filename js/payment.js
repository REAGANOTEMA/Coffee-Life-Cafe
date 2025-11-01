(() => {
    'use strict';

    /* ================= CONFIG ================= */
    const WA_NUMBER = '256746888730'; // WhatsApp orders
    const SUPPORT_NUMBER = '256784305795'; // Call support
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

    /* ================= STATE ================= */
    window.CoffeeLife = window.CoffeeLife || {};
    window.CoffeeLife.cart = window.CoffeeLife.cart || [];
    let DELIVERY_FEE = 0;
    let selectedProvider = null;

    /* ================= SELECTORS ================= */
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));

    const deliverySelect = qs('#delivery-zone');
    const deliveryFeeEl = qs('#deliveryFee');
    const deliveryFeeSummaryEl = qs('#deliveryFeeSummary');
    const cartItemsContainer = qs('#cartItems');
    const cartSubtotalEl = qs('#cartSubtotal');
    const cartTotalEl = qs('#cartTotal');
    const paymentOptions = qsa('.payment-option');
    const merchantProviderEl = qs('#merchantProvider');
    const merchantCodeEl = qs('#merchantCode');
    const copyMerchantBtn = qs('#copyMerchant');
    const copyIndividualBtns = qsa('.copy-individual');
    const showUSSDBtn = qs('#showUSSD');
    const whatsappBtn = qs('#whatsapp-confirm');
    const toastEl = qs('#toast');
    const callSupportBtn = qs('#callSupport');

    /* ================= UTILS ================= */
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';

    const persistCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(window.CoffeeLife.cart));
    const loadCart = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        window.CoffeeLife.cart = saved ? JSON.parse(saved) : [];
    };

    const showToast = (text, duration = 2500) => {
        speak(text);
        if (!toastEl) return alert(text);
        toastEl.textContent = text;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';
        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(20px)';
        }, duration);
    };

    const copyToClipboard = async text => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return true;
        }
    };

    /* ================= VOICE FEEDBACK ================= */
    const speak = text => {
        if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = 1;
            utter.pitch = 1;
            window.speechSynthesis.speak(utter);
        }
    };

    /* ================= CART FUNCTIONS ================= */
    const calcSubtotal = () => window.CoffeeLife.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCart = () => {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        const cart = window.CoffeeLife.cart;

        if (!cart.length) {
            cartItemsContainer.innerHTML = `<p style="padding:12px;color:#333;">Your cart is empty. <a href="index.html#menu" style="color:#ffb300;">Add items</a></p>`;
            cartSubtotalEl.textContent = formatUGX(0);
            cartTotalEl.textContent = formatUGX(DELIVERY_FEE);
            return;
        }

        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
        <img src="${item.img || 'menu-images/placeholder.jpg'}" alt="${item.name}" class="cart-item-img" style="border-radius:50%;">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <p>${formatUGX(item.price)} x ${item.qty}</p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn minus btn-shake" data-id="${item.id}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn plus btn-shake" data-id="${item.id}">+</button>
          <button class="remove btn-shake" data-id="${item.id}">🗑</button>
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
        showGoToPayment();
    };

    window.CoffeeLife.addToCart = addToCart;
    window.CoffeeLife.renderCart = renderCart;

    /* ================= DELIVERY HANDLING ================= */
    const updateDeliveryFee = () => {
        const area = deliverySelect?.value || '';
        DELIVERY_FEE = DELIVERY_AREAS[area] || 0;
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
        if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    };
    deliverySelect?.addEventListener('change', () => { updateDeliveryFee(); speak(`Delivery area changed to ${deliverySelect.value}`); });
    updateDeliveryFee();

    /* ================= PAYMENT PROVIDER ================= */
    const setSelectedProvider = provider => {
        selectedProvider = provider || null;
        if (merchantProviderEl) merchantProviderEl.textContent = selectedProvider ? selectedProvider.toUpperCase() : 'None';
        if (merchantCodeEl) merchantCodeEl.textContent = selectedProvider === 'mtn' ? `MTN: ${MTN_MERCHANT}` :
            selectedProvider === 'airtel' ? `Airtel: ${AIRTEL_MERCHANT}` :
                `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
        paymentOptions.forEach(b => b.classList.toggle('selected', b.dataset.provider === provider));
        speak(`Payment provider selected: ${selectedProvider}`);
    };
    paymentOptions.forEach(btn => btn.addEventListener('click', () => setSelectedProvider(btn.dataset.provider)));

    /* ================= COPY & USSD ================= */
    copyMerchantBtn?.addEventListener('click', async () => {
        if (await copyToClipboard(merchantCodeEl.textContent)) showToast('Merchant code copied');
    });
    copyIndividualBtns.forEach(b => b.addEventListener('click', async () => {
        if (await copyToClipboard(b.dataset.code)) showToast(`${b.dataset.network} code copied`);
    }));
    showUSSDBtn?.addEventListener('click', () => {
        if (!selectedProvider) return showToast('Select a provider first');
        alert(`USSD Instruction: ${selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn('AMOUNT') : USSD_TEMPLATES.airtel('AMOUNT')}`);
        speak('USSD instructions displayed');
    });

    /* ================= WHATSAPP ORDER ================= */
    whatsappBtn?.addEventListener('click', () => {
        if (!window.CoffeeLife.cart.length) return showToast('Cart is empty');
        if (!selectedProvider) return showToast('Select a payment provider first');
        const number = qs('#paymentNumber')?.value || '';
        if (!number || number.length < 9) return showToast('Enter a valid payment number');

        const area = deliverySelect?.value || 'Unknown';
        const subtotal = calcSubtotal();
        const total = subtotal + DELIVERY_FEE;

        let msg = `☕ Coffee Life Order\n\nItems:\n`;
        window.CoffeeLife.cart.forEach(i => {
            msg += `• ${i.name} x${i.qty} = ${formatUGX(i.price * i.qty)}\n`;
        });
        msg += `\nSubtotal: ${formatUGX(subtotal)}\nDelivery: ${formatUGX(DELIVERY_FEE)}\nTotal: ${formatUGX(total)}\n`;
        msg += `Payment via ${selectedProvider.toUpperCase()} (${number})\nDelivery Area: ${area}\n\nThank you!`;

        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
        showToast('WhatsApp message ready');
    });

    /* ================= CALL SUPPORT ================= */
    callSupportBtn?.addEventListener('click', () => {
        window.location.href = `tel:${SUPPORT_NUMBER}`;
        speak('Calling support');
    });

    /* ================= GO TO PAYMENT POINTER ================= */
    const showGoToPayment = () => {
        if (!window.CoffeeLife.cart.length) return;
        if (qs('#goToPaymentPointer')) return;
        const div = document.createElement('div');
        div.id = 'goToPaymentPointer';
        div.innerHTML = `<div class="pointer-bubble btn-shake">Go to Payment →</div>`;
        document.body.appendChild(div);
        div.addEventListener('click', () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            speak('Scrolling to payment section');
        });
    };

    /* ================= INIT ================= */
    loadCart();
    renderCart();
})();
