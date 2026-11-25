# BASELINE AUDIT — upgrade v3 (measured 25 Nov 2026, before any v3 change)

Historical claims from older docs are **not** repeated as measurements. Everything below was re-run for this baseline.

## 1. Environment & architecture
| Item | Finding (evidence) |
|---|---|
| Repo | `Gembul/` is **not a git repository** (`git status`: not a git repository). A pre-edit snapshot was copied to the session scratchpad. |
| Runtime | Static HTML + CSS + native ES modules. No bundler or framework. `site/build.mjs` is plain Node and writes `site/dist/`. |
| Dependencies | **None** (`site/package.json` has scripts only, no `dependencies`). No Three.js, GSAP, Lenis or other animation library. |
| Source vs generated | Source: `site/index.html`, `site/css/*`, `site/js/**`, `site/catalog.json`. Generated: `site/dist/**` (never edited by hand). |
| 3D assets | None (`find -iname *.glb -o -iname *.gltf` returned nothing). |
| Brand assets | `site/assets/brand/` (wordmark, full logo, favicon, icon), cropped from `brand-source/WhatsApp Image 2026-11-24 at 19.32.39.jpeg`. |
| Product assets | `site/assets/products/{id}-400.webp` and `{id}-720.webp` for all 7 products; mapping is in `catalog.json` `image_sources`. |

**Runtime flow:** `build.mjs` validates the catalog and pre-renders promo, campaign, category tiles, grids and counts into `dist/index.html` with inlined CSS. In the browser, `js/app.js` loads `catalog.json`, fills slots that were not pre-rendered (dev), applies WhatsApp/TikTok/footer links, sets admin status (refreshed every 60s), runs the FAB hide-on-scroll logic and the click-event hook.

## 2. Baseline test & build
- `node --test tests/*.test.js` → **27 tests, 27 pass, 0 fail**
- `node build.mjs` → `css 14085 B inlined, catalog v=8e9a1c452a, LCP preload: cw-01`

## 3. Rendered UI — 10 viewports (CDP device emulation)
Screenshots: `screenshots/baseline/*.png`; raw checks: `screenshots/baseline/checks.json` (tool: `site/tools/screenshots.mjs`).

| Check | Result |
|---|---|
| Horizontal overflow | none at any of the 10 viewports |
| Dead anchors | 0 |
| Broken images | 0 |
| Console errors | 0 |
| Targets < 44px | **1 at every viewport: the header "Pria" link (about 37px wide)** |

Note: Chrome's `--window-size` cannot render below about 500px wide, so the first capture attempt was invalid and was discarded. The final captures use DevTools `Emulation.setDeviceMetricsOverride`.

## 4. Performance baseline (Lighthouse 12.6.1, mobile, simulated 4G, local Python server, no compression)
| Run | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 84 | 100 | 100 | 100 | 1.6 s | 2.1 s | 540 ms | 0.001 | 292 KiB |
| 2 | 73 | 100 | 100 | 100 | 3.0 s | 3.2 s | 540 ms | 0.001 | 283 KiB |

These scores are noisier and lower than the earlier session runs (89–97). The laptop was also running a CDP Chrome and the Python server, and simulated throttling multiplies local CPU contention. **Treat ±10 points as noise on this machine**; compare like with like.

## 5. UX / UI
**Strengths:**
- Retail-neutral look with real photos.
- First phone screen shows brand, campaign, a CTA and both category tiles.
- Consistent product cards with prices and discounts.
- Sticky header with conventional navigation.

**Defects and friction:**
| ID | Finding | Evidence | Priority |
|---|---|---|---|
| B-1 | Nav link "Pria" below the 44px target width | checks.json, all viewports | P1 |
| B-2 | No active-section state in the header; users can't tell where they are on a long page | `index.html` nav has no `aria-current` logic | P2 |
| B-3 | The page is visually static: no brand moment beyond photos; the editorial block has no depth or atmosphere (the user's stated goal for v3) | screenshots 390/1440 | P2 |
| B-4 | Category tiles crop photos hard at desktop (16:7) | 1440x900.png | P3 |
| B-5 | `og:image` relative until `site_url` is set | `catalog.json` `site_url: null` | P1 (owner input) |

## 6. Data / backend boundary
- Static only. No server, API, database, auth or analytics provider.
- `track.js` dispatches `bshirt:track` events and pushes to `window.dataLayer` only if one exists.
- The data source is `catalog.json`, validated at build time.

## 7. WebGL feasibility
- No WebGL code exists yet. The stack (no bundler) favours either a vendored ES-module library or raw WebGL.
- Target browsers (TikTok in-app WebView on Android/iOS, Chrome Mobile, Safari iOS) support WebGL1 broadly. WebGL2 is common but not guaranteed on older iOS, so **WebGL1 is the safe baseline**.
- **No approved 3D product models exist.** Any 3D must be an abstract brand object, never a garment presented as a catalog item.

## 8. Accessibility
- Lighthouse a11y 100 (both runs).
- Gaps: B-1 target size; no visible "where am I" state (B-2).
- Reduced motion is honoured in CSS (`styles.css` reduced-motion block).

## 9. Security / SEO
- All outbound buy links: exact URL, `target=_blank`, `rel="noopener noreferrer"` (verified earlier and re-checked in QA).
- No third-party scripts except the Google Fonts stylesheet. No CSP header (static host decides).
- One `h1`, Indonesian title and description, OG title and description present, favicon from the official logo.

## 10. Prioritised list
- **P0:** none.
- **P1:** B-1 (fix in v3); B-5 (owner provides the domain).
- **P2:** B-2, B-3 (v3 scope).
- **P3:** B-4.
