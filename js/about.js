// Carousel Functionality for Facilities Section
let currentSlideIndex = 0;
const totalSlides = 9;
let autoplayInterval;
let isAutoplayActive = true;

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    const offset = -currentSlideIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    
    // Update counter
    document.getElementById('current-slide').textContent = currentSlideIndex + 1;
    
    // Update indicators
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentSlideIndex) {
            indicator.classList.remove('bg-slate-300', 'hover:bg-slate-400');
            indicator.classList.add('bg-orange-500', 'w-8');
        } else {
            indicator.classList.remove('bg-orange-500', 'w-8');
            indicator.classList.add('bg-slate-300', 'hover:bg-slate-400', 'w-3');
        }
    });
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
    currentSlideIndex = index;
    updateCarousel();
}

function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
}

function stopAutoplay() {
    clearInterval(autoplayInterval);
}

function toggleAutoplay() {
    isAutoplayActive = !isAutoplayActive;
    const icon = document.getElementById('autoplay-icon');
    const text = document.getElementById('autoplay-text');
    
    if (isAutoplayActive) {
        startAutoplay();
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        text.textContent = 'Pause Auto-play';
    } else {
        stopAutoplay();
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        text.textContent = 'Resume Auto-play';
    }
}

// Initialize carousel when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCarousel();
    startAutoplay();
    
    // Pause autoplay on hover
    const carouselContainer = document.querySelector('#carousel-track').parentElement;
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', () => {
        if (isAutoplayActive) startAutoplay();
    });
});

// Keyboard navigation for carousel
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel-track');
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) nextSlide(); // Swipe left
        if (touchEndX > touchStartX + 50) prevSlide(); // Swipe right
    }
});

// Contact Modal Functions
function showContactOptions(type, value) {
    if (type === 'phone') {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 class="text-lg font-bold text-blue-900 mb-4">Contact via Phone</h3>
                <p class="text-slate-600 mb-6">${value}</p>
                <div class="flex flex-col gap-3">
                    <a href="https://wa.me/${value.replace(/\D/g, '')}?text=Hi%20Craw%20Hammer%2C%20I%20would%20like%20to%20inquire%20about%20the%202026%20intake." target="_blank" class="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 transition">
                        <i class="fab fa-whatsapp"></i>
                        <span>WhatsApp</span>
                    </a>
                    <a href="tel:${value.replace(/\s/g, '')}" class="flex items-center justify-center gap-2 bg-blue-900 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-800 transition">
                        <i class="fas fa-phone"></i>
                        <span>Direct Call</span>
                    </a>
                    <button onclick="this.closest('.fixed').remove()" class="text-center text-slate-500 hover:text-slate-700 transition">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    } else if (type === 'email') {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 class="text-lg font-bold text-blue-900 mb-4">Contact via Email</h3>
                <p class="text-slate-600 mb-6">${value}</p>
                <div class="flex flex-col gap-3">
                    <a href="mailto:${value}" class="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-orange-700 transition">
                        <i class="fas fa-envelope"></i>
                        <span>Send Email</span>
                    </a>
                    <button onclick="this.closest('.fixed').remove()" class="text-center text-slate-500 hover:text-slate-700 transition">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}
