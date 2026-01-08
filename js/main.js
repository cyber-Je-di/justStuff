/**
 * Craw Hammer Trades School - Main Logic
 * Department of ICT
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Mobile Menu Logic ---
    const menuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;

    if (menuBtn && mobileMenu) {
        // ensure correct initial accessibility state
        menuBtn.setAttribute('aria-expanded', 'false');
        const openMenu = () => {
            // reveal then animate open
            mobileMenu.classList.remove('hidden');
            requestAnimationFrame(() => mobileMenu.classList.add('open'));
            if (menuIcon) { menuIcon.classList.remove('fa-bars'); menuIcon.classList.add('fa-times'); }
            if (menuBtn) { menuBtn.setAttribute('aria-expanded', 'true'); }
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('open');
            // after transition ends, hide to remove from flow
            const onEnd = (ev) => {
                if (ev.propertyName === 'max-height' || ev.propertyName === 'opacity') {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.removeEventListener('transitionend', onEnd);
                }
            };
            mobileMenu.addEventListener('transitionend', onEnd);
            if (menuIcon) { menuIcon.classList.remove('fa-times'); menuIcon.classList.add('fa-bars'); }
            if (menuBtn) { menuBtn.setAttribute('aria-expanded', 'false'); }
        };

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileMenu.classList.contains('open')) closeMenu(); else openMenu();
        });

        // Close when clicking outside the menu on small screens
        document.addEventListener('click', (ev) => {
            const target = ev.target;
            if (mobileMenu.classList.contains('open') && !mobileMenu.contains(target) && !menuBtn.contains(target)) {
                closeMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMenu();
            }
        });
    }

    // --- 2. Smooth Scrolling ---
    // Makes navigation feel high-end when clicking "Programs" or "About"
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu after clicking a hash link (animate close)
                if (mobileMenu && mobileMenu.classList.contains('open')){
                    mobileMenu.classList.remove('open');
                    const onEnd = (ev) => {
                        if (ev.propertyName === 'max-height' || ev.propertyName === 'opacity'){
                            mobileMenu.classList.add('hidden');
                            mobileMenu.removeEventListener('transitionend', onEnd);
                        }
                    };
                    mobileMenu.addEventListener('transitionend', onEnd);
                    if (menuBtn) { menuBtn.setAttribute('aria-expanded', 'false'); }
                }
                if (menuIcon) { menuIcon.classList.remove('fa-times'); menuIcon.classList.add('fa-bars'); }
            }
        });
    });

    // --- 3. Scroll-to-Reveal Animation ---
    // Makes sections fade in as the student scrolls down
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, observerOptions);

    // Apply to sections we want to animate (all major sections)
    const animatedSections = Array.from(document.querySelectorAll('main section, section')).filter((el, i, arr) => {
        // avoid animating navbars or very small helper sections
        return el.closest('nav') === null && el.clientHeight > 40;
    });
    animatedSections.forEach(section => {
        section.classList.add('transition-all', 'duration-800', 'opacity-0', 'translate-y-6');
        observer.observe(section);
    });
});