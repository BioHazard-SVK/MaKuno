'use strict';

// =========================================================
// 1. GLOBÁLNE PREMENNÉ A FUNKCIE (PRE LIGHTBOX)
// Tieto sú deklarované mimo DOMContentLoaded, aby boli dostupné
// pre všetky ostatné funkcie v tomto súbore.
// =========================================================
let currentPhotoIndex = 0; 
// Konštanta sa musí definovať až v DOMContentLoaded, pretože element ešte nemusí existovať.
let LIGHTBOX_OVERLAY; 

function displayLightbox(index) {
    // !!! OPRAVENÝ PREKLEP: productData.length
    if (index < 0 || index >= productData.length || !LIGHTBOX_OVERLAY) return;

    currentPhotoIndex = index;
    const data = productData[index];

    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');

    lightboxImage.src = data.full;
    lightboxImage.alt = data.alt;
    lightboxCaption.textContent = data.caption;

    LIGHTBOX_OVERLAY.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if(!LIGHTBOX_OVERLAY) return;
    LIGHTBOX_OVERLAY.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Riadi navigáciu v lightboxe (Predchádzajúci/Ďalší).
 * @param {number} direction - 1 pre Ďalší, -1 pre Predchádzajúci.
 */
function navigateLightbox(direction) {
    let newIndex = currentPhotoIndex + direction;

    // Cyklické prechádzanie
    if (newIndex < 0 ) {
        newIndex = productData.length -1;
    } else if (newIndex >= productData.length) {
        newIndex = 0;
    }
    displayLightbox(newIndex);
}

// Funkcia na generovanie HTML galérie z dát
function generateGallery(data) {
    const container = document.getElementById('gallery-container');
    if(!container) return;

    const galleryHTML = data.map(product => `
        <figure class="product-figure">
            <div class="photo-preview" data-photo-id="${product.id}" role="button" tabindex="0">
                <img src="${product.preview}" alt="${product.alt}" loading="lazy">
            </div>
            <figcaption>${product.caption}</figcaption>
        </figure>
    `).join('');
    
    container.innerHTML = galleryHTML;
    
    // Pripojenie poslucháča po vygenerovaní obsahu!
    setupDynamicLightboxListener(container);
}

function setupDynamicLightboxListener(container) {
    container.addEventListener('click', function(event) {
        const previewElement = event.target.closest('.photo-preview');
        
        if (previewElement) {
            event.preventDefault();

            const photoId = parseInt(previewElement.dataset.photoId);
            const photoIndex = productData.findIndex(p => p.id === photoId);
            
            if (photoIndex !== -1) {
                displayLightbox(photoIndex);
            }
        }
    });
}


// =========================================================
// HLAVNÁ APLIKAČNÁ LOGIKA (Po načítaní DOM)
// =========================================================
document.addEventListener('DOMContentLoaded', function () {

    // Inicializácia Lightboxu (premenná už existuje, len jej priradíme element)
    LIGHTBOX_OVERLAY = document.getElementById('lightbox-overlay');

    // Inicializácia poslucháčov navigácie Lightboxu (Musí byť v DOMContentLoaded)
    const prevButton = document.getElementById('lightbox-prev');
    const nextButton = document.getElementById('lightbox-next');
    if (prevButton) prevButton.addEventListener('click', () => navigateLightbox(-1));
    if (nextButton) nextButton.addEventListener('click', () => navigateLightbox(1));
    
    // --- 1. Konfigurácia a mapovanie ID ---
    
    const idMap = {
        'aboutus-section': 'aboutus',
        'technology-section': 'technology',
        'products-section': 'products',
        'contact-section': 'contact',
    };
    
    const navLinks = Array.from(document.querySelectorAll('nav a'));
    const sections = Array.from(document.querySelectorAll('.content-section'));
    const header = document.querySelector('header');
    // const footer = document.querySelector('footer'); // Nepoužíva sa, možno vymazať

    // --- 2. Pomocné funkcie ---
    function findTargetId(key) {
        if (!key) return null;
        const cleaned = String(key).replace(/^#/, '');
        return idMap[cleaned] || cleaned;
    }

    function setActiveNav(link) {
        document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
        if (!link) return;
        const li = link.closest('li');
        if (li) li.classList.add('active');
    }

    function showSectionById(id, updateHistory = true) {
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        
        sections.forEach(s => {
            if (s.id === id) {
                s.classList.add('active');
                s.classList.remove('hidden');
            } else {
                s.classList.remove('active');
                s.classList.add('hidden');
            }
        });
        
        const headerOffset = header?.offsetHeight || 0;
        const top = window.pageYOffset + target.getBoundingClientRect().top - headerOffset - 10;
        window.scrollTo({ top, behavior: 'smooth' });
        
        if (updateHistory) history.replaceState(null, '', '#' + id);
    }

    // --- 3. Obsluha klikov v navigácii ---
    navLinks.forEach(a => {
        a.addEventListener('click', function (ev) {
            ev.preventDefault();
            const key = this.dataset.target || this.getAttribute('href') || '';
            const targetId = findTargetId(key);
            setActiveNav(this);
            showSectionById(targetId);
        });
    });

    // --- 4. Spustenie Galérie a Načítanie stránky podľa hash ---
    
    // Spustenie generovania galérie
    if (typeof productData !== 'undefined') {
        generateGallery(productData);
    }
    
    window.addEventListener('load', () => {
        const hash = location.hash.replace('#', '');
        const targetId = findTargetId(hash);
        if (targetId) {
            setTimeout(() => showSectionById(targetId, false), 50);
            const activeLink = navLinks.find(a => {
                const key = (a.dataset.target || a.getAttribute('href') || '').replace(/^#/, '');
                return key === hash || findTargetId(key) === targetId;
            });
            if (activeLink) setActiveNav(activeLink);
        } else {
            const first = sections[0];
            if (first) {
                sections.forEach(s => s.classList.add('hidden'));
                first.classList.remove('hidden');
                first.classList.add('active');
            }
        }
    });

    // --- 5. Reakcia na zmenu veľkosti okna (upraviť scroll podľa headeru) ---
    window.addEventListener('resize', () => {
        const active = document.querySelector('.content-section.active');
        if (active) {
            const headerOffset = header?.offsetHeight || 0;
            const top = window.pageYOffset + active.getBoundingClientRect().top - headerOffset - 10;
            window.scrollTo({ top, behavior: 'auto' });
        }
    });

    // --- 6. Reagovať na zmenu hashu (back/forward tlačidlá) ---
    window.addEventListener('hashchange', () => {
        const targetId = findTargetId(location.hash);
        if (targetId) {
            const activeLink = navLinks.find(a => {
                const key = (a.dataset.target || a.getAttribute('href') || '').replace(/^#/, '');
                return key === location.hash.replace('#', '') || findTargetId(key) === targetId;
            });
            if (activeLink) setActiveNav(activeLink);
            showSectionById(targetId, false);
        }
    });
});