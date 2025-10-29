// COFFEE LIFE — Complete JS (Cart + WhatsApp + Payments + Hamburger + Merchants + Animations)
(function () {
  "use strict";

  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  onReady(() => {
    // ===== HEADER SCROLL =====
    const header = document.querySelector("header.site-header");
    function handleHeaderScroll() {
      if (window.scrollY > 30) {
        header.classList.add("scrolled");
        header.style.backdropFilter = "blur(18px)";
        header.style.boxShadow = "0 15px 50px rgba(0,0,0,0.55)";
      } else {
        header.classList.remove("scrolled");
        header.style.backdropFilter = "blur(16px)";
        header.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
      }
    }
    window.addEventListener("scroll", handleHeaderScroll);
    handleHeaderScroll();

    // ===== HAMBURGER MENU =====
    const hamburger = document.querySelector(".hamburger");
    const mobileMenu = document.querySelector(".mobile-menu");
    function toggleMenu() {
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("active");
      hamburger.querySelectorAll('.bar').forEach((bar, i) => {
        if (hamburger.classList.contains('active')) {
          bar.style.backgroundColor = 'var(--gold)';
          if (i === 0) bar.style.transform = 'rotate(45deg) translate(5px,5px)';
          if (i === 1) bar.style.opacity = '0';
          if (i === 2) bar.style.transform = 'rotate(-45deg) translate(6px,-6px)';
        } else {
          bar.style.backgroundColor = 'var(--royal-blue)';
          bar.style.transform = 'rotate(0) translate(0,0)';
          if (i === 1) bar.style.opacity = '1';
        }
      });
    }
    hamburger.addEventListener("click", toggleMenu);
    document.querySelectorAll(".mobile-link").forEach(link => link.addEventListener("click", () => {
      if (hamburger.classList.contains('active')) toggleMenu();
    }));

    // ===== CART LOGIC =====
    window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const deliveryFeeEl = document.getElementById("deliveryFee");
    const cartTotalEl = document.getElementById("cartTotal");
    const deliverySelect = document.getElementById("delivery-zone");
    const locationGroupSelect = document.getElementById("location-group");
    const whatsappBtn = document.querySelector(".whatsapp-float");
    const paymentContainer = document.getElementById("payment-section");
    const callSupportBtn = document.getElementById("callSupport");

    const DELIVERY_AREAS = {
      "Jinja Town": 2000, "Milo Mbili": 2000, "Walukuba West": 2000,
      "Walukuba East": 3000, "Mafubira": 3000, "Mpumudde": 3000,
      "Bugembe": 3000, "Nile": 3000, "Masese": 4000, "Wakitaka": 4000,
      "Namuleesa": 4000, "Lakeview Central": 2000, "Mailombili": 2000,
      "Makerere": 3000, "Kira Road": 3000, "Gabba Road": 3500, "Other Kampala": 4000
    };
    let DELIVERY_FEE = 0;

    const LOCATION_CONTACTS = {
      "jinja-highway": ["+256752746763", "+256749958799", "+256751054138", "+256701234567", "+256702345678"],
      "jinja-lakeview": ["+256750038032", "+256703456789", "+256704567890", "+256705678901", "+256706789012"],
      "kampala-kansanga": ["+256783070102", "+256707890123", "+256708901234", "+256709012345", "+256709123456"]
    };
    const SUPPORT_NUMBER = "+256709691395";

    function persistCart() { localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart)); }
    function formatUGX(amount) { return Number(amount || 0).toLocaleString() + " UGX"; }
    function calcCartSubtotal() { return window.cart.reduce((a, i) => a + (i.price || 0) * (i.qty || 0), 0); }
    function getSelectedDeliveryFee() { return DELIVERY_AREAS[deliverySelect?.value] || 0; }
    function escapeHtml(str) { return String(str || "").replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])); }

    // ===== UPDATE CART DISPLAY =====
    function updateCartDisplay() {
      if (!cartItemsContainer) return;
      cartItemsContainer.innerHTML = "";
      if (!window.cart.length) {
        cartItemsContainer.innerHTML = "<p class='cart-empty'>🛒 Your cart is empty.</p>";
        whatsappBtn?.classList.add("disabled");
      } else {
        whatsappBtn?.classList.remove("disabled");
        window.cart.forEach(item => {
          const div = document.createElement("div");
          div.className = "cart-item";
          div.innerHTML = `
            <div class="cart-item-info">
              <span class="name">${escapeHtml(item.name)}</span>
              <span class="price">${formatUGX(item.price)}</span>
            </div>
            <div class="cart-controls">
              <button class="qty-btn" data-action="minus" data-name="${escapeHtml(item.name)}">-</button>
              <span class="qty">${item.qty}</span>
              <button class="qty-btn" data-action="plus" data-name="${escapeHtml(item.name)}">+</button>
            </div>
            <span class="remove" data-name="${escapeHtml(item.name)}">×</span>`;
          cartItemsContainer.appendChild(div);
        });
      }
      DELIVERY_FEE = getSelectedDeliveryFee();
      const subtotal = calcCartSubtotal();
      const total = subtotal + DELIVERY_FEE;
      cartSubtotalEl.textContent = formatUGX(subtotal);
      deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
      cartTotalEl.textContent = formatUGX(total);
      bindCartButtons();
    }

    function bindCartButtons() {
      document.querySelectorAll(".qty-btn").forEach(btn => {
        btn.onclick = () => {
          const action = btn.dataset.action; const name = btn.dataset.name;
          const item = window.cart.find(i => i.name === name); if (!item) return;
          if (action === "plus") item.qty++; else { item.qty--; if (item.qty <= 0) window.cart = window.cart.filter(i => i.name !== name); }
          persistCart(); updateCartDisplay();
        };
      });
      document.querySelectorAll(".remove").forEach(btn => {
        btn.onclick = () => { window.cart = window.cart.filter(i => i.name !== btn.dataset.name); persistCart(); updateCartDisplay(); }
      });
    }

    // ===== ADD ITEMS BUTTON =====
    document.querySelectorAll(".btn-add, .add-to-cart-btn").forEach(btn => {
      btn.onclick = e => {
        const itemEl = e.target.closest(".menu-item, .menu-card"); if (!itemEl) return;
        const name = itemEl.dataset.name;
        const price = parseInt(itemEl.dataset.price, 10) || 0;
        const existing = window.cart.find(i => i.name === name);
        if (existing) existing.qty++; else window.cart.push({ name, price, qty: 1 });
        persistCart(); updateCartDisplay();
      };
    });

    // ===== WHATSAPP ORDER =====
    function handleOrderNow(paymentMethod = "Cash") {
      if (!window.cart.length) return alert("🛒 Please add items to your cart.");
      if (!deliverySelect.value) return alert("📍 Please select your delivery area.");
      if (!locationGroupSelect.value) return alert("🏬 Please select branch/location.");
      const customerName = prompt("Enter your full name:")?.trim();
      if (!customerName) return alert("⚠ Name is required to continue.");
      const area = deliverySelect.value;
      const contacts = LOCATION_CONTACTS[locationGroupSelect.value] || [];
      if (!contacts.length) return alert("❌ No WhatsApp contact available. Call support.");

      const waNumber = contacts[Math.floor(Math.random() * contacts.length)];
      const subtotal = calcCartSubtotal();
      const total = subtotal + DELIVERY_FEE;

      let message = `✨ *Coffee Life Order* ✨\n`;
      message += `\n👤 Name: ${customerName}`;
      message += `\n📍 Area: ${area}`;
      message += `\n💰 Payment Method: ${paymentMethod}`;
      message += `\n\n🛒 *Items:* \n`;
      window.cart.forEach((item, index) => { message += `${index + 1}. ${item.name} (x${item.qty}) - ${formatUGX(item.price * item.qty)}\n`; });
      message += `\n💵 Subtotal: ${formatUGX(subtotal)}`;
      message += `\n🚚 Delivery Fee: ${formatUGX(DELIVERY_FEE)}`;
      message += `\n📦 Total: ${formatUGX(total)}`;
      message += `\n\n☕ _Coffee Life — Crafted with Passion_`;

      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, "_blank");
      window.cart = [];
      persistCart();
      updateCartDisplay();
    }
    whatsappBtn?.addEventListener("click", () => handleOrderNow("Cash"));

    // ===== PAYMENT BUTTONS =====
    const PAYMENT_MERCHANTS = { mtn: "971714", airtel1: "4393386" };
    const USSD_PATTERNS = { mtn: "*165*3*{merchant}*{amount}%23", airtel: "*185*9*{merchant}*{amount}%23" };
    function handlePayment(type) {
      if (!window.cart.length) return alert("Add items first!");
      const subtotal = calcCartSubtotal();
      const area = deliverySelect.value || "";
      const total = subtotal + (DELIVERY_AREAS[area] || 0);
      const method = type === "mtn" ? "MTN Mobile Money" : "Airtel Money";
      const merchant = type === "mtn" ? PAYMENT_MERCHANTS.mtn : PAYMENT_MERCHANTS.airtel1;
      const ussdTemplate = type === "mtn" ? USSD_PATTERNS.mtn : USSD_PATTERNS.airtel;
      const ussd = ussdTemplate.replace("{merchant}", merchant).replace("{amount}", String(total));
      window.location.href = "tel:" + ussd;
      setTimeout(() => handleOrderNow(method), 1000);
    }

    function addPaymentButtons() {
      if (!paymentContainer) return;
      paymentContainer.innerHTML = "";
      const payments = [
        { type: "mtn", label: "MTN Mobile Money", icon: "./images/mtn.jpg", merchant: PAYMENT_MERCHANTS.mtn },
        { type: "airtel", label: "Airtel Money", icon: "./images/el.jpg", merchant: PAYMENT_MERCHANTS.airtel1 }
      ];
      payments.forEach(p => {
        const btn = document.createElement("button");
        btn.className = `payment-btn ${p.type}`;
        btn.innerHTML = `<img src="${p.icon}" alt="${escapeHtml(p.type)} icon" loading="lazy" />
          <div class="payment-label">
            <span>${escapeHtml(p.label)}</span>
            <small>Merchant Code: ${p.merchant}</small>
          </div>`;
        btn.addEventListener("click", () => handlePayment(p.type));
        paymentContainer.appendChild(btn);
      });
    }

    // ===== DELIVERY / LOCATION CHANGE =====
    deliverySelect?.addEventListener("change", () => { DELIVERY_FEE = getSelectedDeliveryFee(); updateCartDisplay(); });
    locationGroupSelect?.addEventListener("change", () => {
      const group = locationGroupSelect.value;
      Array.from(deliverySelect.options).forEach(opt => { if (opt.dataset.location) opt.hidden = opt.dataset.location !== group; });
      deliverySelect.value = ""; updateCartDisplay();
    });

    // ===== CALL SUPPORT =====
    callSupportBtn?.addEventListener("click", () => { window.location.href = `tel:${SUPPORT_NUMBER}`; });

    // ===== INIT =====
    addPaymentButtons();
    updateCartDisplay();

    // ===== CART SHAKE ANIMATION EVERY 3 SECONDS =====
    setInterval(() => {
      document.querySelectorAll(".cart-item").forEach(item => item.classList.add("shake"));
      setTimeout(() => { document.querySelectorAll(".cart-item").forEach(item => item.classList.remove("shake")); }, 800);
    }, 3000);

  });
})();
