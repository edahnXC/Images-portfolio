document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 800);
    });

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
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

    // Scroll reveal animations
    ScrollReveal().reveal('.animate-text', {
        delay: 200,
        distance: '40px',
        origin: 'bottom',
        interval: 100,
        reset: true
    });

    // Initialize LightGallery
    if (document.querySelector('.gallery-grid')) {
        // Simulate loading images (replace with actual image loading)
        setTimeout(() => {
            const loadingState = document.querySelector('.loading-state');
            if (loadingState) loadingState.style.display = 'none';
            
            // Sample gallery items (replace with your actual images)
            const galleryItems = [
                { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', title: 'Nature', desc: 'Beautiful landscape' },
                { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', title: 'Mountains', desc: 'Scenic mountain view' },
                { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', title: 'Forest', desc: 'Misty forest path' },
                { src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d', title: 'Waterfall', desc: 'Majestic waterfall' },
                { src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e', title: 'Cliffs', desc: 'Ocean cliffs' },
                { src: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716', title: 'Mist', desc: 'Misty morning' }
            ];

            const galleryGrid = document.querySelector('.gallery-grid');
            galleryItems.forEach((item, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item animate-text';
                galleryItem.style.transitionDelay = `${index * 0.1}s`;
                galleryItem.innerHTML = `
                    <a href="${item.src}" data-lg-size="1600-2400" class="gallery-image">
                        <img src="${item.src}" alt="${item.title}" />
                        <div class="item-info">
                            <h3>${item.title}</h3>
                            <p>${item.desc}</p>
                        </div>
                    </a>
                `;
                galleryGrid.appendChild(galleryItem);
            });

            // Initialize LightGallery after items are added
            lightGallery(document.querySelector('.gallery-grid'), {
                selector: '.gallery-image',
                download: false,
                zoom: true,
                counter: false
            });
        }, 1500);
    }

    // Contact form submission
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
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                formMessage.textContent = 'Error sending message. Please try again.';
                formMessage.classList.add('error');
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

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Activate section title underline animation when in view
    const sectionTitles = document.querySelectorAll('.section-title');
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

    // Activate scroll down arrow after hero title animation
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        setTimeout(() => {
            document.querySelector('.scroll-down').classList.add('animated');
        }, 1500);
    }
});