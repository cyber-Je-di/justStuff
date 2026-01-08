/**
 * Craw Hammer Trades School - Main Logic
 * Department of ICT
 */

// --- 1. Mobile Menu Logic ---
function initializeMobileMenu() {
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
}

// --- 2. Navbar Loading and Active Link Logic ---
async function loadNavbar() {
    console.log('Starting navbar load...');
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) {
        console.log('No navbar placeholder found.');
        return;
    }

    try {
        const response = await fetch('navbar.html');
        if (!response.ok) throw new Error('Network response was not ok.');
        const navbarHtml = await response.text();
        placeholder.outerHTML = navbarHtml;
        console.log('Navbar HTML injected.');

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a[href]');

        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop() || 'index.html';

            if (currentPage === linkPage) {
                // Exclude the "APPLY NOW" button from text link styling
                if (!link.classList.contains('bg-orange-600')) {
                    link.classList.remove('text-slate-600', 'hover:text-orange-500');
                    link.classList.add('text-blue-900', 'font-bold', 'border-b-2', 'border-orange-500');
                }
            }
        });
        console.log('Active link styled.');

        initializeMobileMenu();
        console.log('Mobile menu initialized.');
        // Signal that the navbar is ready
        document.body.classList.add('navbar-loaded');
        console.log('navbar-loaded class added to body.');
    } catch (error) {
        console.error('Failed to load navbar:', error);
        if (placeholder) {
            placeholder.innerHTML = '<p class="text-center text-red-500">Failed to load navigation.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded event fired.');
    await loadNavbar();

    // --- 3. Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    const onEnd = (ev) => {
                        if (ev.propertyName === 'max-height' || ev.propertyName === 'opacity') {
                            mobileMenu.classList.add('hidden');
                            mobileMenu.removeEventListener('transitionend', onEnd);
                        }
                    };
                    mobileMenu.addEventListener('transitionend', onEnd);
                    const menuBtn = document.getElementById('mobile-menu-button');
                    if (menuBtn) {
                        menuBtn.setAttribute('aria-expanded', 'false');
                        const menuIcon = menuBtn.querySelector('i');
                        if (menuIcon) {
                            menuIcon.classList.remove('fa-times');
                            menuIcon.classList.add('fa-bars');
                        }
                    }
                }
            }
        });
    });

    // --- 4. Scroll-to-Reveal Animation ---
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

    const animatedSections = Array.from(document.querySelectorAll('main section, section')).filter((el) => {
        return el.closest('nav') === null && el.clientHeight > 40;
    });
    animatedSections.forEach(section => {
        section.classList.add('transition-all', 'duration-800', 'opacity-0', 'translate-y-6');
        observer.observe(section);
    });
});
