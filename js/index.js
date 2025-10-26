'use strict';


document.addEventListener('DOMContentLoaded', function () {

    // --- 1. Konfigurácia a mapovanie ID ---
    
    // Mapovanie navigačných kľúčov (data-target) na skutočné ID sekcií
    const idMap = {
        'aboutus-section': 'aboutus',
        'technology-section': 'technology',
        'products-section': 'products',
        'contact-section': 'contact',
    };
    
    // Konštanty pre elementy DOM
    const navLinks = Array.from(document.querySelectorAll('nav a'));
    const sections = Array.from(document.querySelectorAll('.content-section'));
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

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
        // Zobrazenie / skrytie sekcií
        sections.forEach(s => {
            if (s.id === id) {
                s.classList.add('active');
                s.classList.remove('hidden');
            } else {
                s.classList.remove('active');
                s.classList.add('hidden');
            }
        });
        // Plynulé posunutie s odpočítaním výšky headeru
        const headerOffset = header?.offsetHeight || 0;
        const top = window.pageYOffset + target.getBoundingClientRect().top - headerOffset - 10;
        window.scrollTo({ top, behavior: 'smooth' });
        // Aktualizovať hash v URL bez pridania do histórie
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

    // --- 4. Pri načítaní stránky podľa hash ---
    window.addEventListener('load', () => {
        const hash = location.hash.replace('#', '');
        const targetId = findTargetId(hash);
        if (targetId) {
            // malé oneskorenie, aby sa správne spočítal header offset
            setTimeout(() => showSectionById(targetId, false), 50);
            // nastaviť aktívny odkaz v nav
            const activeLink = navLinks.find(a => {
                const key = (a.dataset.target || a.getAttribute('href') || '').replace(/^#/, '');
                return key === hash || findTargetId(key) === targetId;
            });
            if (activeLink) setActiveNav(activeLink);
        } else {
            // ak nie je hash, zabezpečíme, že prvá sekcia je viditeľná
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