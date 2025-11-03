(() => {
    'use strict';

    /* ================= CONFIG ================= */
    const WA_NUMBER = '+256746888730'; // Chef / kitchen WhatsApp (as requested)
    const SUPPORT_NUMBER = '+256784305795';
    const MTN_MERCHANT = '971714';
    const AIRTEL_MERCHANT = '4393386';
    const STORAGE_KEY = 'COFFEE_CART';
    const DELIVERY_AREAS = {
        "Jinja Town": 2000, "Milo Mbili": 2000, "Walukuba West": 2000,
        "Walukuba East": 3000, "Mafubira": 3000, "Mpumudde": 3000,
        "Bugembe": 3000, "Nile": 3000, "Makerere": 3000, "Kira Road": 3000,
        "Masese": 4000, "Wakitaka": 4000, "Namuleesa": 4000
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
    let guideShown = false; // only show initial guide once per page load

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
    const companionsContainer = qs('#companionsList');

    /* ================= UTILITIES ================= */
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';

    const persistCart = () =>
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.CoffeeLife.cart));
    const loadCart = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        window.CoffeeLife.cart = saved ? JSON.parse(saved) : [];
    };

    /* Calm, clear speak wrapper */
    const speak = (text, opts = {}) => {
        if (!('speechSynthesis' in window)) return;
        try {
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = typeof opts.rate === 'number' ? opts.rate : 0.95; // slightly slower for clarity
            utter.pitch = typeof opts.pitch === 'number' ? opts.pitch : 1;
            utter.lang = opts.lang || 'en-GB';
            // ensure previous speech doesn't overlap
            try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
            window.speechSynthesis.speak(utter);
        } catch (err) {
            // ignore speech errors gracefully
            console.warn('Speech failed:', err);
        }
    };

    /* Speak multiple items in sequence with controlled spacing */
    const speakSequence = (texts = [], delayBetweenMs = 2600) => {
        texts.forEach((t, i) => {
            setTimeout(() => {
                speak(t);
            }, i * delayBetweenMs);
        });
    };

    const showToast = (text, duration = 3000, voice = true) => {
        if (!toastEl) {
            // fallback
            try { alert(text); } catch (e) { /* ignore */ }
            return;
        }
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
            try { document.execCommand('copy'); } catch (e) { /* ignore */ }
            document.body.removeChild(ta);
            return true;
        }
    };

    const shakeButton = btn => {
        if (!btn) return;
        btn.classList.add('btn-shake');
        setTimeout(() => btn.classList.remove('btn-shake'), 600);
    };

    /* Fast listener helper for good touch response */
    const addFastListener = (el, handler) => {
        if (!el) return;
        let fired = false;
        const reset = () => { fired = false; setTimeout(() => fired = false, 50); };
        const onPointerDown = (ev) => {
            if (fired) return;
            fired = true;
            handler(ev);
            setTimeout(reset, 150);
        };
        const onClick = (ev) => {
            if (fired) return;
            fired = true;
            handler(ev);
            setTimeout(reset, 150);
        };
        el.addEventListener('pointerdown', onPointerDown, { passive: true });
        el.addEventListener('click', onClick);
    };

    /* ================= CART ================= */
    const calcSubtotal = () =>
        window.CoffeeLife.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

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
          <button class="qty-btn minus btn-3d" aria-label="Decrease ${item.name} quantity">−</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn plus btn-3d" aria-label="Increase ${item.name} quantity">+</button>
          <button class="remove btn-3d" aria-label="Remove ${item.name}">🗑</button>
        </div>
      `;
            cartItemsContainer.appendChild(div);

            const minusBtn = div.querySelector('.minus');
            const plusBtn = div.querySelector('.plus');
            const removeBtn = div.querySelector('.remove');

            addFastListener(minusBtn, () => {
                const it = window.CoffeeLife.cart.find(i => i.id === item.id);
                if (!it) return;
                it.qty -= 1;
                if (it.qty <= 0)
                    window.CoffeeLife.cart = window.CoffeeLife.cart.filter(i => i.id !== it.id);
                persistCart();
                renderCart();
                showToast('Quantity reduced');
            });

            addFastListener(plusBtn, () => {
                const it = window.CoffeeLife.cart.find(i => i.id === item.id);
                if (!it) return;
                it.qty += 1;
                persistCart();
                renderCart();
                showToast('Quantity increased');
            });

            addFastListener(removeBtn, () => {
                window.CoffeeLife.cart = window.CoffeeLife.cart.filter(i => i.id !== item.id);
                persistCart();
                renderCart();
                showToast(`${item.name} removed`);
            });
        });

        const subtotal = calcSubtotal();
        cartSubtotalEl.textContent = formatUGX(subtotal);
        cartTotalEl.textContent = formatUGX(subtotal + DELIVERY_FEE);

        // Render companions if any
        renderCompanions();

        // gentle guiding voice when items exist (only once per page load)
        if (!guideShown && cart.length) {
            guideShown = true;
            const itemCount = cart.reduce((s, i) => s + i.qty, 0);
            const shortMsg = `You have ${itemCount} item${itemCount > 1 ? 's' : ''} in your cart. The current subtotal is ${formatUGX(subtotal)}. When ready, choose a payment method and follow the instructions.`;
            speakSequence([
                shortMsg,
                'If you need help, tap Show Instructions to hear how to complete mobile money payment.',
                'When payment is done, press Confirm and Send via WhatsApp to send your order to our chefs.'
            ], 3000);
        }
    };

    /* ================= COMPANIONS ================= */
    const renderCompanions = () => {
        if (!companionsContainer) return;
        companionsContainer.innerHTML = '';
        const companions = window.CoffeeLife.cart.filter(i => i.type === 'companion');
        if (!companions.length) return;
        companionsContainer.innerHTML = `<h4>Companions</h4>`;
        companions.forEach(c => {
            const line = document.createElement('div');
            line.className = 'companion-item';
            line.innerHTML = `<span>${c.name}</span><span>${formatUGX(c.price)}</span>`;
            companionsContainer.appendChild(line);
        });
    };

    /* ================= DELIVERY ================= */
    const updateDeliveryFee = () => {
        const area = deliverySelect?.value || '';
        DELIVERY_FEE = DELIVERY_AREAS[area] || 0;
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
        if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    };

    if (deliverySelect) {
        addFastListener(deliverySelect, () => {
            updateDeliveryFee();
            speak(`Delivery area selected: ${deliverySelect.value}.`);
        });
    }
    updateDeliveryFee();

    /* ================= PAYMENT PROVIDER ================= */
    const calmProviderMessage = (provider) => {
        if (provider === 'mtn') {
            return 'You selected MTN Mobile Money. I will guide you calmly through the payment steps.';
        } else if (provider === 'airtel') {
            return 'You selected Airtel Money. I will guide you calmly through the payment steps.';
        }
        return '';
    };

    const setSelectedProvider = provider => {
        selectedProvider = provider;
        paymentOptions.forEach(btn =>
            btn.classList.toggle('selected', btn.dataset.provider === provider)
        );
        merchantProviderEl.textContent = provider ? provider.toUpperCase() : 'None';
        merchantCodeEl.textContent =
            provider === 'mtn'
                ? MTN_MERCHANT
                : provider === 'airtel'
                    ? AIRTEL_MERCHANT
                    : `${MTN_MERCHANT} / ${AIRTEL_MERCHANT}`;

        const message = calmProviderMessage(provider);
        speak(message);
        setTimeout(() => {
            if (provider === 'mtn') speak(`Merchant code ${MTN_MERCHANT}.`);
            else if (provider === 'airtel') speak(`Merchant code ${AIRTEL_MERCHANT}.`);
        }, 900);

        showToast(`${provider.toUpperCase()} selected`, false);
    };

    paymentOptions.forEach(btn => {
        addFastListener(btn, (e) => {
            setSelectedProvider(btn.dataset.provider);
            shakeButton(e.currentTarget || btn);
        });
    });

    /* ================= COPY INDIVIDUAL BUTTONS (and main copy) ================= */
    addFastListener(copyMerchantBtn, async (e) => {
        if (!merchantCodeEl) return;
        if (await copyToClipboard(merchantCodeEl.textContent)) {
            shakeButton(e.currentTarget);
            showToast('Merchant code copied! Proceed to payment.');
            speak('Merchant code copied to clipboard.');
        }
    });

    const individualCopyButtons = qsa('.copy-individual');
    individualCopyButtons.forEach(btn => {
        addFastListener(btn, async (e) => {
            const code = btn.dataset.code || btn.getAttribute('data-code') || merchantCodeEl?.textContent;
            if (!code) return showToast('No code to copy.');
            if (await copyToClipboard(code)) {
                shakeButton(e.currentTarget || btn);
                showToast(`${code} copied to clipboard.`);
                speak(`Copied ${code} to clipboard.`);
            }
        });
    });

    /* ================= COPY & USSD ================= */
    const verbalizeUSSD = (ussd) => {
        return ussd.replace(/\*/g, ' star ').replace(/#/g, ' hash ').replace(/\s+/g, ' ').trim();
    };

    const openUssdDialer = (ussd) => {
        // Try to open dialer with encoded USSD. This works on many phones: tel:*165*3*971714*12000%23
        try {
            const tel = 'tel:' + encodeURIComponent(ussd);
            window.location.href = tel;
        } catch (e) {
            // fallback do nothing
            console.warn('Opening dialer failed', e);
        }
    };

    addFastListener(showUSSDBtn, async (e) => {
        if (!selectedProvider)
            return showToast('Please select a payment provider first.');
        const total = calcSubtotal() + DELIVERY_FEE;
        const roundedTotal = Math.round(total);
        const ussd =
            selectedProvider === 'mtn'
                ? USSD_TEMPLATES.mtn(roundedTotal)
                : USSD_TEMPLATES.airtel(roundedTotal);

        const spokenUSSD = verbalizeUSSD(ussd);
        const merchant = selectedProvider === 'mtn' ? MTN_MERCHANT : AIRTEL_MERCHANT;

        // Sequence: USSD x3, then merchant x3, calm phrasing
        const seq = [
            `Please dial ${spokenUSSD} on your phone.`,
            `Please repeat: ${spokenUSSD}.`,
            `Once more: ${spokenUSSD}.`,
            `Now I will say the merchant code.`,
            `Merchant code: ${merchant}.`,
            `I repeat, merchant code ${merchant}.`,
            `One more time, merchant code ${merchant}.`
        ];
        speakSequence(seq, 2600);

        // Copy USSD and merchant to clipboard as convenience
        await copyToClipboard(ussd);
        await copyToClipboard(merchant);

        // Visual & interactive help
        shakeButton(e.currentTarget || showUSSDBtn);

        // Ask user if they want the device to open the dialer now (only a prompt)
        setTimeout(() => {
            const wantsOpen = confirm('Open the mobile dialer with this USSD now? (Only on phones) — Choose OK to open, Cancel to copy the code manually.');
            if (wantsOpen) {
                openUssdDialer(ussd);
                showToast('Opening your phone dialer. Please follow the prompts and enter the merchant code if required.', false);
                speak('Opening your phone dialer. Please follow the prompts and enter the merchant code when asked.');
            } else {
                alert(`USSD: ${ussd}\nMerchant code: ${merchant}\nBoth have been copied to your clipboard. Dial on your phone to complete payment.`);
                speak('The USSD and merchant code are copied. Please dial on your phone to complete the payment.');
            }
        }, 3000);
    });

    /* ================= WHATSAPP CONFIRM (send to chef) ================= */
    addFastListener(whatsappBtn, (e) => {
        if (!window.CoffeeLife.cart.length)
            return showToast('Your cart is empty.');
        if (!selectedProvider)
            return showToast('Please select a payment provider.');
        const number = qs('#paymentNumber')?.value || '';
        if (!number || number.length < 9)
            return showToast('Enter a valid payment number.');
        const area = deliverySelect?.value || 'Unknown';
        const subtotal = calcSubtotal();
        const total = subtotal + DELIVERY_FEE;

        let msg = `☕ *Coffee Life Café* Order Confirmation\n\nItems:\n`;
        window.CoffeeLife.cart.forEach(
            i => (msg += `• ${i.name} x${i.qty} = ${formatUGX(i.price * i.qty)}\n`)
        );

        const companions = window.CoffeeLife.cart.filter(i => i.type === 'companion');
        if (companions.length) {
            msg += `\n*Companions:*\n`;
            companions.forEach(c => (msg += `• ${c.name} = ${formatUGX(c.price)}\n`));
        }

        msg += `\nSubtotal: ${formatUGX(subtotal)}\nDelivery: ${formatUGX(
            DELIVERY_FEE
        )}\nTotal: ${formatUGX(total)}\n\nPayment via ${selectedProvider.toUpperCase()} (${number})\nDelivery Area: ${area}\n\nPlease confirm payment so the kitchen can begin preparing the order. Thank you.`;

        // Open WhatsApp to chef / kitchen number
        const waLink = `https://wa.me/${WA_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(msg)}`;
        window.open(waLink, '_blank');

        shakeButton(e.currentTarget || whatsappBtn);
        showToast('Order details sent to the chef. Please confirm your payment.', false);
        speak('Order sent to our chef. Kindly confirm your payment. The kitchen will begin preparing your order once payment is confirmed.');
    });

    /* ================= CALL SUPPORT ================= */
    addFastListener(callSupportBtn, (e) => {
        shakeButton(e.currentTarget || callSupportBtn);
        speak('Connecting you to Coffee Life Café support. Please hold. A friendly representative will speak with you shortly.');
        setTimeout(() => {
            window.location.href = `tel:${SUPPORT_NUMBER}`;
        }, 400);
    });

    /* ================= INIT / AUTO GUIDE ================= */
    loadCart();
    renderCart();

    // Presenter welcome and step-by-step guidance (attempts to start on load)
    const initialGuide = [
        'Dear customer, welcome to Coffee Life Café payment centre.',
        'To begin, please choose your delivery area and then select the payment provider you prefer.',
        'When you choose a provider, tap Show Instructions to hear the USSD and merchant code clearly.',
        'After making payment, please press Confirm and Send via WhatsApp to send your order to our chefs.',
        'If you need help at any time, press Call Support.'
    ];
    // try to speak the guide gently
    speakSequence(initialGuide, 3000);

    // Accessibility: keyboard selection for payment options
    paymentOptions.forEach(btn => {
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        btn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                btn.click();
            }
        });
    });

    // End of IIFE
})();
