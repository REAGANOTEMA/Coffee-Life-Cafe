// ===== Hamburger Menu Toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.desktop');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// ===== Contact Form Submission =====
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');

contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic Validation (all required fields are filled)
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
        successMessage.textContent = 'Please fill in all required fields.';
        successMessage.style.color = 'red';
        return;
    }

    // Show success message
    successMessage.textContent = 'Thank you! Your message has been sent.';
    successMessage.style.color = 'green';

    // Clear form
    contactForm.reset();
});

// ===== WhatsApp Order Form =====
const whatsappForm = document.getElementById('whatsapp-order-form');

if (whatsappForm) {
    whatsappForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const custName = document.getElementById('custName').value.trim();
        const custLocation = document.getElementById('custLocation').value.trim();
        const custOrder = document.getElementById('custOrder').value.trim();

        if (!custName || !custLocation || !custOrder) {
            alert('Please fill in all WhatsApp order fields.');
            return;
        }

        // Construct WhatsApp URL
        const phoneNumber = '+256746888730'; // Your Coffee Life WhatsApp number
        const text = `Hello Coffee Life!%0AName: ${encodeURIComponent(custName)}%0ALocation: ${encodeURIComponent(custLocation)}%0AOrder: ${encodeURIComponent(custOrder)}`;
        const url = `https://wa.me/${phoneNumber}?text=${text}`;

        // Open WhatsApp
        window.open(url, '_blank');

        // Clear WhatsApp form
        whatsappForm.reset();
    });
}
