/**
 * Craw Hammer Trades School - Main Logic
 * Department of ICT
 */

/* Fallback navbar template (used when fetch() fails, e.g., file:// protocol) */
const navbarTemplate = `
<nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
            <div class="flex items-center">
                <a href="index.html" class="flex items-center gap-3 group">
                    <div class="relative">
                        <img src="static/logo.png" alt="Craw Hammer Logo"
                            class="h-14 w-14 rounded-full aspect-square object-cover border-2 border-slate-100 shadow-sm group-hover:border-orange-500 transition-colors duration-300">
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xl font-black text-blue-900 leading-none tracking-tighter">CRAW
                            HAMMER</span>
                        <span class="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Trades
                            School</span>
                    </div>
                </a>
            </div>

            <div class="hidden md:flex items-center space-x-6">
                <a href="index.html" class="text-slate-600 font-medium hover:text-orange-500 transition">Home</a>
                <a href="programs.html" class="text-slate-600 font-medium hover:text-orange-500 transition">Programs</a>
                <a href="about.html" class="text-slate-600 font-medium hover:text-orange-500">About Us</a>
                <a href="updates.html" class="text-slate-600 font-medium hover:text-orange-500">News &amp; Updates</a>
                <a href="contact.html" class="text-slate-600 font-medium hover:text-orange-500">Contact</a>
                <a href="apply.html"
                    class="ml-4 bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition shadow-lg btn-glow">APPLY
                    NOW</a>
            </div>

            <div class="md:hidden">
                <button id="mobile-menu-button" aria-controls="mobile-menu" aria-expanded="false" class="text-blue-900 focus:outline-none">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>

            <div id="mobile-menu" class="mobile-menu hidden md:hidden bg-white border-t border-slate-100 px-4 py-6 space-y-4 shadow-lg absolute left-0 right-0 mt-20">
                <a href="index.html" class="block text-blue-900 font-bold">Home</a>
                <a href="programs.html" class="block text-slate-600 font-medium">Programs</a>
                <a href="about.html" class="block text-slate-600 font-medium">About Us</a>
                <a href="updates.html" class="block text-slate-600 font-medium">News &amp; Updates</a>
                <a href="contact.html" class="block text-slate-600 font-medium">Contact</a>
                <a href="apply.html" class="block bg-orange-600 text-white px-4 py-2 rounded-lg text-center font-bold btn-glow">APPLY NOW</a>
            </div>
        </div>
    </div>
</nav>
`;

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
            menuBtn.setAttribute('aria-expanded', 'true');
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
            menuBtn.setAttribute('aria-expanded', 'false');
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
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) {
        return;
    }

    try {
        const response = await fetch('navbar.html');
        if (!response.ok) throw new Error('Network response was not ok.');
        const navbarHtml = await response.text();
        placeholder.outerHTML = navbarHtml;

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

        // Initialize the mobile menu AFTER the HTML has been injected
        initializeMobileMenu();
        
        // Signal that the navbar is ready
        document.body.classList.add('navbar-loaded');
    } catch (error) {
        console.error('Failed to load navbar:', error);
        if (placeholder) {
            // If fetch fails (commonly when opened via file://), fall back to embedded template
            try {
                placeholder.outerHTML = navbarTemplate;
                console.log('Injected navbar from fallback template.');

                // Initialize mobile menu for the injected HTML
                initializeMobileMenu();
                document.body.classList.add('navbar-loaded');
            } catch (innerErr) {
                console.error('Fallback navbar injection failed:', innerErr);
                placeholder.innerHTML = '<p class="text-center text-red-500 py-4">Failed to load navigation. Please ensure you are using a local server.</p>';
            }
        }
    }
}

// --- 3. Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadNavbar();

    // Ensure mobile menu is initialized on pages that include the navbar statically
    initializeMobileMenu();

    // --- Smooth Scrolling for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Auto-close mobile menu if it's open (for anchor links)
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    const menuBtn = document.getElementById('mobile-menu-button');
                    if (menuBtn) menuBtn.click();
                }
            }
        });
    });

    // --- 5. Scroll-to-Reveal Animation ---
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
        return el.closest('nav') === null && el.closest('footer') === null && el.clientHeight > 40;
    });

    animatedSections.forEach(section => {
        section.classList.add('transition-all', 'duration-800', 'opacity-0', 'translate-y-6');
        observer.observe(section);
    });
});

// --- Counter Animation ---
function initializeCounters() {
    const counters = document.querySelectorAll('.counter[data-target]');
    
    const countUp = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2500; // 2.5 seconds
        const startTime = Date.now();
        
        // Determine format based on target value or parent context
        const parentText = element.parentElement.textContent.toLowerCase();
        let suffix = '';
        let isPercentage = false;
        let isSpecial = false;
        
        if (parentText.includes('rate') || parentText.includes('learning') || target === 95 || target === 100) {
            suffix = '%';
            isPercentage = true;
        } else if (target === 24) {
            suffix = '/7';
            isSpecial = true;
        } else if (target === 30 || target >= 1000) {
            suffix = '+';
        }
        
        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            
            if (elapsed >= duration) {
                // Animation complete
                const displayValue = target.toLocaleString();
                element.textContent = displayValue + suffix;
                return;
            }
            
            const progress = elapsed / duration;
            const current = Math.floor(target * progress);
            element.textContent = current + suffix;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    };
    
    // Use Intersection Observer to trigger counters when they come into view
    const observerOptions = { threshold: 0.5 };
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                counterObserver.unobserve(entry.target); // Only run once
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// Initialize counters when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCounters);
} else {
    initializeCounters();
}

// --- Scroll-triggered animations ---
function initializeScrollAnimations() {
    const items = document.querySelectorAll('.animate-on-scroll[data-anim], [data-anim]');
    if (!items || items.length === 0) return;

    const onEnter = (el, animName) => {
        // normalize: allow either a utility class name or 'fade-in' etc.
        el.classList.add(animName);
    };

    const onLeave = (el, animName) => {
        // remove animation classes only when element re-enters
        if (!el.dataset.once) {
            el.classList.remove(animName);
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            const animName = el.getAttribute('data-anim') || 'fade-in';
            if (entry.isIntersecting) {
                onEnter(el, animName);
                if (el.dataset.once === 'true') observer.unobserve(el);
            } else {
                onLeave(el, animName);
            }
        });
    }, { threshold: 0.35 });

    items.forEach(it => {
        // set initial invisible state for non-splash animations
        const a = it.getAttribute('data-anim') || 'fade-in';
        if (!a.includes('splash')) it.classList.add('disappear');
        observer.observe(it);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScrollAnimations);
} else {
    initializeScrollAnimations();
}


