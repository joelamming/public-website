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