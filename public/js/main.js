document.addEventListener('DOMContentLoaded', function() {
    // ========== Preloader ==========
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }, 800);
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

    // ========== Curtain Transition for Gallery ==========
    const galleryLink = document.querySelector('.gallery-link');
    const curtainTransition = document.querySelector('.curtain-transition');
    
    if (galleryLink && curtainTransition) {
        galleryLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show curtain transition
            curtainTransition.style.display = 'block';
            document.querySelector('.curtain-left').style.transform = 'translateX(0)';
            document.querySelector('.curtain-right').style.transform = 'translateX(0)';
            
            // Navigate after animation completes
            setTimeout(() => {
                window.location.href = this.getAttribute('href');
            }, 1200);
        });
    }

    // Reset curtain when page loads
    if (curtainTransition) {
        setTimeout(() => {
            document.querySelector('.curtain-left').style.transform = 'translateX(-100%)';
            document.querySelector('.curtain-right').style.transform = 'translateX(100%)';
            setTimeout(() => {
                curtainTransition.style.display = 'none';
            }, 1200);
        }, 100);
    }

    // ========== Gallery Functionality ==========
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        loadGalleryImages();
        
        async function loadGalleryImages() {
            try {
                const response = await fetch('/api/images');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                const images = data.images || [];
                
                if (images.length === 0) {
                    showNoImagesMessage();
                    return;
                }
                
                populateGallery(images);
                initLightGallery();
                
                // Animation for gallery items
                if (typeof ScrollReveal !== 'undefined') {
                    ScrollReveal().reveal('.gallery-item', { 
                        duration: 1200,
                        distance: '50px',
                        easing: 'cubic-bezier(0.5, 0, 0, 1)',
                        interval: 150,
                        origin: 'bottom',
                        rotate: { x: 10, y: 10, z: 0 },
                        reset: true
                    });
                }
            } catch (error) {
                console.error('Error loading gallery images:', error);
                showNoImagesMessage();
            }
        }
        
        function populateGallery(images) {
            galleryGrid.innerHTML = '';
            
            images.forEach((image) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <a href="${image.path}" data-lg-size="1600-1600" class="gallery-image">
                        <img src="${image.path}" 
                             alt="Photography by Om Kumar" 
                             loading="lazy"
                             onerror="this.parentElement.style.display='none'">
                    </a>
                `;
                galleryGrid.appendChild(galleryItem);
            });
        }
        
        function initLightGallery() {
            if (typeof lightGallery !== 'undefined') {
                lightGallery(galleryGrid, {
                    selector: '.gallery-image',
                    download: false,
                    zoom: true,
                    counter: false,
                    showAfterLoad: true,
                    hideBarsDelay: 2000,
                    speed: 600
                });
            }
        }
        
        function showNoImagesMessage() {
            galleryGrid.innerHTML = `
                <div class="no-images-message">
                    <h3>Photos coming soon!</h3>
                    <p>Check back later or follow me on Instagram for updates</p>
                    <a href="https://www.instagram.com/captured.by.om/" target="_blank" class="btn btn-primary">
                        <i class="fab fa-instagram"></i> Follow on Instagram
                    </a>
                </div>
            `;
        }
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

    // ========== Text Animation with ScrollReveal ==========
    if (typeof ScrollReveal !== 'undefined') {
        // Initialize ScrollReveal with default config
        const sr = ScrollReveal({
            duration: 1200,
            distance: '60px',
            easing: 'cubic-bezier(0.5, 0, 0, 1)',
            interval: 150,
            reset: true,
            viewFactor: 0.2
        });

        // Hero section animations
        sr.reveal('.hero-title', {
            delay: 300,
            origin: 'top'
        });
        sr.reveal('.hero-subtitle', {
            delay: 500,
            origin: 'bottom'
        });
        sr.reveal('.hero .btn', {
            delay: 700,
            origin: 'bottom'
        });

        // Section titles and subtitles
        sr.reveal('.section-title', {
            delay: 200,
            origin: 'top'
        });
        sr.reveal('.section-subtitle', {
            delay: 400,
            origin: 'bottom'
        });

        // About section animations
        sr.reveal('.about-img', {
            delay: 300,
            origin: 'left'
        });
        sr.reveal('.about-text h3', {
            delay: 400,
            origin: 'right'
        });
        sr.reveal('.about-text p', {
            delay: 500,
            interval: 100,
            origin: 'right'
        });
        sr.reveal('.skills h4', {
            delay: 600,
            origin: 'right'
        });
        sr.reveal('.skills li', {
            delay: 700,
            interval: 100,
            origin: 'bottom'
        });

        // Contact section animations
        sr.reveal('.contact-item', {
            delay: 300,
            interval: 100,
            origin: 'left'
        });
        sr.reveal('.social-links a', {
            delay: 600,
            interval: 100,
            origin: 'bottom'
        });
        sr.reveal('.form-group', {
            delay: 300,
            interval: 100,
            origin: 'right'
        });

        // Footer animations
        sr.reveal('.footer-logo p', {
            delay: 300,
            origin: 'bottom'
        });
        sr.reveal('.footer-links h4', {
            delay: 400,
            origin: 'bottom'
        });
        sr.reveal('.footer-links li', {
            delay: 500,
            interval: 100,
            origin: 'bottom'
        });
        sr.reveal('.footer-bottom p', {
            delay: 300,
            origin: 'bottom'
        });
        sr.reveal('.footer-social a', {
            delay: 400,
            interval: 100,
            origin: 'bottom'
        });

        // Scroll down indicator animation
        setTimeout(() => {
            document.querySelector('.scroll-down').classList.add('animated');
        }, 1800);
    }

    // ========== Animate elements when they come into view ==========
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-text');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
                
                // Special animation for section title spans
                if (element.classList.contains('section-title')) {
                    const span = element.querySelector('span');
                    if (span) {
                        span.classList.add('animated');
                    }
                }
            }
        });
    };

    // Run once on load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
});