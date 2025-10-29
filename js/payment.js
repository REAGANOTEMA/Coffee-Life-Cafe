(() => {
    'use strict';

    /* ===========================
       CONFIG
    =========================== */
    const WA_NUMBER = '256709691395';
    const MTN_MERCHANT = '971714';
    const AIRTEL_MERCHANT = '4393386';
    const STORAGE_KEY = 'COFFEE_CART';

    const USSD_TEMPLATES = {
        mtn: amount => `*165*3*${MTN_MERCHANT}*${amount}#`,
        airtel: amount => `*185*9*${AIRTEL_MERCHANT}*${amount}#`
    };

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
       STATE
    =========================== */
    let DELIVERY_FEE = 0;
    let selectedProvider = null;
    let cart = [];

    /* ===========================
       UTILS
    =========================== */
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';

    const persistCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    const loadCart = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        cart = saved ? JSON.parse(saved) : [];
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

    /* ===========================
       CART FUNCTIONS
    =========================== */
    const calcSubtotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCart = () => {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';

        if (!cart.length) {
            cartItemsContainer.innerHTML = `<p style="padding:12px;color:#fff;">Your cart is empty. <a href="index.html#menu" style="color:#ffb300;">Add items</a></p>`;
        }

        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
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

            // Decrease quantity
            div.querySelector('.minus').addEventListener('click', () => {
                const target = cart.find(i => i.id === item.id);
                if (!target) return;
                target.qty -= 1;
                if (target.qty <= 0) cart = cart.filter(i => i.id !== target.id);
                persistCart(); renderCart();
                showToast('Quantity decreased');
            });

            // Increase quantity
            div.querySelector('.plus').addEventListener('click', () => {
                const target = cart.find(i => i.id === item.id);
                if (!target) return;
                target.qty += 1;
                persistCart(); renderCart();
                showToast('Quantity increased');
            });

            // Remove item
            div.querySelector('.remove').addEventListener('click', () => {
                cart = cart.filter(i => i.id !== item.id);
                persistCart(); renderCart();
                showToast('Item removed');
            });
        });

        const subtotal = calcSubtotal();
        cartSubtotalEl.textContent = formatUGX(subtotal);
        cartTotalEl.textContent = formatUGX(subtotal + DELIVERY_FEE);
    };

    const addToCart = item => {
        if (!item || !item.id) return;

        // Check if item already exists
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            existing.qty += 1; // just increase quantity
        } else {
            cart.push({ ...item, qty: 1 });
        }

        persistCart();
        renderCart();
        showToast(`${item.name} added`);
    };

    window.CoffeeLife = { addToCart, renderCart };

    /* ===========================
       DELIVERY HANDLING
    =========================== */
    const parseDeliveryFeeFromSelect = () => {
        if (!deliverySelect) return;
        const text = deliverySelect.selectedOptions?.[0]?.text || '';
        const match = text.match(/([0-9,]+)\s*UGX/);
        DELIVERY_FEE = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
        deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
        deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    };

    deliverySelect?.addEventListener('change', parseDeliveryFeeFromSelect);
    parseDeliveryFeeFromSelect();

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
        const tmpl = selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn('AMOUNT') :
            selectedProvider === 'airtel' ? USSD_TEMPLATES.airtel('AMOUNT') : '';
        alert(`USSD Instruction: ${tmpl}`);
    });

    /* ===========================
       WHATSAPP CONFIRM
    =========================== */
    whatsappBtn?.addEventListener('click', () => {
        const number = paymentNumberInput.value.trim();
        if (!number) return showToast('Enter your payment number');
        const total = calcSubtotal() + DELIVERY_FEE;
        const provider = selectedProvider ? selectedProvider.toUpperCase() : 'None';
        const message = encodeURIComponent(`Hello, I have paid ${formatUGX(total)} via ${provider}. My number: ${number}`);
        window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
    });

    /* ===========================
       COMPLAINT BOX
    =========================== */
    const createComplaintBox = () => {
        if (qs('#complaint-box')) return; // avoid duplicates
        const box = document.createElement('div');
        box.id = 'complaint-box';
        box.innerHTML = `
            <h4>Complaint / Feedback</h4>
            <p>Have an issue or suggestion? Let us know!</p>
            <a href="form.html" target="_blank">Submit Complaint</a>
        `;
        document.body.appendChild(box);
    };
    createComplaintBox();

    /* ===========================
       INITIALIZATION
    =========================== */
    loadCart();
    renderCart();

})();
