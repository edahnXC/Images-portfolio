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

    // ========== Gallery Carousel Functionality ==========
    const galleryCarousel = document.querySelector('.gallery-carousel');
    if (galleryCarousel) {
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
                
                initCarousel(images);
                
            } catch (error) {
                console.error('Error loading gallery images:', error);
                showNoImagesMessage();
            }
        }
        
        function initCarousel(images) {
            const carouselContainer = document.querySelector('.carousel-container');
            const carouselTrack = document.querySelector('.carousel-track');
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            const dotsContainer = document.querySelector('.carousel-dots');
            
            let currentIndex = 0;
            let slides = [];
            let autoSlideInterval;
            
            // Group images into slides (3 per slide)
            for (let i = 0; i < images.length; i += 3) {
                slides.push(images.slice(i, i + 3));
            }
            
            // Create carousel slides
            function createSlides() {
                carouselTrack.innerHTML = '';
                dotsContainer.innerHTML = '';
                
                slides.forEach((slide, index) => {
                    // Create slide
                    const slideElement = document.createElement('div');
                    slideElement.className = 'carousel-slide';
                    
                    // Create items for this slide
                    slide.forEach((image, imgIndex) => {
                        const item = document.createElement('div');
                        item.className = 'carousel-item';
                        item.innerHTML = `
                            <a href="${image.path}" data-lg-size="1600-1600" class="gallery-image">
                                <img src="${image.path}" 
                                     alt="Photography by Om Kumar" 
                                     loading="lazy"
                                     onerror="this.parentElement.style.display='none'">
                            </a>
                        `;
                        slideElement.appendChild(item);
                    });
                    
                    carouselTrack.appendChild(slideElement);
                    
                    // Create dot
                    const dot = document.createElement('div');
                    dot.className = 'carousel-dot';
                    if (index === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => goToSlide(index));
                    dotsContainer.appendChild(dot);
                });
                
                // Initialize lightGallery
                initLightGallery();
                
                // Set initial position
                updateCarousel();
                
                // Activate first slide items
                setTimeout(() => {
                    const firstSlideItems = document.querySelectorAll('.carousel-slide:first-child .carousel-item');
                    firstSlideItems.forEach(item => item.classList.add('active'));
                }, 100);
            }
            
            function updateCarousel() {
                carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
                
                // Update dots
                document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
                
                // Update slide items animation
                document.querySelectorAll('.carousel-item').forEach(item => item.classList.remove('active'));
                const activeSlideItems = document.querySelectorAll(`.carousel-slide:nth-child(${currentIndex + 1}) .carousel-item`);
                activeSlideItems.forEach((item, i) => {
                    setTimeout(() => {
                        item.classList.add('active');
                    }, i * 200);
                });
            }
            
            function goToSlide(index) {
                if (index < 0 || index >= slides.length) return;
                currentIndex = index;
                updateCarousel();
                resetAutoSlide();
            }
            
            function nextSlide() {
                currentIndex = (currentIndex + 1) % slides.length;
                updateCarousel();
                resetAutoSlide();
            }
            
            function prevSlide() {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateCarousel();
                resetAutoSlide();
            }
            
            function startAutoSlide() {
                autoSlideInterval = setInterval(nextSlide, 5000);
            }
            
            function resetAutoSlide() {
                clearInterval(autoSlideInterval);
                startAutoSlide();
            }
            
            // Event listeners
            nextBtn.addEventListener('click', nextSlide);
            prevBtn.addEventListener('click', prevSlide);
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') nextSlide();
                if (e.key === 'ArrowLeft') prevSlide();
            });
            
            // Initialize
            createSlides();
            startAutoSlide();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                updateCarousel();
            });
        }
        
        function initLightGallery() {
            if (typeof lightGallery !== 'undefined') {
                lightGallery(document.querySelector('.carousel-track'), {
                    selector: '.gallery-image',
                    download: false,
                    zoom: true,
                    counter: false,
                    showAfterLoad: true,
                    hideBarsDelay: 2000
                });
            }
        }
        
        function showNoImagesMessage() {
            const carouselContainer = document.querySelector('.carousel-container');
            if (carouselContainer) {
                carouselContainer.innerHTML = `
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
});