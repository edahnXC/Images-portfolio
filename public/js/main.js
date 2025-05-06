document.addEventListener('DOMContentLoaded', function() {
    // ========== Preloader ==========
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', function() {
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
        hamburger.addEventListener('click', function() {
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
        window.addEventListener('scroll', function() {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ========== Back to Top Button ==========
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            backToTopBtn.classList.toggle('active', window.scrollY > 300);
        });
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========== Current Year ==========
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ========== Smooth Scrolling ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== Contact Form Handling ==========
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                this.reset();
                showFormMessage('Message sent successfully!', 'success');
            } catch (error) {
                showFormMessage('Failed to send message. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
        
        function showFormMessage(message, type) {
            const existingMsg = contactForm.querySelector('.form-message');
            if (existingMsg) existingMsg.remove();
            
            const msgElement = document.createElement('div');
            msgElement.className = `form-message ${type}`;
            msgElement.textContent = message;
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            contactForm.insertBefore(msgElement, submitBtn);
            
            setTimeout(() => {
                msgElement.classList.add('fade-out');
                setTimeout(() => msgElement.remove(), 500);
            }, 5000);
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

        projectCards.forEach(card => {
            projectObserver.observe(card);
        });
    }

    // ========== ScrollReveal Animations ==========
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '60px',
            duration: 1000,
            delay: 200,
            reset: false
        });

        // Hero section
        sr.reveal('.hero-title', { delay: 300 });
        sr.reveal('.hero-subtitle', { delay: 500 });
        sr.reveal('.btn', { delay: 700 });

        // About section
        sr.reveal('.about-img', { origin: 'left' });
        sr.reveal('.about-text h3', { delay: 300 });
        sr.reveal('.about-text p', { delay: 400, interval: 100 });
        sr.reveal('.skills h4', { delay: 500 });
        sr.reveal('.skills li', { delay: 600, interval: 100 });

        // Projects section
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

        // Contact section
        sr.reveal('.contact-item', { interval: 200 });
        sr.reveal('.social-links a', { interval: 100 });
        sr.reveal('.form-group', { interval: 150 });

        // Footer
        sr.reveal('.footer-logo p', { delay: 300 });
        sr.reveal('.footer-links h4', { delay: 400 });
        sr.reveal('.footer-links li', { delay: 500, interval: 100 });
        sr.reveal('.footer-bottom p', { delay: 600 });
        sr.reveal('.footer-social a', { delay: 700, interval: 100 });
    }

    // ========== Keyboard Handling for Contact Form ==========
    window.addEventListener('resize', function() {
        if (window.innerHeight < 500) { // When keyboard is open
            document.querySelector('.contact-form')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });

    // ========== Animate Section Titles ==========
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length > 0) {
        const titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    titleObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        sectionTitles.forEach(title => {
            titleObserver.observe(title);
        });
    }

    // ========== Project Link Interactions ==========
    document.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click if needed
            // You can add analytics tracking here if needed
        });
    });

    // ========== Project Card Interactions ==========
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.project-link')) {
                const link = this.querySelector('.project-link');
                if (link) {
                    window.open(link.href, '_blank');
                }
            }
        });
    });
});