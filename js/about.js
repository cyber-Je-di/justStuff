// Gallery Modal Functions for About Page
const galleryImages = [
    { src: 'static/programs/parking.jpeg', caption: 'School Parking' },
    { src: 'static/programs/surrounding.jpeg', caption: 'Campus Surroundings' },
    { src: 'static/programs/surrounding2.jpeg', caption: 'Campus View' },
    { src: 'static/programs/reception.jpeg', caption: 'Reception Area' },
    { src: 'static/programs/lecture.jpeg', caption: 'Lecture Facilities' },
    { src: 'static/programs/outside.jpeg', caption: 'School Exterior' },
    { src: 'static/programs/surrounding3.jpeg', caption: 'Campus Facilities' },
    { src: 'static/programs/male.jpeg', caption: 'Student Portrait' },
    { src: 'static/programs/female.jpeg', caption: 'Student Portrait' }
];
let currentGalleryIndex = 0;

function openGalleryModal(element) {
    const imgSrc = element.querySelector('img').src;
    currentGalleryIndex = galleryImages.findIndex(img => img.src === imgSrc);
    displayGalleryImage();
    document.getElementById('galleryModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
    document.getElementById('galleryModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function displayGalleryImage() {
    const image = galleryImages[currentGalleryIndex];
    document.getElementById('galleryImage').src = image.src;
    document.getElementById('galleryCaption').textContent = image.caption;
}

function nextGalleryImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    displayGalleryImage();
}

function previousGalleryImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    displayGalleryImage();
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (document.getElementById('galleryModal').classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') nextGalleryImage();
    if (e.key === 'ArrowLeft') previousGalleryImage();
    if (e.key === 'Escape') closeGalleryModal();
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
