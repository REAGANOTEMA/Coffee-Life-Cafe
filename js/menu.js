// ================= MENU SCRIPT =================

// ======= SMOOTH SCROLL FOR TABS =======
document.querySelectorAll('.menu-cat').forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(tab.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80, // offset for header
        behavior: 'smooth'
      });
    }
  });
});

// ======= CART SYSTEM =======
let cart = [];

// Function to add item to cart
function addToCart(itemName, itemPrice) {
  const existing = cart.find(i => i.name === itemName);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name: itemName, price: itemPrice, quantity: 1 });
  }
  updateCartDisplay();
}

// Function to remove item from cart
function removeFromCart(itemName) {
  cart = cart.filter(i => i.name !== itemName);
  updateCartDisplay();
}

// Function to update cart display
function updateCartDisplay() {
  let cartContainer = document.getElementById('cart-container');
  if (!cartContainer) {
    // Create cart sidebar if it doesn't exist
    cartContainer = document.createElement('div');
    cartContainer.id = 'cart-container';
    cartContainer.style.position = 'fixed';
    cartContainer.style.top = '80px';
    cartContainer.style.right = '20px';
    cartContainer.style.width = '250px';
    cartContainer.style.maxHeight = '70vh';
    cartContainer.style.overflowY = 'auto';
    cartContainer.style.background = '#fff';
    cartContainer.style.border = '2px solid #ff6b3c';
    cartContainer.style.borderRadius = '10px';
    cartContainer.style.padding = '10px';
    cartContainer.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
    document.body.appendChild(cartContainer);
  }

  cartContainer.innerHTML = '<h4 style="text-align:center;color:#ff6b3c;">Your Cart</h4>';
  if (cart.length === 0) {
    cartContainer.innerHTML += '<p style="text-align:center;color:#555;">Cart is empty</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.padding = '0';

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const li = document.createElement('li');
    li.style.marginBottom = '8px';
    li.innerHTML = `
            <span style="font-weight:600;">${item.name}</span> x ${item.quantity} 
            <span style="float:right;color:#ff6b3c;">${item.price * item.quantity} UGX</span>
            <button style="margin-top:5px;display:block;width:100%;padding:3px 0;background:#ff3e00;color:#fff;border:none;border-radius:5px;cursor:pointer;">Remove</button>
        `;
    li.querySelector('button').addEventListener('click', () => removeFromCart(item.name));
    ul.appendChild(li);
  });

  const totalDiv = document.createElement('div');
  totalDiv.style.marginTop = '10px';
  totalDiv.style.fontWeight = '700';
  totalDiv.style.color = '#ff6b3c';
  totalDiv.style.textAlign = 'right';
  totalDiv.textContent = `Total: ${total} UGX`;

  cartContainer.appendChild(ul);
  cartContainer.appendChild(totalDiv);
}

// ======= ATTACH ADD BUTTONS =======
document.querySelectorAll('.btn-add').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    let itemName, itemPrice;

    // If using <a href>, get values from URL
    if (btn.tagName.toLowerCase() === 'a') {
      const urlParams = new URLSearchParams(btn.getAttribute('href').split('?')[1]);
      itemName = urlParams.get('item');
      itemPrice = parseInt(urlParams.get('price'));
    } else {
      // For button with onclick
      itemName = btn.getAttribute('data-name') || btn.textContent;
      itemPrice = parseInt(btn.getAttribute('data-price')) || 0;
    }

    addToCart(itemName, itemPrice);
  });
});

// Optional: Smooth scroll for hash links on page load
if (window.location.hash) {
  const target = document.querySelector(window.location.hash);
  if (target) {
    window.scrollTo({
      top: target.offsetTop - 80,
      behavior: 'smooth'
    });
  }
}
