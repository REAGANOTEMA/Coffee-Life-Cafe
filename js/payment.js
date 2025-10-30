// ================= PAYMENT.JS — ELITE EXPERIENCE =================
(() => {
    'use strict';

    // ===== CONFIG =====
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

    // ===== STATE =====
    let cart = [];
    let DELIVERY_FEE = 0;
    let selectedProvider = null;

    // ===== SELECTORS =====
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
    const paymentNumberEl = qs('#paymentNumber');
    const callSupportBtn = qs('#callSupport');
    const toastEl = qs('#toast');

    // ===== UTILS =====
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';
    const saveCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    const loadCart = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        cart = saved ? JSON.parse(saved) : [];
    };

    const showToast = (msg, duration = 2500) => {
        if (!toastEl) return alert(msg);
        toastEl.textContent = msg;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';
        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(20px)';
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

    // ===== CART FUNCTIONS =====
    const calcSubtotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCart = () => {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';

        if (!cart.length) {
            cartItemsContainer.innerHTML = `<p style="padding:12px;color:#555;">Your cart is empty. <a href="index.html#menu" style="color:#ffb300;">Add items</a></p>`;
            cartSubtotalEl.textContent = formatUGX(0);
            cartTotalEl.textContent = formatUGX(0);
            return;
        }

        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.marginBottom = '10px';
            div.style.opacity = 0;
            div.style.transform = 'translateX(50px)';
            div.style.transition = 'all 0.5s ease-out';
            div.innerHTML = `
        <img src="${item.img || 'images/logo.jpg'}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;margin-right:10px;">
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
            cartItemsContainer.appendChild(div);

            setTimeout(() => {
                div.style.opacity = 1;
                div.style.transform = 'translateX(0)';
            }, 50 + index * 100);

            div.querySelector('.minus').addEventListener('click', () => {
                item.qty -= 1;
                if (item.qty <= 0) cart = cart.filter(i => i.id !== item.id);
                saveCart(); renderCart(); animateCartBadge();
            });
            div.querySelector('.plus').addEventListener('click', () => { item.qty += 1; saveCart(); renderCart(); animateCartBadge(); });
            div.querySelector('.remove').addEventListener('click', () => { cart = cart.filter(i => i.id !== item.id); saveCart(); renderCart(); animateCartBadge(); });
        });

        const subtotal = calcSubtotal();
        cartSubtotalEl.textContent = formatUGX(subtotal);
        const deliveryFee = parseInt(deliveryFeeSummaryEl?.textContent.replace(/,/g, '').replace(' UGX', '')) || 0;
        cartTotalEl.textContent = formatUGX(subtotal + deliveryFee);

        animateCartBadge();
        showCheckoutPointer();
    };

    const addToCart = item => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) existing.qty += 1;
        else cart.push({ ...item, qty: 1 });
        saveCart(); renderCart();
        showToast(`${item.name} added to cart!`);
        launchConfetti();
    };

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

    const showCheckoutPointer = () => {
        if (!cart.length) return;
        let pointer = document.querySelector('#checkoutPointer');
        if (!pointer) {
            pointer = document.createElement('div');
            pointer.id = 'checkoutPointer';
            pointer.innerHTML = `<div class="pointer-bubble">👉 <strong>Go to Payment!</strong></div>`;
            Object.assign(pointer.style, { position: 'fixed', bottom: '80px', right: '20px', cursor: 'pointer', zIndex: 9999 });
            document.body.appendChild(pointer);
            const bubble = pointer.querySelector('.pointer-bubble');
            Object.assign(bubble.style, {
                background: '#ffb300', color: '#000', fontWeight: 'bold', padding: '10px 16px',
                borderRadius: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', animation: 'pulse 1.2s infinite'
            });
            bubble.addEventListener('click', () => window.scrollTo({ top: document.getElementById('payment-section').offsetTop - 50, behavior: 'smooth' }));

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

    const launchConfetti = () => {
        const container = document.createElement('div');
        Object.assign(container.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9998 });
        document.body.appendChild(container);
        for (let i = 0; i < 25; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = `hsl(${Math.random() * 360},100%,50%)`;
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-10px';
            confetti.style.opacity = 0.8;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.transition = 'all 1s linear';
            container.appendChild(confetti);
            setTimeout(() => { confetti.style.top = `${window.innerHeight + 20}px`; confetti.style.transform = `rotate(${Math.random() * 720}deg)` }, 50);
            setTimeout(() => confetti.remove(), 1200);
        }
        setTimeout(() => container.remove(), 1500);
    };

    // ===== DELIVERY =====
    const updateDeliveryFee = () => {
        const area = deliverySelect?.value || '';
        DELIVERY_FEE = DELIVERY_AREAS[area] || 0;
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
        if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    };
    deliverySelect?.addEventListener('change', updateDeliveryFee);
    updateDeliveryFee();

    // ===== PAYMENT PROVIDER =====
    const setSelectedProvider = provider => {
        selectedProvider = provider || null;
        merchantProviderEl.textContent = selectedProvider ? selectedProvider.toUpperCase() : 'None';
        merchantCodeEl.textContent = selectedProvider === 'mtn' ? `MTN: ${MTN_MERCHANT}` :
            selectedProvider === 'airtel' ? `Airtel: ${AIRTEL_MERCHANT}` :
                `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
        paymentOptions.forEach(b => b.classList.toggle('selected', b.dataset.provider === provider));
    };
    paymentOptions.forEach(btn => btn.addEventListener('click', () => setSelectedProvider(btn.dataset.provider)));

    // ===== COPY BUTTONS =====
    copyMerchantBtn?.addEventListener('click', async () => { if (await copyToClipboard(merchantCodeEl.textContent)) showToast('Merchant code copied!'); });
    copyIndividualBtns.forEach(b => b.addEventListener('click', async () => { if (await copyToClipboard(b.dataset.code)) showToast(`${b.dataset.network} code copied!`); }));
    showUSSDBtn?.addEventListener('click', () => {
        if (!selectedProvider) return showToast('Select a provider first');
        alert(`USSD Instruction: ${selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn('AMOUNT') : USSD_TEMPLATES.airtel('AMOUNT')}`);
    });

    // ===== WHATSAPP ORDER =====
    whatsappBtn?.addEventListener('click', () => {
        if (!cart.length) return showToast('Cart is empty');
        if (!deliverySelect?.value) return showToast('Select delivery area');
        const name = prompt('Enter your full name:')?.trim();
        if (!name) return showToast('Name required');
        const number = paymentNumberEl.value.trim() || 'Not provided';

        const message = encodeURIComponent(
            `✨ Coffee Life Order ✨\n👤 Customer: ${name}\n📍 Delivery Area: ${deliverySelect.value}\n💳 Payment: ${selectedProvider?.toUpperCase() || 'Cash'}\n📞 Payment Number: ${number}\n\n` +
            `🛒 Items:\n${cart.map((it, i) => `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}`).join('\n')}` +
            `\n\n🧾 Subtotal: ${formatUGX(calcSubtotal())}\n🚚 Delivery: ${formatUGX(DELIVERY_FEE)}\n💰 Total: ${formatUGX(calcSubtotal() + DELIVERY_FEE)}\n\n☕ Coffee Life — Enjoy!`
        );

        window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
        cart = []; saveCart(); renderCart();
        showToast('Order sent via WhatsApp!');
    });

    callSupportBtn?.addEventListener('click', () => { window.location.href = 'tel:+256709691395'; });

    // ===== ADD TO CART FROM MENU =====
    qsa('.btn-add').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const parent = btn.closest('.menu-item');
            if (!parent) return;
            const item = { id: parent.dataset.id, name: parent.dataset.name, price: parseInt(parent.dataset.price), img: parent.querySelector('img')?.src || '' };
            addToCart(item);
        });
    });

    // ===== INIT =====
    loadCart();
    renderCart();
})();
