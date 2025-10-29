// =============================
// NAVBAR JS
// =============================

// Select elements
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar a');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Toggle hamburger menu on mobile
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('is-active'); // animate hamburger
});

// Close mobile menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('is-active');
        }
    });
});

// Sticky navbar on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('sticky');
    } else {
        navbar.classList.remove('sticky');
    }
});

// Active link highlighting
function setActiveLink() {
    const scrollPos = window.scrollY + 200; // offset for sections
    navLinks.forEach(link => {
        const section = document.querySelector(link.hash);
        if (section) {
            if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', setActiveLink);

// Optional: Smooth scrolling for anchor links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.hash);
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});
