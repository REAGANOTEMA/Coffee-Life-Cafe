// ================= payment.js — FINAL (voice + UX + animations) =================
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

    /* ==== SMALL UTILS ==== */
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';

    // Toast helper (visible + aria-live)
    const toastEl = qs('#toast') || (() => {
        const t = document.createElement('div');
        t.id = 'toast';
        t.setAttribute('aria-live', 'polite');
        Object.assign(t.style, { position: 'fixed', right: '20px', bottom: '24px', padding: '10px 14px', borderRadius: '12px', background: '#111', color: '#fff', zIndex: 99999, opacity: 0, transform: 'translateY(20px)', transition: 'all .28s ease' });
        document.body.appendChild(t);
        return t;
    })();

    const showToast = (msg, duration = 3000) => {
        if (!toastEl) return alert(msg);
        toastEl.textContent = msg;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(20px)';
        }, duration);
    };

    // Speech helper (calm/premium voice preference - en-GB if available)
    const speak = (text, opts = {}) => {
        try {
            if (!('speechSynthesis' in window)) {
                // not supported
                return;
            }
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = opts.rate || 1.0;
            utter.pitch = opts.pitch || 1.0;
            utter.volume = opts.volume || 1.0;
            // choose a calm english voice (prefer en-GB)
            const voices = window.speechSynthesis.getVoices();
            const prefer = voices.find(v => /en-?gb/i.test(v.lang)) || voices.find(v => /en-?us/i.test(v.lang)) || voices[0];
            if (prefer) utter.voice = prefer;
            // make sure utterance doesn't interrupt important speech (queue)
            window.speechSynthesis.cancel(); // small reset to keep guidance consistent
            window.speechSynthesis.speak(utter);
        } catch (e) {
            // fail silently
            console.warn('Speech failed', e);
        }
    };

    // clipboard copy with graceful fallback
    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                return true;
            }
        } catch (err) {
            return false;
        }
    };

    /* ==== INJECT SMALL CSS FOR BUTTON FX (lighting + shake + 3d) ==== */
    const injectStyles = () => {
        if (document.getElementById('payment-js-styles')) return;
        const style = document.createElement('style');
        style.id = 'payment-js-styles';
        style.textContent = `
      /* 3D button base (if your CSS already has .btn-3d this won't conflict) */
      .btn-3d { position:relative; transform-style: preserve-3d; transition: transform .18s ease, box-shadow .18s ease; }
      .btn-3d::after { content:''; position:absolute; left:6px; right:6px; bottom:-6px; height:8px; border-radius:8px; background: rgba(0,0,0,0.12); z-index:-1; transform-origin:center; transition: transform .18s ease, opacity .18s ease; }
      .btn-3d:active { transform: translateY(4px) scale(.995); }
      
      /* lighting pulse (glow) */
      @keyframes pf-light {
        0% { box-shadow: 0 6px 18px rgba(255,179,0,0.06); transform: translateY(0); }
        50% { box-shadow: 0 12px 28px rgba(255,200,0,0.12); transform: translateY(-2px); }
        100% { box-shadow: 0 6px 18px rgba(255,179,0,0.06); transform: translateY(0); }
      }
      .btn-lighting { animation: pf-light 1.4s ease-in-out infinite; }

      /* gentle shake */
      @keyframes pf-shake {
        0% { transform: translateX(0) rotate(0deg); }
        25% { transform: translateX(-2px) rotate(-0.5deg); }
        50% { transform: translateX(2px) rotate(0.5deg); }
        75% { transform: translateX(-1px) rotate(-0.3deg); }
        100% { transform: translateX(0) rotate(0deg); }
      }
      .btn-shake { animation: pf-shake 0.6s ease-in-out; }

      /* small highlight when active */
      .btn-highlight { box-shadow: 0 8px 30px rgba(255,179,0,0.18); transform: translateY(-2px) scale(1.01); }

      /* subtle pointer bubble style (if script creates pointers) */
      .pointer-bubble { background: var(--primary, #ffb300); color: #000; padding: 8px 12px; border-radius: 24px; font-weight:700; box-shadow: 0 8px 24px rgba(0,0,0,0.18); }

      /* toast override to make toast accessible */
      #toast[aria-live] { min-width: 180px; max-width: 320px; text-align:center; }

      /* small focus outline for keyboard users */
      .btn-3d:focus, .btn:focus { outline: 3px solid rgba(255,179,0,0.14); outline-offset: 3px; }
    `;
        document.head.appendChild(style);
    };

    /* ==== SELECTORS ==== */
    let deliverySelect, deliveryFeeEl, deliveryFeeSummaryEl;
    let cartItemsContainer, cartSubtotalEl, cartTotalEl;
    let paymentOptions, merchantProviderEl, merchantCodeEl, copyMerchantBtn, copyIndividualBtns, showUSSDBtn;
    let whatsappBtn, paymentNumberEl, callSupportBtn;

    const cacheSelectors = () => {
        deliverySelect = qs('#delivery-zone');
        deliveryFeeEl = qs('#deliveryFee');
        deliveryFeeSummaryEl = qs('#deliveryFeeSummary');
        cartItemsContainer = qs('#cartItems');
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

    /* ==== CART HELPERS (reads from window.CoffeeLife.cart when available) ==== */
    const getCart = () => {
        try {
            if (window.CoffeeLife && Array.isArray(window.CoffeeLife.cart)) return window.CoffeeLife.cart;
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    };

    const calcSubtotal = () => getCart().reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

    const getDeliveryFeeValue = () => {
        const area = deliverySelect?.value || '';
        return DELIVERY_AREAS[area] || 0;
    };

    /* ==== UI RENDER ==== */
    const updateDeliveryFeeDisplay = () => {
        const fee = getDeliveryFeeValue();
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(fee);
        if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(fee);
        updateTotals();
    };

    const updateTotals = () => {
        const subtotal = calcSubtotal();
        const delivery = getDeliveryFeeValue();
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatUGX(subtotal);
        if (cartTotalEl) cartTotalEl.textContent = formatUGX(subtotal + delivery);
    };

    /* ==== PAYMENT PROVIDER UI ==== */
    const setSelectedProvider = (provider) => {
        selectedProvider = provider || null;
        if (merchantProviderEl) merchantProviderEl.textContent = selectedProvider ? selectedProvider.toUpperCase() : 'None';
        if (merchantCodeEl) merchantCodeEl.textContent = selectedProvider === 'mtn' ? `MTN: ${MTN_MERCHANT}` :
            selectedProvider === 'airtel' ? `Airtel: ${AIRTEL_MERCHANT}` :
                `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
        paymentOptions.forEach(b => {
            const is = b.dataset.provider === provider;
            b.classList.toggle('selected', is);
            b.setAttribute('aria-pressed', is ? 'true' : 'false');
        });
        showToast(selectedProvider ? `${selectedProvider.toUpperCase()} selected` : 'Provider cleared');
        speak(selectedProvider ? `You selected ${selectedProvider.toUpperCase()} as your payment provider.` : `No payment provider selected.`);
    };

    /* ==== COPY BUTTONS & USSD ==== */
    const wireCopyButtons = () => {
        if (copyMerchantBtn) {
            copyMerchantBtn.addEventListener('click', async () => {
                const code = merchantCodeEl?.textContent?.trim() || (`MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`);
                const ok = await copyToClipboard(code);
                showToast(ok ? 'Merchant code copied' : 'Unable to copy code');
                if (ok) speak('Merchant code copied to clipboard. Paste it in your phone dialer or payment app.');
            });
        }
        copyIndividualBtns.forEach(b => {
            b.addEventListener('click', async (ev) => {
                const code = b.dataset.code || b.getAttribute('data-code') || '';
                const network = b.dataset.network || 'Code';
                const ok = await copyToClipboard(code);
                showToast(ok ? `${network} code copied` : `Unable to copy ${network}`);
                if (ok) speak(`${network} payment code copied. Use this code in your payment app or when requested.`);
            });
        });

        showUSSDBtn?.addEventListener('click', () => {
            if (!selectedProvider) {
                showToast('Select a provider first');
                speak('Please select a mobile money provider before viewing USSD instructions.');
                return;
            }
            const total = calcSubtotal() + getDeliveryFeeValue();
            if (!total) {
                showToast('Cart total is zero');
                speak('Your cart is empty. Add items before attempting payment.');
                return;
            }
            const ussd = selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn(total) : USSD_TEMPLATES.airtel(total);
            // Copy USSD and show it in an accessible confirm
            copyToClipboard(ussd).then(ok => {
                if (ok) showToast('USSD copied — paste into your phone dialer');
                speak(`USSD instruction copied. Dial ${ussd} on your phone to pay ${formatUGX(total)}.`);
                // show a visual dialog for desktop users
                if (confirm(`USSD Instruction:\n${ussd}\n\nPress OK to copy and continue.`)) {
                    // already copied
                }
            });
        });
    };

    /* ==== WHATSAPP ORDER ==== */
    const sendWhatsAppOrder = () => {
        const cart = getCart();
        if (!cart.length) {
            showToast('Cart is empty');
            speak('Your cart is empty. Please add items from the menu first.');
            return;
        }
        if (!deliverySelect?.value) {
            showToast('Select a delivery area');
            speak('Please select a delivery area to calculate delivery fee and total.');
            return;
        }

        // Ask for name (friendly)
        let name = '';
        try {
            name = prompt('Enter your full name:');
            if (name) name = name.trim();
        } catch (e) {
            name = '';
        }
        if (!name) {
            showToast('Name is required to send the order');
            speak('Please enter your full name. We need it to complete the order.');
            return;
        }

        const phone = (paymentNumberEl && paymentNumberEl.value) ? paymentNumberEl.value.trim() : 'Not provided';
        const subtotal = calcSubtotal();
        const delivery = getDeliveryFeeValue();
        const total = subtotal + delivery;

        let paymentNote = `Payment method: ${selectedProvider ? selectedProvider.toUpperCase() : 'Cash'}.`;
        if (selectedProvider) {
            const ussd = selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn(total) : USSD_TEMPLATES.airtel(total);
            paymentNote += ` Pay ${formatUGX(total)} with USSD ${ussd}.`;
        }

        const itemsText = cart.map((it, i) => `${i + 1}. ${it.name} x${it.qty} = ${formatUGX((it.price || 0) * (it.qty || 0))}`).join('\n');

        const messagePlain = [
            '✨ Coffee Life Order ✨',
            `👤 Customer: ${name}`,
            `📍 Delivery Area: ${deliverySelect.value}`,
            `📞 Payment Number: ${phone}`,
            `${paymentNote}`,
            '',
            '🛒 Items:',
            itemsText,
            '',
            `🧾 Subtotal: ${formatUGX(subtotal)}`,
            `🚚 Delivery: ${formatUGX(delivery)}`,
            `💰 Total: ${formatUGX(total)}`,
            '',
            '☕ Coffee Life — Enjoy!'
        ].join('\n');

        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(messagePlain)}`;
        try {
            window.open(url, '_blank');
            showToast('Order opened in WhatsApp. Complete the message and send.');
            speak('I have prepared your order message and opened WhatsApp. Please review and send to complete your order.');
            // clear cart if desired — keep behavior consistent with previous code: clear cart
            if (window.CoffeeLife && Array.isArray(window.CoffeeLife.cart)) {
                window.CoffeeLife.cart = [];
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(window.CoffeeLife.cart)); } catch (e) { }
                // attempt to call rendering function if available
                if (typeof window.CoffeeLife.renderCart === 'function') window.CoffeeLife.renderCart();
            }
        } catch (err) {
            showToast('Unable to open WhatsApp — copy order manually');
            speak('I could not open WhatsApp. Please copy the order details and send manually.');
        }
    };

    /* ==== CALL SUPPORT ==== */
    const callSupport = () => {
        const tel = '+256709691395';
        speak('Connecting you to customer support. Please allow your device to make a call.');
        try {
            window.location.href = `tel:${tel}`;
        } catch (e) {
            alert(`Call support: ${tel}`);
        }
    };

    /* ==== BUTTON FX: lighting every 3s, shake every 4s ==== */
    let lightingInterval = null;
    let shakeInterval = null;

    const startButtonEffects = () => {
        const allButtons = () => Array.from(document.querySelectorAll('.btn-3d, .btn'));

        // clear any previous
        if (lightingInterval) clearInterval(lightingInterval);
        if (shakeInterval) clearInterval(shakeInterval);

        // initial apply
        allButtons().forEach(b => b.classList.add('btn-3d'));

        // every 3 seconds, apply a short lighting pulse to a subset (or all)
        lightingInterval = setInterval(() => {
            const btns = allButtons();
            if (!btns.length) return;
            btns.forEach((btn, i) => {
                // stagger small highlight for a nicer feel
                setTimeout(() => {
                    btn.classList.add('btn-highlight');
                    speakOnElement(btn, `Tip: You can ${btn.title || btn.textContent || 'press this button'}`);
                    setTimeout(() => btn.classList.remove('btn-highlight'), 900);
                }, i * 60);
            });
        }, 3000);

        // every 4 seconds, make a gentle shake on CTA buttons
        shakeInterval = setInterval(() => {
            const ctAs = Array.from(document.querySelectorAll('.btn-3d, .btn.cta, .btn-primary, .btn'));
            ctAs.slice(0, 8).forEach((btn, i) => {
                setTimeout(() => {
                    btn.classList.add('btn-shake');
                    setTimeout(() => btn.classList.remove('btn-shake'), 700);
                }, i * 50);
            });
        }, 4000);
    };

    // speak a short hint based on element if user hasn't heard too many hints recently
    let lastHintAt = 0;
    const speakOnElement = (el, fallback) => {
        const tooSoon = (Date.now() - lastHintAt) < 1400;
        if (tooSoon) return;
        lastHintAt = Date.now();
        const hint = fallback || el.getAttribute('data-hint') || el.title || (el.textContent && el.textContent.trim().slice(0, 40));
        if (hint) {
            // speak in a soft tone but short
            speak(`Tip: ${hint}`, { rate: 1.05, pitch: 1.0 });
        }
    };

    // pause animations while user focuses or interacts
    const pauseButtonEffects = () => {
        if (lightingInterval) clearInterval(lightingInterval);
        if (shakeInterval) clearInterval(shakeInterval);
    };
    const resumeButtonEffects = () => startButtonEffects();

    /* ==== INITIAL SETUP & WIRING ==== */
    const init = () => {
        injectStyles();
        cacheSelectors();

        // wire delivery change
        if (deliverySelect) {
            deliverySelect.addEventListener('change', () => {
                updateDeliveryFeeDisplay();
                speak(`Delivery area set to ${deliverySelect.value}. Delivery fee ${formatUGX(getDeliveryFeeValue())}.`);
            });
        }
        updateDeliveryFeeDisplay();

        // wire payment option buttons
        paymentOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                setSelectedProvider(btn.dataset.provider);
            });
            btn.addEventListener('mouseover', () => speakOnElement(btn));
        });

        // wire copy + USSD
        wireCopyButtons();

        // whatsapp send
        whatsappBtn?.addEventListener('click', () => {
            speak('Preparing your order for WhatsApp. I will guide you through the steps.');
            setTimeout(sendWhatsAppOrder, 300);
        });

        // call support
        callSupportBtn?.addEventListener('click', () => { callSupport(); });

        // keyboard accessibility: Enter on focused payment option acts as click
        paymentOptions.forEach(b => {
            b.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault(); b.click();
                }
            });
        });

        // add gentle voice guidance when user focuses the payment number field
        if (paymentNumberEl) {
            paymentNumberEl.addEventListener('focus', () => {
                speak('Enter the phone number you used for payment, for easier confirmation.');
            });
        }

        // listen for cart updates (if cart.js exposes renderCart or triggers a custom event)
        // If cart.js triggers a 'cart:updated' event we will update totals; otherwise poll a few times
        window.addEventListener('cart:updated', () => { updateTotals(); });
        if (typeof window.CoffeeLife !== 'undefined' && typeof window.CoffeeLife.renderCart === 'function') {
            // give a gentle guidance on initial load
            setTimeout(() => {
                const subtotal = calcSubtotal();
                if (subtotal > 0) {
                    speak(`Welcome back. Your cart has ${getCart().length} items. Total ${formatUGX(subtotal + getDeliveryFeeValue())}.`);
                } else {
                    speak('Welcome to Coffee Life. Browse the menu to add your favorite items.');
                }
            }, 700);
        }

        // start button animation effects (lighting + shake)
        startButtonEffects();

        // pause/resume effects on focus/interaction
        document.addEventListener('focusin', pauseButtonEffects);
        document.addEventListener('focusout', resumeButtonEffects);
        document.addEventListener('mousemove', resumeButtonEffects);

        // make sure copy buttons speak a short confirmation when used (delegated)
        document.body.addEventListener('click', async (ev) => {
            const t = ev.target;
            if (!t) return;
            if (t.matches && t.matches('.copy-individual')) {
                const code = t.dataset.code || t.getAttribute('data-code') || '';
                const network = t.dataset.network || 'Code';
                const ok = await copyToClipboard(code);
                if (ok) {
                    showToast(`${network} code copied`);
                    speak(`${network} code copied to clipboard.`);
                }
            }
            if (t.matches && t.matches('#copyMerchant')) {
                const code = merchantCodeEl?.textContent || `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
                const ok = await copyToClipboard(code);
                if (ok) {
                    showToast('Merchant code copied');
                    speak('Merchant code copied to clipboard.');
                }
            }
        });

        // Accessibility: announce totals when they change (polite)
        const totalsObserver = new MutationObserver(() => {
            const subtotalText = cartSubtotalEl?.textContent || '0 UGX';
            const totalText = cartTotalEl?.textContent || '0 UGX';
            // short speak to inform
            speak(`Updated totals. Subtotal ${subtotalText}. Total ${totalText}.`);
        });
        if (cartSubtotalEl && cartTotalEl) {
            totalsObserver.observe(cartSubtotalEl, { childList: true, characterData: true, subtree: true });
            totalsObserver.observe(cartTotalEl, { childList: true, characterData: true, subtree: true });
        }

        // in case menu.js/cart.js load later, attempt to rewire after a short delay
        setTimeout(() => {
            cacheSelectors();
            wireCopyButtons();
            updateDeliveryFeeDisplay();
            updateTotals();
        }, 900);
    };

    /* ==== Run on DOM ready ==== */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
