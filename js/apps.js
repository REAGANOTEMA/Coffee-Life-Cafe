// ============================
// COFFEE LIFE CAFE - PWA & WhatsApp Integration (FINAL)
// ============================

// ===== PWA Install Prompt =====
let deferredPrompt;
const installBtn = document.createElement('button');
installBtn.textContent = 'Install CoffeeLife App';
installBtn.className = 'btn btn-install';
Object.assign(installBtn.style, {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    zIndex: '1000',
    display: 'none',
    padding: '0.8rem 1.2rem',
    backgroundColor: '#b85c38',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(184, 88, 56, 0.5)',
    transition: 'all 0.3s ease'
});
installBtn.addEventListener('mouseover', () => installBtn.style.transform = 'scale(1.05)');
installBtn.addEventListener('mouseout', () => installBtn.style.transform = 'scale(1)');
document.body.appendChild(installBtn);

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    installBtn.style.display = 'none';
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        deferredPrompt = null;
        console.log('User choice:', choiceResult.outcome);
    }
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ===== WhatsApp Floating Button =====
const whatsappBtn = document.querySelector('.whatsapp-float');
if(whatsappBtn){
    whatsappBtn.addEventListener('click', () => {
        const phone = '256772514889'; // Replace with actual CoffeeLife number
        const message = encodeURIComponent(
            'Hello CoffeeLife, I want to place an order. 🛒☕'
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });

    // Optional: Floating animation for attention
    setInterval(() => {
        whatsappBtn.classList.add('highlight');
        setTimeout(() => whatsappBtn.classList.remove('highlight'), 1200);
    }, 4000);
}

// ===== Optional: Auto-show PWA install after delay =====
setTimeout(() => {
    if(deferredPrompt && installBtn.style.display === 'none'){
        installBtn.style.display = 'block';
    }
}, 5000);

// ===== Console Friendly Branding =====
console.log('%cWelcome to COFFEE LIFE CAFE!', 'color:#b85c38; font-size:16px; font-weight:bold;');
console.log('%cCrafted with Passion, Served with Care ☕', 'color:#4b2e1e; font-size:14px; font-style:italic;');
