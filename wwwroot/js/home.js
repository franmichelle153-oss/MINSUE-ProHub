// MINSU E-ProHub - Enhanced Homepage JavaScript
// ================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('%c 🎓 MINSU E-ProHub ', 'background: linear-gradient(135deg, #1a5f3f, #7cb342); color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 10px;');
    console.log('%c 📅 Online Reservation System Loaded Successfully! ', 'background: #f4d03f; color: #134d30; font-size: 16px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
    console.log('%c Developed with ❤️ for MINSU Community ', 'background: #7cb342; color: white; font-size: 14px; padding: 8px 15px; border-radius: 5px;');

    // Initialize all features
    initActiveNavigation();
    initNavbarScroll();
    initSmoothScroll();
    initParallaxEffect();
    initScrollAnimations();
    initScrollToTop();
    initAnimatedCounters();
    initButtonEffects();
    initCardHoverEffects();
    initTypingEffect();
});

// ==================== NAVIGATION ====================

// Highlight current page navigation
function initActiveNavigation() {
    const path = window.location.pathname.toLowerCase();
    const page = path.split('/').pop() || 'homepage';

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('data-page')?.toLowerCase();
        if (linkPage === page) {
            link.classList.add('active');
        }
    });
}

// Navbar scroll effect with smooth transition
function initNavbarScroll() {
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ==================== VISUAL EFFECTS ====================

// Advanced parallax effect for logo
function initParallaxEffect() {
    const heroSection = document.querySelector('.hero-section');
    const logo = document.querySelector('.minsu-logo');

    if (!heroSection || !logo) return;

    let ticking = false;

    heroSection.addEventListener('mousemove', function (e) {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                const rect = heroSection.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;

                const moveX = deltaX * 25;
                const moveY = deltaY * 25;
                const rotateZ = deltaX * 8;

                logo.style.transform = `
                    translate(${moveX}px, ${moveY}px) 
                    rotateY(${deltaX * 15}deg) 
                    rotateX(${-deltaY * 15}deg)
                    rotateZ(${rotateZ}deg)
                `;

                ticking = false;
            });
            ticking = true;
        }
    });

    heroSection.addEventListener('mouseleave', function () {
        logo.style.transform = 'translate(0, 0) rotateY(0) rotateX(0) rotateZ(0)';
        logo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    heroSection.addEventListener('mouseenter', function () {
        logo.style.transition = 'none';
    });
}

// Scroll reveal animations with Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(element => {
        observer.observe(element);
    });
}

// ==================== INTERACTIVE ELEMENTS ====================

// Enhanced button effects with ripple
function initButtonEffects() {
    document.querySelectorAll('.btn-custom, .btn').forEach(button => {
        // Ripple effect
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple-effect 0.6s ease-out';
            ripple.style.pointerEvents = 'none';

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });

        // 3D tilt effect
        button.addEventListener('mouseenter', function (e) {
            this.style.transition = 'transform 0.3s ease';
        });

        button.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            this.style.transform = `
                perspective(500px) 
                rotateY(${deltaX * 10}deg) 
                rotateX(${-deltaY * 10}deg) 
                translateY(-5px)
            `;
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'perspective(500px) rotateY(0) rotateX(0) translateY(0)';
        });
    });
}

// Card hover effects with 3D transform
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.feature-card, .service-card, .testimonial-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            this.style.transform = `
                perspective(1000px) 
                rotateY(${deltaX * 5}deg) 
                rotateX(${-deltaY * 5}deg) 
                translateY(-10px)
                scale(1.02)
            `;
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0) scale(1)';
        });
    });
}

// ==================== SCROLL TO TOP ====================

function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTop');

    if (!scrollTopBtn) return;

    // Show/hide button based on scroll position
    let lastScrollTop = 0;
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 500) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }

        lastScrollTop = scrollTop;
    });

    // Smooth scroll to top
    scrollTopBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==================== ANIMATED COUNTERS ====================

function initAnimatedCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;

                counters.forEach((counter, index) => {
                    setTimeout(() => {
                        const target = parseInt(counter.getAttribute('data-target'));
                        let count = 0;
                        const increment = target / 60; // 60 frames for smooth animation
                        const duration = 2000; // 2 seconds
                        const stepTime = duration / 60;

                        const updateCounter = () => {
                            count += increment;
                            if (count < target) {
                                counter.textContent = Math.floor(count) + '+';
                                setTimeout(updateCounter, stepTime);
                            } else {
                                counter.textContent = target + '+';
                            }
                        };

                        updateCounter();
                    }, index * 200);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        counterObserver.observe(statsSection);
    }
}

// ==================== TYPING EFFECT ====================

function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle strong');
    if (!subtitle) return;

    const text = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.borderRight = '2px solid var(--accent-gold)';

    let index = 0;

    function type() {
        if (index < text.length) {
            subtitle.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        } else {
            setTimeout(() => {
                subtitle.style.borderRight = 'none';
            }, 500);
        }
    }

    // Start typing effect after a delay
    setTimeout(type, 1000);
}

// ==================== NAVIGATION LINK EFFECTS ====================

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', function () {
        if (!this.classList.contains('active')) {
            this.style.transform = 'translateY(-2px)';
        }
    });

    link.addEventListener('mouseleave', function () {
        if (!this.classList.contains('active')) {
            this.style.transform = 'translateY(0)';
        }
    });
});

// ==================== ADD RIPPLE ANIMATION TO CSS ====================

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-effect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== PERFORMANCE OPTIMIZATION ====================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== CONSOLE EASTER EGG ====================

console.log('%c 🎬 Looking for something? ', 'background: #134d30; color: #f4d03f; font-size: 16px; padding: 10px;');
console.log('%c Join us in making reservations easier! ', 'background: #7cb342; color: white; font-size: 14px; padding: 8px;');
console.log('%c Contact: eprohub@minsu.edu.ph ', 'color: #1a5f3f; font-size: 12px; padding: 5px;');