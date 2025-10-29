/* ============================
   COFFEE LIFE MENU & CART JS
   Compact, category arranged, fully linked
============================ */

let cart = [];

// Helper
function createEl(tag, className, innerHTML) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

// Render menu by categories
function renderMenu() {
  const container = document.getElementById("menu-container");
  if (!container) return;
  container.innerHTML = "";

  const menuItems = window.MENU_ITEMS || [];

  // Group by category
  const categories = [...new Set(menuItems.map(i => i.category || "Other"))];

  categories.forEach(cat => {
    const catTitle = createEl("h3", "menu-category", cat);
    catTitle.style.margin = "8px 0";
    container.appendChild(catTitle);

    const catGrid = createEl("div", "menu-grid-cat");
    catGrid.style.display = "grid";
    catGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
    catGrid.style.gap = "8px";

    menuItems.filter(i => i.category === cat).forEach(item => {
      const card = createEl("div", "menu-item");

      card.innerHTML = `
        <div class="menu-media">
          <a href="payment.html" class="img-link">
            <img src="${item.img}" alt="${item.name}">
          </a>
        </div>
        <div class="menu-body">
          <h4>${item.name}</h4>
          <p class="desc">${item.description}</p>
          <p class="price">UGX ${item.price.toLocaleString()}</p>
          <div class="actions">
            <button class="btn-add">Add</button>
            <button class="btn-whatsapp">WA</button>
          </div>
        </div>
      `;

      // Add to cart
      card.querySelector(".btn-add").addEventListener("click", () => addToCart(item));
      // WhatsApp single item
      card.querySelector(".btn-whatsapp").addEventListener("click", () => {
        const msg = `I want ${item.name} (UGX ${item.price.toLocaleString()})`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
      });

      catGrid.appendChild(card);
    });

    container.appendChild(catGrid);
  });
}

// Add to cart
function addToCart(item) {
  const existing = cart.find(ci => ci.id === item.id);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  renderCart();
  saveCart();
}

// Render cart
function renderCart() {
  const container = document.querySelector(".cart-items");
  if (!container) return;
  container.innerHTML = "";

  cart.forEach(item => {
    const cartItem = createEl("div", "cart-item");
    cartItem.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="controls">
          <button class="qty-btn minus">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn plus">+</button>
          <span class="cart-item-remove">x</span>
        </div>
      </div>
    `;
    const btnMinus = cartItem.querySelector(".minus");
    const btnPlus = cartItem.querySelector(".plus");
    const removeBtn = cartItem.querySelector(".cart-item-remove");

    btnMinus.addEventListener("click", () => {
      if (item.qty > 1) item.qty--;
      else cart = cart.filter(ci => ci.id !== item.id);
      renderCart(); saveCart();
    });
    btnPlus.addEventListener("click", () => { item.qty++; renderCart(); saveCart(); });
    removeBtn.addEventListener("click", () => { cart = cart.filter(ci => ci.id !== item.id); renderCart(); saveCart(); });

    container.appendChild(cartItem);
  });

  updateTotals();
}

// Update totals
function updateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("subtotal")?.textContent = subtotal.toLocaleString();
  document.getElementById("grandTotal")?.textContent = subtotal.toLocaleString();
}

// Save/load cart
function saveCart() { localStorage.setItem("COFFEE_CART", JSON.stringify(cart)); }
function loadCart() {
  const saved = localStorage.getItem("COFFEE_CART");
  if (saved) cart = JSON.parse(saved);
}

// WhatsApp full cart
document.querySelector(".btn-order")?.addEventListener("click", () => {
  if (!cart.length) return alert("Cart is empty!");
  let msg = "Order:%0A";
  cart.forEach(item => {
    msg += `${item.name} x${item.qty} = UGX ${(item.price * item.qty).toLocaleString()}%0A`;
  });
  msg += `Total: UGX ${cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}`;
  window.open(`https://wa.me/?text=${msg}`);
});

// Init
document.addEventListener("DOMContentLoaded", () => { loadCart(); renderMenu(); renderCart(); });
