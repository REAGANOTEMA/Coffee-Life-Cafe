// ============================
// COFFEE LIFE WhatsApp + AI Chatbot + Footer Integration (FINAL 2025)
// ============================

// ===== Elements =====
const whatsappFloat = document.querySelector(".whatsapp-float");
const whatsappModal = document.querySelector(".whatsapp-modal");
const whatsappClose = document.querySelector(".close-whatsapp");
const whatsappSendBtn = document.querySelector(".btn-whatsapp-send");
const cartPreview = document.querySelector(".whatsapp-cart-preview");
const qrBtn = document.querySelector(".qr-btn");
const whatsappBtnFooter = document.querySelector(".btn-whatsapp-send-footer");

// WhatsApp business number
const WA_PHONE = "256772514889";

// ===== Cart System =====
let cart = [];

// ===== Add-to-cart functionality =====
document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", e => {
        const itemEl = e.target.closest(".menu-item");
        if (!itemEl) return;
        const name = itemEl.dataset.name;
        const price = parseInt(itemEl.dataset.price) || 0;
        const existing = cart.find(i => i.name === name);
        if (existing) existing.qty++;
        else cart.push({ name, price, qty: 1 });
        updateCartPreview();
        updateQRLink();
    });
});

// ===== Update Cart Preview =====
function updateCartPreview() {
    if (!cartPreview) return;
    cartPreview.innerHTML = "";
    if (cart.length === 0) {
        cartPreview.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }
    cart.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <span class="name">${item.name}</span>
            <div class="controls">
                <button class="qty-btn" data-action="minus" data-name="${item.name}">-</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-btn" data-action="plus" data-name="${item.name}">+</button>
            </div>
            <span class="price">${item.price * item.qty} UGX</span>
        `;
        cartPreview.appendChild(div);
    });

    cartPreview.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const action = e.target.dataset.action;
            const name = e.target.dataset.name;
            const item = cart.find(i => i.name === name);
            if (!item) return;
            if (action === "plus") item.qty++;
            else {
                item.qty--;
                if (item.qty <= 0) cart = cart.filter(i => i.name !== name);
            }
            updateCartPreview();
            updateQRLink();
        });
    });
}

// ===== Generate WhatsApp Message =====
function generateCartMessage(name, location) {
    let message = `✨ Coffee Life Order ✨\n\n`;
    message += `👤 Customer: ${name || "[Your Name]"}\n📍 Delivery: ${location || "[Your Location]"}\n\n`;
    message += "🛒 Order Details:\n";

    if (cart.length === 0) message += "No items selected yet.\n";
    else {
        let total = 0;
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x${item.qty} - ${item.price * item.qty} UGX\n`;
            total += item.price * item.qty;
        });
        message += `\n💰 Total: ${total} UGX`;
    }

    message += "\n\n💵 Payment before delivery required.\n☕ Coffee Life — Crafted with Passion, Served with Care.";
    return message;
}

// ===== Floating WhatsApp Modal =====
whatsappFloat?.addEventListener("click", () => {
    whatsappModal?.classList.toggle("active");
    updateCartPreview();
    startChat();
});
whatsappClose?.addEventListener("click", () => whatsappModal?.classList.remove("active"));

// ===== Send via WhatsApp from Floating Modal =====
whatsappSendBtn?.addEventListener("click", () => {
    if (cart.length === 0) return alert("Please add items to your order first.");
    const name = prompt("Please enter your name:");
    if (!name) return alert("Name is required!");
    const location = prompt("Please enter your delivery location:");
    if (!location) return alert("Location is required!");
    const message = generateCartMessage(name, location);
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
});

// ===== Footer WhatsApp Button =====
whatsappBtnFooter?.addEventListener("click", () => {
    if (cart.length === 0) return alert("Your cart is empty! Please add items before sending.");
    const name = prompt("Please enter your name:");
    if (!name) return alert("Name is required!");
    const location = prompt("Please enter your delivery location:");
    if (!location) return alert("Location is required!");
    const message = generateCartMessage(name, location);
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
});

// ===== Update QR Link =====
function updateQRLink() {
    if (!qrBtn) return;
    qrBtn.setAttribute("href", "https://reaganotema.github.io/Coffee-Life/#menu");
}

// ===== Floating Animation =====
setInterval(() => {
    whatsappFloat?.classList.toggle("highlight");
}, 3000);

// ===== AI Chatbot =====
const chatMessages = document.querySelector(".chat-messages");
const chatInput = document.getElementById("chatUserInput");
const chatSendBtnChat = document.getElementById("chatSendBtn");
let chatStep = 0;
let userData = { name: "", location: "" };

function addMessage(text, sender = "bot") {
    if (!chatMessages) return;
    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function startChat() {
    if (!chatMessages) return;
    chatMessages.innerHTML = "";
    chatStep = 0;
    userData = { name: "", location: "" };
    addMessage("👋 Hello! Welcome to Coffee Life ☕");
    setTimeout(() => addMessage("May I have your name, please?"), 1500);
}

function handleChat() {
    if (!chatInput) return;
    const input = chatInput.value.trim();
    if (!input) return;
    addMessage(input, "user");
    chatInput.value = "";

    setTimeout(() => {
        if (chatStep === 0) {
            userData.name = input;
            addMessage(`Nice to meet you, ${userData.name}! 😊`);
            addMessage("Where should we deliver your order?");
            chatStep++;
        } else if (chatStep === 1) {
            userData.location = input;
            addMessage(`Got it! Delivery to ${userData.location}.`);
            addMessage("💡 Note: delivery fee may vary depending on distance.");
            addMessage("Would you like to *view the menu* or *place an order*?");
            chatStep++;
        } else if (chatStep === 2) {
            if (input.toLowerCase().includes("menu")) {
                addMessage("Opening our menu... 🍰☕");
                setTimeout(() => window.location.href = "#menu", 1000);
            } else {
                addMessage("Preparing your order. Click below 👇");
                const orderBtn = document.createElement("button");
                orderBtn.className = "btn-whatsapp-send";
                orderBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Send to WhatsApp';
                orderBtn.onclick = () => {
                    const message = generateCartMessage(userData.name, userData.location);
                    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
                };
                chatMessages.appendChild(orderBtn);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }, 1000);
}

chatSendBtnChat?.addEventListener("click", handleChat);
chatInput?.addEventListener("keypress", e => { if (e.key === "Enter") handleChat(); });

// ===== Auto Year Update =====
document.getElementById("year")?.textContent = new Date().getFullYear();

// ===== Initialize =====
updateCartPreview();
updateQRLink();

// ============================
// COFFEE LIFE WhatsApp + AI Chatbot Mobile Enhancements (FINAL 2025)
// ============================

// All responsive styles should be included in CSS file
