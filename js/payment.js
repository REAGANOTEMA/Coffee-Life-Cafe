(() => {
    'use strict';

    /* ================= CONFIG ================= */
    const WA_NUMBER = '256746888730';
    const SUPPORT_NUMBER = '256784305795';
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

    const speak = text => {
        if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = 1;
            utter.pitch = 1;
            utter.lang = 'en-GB';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
        }
    };

    const showToast = (text, duration = 2500, voice = true) => {
        if (!toastEl) return alert(text);
        toastEl.textContent = text;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';
        if (voice) speak(text);
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

    /* ================= CART ================= */
    const calcSubtotal = () => window.CoffeeLife.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCart = () => {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        const cart = window.CoffeeLife.cart;

        if (!cart.length) {
            cartItemsContainer.innerHTML = `<p>Your cart is empty. <a href="index.html#menu" style="color:#ffb300;">Add items</a></p>`;
            cartSubtotalEl.textContent = formatUGX(0);
            cartTotalEl.textContent = formatUGX(DELIVERY_FEE);
            return;
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
                    <button class="qty-btn minus btn-circle shake">−</button>
                    <span class="qty">${item.qty}</span>
                    <button class="qty-btn plus btn-circle shake">+</button>
                    <button class="remove btn-circle shake">🗑</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);

            div.querySelector('.minus').addEventListener('click', () => {
                const it = window.CoffeeLife.cart.find(i => i.id === item.id);
                if (!it) return;
                it.qty -= 1;
                if (it.qty <= 0) window.CoffeeLife.cart = window.CoffeeLife.cart.filter(i => i.id !== it.id);
                persistCart();
                renderCart();
                showToast('Quantity reduced', true);
            });

            div.querySelector('.plus').addEventListener('click', () => {
                const it = window.CoffeeLife.cart.find(i => i.id === item.id);
                if (!it) return;
                it.qty += 1;
                persistCart();
                renderCart();
                showToast('Quantity increased', true);
            });

            div.querySelector('.remove').addEventListener('click', () => {
                window.CoffeeLife.cart = window.CoffeeLife.cart.filter(i => i.id !== item.id);
                persistCart();
                renderCart();
                showToast(`${item.name} removed`, true);
            });
        });

        const subtotal = calcSubtotal();
        cartSubtotalEl.textContent = formatUGX(subtotal);
        cartTotalEl.textContent = formatUGX(subtotal + DELIVERY_FEE);
    };

    /* ================= DELIVERY ================= */
    const updateDeliveryFee = () => {
        const area = deliverySelect?.value || '';
        DELIVERY_FEE = DELIVERY_AREAS[area] || 0;
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
        if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    };

    deliverySelect?.addEventListener('change', () => {
        updateDeliveryFee();
        speak(`You selected ${deliverySelect.value}. Delivery fee updated.`);
    });

    /* ================= PAYMENT PROVIDER ================= */
    const setSelectedProvider = provider => {
        selectedProvider = provider || null;
        paymentOptions.forEach(btn => btn.classList.toggle('selected', btn.dataset.provider === provider));
        if (merchantProviderEl)
            merchantProviderEl.textContent = provider ? provider.toUpperCase() : 'None';
        if (merchantCodeEl)
            merchantCodeEl.textContent = provider === 'mtn' ? MTN_MERCHANT :
                provider === 'airtel' ? AIRTEL_MERCHANT :
                    `${MTN_MERCHANT} / ${AIRTEL_MERCHANT}`;

        if (provider) {
            const guide = provider === 'mtn'
                ? `Dial *165*3*${MTN_MERCHANT}*amount#`
                : `Dial *185*9*${AIRTEL_MERCHANT}*amount#`;
            speak(`Great! You selected ${provider.toUpperCase()}. To pay, dial ${guide}. Once payment is done, confirm on WhatsApp.`);
            showToast(`${provider.toUpperCase()} selected.`, false);
        }
    };
    paymentOptions.forEach(btn => btn.addEventListener('click', () => setSelectedProvider(btn.dataset.provider)));

    /* ================= COPY & USSD ================= */
    copyMerchantBtn?.addEventListener('click', async () => {
        if (await copyToClipboard(merchantCodeEl.textContent)) {
            showToast('Merchant code copied. Proceed to payment.', true);
        }
    });

    showUSSDBtn?.addEventListener('click', () => {
        if (!selectedProvider) return showToast('Select a payment provider first.', true);
        const total = calcSubtotal() + DELIVERY_FEE;
        const ussd = selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn(total) : USSD_TEMPLATES.airtel(total);
        speak(`Please dial ${ussd.replace(/\*/g, 'star ').replace(/#/g, ' hash')} to complete payment.`);
        alert(`Dial this USSD on your phone:\n${ussd}\n\nAfter payment, confirm via WhatsApp.`);
    });

    /* ================= WHATSAPP CONFIRM ================= */
    whatsappBtn?.addEventListener('click', () => {
        if (!window.CoffeeLife.cart.length) return showToast('Your cart is empty.', true);
        if (!selectedProvider) return showToast('Please select a payment provider.', true);

        const number = qs('#paymentNumber')?.value || '';
        if (!number || number.length < 9) return showToast('Enter a valid payment number.', true);

        const area = deliverySelect?.value || 'Unknown';
        const subtotal = calcSubtotal();
        const total = subtotal + DELIVERY_FEE;

        let msg = `☕ *Coffee Life Café* Order Confirmation\n\nItems:\n`;
        window.CoffeeLife.cart.forEach(i => msg += `• ${i.name} x${i.qty} = ${formatUGX(i.price * i.qty)}\n`);
        msg += `\nSubtotal: ${formatUGX(subtotal)}\nDelivery: ${formatUGX(DELIVERY_FEE)}\nTotal: ${formatUGX(total)}\n\nPayment via ${selectedProvider.toUpperCase()} (${number})\nDelivery Area: ${area}\n\nThank you for choosing Coffee Life Café — where every sip is a smile! ☕✨`;

        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
        speak('WhatsApp message ready. Kindly confirm your order so our chefs can start crafting your meal.');
    });

    /* ================= CALL SUPPORT ================= */
    callSupportBtn?.addEventListener('click', () => {
        speak('Connecting you to Coffee Life Café support now.');
        window.location.href = `tel:${SUPPORT_NUMBER}`;
    });

    /* ================= WELCOME SEQUENCE ================= */
    window.addEventListener('load', () => {
        speak(`Dear customer, welcome to Coffee Life Café payment center. 
        Let's complete your order together. First, please select your delivery location. 
        Then choose your payment provider — either MTN or Airtel. 
        Finally, confirm your order on WhatsApp. Let's get started.`);
    });

    /* ================= INIT ================= */
    loadCart();
    renderCart();
})();
// === Payment Option Selection Fix ===
document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', function () {
        // Remove previous selection
        document.querySelectorAll('.payment-option').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add to clicked option
        this.classList.add('selected');

        // Update payment provider variable
        const provider = this.classList.contains('mtn') ? 'MTN' : 'AIRTEL';
        localStorage.setItem('paymentProvider', provider);

        // Voice guide or toast feedback
        const msg = `You selected ${provider}. Please proceed below.`;
        speakGuide(msg);
        showToast(msg);

        // Optional: visually confirm with shake and glow
        this.classList.add('btn-glow');
        setTimeout(() => this.classList.remove('btn-glow'), 1200);
    });
});

// === Toast ===
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 2500);
}

// === Voice Guidance ===
function speakGuide(text) {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
}
