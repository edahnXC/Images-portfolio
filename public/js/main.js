document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 800);
        });
    }

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Back to Top Button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // View Portfolio Button
    const viewPortfolioBtn = document.getElementById('viewPortfolioBtn');
    if (viewPortfolioBtn) {
        viewPortfolioBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#gallery')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Scroll Down Button
    const scrollDown = document.getElementById('scrollDown');
    if (scrollDown) {
        scrollDown.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#gallery')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Scroll Reveal Animations
    function initializeScrollReveal() {
        if (typeof ScrollReveal !== 'undefined') {
            const sr = ScrollReveal({
                reset: true,
                distance: '40px',
                duration: 1000,
                delay: 200
            });

            sr.reveal('.animate-text', {
                origin: 'bottom',
                interval: 100
            });

            sr.reveal('.hero-title', {
                delay: 300,
                distance: '60px'
            });

            sr.reveal('.hero-subtitle', {
                delay: 500,
                distance: '40px'
            });

            sr.reveal('.btn-primary', {
                delay: 700,
                distance: '40px'
            });

            return true;
        }
        return false;
    }

    // Initialize with fallback
    if (!initializeScrollReveal()) {
        setTimeout(() => {
            document.querySelectorAll('.animate-text').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 1000);
    }

    // Gallery Functionality
    function initializeGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;

        // Show loading state initially
        const loadingState = document.createElement('div');
        loadingState.className = 'loading-state';
        loadingState.innerHTML = `
            <div class="loader"></div>
            <p>Loading images...</p>
        `;
        galleryGrid.appendChild(loadingState);

        // Fetch images from server
        fetch('/api/images')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!data.success || !data.images || data.images.length === 0) {
                    throw new Error(data.message || 'No images available');
                }

                // Clear loading state
                galleryGrid.innerHTML = '';

                // Create gallery items
                data.images.forEach((image, index) => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item animate-text';
                    galleryItem.style.transitionDelay = `${index * 0.1}s`;

                    // Generate title from filename
                    const title = image.filename
                        .replace(/\.[^/.]+$/, '')
                        .replace(/[^a-zA-Z ]/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());

                    galleryItem.innerHTML = `
                        <div class="gallery-image-container">
                            <img src="${image.url}" alt="${title || 'Photograph'}" loading="lazy" />
                            <div class="item-info">
                                <h3>${title || 'Untitled'}</h3>
                                <p>Photograph captured on iPhone XR</p>
                            </div>
                        </div>
                    `;
                    galleryGrid.appendChild(galleryItem);
                });
            })
            .catch(error => {
                console.error('Gallery error:', error);
                showGalleryError(error.message || 'Could not load gallery. Please try again later.');
            });
    }

    function showGalleryError(message) {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                ${message.includes('No images') ? '<p>Please upload images to the server</p>' : ''}
                <button class="btn btn-primary" id="retry-button">Try Again</button>
            </div>
        `;

        document.getElementById('retry-button')?.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // Initialize gallery after slight delay
    setTimeout(initializeGallery, 1500);

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            const formData = new FormData(contactForm);
            const formMessage = document.getElementById('form-message');
            
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    formMessage.textContent = 'Message sent successfully!';
                    formMessage.classList.add('success');
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Form submission failed');
                }
            } catch (error) {
                formMessage.textContent = error.message || 'Error sending message. Please try again.';
                formMessage.classList.add('error');
                console.error('Form error:', error);
            } finally {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                
                setTimeout(() => {
                    formMessage.textContent = '';
                    formMessage.classList.remove('success', 'error');
                }, 5000);
            }
        });
    }

    // Current Year in Footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Section Title Animations
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.5 });

        sectionTitles.forEach(title => {
            observer.observe(title);
        });
    }

    // Hero Scroll Down Arrow
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        setTimeout(() => {
            const scrollDown = document.getElementById('scrollDown');
            if (scrollDown) {
                scrollDown.classList.add('animated');
            }
        }, 1500);
    }
});