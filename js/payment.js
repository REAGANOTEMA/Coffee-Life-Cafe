// ================= payment.js — FINAL (voice + UX + animations + WhatsApp notifications) =================
(() => {
    'use strict';

    /* ==== CONFIG ==== */
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

    /* ==== UTILS ==== */
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';

    const speak = (text, opts = {}) => {
        if (!('speechSynthesis' in window)) return;
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = opts.rate || 1.0;
        utter.pitch = opts.pitch || 1.0;
        utter.volume = opts.volume || 1.0;
        const voices = window.speechSynthesis.getVoices();
        utter.voice = voices.find(v => /en-?gb/i.test(v.lang)) || voices.find(v => /en-?us/i.test(v.lang)) || voices[0];
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    };

    const copyToClipboard = async text => {
        try { await navigator.clipboard.writeText(text); return true; }
        catch { return false; }
    };

    /* ==== CSS FX ==== */
    const injectStyles = () => {
        if (document.getElementById('payment-js-styles')) return;
        const style = document.createElement('style');
        style.id = 'payment-js-styles';
        style.textContent = `
        .btn-3d { position:relative; transform-style: preserve-3d; transition: transform .18s ease, box-shadow .18s ease; cursor:pointer; }
        .btn-3d::after { content:''; position:absolute; left:6px; right:6px; bottom:-6px; height:8px; border-radius:8px; background: rgba(0,0,0,0.12); z-index:-1; transform-origin:center; transition: transform .18s ease, opacity .18s ease; }
        .btn-3d:active { transform: translateY(4px) scale(.995); }
        @keyframes pf-light {0% { box-shadow: 0 6px 18px rgba(255,179,0,0.06); transform: translateY(0); } 50% { box-shadow: 0 12px 28px rgba(255,200,0,0.12); transform: translateY(-2px); } 100% { box-shadow: 0 6px 18px rgba(255,179,0,0.06); transform: translateY(0); } }
        .btn-lighting { animation: pf-light 1.4s ease-in-out infinite; }
        @keyframes pf-shake {0% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(-2px) rotate(-0.5deg); } 50% { transform: translateX(2px) rotate(0.5deg); } 75% { transform: translateX(-1px) rotate(-0.3deg); } 100% { transform: translateX(0) rotate(0deg); }}
        .btn-shake { animation: pf-shake 0.6s ease-in-out; }
        .btn-highlight { box-shadow: 0 8px 30px rgba(255,179,0,0.18); transform: translateY(-2px) scale(1.01); }
        .pointer-bubble { background: var(--primary, #ffb300); color: #000; padding: 8px 12px; border-radius: 24px; font-weight:700; box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
        #toast[aria-live] { min-width: 180px; max-width: 320px; text-align:center; }
        .btn-3d:focus, .btn:focus { outline: 3px solid rgba(255,179,0,0.14); outline-offset: 3px; }
        `;
        document.head.appendChild(style);
    };

    /* ==== SELECTORS ==== */
    let deliverySelect, deliveryFeeEl, deliveryFeeSummaryEl;
    let cartSubtotalEl, cartTotalEl;
    let paymentOptions, merchantProviderEl, merchantCodeEl, copyMerchantBtn, copyIndividualBtns, showUSSDBtn;
    let whatsappBtn, paymentNumberEl, callSupportBtn;

    const cacheSelectors = () => {
        deliverySelect = qs('#delivery-zone');
        deliveryFeeEl = qs('#deliveryFee');
        deliveryFeeSummaryEl = qs('#deliveryFeeSummary');
        cartSubtotalEl = qs('#cartSubtotal');
        cartTotalEl = qs('#cartTotal');
        paymentOptions = qsa('.payment-option');
        merchantProviderEl = qs('#merchantProvider');
        merchantCodeEl = qs('#merchantCode');
        copyMerchantBtn = qs('#copyMerchant');
        copyIndividualBtns = qsa('.copy-individual');
        showUSSDBtn = qs('#showUSSD');
        whatsappBtn = qs('#whatsapp-confirm');
        paymentNumberEl = qs('#paymentNumber');
        callSupportBtn = qs('#callSupport');
    };

    /* ==== STATE ==== */
    let selectedProvider = null;

    /* ==== CART HELPERS ==== */
    const getCart = () => {
        try { return window.CoffeeLife?.cart || JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch { return []; }
    };
    const calcSubtotal = () => getCart().reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
    const getDeliveryFeeValue = () => DELIVERY_AREAS[deliverySelect?.value] || 0;
    const updateDeliveryFeeDisplay = () => {
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(getDeliveryFeeValue());
        if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(getDeliveryFeeValue());
        updateTotals();
    };
    const updateTotals = () => {
        const subtotal = calcSubtotal();
        const delivery = getDeliveryFeeValue();
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatUGX(subtotal);
        if (cartTotalEl) cartTotalEl.textContent = formatUGX(subtotal + delivery);
    };

    /* ==== PAYMENT PROVIDER ==== */
    const setSelectedProvider = provider => {
        selectedProvider = provider || null;
        if (merchantProviderEl) merchantProviderEl.textContent = selectedProvider ? selectedProvider.toUpperCase() : 'None';
        if (merchantCodeEl) merchantCodeEl.textContent = selectedProvider === 'mtn' ? `MTN: ${MTN_MERCHANT}` : selectedProvider === 'airtel' ? `Airtel: ${AIRTEL_MERCHANT}` : `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
        paymentOptions.forEach(b => { const is = b.dataset.provider === provider; b.classList.toggle('selected', is); b.setAttribute('aria-pressed', is ? 'true' : 'false'); });
        showToast(selectedProvider ? `${selectedProvider.toUpperCase()} selected` : 'Provider cleared');
        speak(selectedProvider ? `You selected ${selectedProvider.toUpperCase()} as your payment provider.` : 'No payment provider selected.');
    };

    const wireCopyButtons = () => {
        if (copyMerchantBtn) copyMerchantBtn.addEventListener('click', async () => {
            const code = merchantCodeEl?.textContent || `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
            if (await copyToClipboard(code)) { showToast('Merchant code copied'); speak('Merchant code copied.'); }
        });
        copyIndividualBtns.forEach(b => b.addEventListener('click', async () => {
            const code = b.dataset.code || '';
            const network = b.dataset.network || 'Code';
            if (await copyToClipboard(code)) { showToast(`${network} code copied`); speak(`${network} code copied.`); }
        }));
        showUSSDBtn?.addEventListener('click', () => {
            if (!selectedProvider) { showToast('Select a provider first'); speak('Please select a provider.'); return; }
            const total = calcSubtotal() + getDeliveryFeeValue();
            const ussd = selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn(total) : USSD_TEMPLATES.airtel(total);
            copyToClipboard(ussd).then(ok => {
                if (ok) { showToast('USSD copied — paste in phone'); speak(`Dial ${ussd} to pay ${formatUGX(total)}.`); }
            });
        });
    };

    /* ==== WHATSAPP ORDER ==== */
    const sendWhatsAppOrder = () => {
        const cart = getCart();
        if (!cart.length) { showToast('Cart empty'); speak('Your cart is empty'); return; }
        if (!deliverySelect?.value) { showToast('Select delivery area'); speak('Please select a delivery area'); return; }

        let name = prompt('Enter your full name:')?.trim();
        if (!name) { showToast('Name required'); speak('Please enter your full name'); return; }
        const phone = paymentNumberEl?.value?.trim() || 'Not provided';
        const subtotal = calcSubtotal();
        const delivery = getDeliveryFeeValue();
        const total = subtotal + delivery;

        let paymentNote = `Payment method: ${selectedProvider ? selectedProvider.toUpperCase() : 'Cash'}.`;
        if (selectedProvider) paymentNote += ` Pay ${formatUGX(total)} using USSD ${selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn(total) : USSD_TEMPLATES.airtel(total)}.`;

        const itemsText = cart.map((i, j) => `${j + 1}. ${i.name} x${i.qty} = ${formatUGX((i.price || 0) * (i.qty || 0))}`).join('\n');
        const message = [
            '✨ Coffee Life Order ✨',
            `👤 Customer: ${name}`,
            `📍 Delivery Area: ${deliverySelect.value}`,
            `📞 Payment Number: ${phone}`,
            paymentNote,
            '',
            '🛒 Items:',
            itemsText,
            '',
            `🧾 Subtotal: ${formatUGX(subtotal)}`,
            `🚚 Delivery: ${formatUGX(delivery)}`,
            `💰 Total: ${formatUGX(total)}`,
            '',
            '☕ Coffee Life — Notify chef for your order!'
        ].join('\n');

        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
        showToast('Order opened in WhatsApp'); speak('Order prepared. Please check WhatsApp and send to complete your order.');

        if (window.CoffeeLife?.cart) { window.CoffeeLife.cart = []; localStorage.setItem(STORAGE_KEY, JSON.stringify([])); window.CoffeeLife.renderCart?.(); }
    };

    /* ==== CALL SUPPORT ==== */
    const callSupport = () => { speak('Connecting you to customer support.'); try { window.location.href = 'tel:+256709691395'; } catch { alert('Call +256709691395'); } };

    /* ==== BUTTON FX ==== */
    let lightingInterval = null, shakeInterval = null;
    const startButtonEffects = () => {
        const allButtons = () => Array.from(document.querySelectorAll('.btn-3d,.btn'));
        if (lightingInterval) clearInterval(lightingInterval);
        if (shakeInterval) clearInterval(shakeInterval);
        allButtons().forEach(b => b.classList.add('btn-3d'));
        lightingInterval = setInterval(() => allButtons().forEach((btn, i) => setTimeout(() => { btn.classList.add('btn-highlight'); setTimeout(() => btn.classList.remove('btn-highlight'), 900) }, i * 60)), 3000);
        shakeInterval = setInterval(() => allButtons().slice(0, 8).forEach((btn, i) => setTimeout(() => { btn.classList.add('btn-shake'); setTimeout(() => btn.classList.remove('btn-shake'), 700) }, i * 50)), 4000);
    };
    const pauseButtonEffects = () => { if (lightingInterval) clearInterval(lightingInterval); if (shakeInterval) clearInterval(shakeInterval); };
    const resumeButtonEffects = () => startButtonEffects();

    /* ==== VOICE ITEM GUIDANCE ==== */
    const guideItems = () => {
        const items = getCart();
        if (!items.length) return;
        const itemNames = items.map(i => `${i.qty} ${i.name}`).join(', ');
        speak(`You have added: ${itemNames}. After paying using the code, click WhatsApp confirm to send your order to the chef.`);
    };

    /* ==== TOAST ==== */
    const toastEl = qs('#toast') || (() => {
        const t = document.createElement('div');
        t.id = 'toast';
        t.setAttribute('aria-live', 'polite');
        Object.assign(t.style, { position: 'fixed', right: '20px', bottom: '24px', padding: '10px 14px', borderRadius: '12px', background: '#111', color: '#fff', zIndex: 99999, opacity: 0, transform: 'translateY(20px)', transition: 'all .28s ease' });
        document.body.appendChild(t);
        return t;
    })();
    const showToast = (msg, duration = 3000) => {
        toastEl.textContent = msg;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';
        setTimeout(() => { toastEl.style.opacity = '0'; toastEl.style.transform = 'translateY(20px)'; }, duration);
    };

    /* ==== INIT ==== */
    const init = () => {
        injectStyles();
        cacheSelectors();

        // === LOUD WELCOME MESSAGE ===
        const welcomeMessage = "Welcome to Coffee Life website. Feel free to look for and order anything and we will deliver to your doorstep.";
        speak(welcomeMessage, { rate: 1, pitch: 1, volume: 2.0 });

        if (deliverySelect) deliverySelect.addEventListener('change', () => { updateDeliveryFeeDisplay(); speak(`Delivery: ${deliverySelect.value} Fee: ${formatUGX(getDeliveryFeeValue())}`); });
        updateDeliveryFeeDisplay();
        paymentOptions.forEach(btn => {
            btn.addEventListener('click', () => setSelectedProvider(btn.dataset.provider));
            btn.addEventListener('mouseover', () => speak(`Tip: ${btn.title || btn.textContent || 'press this button'}`));
        });
        wireCopyButtons();
        whatsappBtn?.addEventListener('click', () => { speak('Preparing your order for WhatsApp'); setTimeout(sendWhatsAppOrder, 300); });
        callSupportBtn?.addEventListener('click', () => callSupport());
        paymentOptions.forEach(b => b.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); b.click(); } }));
        paymentNumberEl?.addEventListener('focus', () => speak('Enter the phone number used for payment.'));
        startButtonEffects();
        document.addEventListener('focusin', pauseButtonEffects);
        document.addEventListener('focusout', resumeButtonEffects);
        document.addEventListener('mousemove', resumeButtonEffects);

        // Speak item guidance on tabbing into add items
        qsa('.add-to-cart').forEach(btn => btn.addEventListener('focus', guideItems));
    };

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

})();
