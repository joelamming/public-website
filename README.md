# public-website
## GitHub Pages host repo
Static site, see?

## Rationale
  - HTMX-first static site to keep things simple, fast and linkable; avoid SPA frameworks while retaining modern UX.
  - Each route is a fully valid HTML page for direct loads and crawlers from Google and also random villages in Albania; HTMX speedifies navigation by swapping only `#main-content`.

# Changelogs

## 2025-09-15:

- Gallery
  - Added Gallery tab in navigation.
  - Gallery layout/styles: Single-column layout; `aspect-ratio` sizing to prevent CLS; lazy-loaded images with `decoding="async"` and tuned `fetchpriority`.
  - Lightbox: Click images to open overlay with caption, scroll lock/restored on close.
- Homepage image: switched to `/static/jnl3_768.png`.

## 2025-08-11:
 
- HTMX UX
  - Scroll reset on `#main-content` swaps; history restores prior scroll on back/forward.
  - Anchor hash support after swaps (e.g., `/post#section`).
  - Removed `show:#main-content:top` from year links; logic centralised in `static/site.js`.

## 2025-08-07

- HTMX UX
  - Year and post links now swap with view transitions: `hx-swap="innerHTML transition:true"`.
  - Scroll-to-top on navigations is centralised in `static/site.js` (listens to `htmx:afterSwap`). No inline JS.
  - Still no `hx-boost`. Explicit HTMX everywhere.

- Performance / LCP
  - Preload homepage hero (`/static/jnl2.png`) in `<head>` and made it first-class LCP: removed `loading="lazy"`, added `decoding="async"` + `fetchpriority="high"`.
  - Dropped the “hide body then reveal” FOUC hack; let CSS block render like nature intended.
  - `htmx.min.js` and `site.js` now `defer` on year pages.

- CSS / Motion
  - Fixed typo: `prefers-colour-scheme` → `prefers-color-scheme`. USA USA USA
  - Respect `prefers-reduced-motion`: shimmer placeholders don’t animate for users who opt out.

- A11y / Semantics
  - `role="main"` on `#main-content` across pages.
  - Year nav has `aria-label="Year navigation"`.

- Head / Meta
  - Added `<meta name="theme-color" content="#000000">`.
  - Kept custom head-merge logic in `static/site.js` (simple, no dependency on the htmx extension).

Why
- Keep the story HTMX-first: tiny JS, snappy UX, no frameworks.
- Better LCP and fewer layout freakouts, smoother swaps and cleaner markup.

## Long time before

- Architecture
  - Header, nav, footer and homepage/post content are componentised and loaded via `hx-get` with `hx-trigger="load"`.
  - Links use explicit `hx-get`/`hx-select="#main-content"`/`hx-target="#main-content"` and `hx-push-url` for history.
  - `hx-preserve` on critical `<head>` elements; lightweight head merge in `static/site.js` to adopt new `<title>`, meta, links without duplication.
  - No `hx-boost`; explicit attributes keep control over swap targets, transitions and history.

- UX
  - View transitions on swaps where supported; graceful fallback.
  - Centralised scroll handling: top on navigation, restore prior position on back/forward; hash anchors respected after swap.

- Performance
  - Preload LCP image and use `decoding="async"` + `fetchpriority="high"`; scripts `defer` where safe.
  - FOUC -- surprisingly easy to fuck up -- let CSS do the right thing and eliminate that JS footprint.

- Ops
  - GitHub Pages hosting with `CNAME`, `sitemap.xml` kept simple; year indexes link to standalone post pages.
  - Local test server with optional delay (`serve_with_delay.py`) to validate skeleton states.
