document.addEventListener('DOMContentLoaded', function () {
    // ========== Preloader ==========
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', function () {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }, 500);
        });
    }

    // ========== Mobile Navigation ==========
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // ========== Sticky Header ==========
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ========== Back to Top Button ==========
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            backToTopBtn.classList.toggle('active', window.scrollY > 300);
        });

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.documentElement.scrollTop > 0) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // ========== Current Year ==========
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ========== Smooth Scrolling ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80; // fallback to 80
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== Contact Form Handling ==========
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            if (!validateForm()) return;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="btn-loading">
                        <i class="fas fa-spinner fa-spin"></i> Sending...
                    </span>
                `;

                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    subject: document.getElementById('subject').value.trim() || 'No subject',
                    message: document.getElementById('message').value.trim()
                };

                const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://localhost:5500/api/contact'
                    : 'https://images-portfolio-wp42.onrender.com/api/contact';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Server responded with status ${response.status}`);
                }

                const result = await response.json();
                if (result.success) {
                    this.reset();
                    showFormMessage(result.message || 'Message sent successfully!', 'success');
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }

            } catch (error) {
                console.error('Form submission error:', error);
                let userMessage = 'Failed to send message. Please try again later.';

                if (error.message.includes('Failed to fetch')) {
                    userMessage = 'Network error. Please check your internet connection.';
                } else if (error.message.includes('500')) {
                    userMessage = 'Server error. Please try again later.';
                } else if (error.message.includes('405')) {
                    userMessage = 'Action not allowed. Please refresh the page.';
                } else if (error.message) {
                    userMessage = error.message;
                }

                showFormMessage(userMessage, 'error');

            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });

        function validateForm() {
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');

            document.querySelectorAll('.error-text').forEach(el => el.remove());

            if (!name.value.trim()) {
                showError(name, 'Name is required');
                isValid = false;
            }

            if (!email.value.trim()) {
                showError(email, 'Email is required');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                showError(email, 'Please enter a valid email address');
                isValid = false;
            }

            if (!message.value.trim()) {
                showError(message, 'Message is required');
                isValid = false;
            } else if (message.value.trim().length < 10) {
                showError(message, 'Message should be at least 10 characters');
                isValid = false;
            }

            return isValid;
        }

        function showError(input, message) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-text';
            errorElement.textContent = message;
            input.parentNode.insertBefore(errorElement, input.nextSibling);
            input.classList.add('error');
        }

        function showFormMessage(message, type) {
            document.querySelectorAll('.form-message').forEach(msg => msg.remove());

            const messageElement = document.createElement('div');
            messageElement.className = `form-message ${type}`;
            messageElement.innerHTML = `<p>${message}</p>`;
            contactForm.insertBefore(messageElement, contactForm.firstChild);

            if (type !== 'success') {
                setTimeout(() => {
                    messageElement.classList.add('fade-out');
                    setTimeout(() => messageElement.remove(), 500);
                }, 5000);
            }
        }
    }

    // ========== Project Card Animations ==========
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length > 0) {
        const projectObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    projectObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        projectCards.forEach(card => projectObserver.observe(card));
    }

    // ========== ScrollReveal Animations ==========
    if (typeof ScrollReveal === 'function') {
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '60px',
            duration: 1000,
            delay: 200,
            reset: false
        });

        sr.reveal('.hero-title', { delay: 300 });
        sr.reveal('.hero-subtitle', { delay: 500 });
        sr.reveal('.btn', { delay: 700 });

        sr.reveal('.about-img', { origin: 'left' });
        sr.reveal('.about-text h3', { delay: 300 });
        sr.reveal('.about-text p', { delay: 400, interval: 100 });
        sr.reveal('.skills h4', { delay: 500 });
        sr.reveal('.skills li', { delay: 600, interval: 100 });

        sr.reveal('.projects .section-title', { delay: 200 });
        sr.reveal('.projects .section-subtitle', { delay: 300 });
        sr.reveal('.project-card', {
            interval: 200,
            origin: 'bottom',
            distance: '50px',
            duration: 800,
            easing: 'cubic-bezier(0.5, 0, 0, 1)',
            viewFactor: 0.1
        });

        sr.reveal('.contact-item', { interval: 200 });
        sr.reveal('.social-links a', { interval: 100 });
        sr.reveal('.form-group', { interval: 150 });

        sr.reveal('.footer-logo p', { delay: 300 });
        sr.reveal('.footer-links h4', { delay: 400 });
        sr.reveal('.footer-links li', { delay: 500, interval: 100 });
        sr.reveal('.footer-bottom p', { delay: 600 });
        sr.reveal('.footer-social a', { delay: 700, interval: 100 });
    }

    // ========== Image Error Handling ==========
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            this.src = 'images/default-image.jpg';
            this.alt = 'Default placeholder image';
        });
    });

    // ========== Project Card Interactions ==========
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (!e.target.closest('.project-link')) {
                const link = this.querySelector('.project-link');
                if (link) window.open(link.href, '_blank');
            }
        });
    });
});