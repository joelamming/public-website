/**
 * Simplified head-support.js stolen from HTMX
 * Custom implementation focused on my specific head-base.html merging
 * Also other random JS needed because spaghetti tastes great
 */
(function () {
    function mergeHeadContent(newContent) {
        if (!newContent || newContent.indexOf('<head') === -1) return;

        // Extract head tag from response
        const headMatch = newContent.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);
        if (!headMatch) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = headMatch[2]; // Just the head content

        const currentHead = document.head;
        const existingElements = new Set();

        // Track existing elements by their outerHTML
        Array.from(currentHead.children).forEach(el => {
            existingElements.add(el.outerHTML);
        });

        // Add new elements that don't already exist
        Array.from(tempDiv.children).forEach(newEl => {
            if (!existingElements.has(newEl.outerHTML)) {
                currentHead.appendChild(newEl.cloneNode(true));
            }
        });
    }

    // Initialise when HTMX is available
    function initHeadSupport() {
        if (typeof htmx === 'undefined') {
            setTimeout(initHeadSupport, 50);
            return;
        }

        // Handle HTMX responses that contain head content
        htmx.on('htmx:afterSwap', function (evt) {
            const response = evt.detail.xhr.response;
            // Use requestAnimationFrame to prevent layout thrashing
            requestAnimationFrame(function () {
                mergeHeadContent(response);
            });
        });

        // Enable view transitions when available/fallback gracefully
        htmx.on('htmx:beforeSwap', function (evt) {
            // If browser supports startViewTransition and swap targets main content, wrap it
            const supportsVT = typeof document.startViewTransition === 'function';
            if (!supportsVT) return;
            const target = evt.detail.target;
            if (!target || !target.id || target.id !== 'main-content') return;
            // Prevent double execution: allow htmx to proceed, view-transition is set via hx-swap option already
        });

        // Reset scroll for swaps targeting main content on XHR-driven navigations
        htmx.on('htmx:afterSwap', function (evt) {
            const target = evt.detail.target;
            if (target && target.id === 'main-content') {
                // Skip when restoring from history (no XHR). History restore handler will set scroll.
                if (!evt.detail.xhr) return;
                requestAnimationFrame(function () {
                    const hash = window.location.hash;
                    if (hash && hash.length > 1) {
                        const id = decodeURIComponent(hash.substring(1));
                        const anchor = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
                        if (anchor) {
                            anchor.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
                            return;
                        }
                    }
                    window.scrollTo({ top: 0, behavior: 'auto' });
                });
            }
        });

        // Preserve & restore scroll position for history navigation (back/forward)
        htmx.on('htmx:beforeHistorySave', function (evt) {
            try {
                const y = window.scrollY || document.documentElement.scrollTop || 0;
                evt.detail.historyElt.setAttribute('data-scroll-position', String(y));
            } catch (_) { /* no-op */ }
        });

        htmx.on('htmx:historyRestore', function (evt) {
            const saved = evt.detail.historyElt && evt.detail.historyElt.getAttribute('data-scroll-position');
            if (saved != null) {
                const y = parseInt(saved, 10) || 0;
                requestAnimationFrame(function () {
                    window.scrollTo({ top: y, behavior: 'auto' });
                });
            }
        });
    }

    // Start initialisation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeadSupport);
    } else {
        initHeadSupport();
    }
})();

(function () {
    // Track if already set up the event listeners
    let initialised = false;

    function setupBackToTop() {
        if (initialised) return;
        initialised = true;

        // Use event delegation for clicks on dynamically loaded buttons
        document.addEventListener('click', function (e) {
            if (e.target && e.target.id === 'back-to-top-button') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Handle scroll visibility - check for button existence on each scroll
        document.addEventListener('scroll', function () {
            const backToTopButton = document.getElementById('back-to-top-button');
            if (backToTopButton) {
                if (window.scrollY > 100) {
                    if (!backToTopButton.classList.contains('visible')) {
                        backToTopButton.classList.add('visible');
                    }
                } else {
                    if (backToTopButton.classList.contains('visible')) {
                        backToTopButton.classList.remove('visible');
                    }
                }
            }
        });
    }

    // Initialise when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBackToTop);
    } else {
        setupBackToTop();
    }
})();