document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setActiveNavigation();
    setupRevealOnScroll(prefersReducedMotion);
    setupBackToTop(prefersReducedMotion);
    setupInteractiveSurfaces(prefersReducedMotion);
    setupRippleEffects();
    setupPressedStates();
});

function normalizePath(path) {
    const cleanPath = path.replace(/index\.html$/i, '');
    return cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
}

function setActiveNavigation() {
    const navLinks = Array.from(document.querySelectorAll('nav a'));

    if (!navLinks.length) {
        return;
    }

    const currentPath = normalizePath(window.location.pathname);
    const normalizedLinks = navLinks.map((link) => ({
        element: link,
        path: normalizePath(new URL(link.href, window.location.href).pathname)
    }));

    const shortestPathLength = Math.min(...normalizedLinks.map((item) => item.path.length));

    let bestMatch = null;

    normalizedLinks.forEach((item) => {
        const isHomeLink = item.path.length === shortestPathLength;
        const isMatch = currentPath === item.path || (!isHomeLink && currentPath.startsWith(item.path));

        if (!isMatch) {
            return;
        }

        if (!bestMatch || item.path.length > bestMatch.path.length) {
            bestMatch = item;
        }
    });

    if (bestMatch) {
        bestMatch.element.classList.add('active-link');
        bestMatch.element.setAttribute('aria-current', 'page');
    }
}

function setupRevealOnScroll(prefersReducedMotion) {
    const revealTargets = document.querySelectorAll(
        '.hero, .page-hero, .section-card, .project-card, .category-card, .social-card, .info-card, .highlight-item'
    );

    revealTargets.forEach((element) => {
        element.classList.add('reveal');
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach((element) => observer.observe(element));
}

function setupBackToTop(prefersReducedMotion) {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Voltar ao topo');
    button.textContent = 'Topo';

    document.body.appendChild(button);

    const toggleVisibility = () => {
        button.classList.toggle('is-visible', window.scrollY > 420);
    };

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
}

function setupInteractiveSurfaces(prefersReducedMotion) {
    const surfaces = document.querySelectorAll('.info-card, .highlight-item, .category-card, .project-card, .social-card');

    surfaces.forEach((surface) => {
        surface.classList.add('interactive-surface');

        if (prefersReducedMotion) {
            return;
        }

        surface.addEventListener('pointermove', (event) => {
            const bounds = surface.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * 100;
            const y = ((event.clientY - bounds.top) / bounds.height) * 100;

            surface.style.setProperty('--pointer-x', `${x}%`);
            surface.style.setProperty('--pointer-y', `${y}%`);
        });

        surface.addEventListener('pointerleave', () => {
            surface.style.removeProperty('--pointer-x');
            surface.style.removeProperty('--pointer-y');
        });
    });
}

function setupRippleEffects() {
    const rippleTargets = document.querySelectorAll('button, nav a, .button-primary, .button-secondary, .link-list a, .social-card > a');

    rippleTargets.forEach((target) => {
        target.classList.add('ripple-target');

        target.addEventListener('click', (event) => {
            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            target.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                ripple.remove();
            }, { once: true });
        });
    });
}

function setupPressedStates() {
    const clickableElements = document.querySelectorAll('button, nav a, .button-primary, .button-secondary, .link-list a, .social-card > a');

    clickableElements.forEach((element) => {
        const activate = () => element.classList.add('is-pressed');
        const deactivate = () => element.classList.remove('is-pressed');

        element.addEventListener('pointerdown', activate);
        element.addEventListener('pointerup', deactivate);
        element.addEventListener('pointerleave', deactivate);
        element.addEventListener('blur', deactivate);
    });
}
