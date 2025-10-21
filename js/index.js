'use strict';

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. Konfigurácia a mapovanie ID ---
    
    // Mapovanie navigačných kľúčov (data-target) na skutočné ID sekcií
    const idMap = {
        'aboutus-section': 'onas',
        'technology-section': 'technologia',
        'ourproduct-section': 'produkty',
        'contact-section': 'kontakt' 
    };
    
    // Konštanty pre elementy DOM
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.content-section');
    const header = document.querySelector('header');
    
    // --- 2. Pomocné funkcie ---

    /**
     * Preloží navigačný kľúč na skutočné ID sekcie.
     */
    function findTargetId(key) {
        if (!key) return null;
        const cleanedKey = key.replace(/^#/, ''); // Odstráni '#' zo začiatku
        return idMap[cleanedKey] || cleanedKey;
    }

    /**
     * Nastaví aktívnu triedu na rodičovský <li> element odkazu.
     */
    function setActiveNav(link) {
        // Odstráni triedu 'active' zo všetkých li
        document.querySelectorAll('nav li').forEach(el => el.classList.remove('active'));
        // Pridá triedu 'active' na rodičovský li element kliknutého odkazu
        if (link && link.parentElement && link.parentElement.tagName === 'LI') {
            link.parentElement.classList.add('active');
        }
    }
    
    /**
     * Prepne viditeľnosť sekcií a posunie sa na cieľ.
     */
    function showSectionById(targetId) {
        if (!targetId) return;

        let targetFound = false;
        
        // Prepínanie tried
        sections.forEach(s => {
            if (s.id === targetId) {
                s.classList.add('active');
                s.classList.remove('hidden');
                targetFound = true;
            } else {
                s.classList.remove('active');
                s.classList.add('hidden');
            }
        });

        if (!targetFound) return;
        
        const targetElement = document.getElementById(targetId);
        
        // --- Posun s kompenzáciou fixnej hlavičky ---
        
        const headerOffset = header ? header.offsetHeight : 0;
        const targetTop = targetElement.getBoundingClientRect().top;
        const newScrollTop = window.pageYOffset + targetTop - headerOffset - 10; 
        // Odpočítame výšku hlavičky a pridáme malý buffer (10px)

        // Posunie okno na vypočítanú pozíciu
        window.scrollTo({
            top: newScrollTop,
            behavior: 'smooth'
        });

        // Aktualizácia URL hashu (pre jednoduché zdieľanie)
        history.replaceState(null, '', '#' + targetId);
    }

    // --- 3. Obsluha udalostí ---

    // A. Obsluha klikov na navigačné odkazy
    navLinks.forEach(link => {
        link.addEventListener('click', function (ev) {
            ev.preventDefault(); // Zastaví štandardné presmerovanie

            // Získa cieľ buď z data-target alebo z href
            const key = this.dataset.target || this.getAttribute('href');
            const targetId = findTargetId(key);

            setActiveNav(this);
            showSectionById(targetId);
        });
    });

    // B. Nastavenie počiatočného stavu (na základe URL hashu)
    function initializeSPA() {
        const hash = location.hash.replace('#', '');
        const targetId = findTargetId(hash);
        
        if (targetId) {
            // Použijeme krátke oneskorenie pre správne spočítanie offsetu fixnej hlavičky
            setTimeout(() => showSectionById(targetId), 50);

            // Nájde a nastaví aktívny navigačný odkaz
            const activeLink = Array.from(navLinks).find(a => {
                const key = (a.dataset.target || a.getAttribute('href')).replace(/^#/, '');
                return findTargetId(key) === targetId;
            });

            if (activeLink) setActiveNav(activeLink);
        } else {
            // Ak nie je hash, nastaví sa prvá sekcia ako aktívna
            const firstLink = navLinks[0];
            if (firstLink) {
                setActiveNav(firstLink);
            }
        }
    }

    // Spustiť inicializáciu (namiesto 'load', použijeme setTimeout po DOMContentLoaded)
    // Týmto zaistíme, že HTML a skript sú pripravené
    initializeSPA();
});