document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // Navigation Mobile
    // ==========================================================================
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mainNav.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Fermer le menu si un lien est cliqué
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        });

        // Fermer le menu si on clique en dehors
        document.addEventListener('click', (e) => {
            if (mainNav.classList.contains('active') && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
                mainNav.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // Effet de défilement doux (Smooth scroll) - Désactivé sur mobile
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const isMobile = window.innerWidth <= 768;
                target.scrollIntoView({ behavior: isMobile ? 'auto' : 'smooth' });
            }
        });
    });

    // ==========================================================================
    // Animations au défilement (Intersection Observer)
    // ==========================================================================
    const faders = document.querySelectorAll('.section-padding');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        fader.classList.add('fade-in-section');
        appearOnScroll.observe(fader);
    });

    // ==========================================================================
    // Portfolio Gallery & Filters Logic
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                // Toggle visibility of category titles
                document.querySelectorAll('.gallery-grid').forEach(grid => {
                    const title = grid.previousElementSibling;
                    if (title && title.classList.contains('gallery-category-title')) {
                        const hasMatch = Array.from(grid.querySelectorAll('.gallery-item')).some(item => {
                            const categories = item.getAttribute('data-category');
                            return filterValue === 'all' || (categories && categories.includes(filterValue));
                        });
                        title.style.display = hasMatch ? 'block' : 'none';
                    }
                });

                galleryItems.forEach(item => {
                    const categories = item.getAttribute('data-category');
                    if (filterValue === 'all' || (categories && categories.includes(filterValue))) {
                        item.classList.remove('hide-display');
                        // Petit délai pour permettre au display:block d'être pris en compte avant l'animation
                        setTimeout(() => {
                            item.classList.remove('hidden-item');
                        }, 50);
                    } else {
                        item.classList.add('hidden-item');
                        // Attendre la fin de la transition d'opacité avant de cacher l'élément
                        setTimeout(() => {
                            if (item.classList.contains('hidden-item')) {
                                item.classList.add('hide-display');
                            }
                        }, 400); // 400ms pour correspondre à une transition CSS fluide
                    }
                });
            });
        });
    }

    // ==========================================================================
    // Lightbox Modal Logic
    // ==========================================================================
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');

    // Nouveaux éléments statiques de la lightbox
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxIframe = document.getElementById('lightbox-iframe');

    if (lightbox && galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lightboxData = item.querySelector('.lightbox-data');
                if (!lightboxData) return;

                const type = lightboxData.getAttribute('data-type');
                const src = lightboxData.getAttribute('data-src');

                // Cacher tous les éléments par défaut
                if (lightboxImg) lightboxImg.style.display = 'none';
                if (lightboxVideo) {
                    lightboxVideo.style.display = 'none';
                    lightboxVideo.pause();
                }
                if (lightboxIframe) lightboxIframe.style.display = 'none';

                // Afficher l'élément correspondant
                if (type === 'image' && lightboxImg) {
                    lightboxImg.src = src;
                    lightboxImg.style.display = 'block';
                } else if (type === 'video' && lightboxVideo) {
                    const source = lightboxVideo.querySelector('source');
                    if (source) source.src = src;
                    lightboxVideo.load();
                    lightboxVideo.style.display = 'block';
                    lightboxVideo.play();
                } else if (type === 'tiktok' && lightboxIframe) {
                    const iframeSrc = src.includes('tiktok.com') ? src : `https://www.tiktok.com/embed/v2/${src}`;
                    lightboxIframe.src = iframeSrc;
                    lightboxIframe.style.display = 'block';
                }

                lightbox.classList.add('active');
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            // Mettre en pause et nettoyer les sources
            setTimeout(() => {
                if (lightboxVideo) lightboxVideo.pause();
                if (lightboxIframe) lightboxIframe.src = '';
            }, 300);
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // ==========================================================================
    // Contact Form Logic
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('form-success-message');
    const errorMessage = document.getElementById('form-error-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Empêche le rechargement de la page

            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.innerHTML = 'Envoi en cours...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    contactForm.style.display = 'none';
                    if (successMessage) successMessage.style.display = 'block';
                    if (errorMessage) errorMessage.style.display = 'none';
                    contactForm.reset();
                } else {
                    if (errorMessage) errorMessage.style.display = 'block';
                }
            } catch (error) {
                if (errorMessage) errorMessage.style.display = 'block';
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

});