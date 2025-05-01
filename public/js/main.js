document.addEventListener('DOMContentLoaded', function () {
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
            header.classList.toggle('scrolled', window.scrollY > 100);
        });
    }

    // Back to Top Button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('active', window.scrollY > 300);
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Scroll Buttons
    const scrollTargets = {
        viewPortfolioBtn: '#gallery',
        scrollDown: '#gallery'
    };

    for (const [btnId, targetSelector] of Object.entries(scrollTargets)) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector(targetSelector)?.scrollIntoView({ behavior: 'smooth' });
            });
        }
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

            sr.reveal('.animate-text', { origin: 'bottom', interval: 100 });
            sr.reveal('.hero-title', { delay: 300, distance: '60px' });
            sr.reveal('.hero-subtitle', { delay: 500, distance: '40px' });
            sr.reveal('.btn-primary', { delay: 700, distance: '40px' });

            return true;
        }
        return false;
    }

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

        // Show loading state
        const loadingState = document.createElement('div');
        loadingState.className = 'loading-state';
        loadingState.innerHTML = `
            <div class="loader"></div>
            <p>Loading images...</p>
        `;
        galleryGrid.appendChild(loadingState);

        // Fetch images
        fetch('/api/images')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch images');
                return res.json();
            })
            .then(data => {
                if (!data.success || !data.images || data.images.length === 0) {
                    throw new Error(data.message || 'No images found');
                }

                galleryGrid.innerHTML = '';

                data.images.forEach((image, index) => {
                    if (!image.url) return; // Skip broken images

                    const title = image.filename
                        .replace(/\.[^/.]+$/, '')
                        .replace(/[^a-zA-Z ]/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());

                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item animate-text';
                    galleryItem.style.transitionDelay = `${index * 0.1}s`;

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
            .catch(err => {
                console.error('Gallery error:', err);
                showGalleryError(err.message);
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

    setTimeout(initializeGallery, 1500);

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            const formMessage = document.getElementById('form-message');
            const formData = new FormData(contactForm);

            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formMessage.textContent = 'Message sent successfully!';
                    formMessage.classList.add('success');
                    contactForm.reset();
                } else {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Contact form error:', error);
                formMessage.textContent = error.message;
                formMessage.classList.add('error');
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                setTimeout(() => {
                    formMessage.textContent = '';
                    formMessage.classList.remove('success', 'error');
                }, 5000);
            }
        });
    }

    // Footer Year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Animate Section Titles
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.5 });

        sectionTitles.forEach(title => observer.observe(title));
    }

    // Animate Hero Arrow
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        setTimeout(() => {
            const scrollDown = document.getElementById('scrollDown');
            if (scrollDown) scrollDown.classList.add('animated');
        }, 1500);
    }
});
