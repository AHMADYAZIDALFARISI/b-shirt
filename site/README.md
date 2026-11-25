# b-shirt Official Web Catalog

A single-page, mobile-first catalog. All purchases go to Shop | Tokopedia and support goes through WhatsApp Admin. The page has no dependencies and no framework.

## Daily use: change products, prices or the promo
Everything lives in **`catalog.json`**:
- `site_config.global_shop_url`: the Tokopedia link every "Beli di Tokopedia" button uses. Paste it exactly as given; it is never shortened or rebuilt.
- `products[].product_url`: optional link for one product. It overrides the global link.
- `products[].original_price` / `promo_price`: the discount % is calculated automatically.
- `products[].is_new`: adds the product to New Arrivals.
- `products[].is_featured`: the large card in an odd-sized collection.
- `products[].image` and `image_position` (`top` | `center`).
- `products[].image`, `image_sources` (each WebP file + its pixel width) and `image_position` (`top` | `center`).
- `site_config.promo_banner.active`: `false` hides the promo strip.
- `site_config.campaign`: campaign headline, CTA and the two product photos (`product_ids`). `{max_new_discount}` in the text is filled in from the data.
- `site_config.category_tiles`: the photo used for the Wanita/Pria tiles.
- `site_config.site_url`: set this to the live domain after deploy so og:image becomes absolute.

After editing, run the tests and the build (below), then upload `dist/`.

## Product photos
1. Export as WebP at 400px and 720px wide (quality around 80), for example `assets/products/cw-01-400.webp` and `cw-01-720.webp`.
2. List both in `image_sources` with their real widths. The build fails if a file is missing.

## Official logo
Save the logo as `assets/brand-source/logo.png`, then run `python tools/make_logo_assets.py assets/brand-source/logo.png` followed by `node build.mjs`. The header wordmark, footer logo and favicon then switch over automatically.

## Commands (PowerShell, inside this folder)
```powershell
npm install            # devDependencies only (Playwright, Axe-core, Lighthouse); 0 runtime deps
node --test tests/*.test.js
node build.mjs
npm run test:e2e       # Playwright browser E2E + WCAG 2.2 AA Axe scan across viewports
npm run audit:lighthouse
```
- Development: `python -m http.server 8080` → http://localhost:8080/
- Production preview: http://localhost:8080/dist/ (pre-rendered, CSS inlined, 0 runtime deps).

## Deploy
Upload only the **contents of `dist/`** to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages) — never upload `node_modules/`. Enable gzip/brotli and long cache headers for `js/`; `catalog.json` is versioned automatically. Then verify the live link on real Android, iOS, and TikTok in-app browser.

## Structure
```
catalog.json              data (single source of truth)
index.html                page shell, SEO/OG, modal dialog root
css/tokens.css            design tokens (colors, glass, dark runway, typography, spacing)
css/styles.css            component styles (strictly CSS custom properties; 0 raw color literals)
js/app.js                 browser wiring: status, links, collision-aware FAB, tracking, modal
js/stage.js               3D stage controller, sliding chips sync, adaptive WebGL quality
js/3d/orbit-scene.js      4-pass WebGL1 renderer (shader backdrop, pedestal rings, 3D hanger/cloth, curved cards)
js/3d/cloth.js            real-time Verlet cloth simulation + procedural 512x512 woven canvas
js/3d/backdrop-shader.js  GLSL ES 1.00 mesh/grain/god-rays/silk atmospheric shader
js/3d/geometry.js         hanger sculpture spline, curved cards, orbital floor ring geometry
js/ui/tilt-spotlight.js   spring 3D TiltedCard physics, SpotlightCard radial glow, sliding filter pill
js/ui/product-modal.js    accessible <dialog> product detail presentation (extensible verified optional specs)
js/lib/*                  pure catalog, price, links, status, HTML renderer & PII-free tracking modules
build.mjs                 production build → dist/ (zero runtime dependencies)
tests/*.test.js           Node unit/integration tests
tests/e2e.mjs             Playwright E2E + WCAG 2.2 AA Axe scan
tools/screenshots.mjs     CDP cross-viewport screenshot, lazy-image decoder & CTA-overlap verifier
tools/lighthouse-audit.mjs Mobile + Desktop Lighthouse audit runner
```

## Analytics
Clicks emit `shop_click`, `whatsapp_click` and `tiktok_click` to `window.dataLayer` and as a `bshirt:track` DOM event. Add your analytics tool (e.g. GA4 via GTM) to start recording. No analytics tool is installed yet.

## Interactive 3D ("Jelajahi koleksi 3D")
- The section shows the 7 product photos on a rotating 3D ring around the b-shirt hanger. It uses no external library (`js/3d/`, raw WebGL).
- It reads everything from `catalog.json`: filters, prices and the Tokopedia link. `site_config.stage.default_product` sets the product shown first.
- The 3D loads only after the visitor scrolls or touches the page. Without WebGL, with reduced motion or on low-power phones, the same panel works in 2D with the product photo.
- Test modes: add `?scene=off` (2D), `?scene=still` or `?scene=live` to the URL.
- QA screenshots and checks: `node tools/screenshots.mjs http://localhost:8080/dist/index.html ../docs/upgrade-v3/screenshots/run1`
- Full details: `../docs/upgrade-v3/`.

## v4.0 additions
- **Hero:** the 3D rack is in the hero. The campaign photo pair (`site_config.campaign.product_ids`) shows first and stays as the fallback without WebGL.
- **Category tiles:** `site_config.category_tiles` (Wanita/Pria, photo from `product_id`).
- **Brand Ambassador:** `site_config.ambassadors` (images in `assets/ambassadors/`). No names or quotes are shown; each portrait links to its collection.
- **Hide anything without deleting it:** add `"published": false` to a product or to an ambassador entry, then `node build.mjs`.
- **New products** `cw-03…cw-08`, `ce-06`, `ce-07` have `"price_source": "proposal"`. Replace the prices with the real Tokopedia prices, then remove that field.
- Full report: `../docs/upgrade-v4/DELIVERY_REPORT.md`.
