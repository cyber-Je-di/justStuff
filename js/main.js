/**
 * Craw Hammer Trades School - Main Logic
 * Department of ICT
 */

/* Fallback navbar template (used when fetch() fails, e.g., file:// protocol) */
const navbarTemplate = `
<nav class="glass sticky top-0 z-50 rounded-b-3xl shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
            <div class="flex items-center">
                <a href="index.html" class="flex items-center gap-3 group no-underline hover:no-underline">
                    <div class="relative">
                        <img src="static/logo.png" alt="Craw Hammer Trades Logo" loading="lazy"
                            class="h-14 w-14 rounded-full aspect-square object-cover border-2 border-white shadow-md group-hover:border-orange-500 group-hover:scale-110 transition-all duration-300">
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xl font-black text-blue-900 leading-none tracking-tight">CRAW HAMMER</span>
                        <span class="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Trades School</span>
                    </div>
                </a>
            </div>

            <div class="hidden md:flex items-center space-x-2">
                <a href="index.html" class="text-slate-700 font-semibold hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200">Home</a>
                <a href="programs.html" class="text-slate-700 font-semibold hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200">Programs</a>
                <a href="about.html" class="text-slate-700 font-semibold hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200">About Us</a>
                <a href="updates.html" class="text-slate-700 font-semibold hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200">News &amp; Updates</a>
                <a href="contact.html" class="text-slate-700 font-semibold hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200">Contact</a>
                <a href="apply.html"
                    class="ml-3 btn-glow bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:from-orange-700 hover:to-orange-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30">APPLY NOW</a>
            </div>

            <div class="md:hidden">
                <button id="mobile-menu-button" aria-controls="mobile-menu" aria-expanded="false" 
                    class="text-blue-900 focus:outline-none text-2xl hover:bg-slate-100 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative z-50">
                    <i class="fas fa-bars"></i>
                </button>
            </div>

            <div id="mobile-menu" class="mobile-menu hidden md:hidden px-6 py-6 space-y-2 absolute left-4 right-4 top-24">
                <div class="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                    <span class="text-xs font-bold text-blue-900 uppercase tracking-widest">Menu</span>
                    <button id="mobile-menu-close" class="text-blue-900 hover:text-orange-600 hover:bg-orange-50 text-2xl focus:outline-none w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200" aria-label="Close menu">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <a href="index.html" class="block text-blue-900 font-bold py-3.5 px-4 bg-blue-50 rounded-xl mb-2 hover:bg-blue-100 transition-all duration-200 border-l-4 border-orange-500">Home</a>
                <a href="programs.html" class="block text-slate-700 font-medium py-3 px-4 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200">Programs</a>
                <a href="about.html" class="block text-slate-700 font-medium py-3 px-4 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200">About Us</a>
                <a href="updates.html" class="block text-slate-700 font-medium py-3 px-4 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200">News &amp; Updates</a>
                <a href="contact.html" class="block text-slate-700 font-medium py-3 px-4 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200">Contact</a>
                <a href="apply.html" class="block btn-glow bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-4 rounded-xl text-center font-bold hover:from-orange-700 hover:to-orange-600 transition-all duration-200 mt-4 shadow-lg shadow-orange-500/30">APPLY NOW</a>
            </div>
        </div>
    </div>
</nav>
`;

// --- 1. Mobile Menu Logic ---
function initializeMobileMenu() {
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
        const menuBtn = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;

        if (!menuBtn || !mobileMenu) {
            console.warn('Mobile menu elements not found');
            return;
        }

        // Remove any existing listeners by cloning and replacing
        const newMenuBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);

        // ensure correct initial accessibility state
        newMenuBtn.setAttribute('aria-expanded', 'false');
        
        const openMenu = () => {
            console.log('Opening mobile menu');
            mobileMenu.classList.remove('hidden');
            // Force a reflow so the transition works
            void mobileMenu.offsetWidth;
            mobileMenu.classList.add('open');
            const icon = newMenuBtn.querySelector('i');
            if (icon && icon.classList.contains('fa-bars')) { 
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times'); 
            }
            newMenuBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };

        const closeMenu = () => {
            console.log('Closing mobile menu');
            mobileMenu.classList.remove('open');
            // Hide after animation finishes
            setTimeout(() => {
                if (!mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.add('hidden');
                }
            }, 300);
            const icon = newMenuBtn.querySelector('i');
            if (icon && icon.classList.contains('fa-times')) { 
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars'); 
            }
            newMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };

        // Main menu button click handler
        newMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu button clicked');
            if (mobileMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Handle close button click
        const closeBtn = mobileMenu.querySelector('#mobile-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMenu();
            });
        }

        // Close menu when clicking on a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close when clicking outside the menu on small screens
        document.addEventListener('click', (ev) => {
            const target = ev.target;
            if (mobileMenu.classList.contains('open') && !mobileMenu.contains(target) && !newMenuBtn.contains(target)) {
                closeMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMenu();
            }
        });

        console.log('Mobile menu initialized successfully');
    }, 100);
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
            const linkHref = link.getAttribute('href');

            if (currentPage === linkPage) {
                // Exclude logo, "APPLY NOW" button, and gradient buttons from active styling
                const isLogo = link.querySelector('img');
                const isApplyBtn = link.classList.contains('btn-glow') || link.classList.contains('bg-gradient-to-r');
                
                if (!isLogo && !isApplyBtn) {
                    link.classList.remove('text-slate-600', 'text-slate-700', 'hover:text-orange-500', 'hover:text-orange-600');
                    link.classList.add('text-orange-600', 'font-bold', 'bg-orange-50');
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


