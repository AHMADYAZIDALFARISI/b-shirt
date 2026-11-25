# GEMBUL V5 — STAGE 2, 3, & 4 FINAL AUDIT REPORT

**Date:** 25 November 2026  
**Scope:** Stage 2 (UX & Conversion Refinement), Stage 3 (QA & Engineering Maturity), Stage 4 (Immersive Brand Experience Refinement)  
**Stage 1 Status:** Out of scope — completed by project owner and verified untouched via regression suite (`57/57` tests).

---

## 1. Executive Summary

The existing `b-shirt` (`Gembul`) v5 static ES-module codebase was audited, hardened, and enhanced across UX conversion paths, automated quality gates, WCAG 2.2 AA accessibility, and 3D performance engineering while strictly preserving **zero runtime dependencies**, Stage 1 business truth (`site/catalog.json`: 15 published products, exact 511-char global Tokopedia URL, WhatsApp `082230089520`/`6282230089520`, TikTok `@b_shirt_co`, Mon–Sat 08:00–17:00 WIB hours, 4 Brand Ambassador portraits), and single-context WebGL1 fallback parity.

**Key outcome:** Functional quality, accessibility (`Lighthouse Accessibility 100` mobile/desktop; `0` Axe WCAG 2.2 AA critical/serious violations), visual integrity (`0` broken lazy images across 29 DOM images × 30 browser matrix runs), and mobile CTA non-overlap (`0` overlaps across `360px`/`390px`/`430px`) all passed after the final edit. Local Lighthouse Performance (`63` mobile, `65` desktop on an uncompressed local Python HTTP server on Windows `HeadlessChrome/158.0.0.0`, `benchmarkIndex ~1199`) improved substantially on TBT/FCP (`1.2s` mobile FCP, `250ms` desktop TBT, `0` CLS) but remains below the `≥ 90` target under local uncompressed CPU-constrained measurement, requiring compressed staging verification + physical mobile device QA prior to public launch sign-off.

---

## 2. Initial Findings (Phase 0 Inspection)

Auditing the actual repository (`site/`, root docs, screenshots) surfaced seven concrete gaps:
1. **Missing `.wa-fab--away` & Mobile Overlap:** `site/js/app.js` toggled `.wa-fab--away` on scroll, but CSS lacked `.wa-fab--away` styling and `env(safe-area-inset-*)` support; on `360px`–`430px` initial folds `.wa-fab` also sat too close to `.stage__panel` CTAs.
2. **Missing `.img-placeholder` Style:** `app.js` injected `.img-placeholder` on decode error without matching CSS styling.
3. **Long Single-Column Mobile Editorial Grid:** `#brand-ambassador` stacked 4 tall portrait cards vertically on phones.
4. **Shallow Product Detail Exploration:** Shoppers could not inspect larger verified imagery, computed Rupiah savings, or extensible optional catalog attributes without leaving for Tokopedia.
5. **False-Green Lazy-Load Verification in `tools/screenshots.mjs`:** Short 120ms scroll waits left below-fold `loading="lazy"` images (`complete === false`) unverified, resulting in blank placeholder frames in prior full-page screenshots (`cw-03`–`cw-07`).
6. **Axe WCAG 2.2 AA Contrast Violation (`3.92:1`):** Initial Lighthouse/Axe modal audit caught `--color-accent: #b8664e` on `#fbf8f3` surface below `4.5:1`.
7. **Render & Boot Bottlenecks:** `app.js` eagerly invoked `render.js` HTML builders (`14.1 KB`) and `Intl.NumberFormat` loops on already `data-prerendered` production HTML, stacked `backdrop-filter` blur layers, and emitted 21 idle `mix-blend-mode: soft-light` / gradient layers on non-hover mobile cards.

---

## 3. Implemented Changes

| Area | Files Changed / Added | Purpose |
|---|---|---|
| Stage 2 UX & Conversion | [site/js/ui/product-modal.js](../../site/js/ui/product-modal.js), [site/js/lib/render.js](../../site/js/lib/render.js), [site/js/app.js](../../site/js/app.js), [site/js/stage.js](../../site/js/stage.js), [site/index.html](../../site/index.html) | Accessible `<dialog id="product-modal">` showing only verified fields (`productDetailSpecs`), `"Lihat di Rak 3D"` sync, clickable Info Belanja Tokopedia bridge (`[data-shop-info]`), active grid highlight (`.card--active`), collision-aware `setupFab()`, zero wasted production string synthesis |
| Stage 2 & 4 Styling/A11y | [site/css/tokens.css](../../site/css/tokens.css), [site/css/styles.css](../../site/css/styles.css) | Darkened `--color-accent: #954530` (`>= 4.5:1` WCAG AA), `.amb-grid` 2×2 mobile lookbook, safe-area `.wa-fab` + `.wa-fab--away` keyboard-safe focus restore, mobile `.pick__*` right gutter clearance, hover-only `.tilt-glare` & spotlight pseudo-elements, `.img-placeholder`, smooth hero poster dissolve |
| Stage 3 & 4 WebGL + Perf | [site/js/3d/orbit-scene.js](../../site/js/3d/orbit-scene.js), [site/js/lib/price.js](../../site/js/lib/price.js), [site/js/ui/tilt-spotlight.js](../../site/js/ui/tilt-spotlight.js), [site/js/lib/track.js](../../site/js/lib/track.js) | Front-first priority WebGL texture queue, adaptive `'medium'` mobile Verlet cloth cadence (2× stride), cached `IDR_FORMAT`, lazy GPU `data-tilting="1"` promotion only during active hover, PII-free `detail_open`/`scene_fallback`/`page_view` schema |
| Stage 3 QA & CI Tooling | [site/tools/screenshots.mjs](../../site/tools/screenshots.mjs), [site/tests/e2e.mjs](../../site/tests/e2e.mjs), [site/tests/v5_3d_ui.test.js](../../site/tests/v5_3d_ui.test.js), [site/tools/lighthouse-audit.mjs](../../site/tools/lighthouse-audit.mjs), [site/package.json](../../site/package.json), [.github/workflows/ci.yml](../../.github/workflows/ci.yml), [.gitignore](../../.gitignore) | Real per-image lazy-load & decode verification (`waitImage` + `8000ms` timeout), CTA-overlap check, Playwright 12-scenario E2E + Axe WCAG 2.2 AA runner, repeatable Lighthouse script, GitHub Actions CI workflow |
| Documentation Sync | [PRD.md](../../PRD.md), [DESIGN.md](../../DESIGN.md), [SRS.md](../../SRS.md), [site/README.md](../../site/README.md), [docs/upgrade-v5/USABILITY_AND_MEASUREMENT.md](../upgrade-v5/USABILITY_AND_MEASUREMENT.md) | Synchronized specs, heuristic walkthrough + field test script, privacy-safe analytics plan |

---

## 4. Technical Decisions

- **Retained Vanilla Static Architecture (`HTML + CSS + ES Modules`):** Preserves `site/build.mjs` zero-runtime-dependency output (`site/dist/` = `1,513,582 B` total including all images/JS; `index.html` = `91,322 B` with `30,924 B` CSS inlined; devDeps `playwright`, `axe-core`, `lighthouse` never enter `dist/`).
- **Avoided `content-visibility: auto` on Catalog Grids:** Tested during Lighthouse diagnosis and removed after proving mismatched `contain-intrinsic-size` caused headless Chromium touch-target rect overlap between `#area-cowok` and `#info-belanja` plus a 3.7s layout stall.
- **Lazy Hydration Splitting:** Delayed non-critical `stage.js` initialization (`50ms`), deferred `tilt-spotlight.js` (`requestIdleCallback`), deferred `initSlidingChips` until filter interaction, skipped `render.js` evaluation on `data-prerendered` HTML, and dynamically imported `product-modal.js` on click.

---

## 5. UX Improvements (Stage 2)

- **Floating WhatsApp Mobile Clearance:** Guaranteed zero overlap with primary/secondary CTAs on `360×800`, `390×844`, and `430×932` initial viewports via safe panel gutter (`padding-right: 60px`), collision detection on scroll, `.wa-fab--away` slide-out, and `:focus-visible` recovery.
- **Mobile Editorial Compactness:** `amb-grid` switched to 2 columns on `< 640px`, cutting vertical scrolling sharply while keeping 4 portraits, `01`–`04` numerals, and `>= 44×44px` collection links legible.
- **Extensible Product Detail Modal & Discovery Sync:** Consistent updates across Hero 3D rack, panel details, `<dialog>`, active grid highlight (`.card--active`), and `Info Belanja` Shop link without inventing missing catalog metadata.

---

## 6. 3D Refinements (Stage 4)

- **Unified Single WebGL1 Context:** 4-pass renderer (`backdrop-shader.js`, orbital pedestal rings, continuous-line `b-shirt` brushed sculpture + live Verlet cloth `cloth.js`, convex curved cards `geometry.js` with linen backs & liquid-metal rim).
- **Texture Priority & Mobile Adaptive Quality:** Front/neighbor card textures load first; phones and `<= 4`-core CPUs run Verlet updates at half cadence (`quality: 'medium'`), DPR capped (`1.5` phones / `1.75` desktop).
- **Smooth Fallbacks:** Non-blocking poster spread dissolves smoothly when live; `?scene=off`, `--disable-webgl`, and `prefers-reduced-motion: reduce` preserve 100% shoppable 2D parity.

---

## 7. Testing Evidence (After Final Edit)

- **Unit & Integration (`cd site; npm test`):** **57 / 57 passing** (`0 fail`, `548.61 ms`), asserting Stage 1 business invariants, pricing, URLs, WebP files, geometry/matrices, Verlet cloth stability, GLSL ES 1.00 rules, extensible modal specs, tracking events, and CSS zero-raw-color token purity.
- **Production Build (`npm run build`):** Succeeded (`css 30924 B inlined`, `catalog v=5245f60980`, `LCP preload: cw-01`, all assets validated).
- **Playwright E2E (`npm run test:e2e`, Chromium desktop/mobile emulation):** **12 / 12 scenarios passing** (`docs/reports/e2e-report.json`): catalog integrity, scroll-engaged WebGL, collection filter + count sync, next/prev/keyboard navigation, detail modal + focus restore, tracking events, mobile `360/390/430` zero overflow / zero FAB overlap / 2×2 editorial grid, reduced-motion still frame, `?scene=off` poster fallback.
- **Cross-Viewport Lazy-Image & Layout Matrix (`tools/screenshots.mjs` across 10 viewports × 3 modes = 30 runs):**
  - `overflow=false`, `dead=0`, **`imgs=29` & `failedImg=0`**, `small=0`, `overlap=0`, `errors=0` across **30 / 30** runs (`normal --full`, `reduced-motion`, `CHROME_FLAGS="--disable-webgl"`).

---

## 8. Performance Measurements (Lighthouse — Simulated Throttling, Uncompressed Local Python Server)

Measured via `node tools/lighthouse-audit.mjs` on `site/dist/` (`HeadlessChrome/158.0.0.0`, Windows `benchmarkIndex 1199–1225`, raw uncompressed `node:http`):

| Profile | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | Report |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Mobile | **63** | **100** | **100** | **100** | `1.2 s` | `3.2 s` | `2,620 ms` | `0` | [lighthouse-mobile.json](./lighthouse-mobile.json) |
| Desktop | **65** | **100** | **100** | **100** | `1.5 s` | `3.5 s` | `250 ms` | `0` | [lighthouse-desktop.json](./lighthouse-desktop.json) |

**Root-cause diagnosis of Performance < 90:** Mobile FCP (`1.2s`), Desktop TBT (`250ms`), and CLS (`0`) meet healthy bounds, but Lighthouse simulated throttling records a `~2.9s` cold main-thread `Unattributable` / `Other` renderer stall and `1.66s` LCP `elementRenderDelay` on this local Windows laptop host (`benchmarkIndex ~1200`), alongside missing HTTP gzip/brotli compression on local `http.createServer`. Previously executed optimization eliminated forced reflows, skipped production `render.js` parsing, cached `IDR_FORMAT`, and removed 41 idle gradient/blend layers (`desktop TBT` dropped from `2,140 ms` → `250 ms`). Staging CDN verification with gzip/brotli compression and multi-run median benchmarking on Linux CI is needed to establish real host Performance.

---

## 9. Accessibility Findings (WCAG 2.2 AA)

- **Axe-core Scan (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`):** Caught 1 `serious` contrast issue (`3.92:1` on `.pmodal__cat` with `--color-accent: #b8664e`), fixed by darkening `--color-accent: #954530`. Final scan ([a11y-report.json](./a11y-report.json)): **0 page violations, 0 modal violations (`29` passing rule groups)**.
- **Lighthouse Accessibility:** **100 / 100** (Mobile & Desktop, including `target-size` passing after `content-visibility` removal).
- **Manual / Simulated Keyboard & Focus Checks:**Verified skip-link visibility rule, ArrowLeft/ArrowRight rack navigation, `Escape` dialog closing + trigger focus restoration, and keyboard `:focus-visible` reveal of `.wa-fab`.

---

## 10. Known Limitations

1. **Physical Devices & TikTok In-App WebView:** Verified only under Windows desktop Chromium / Chrome DevTools device emulation; physical Android Chrome, iOS Safari, and TikTok WebView have **not** been tested.
2. **Stage 1 Owner-Accepted Legal/Content Risks:** `cw-03` (Polo Ralph Lauren logo), `ce-06` (Sanrio character), and ambassador media usage rights remain tracked per `PRD.md` Addendum for owner confirmation/toggle (`"published": false`).
3. **Optional Detail Fields:** The new modal's extended attributes (`description`, `color`, `size`, `material`, `fit`, `care`, `variants`) currently render hidden because canonical `catalog.json` omits those fields; layout is tested via unit tests on fixture data.
4. **Text Scaling / Browser Zoom:** Not tested automatically across 200% font-only zoom edge cases.

---

## 11. Remaining Manual Verification

1. Deploy `site/dist/` to a **staging static host with gzip/brotli enabled** and run multi-run Mobile Lighthouse against HTTPS staging URL.
2. Execute physical device checklist on **Android Chrome**, **iOS Safari**, and **TikTok Bio In-App Browser** (`360px`–`430px`).
3. Set `site_config.site_url` to final domain so `og:image` resolves as an absolute URL, then rebuild.
4. Execute the 10-minute customer usability walkthrough in [USABILITY_AND_MEASUREMENT.md](../upgrade-v5/USABILITY_AND_MEASUREMENT.md).

---

## 12. Production Readiness Assessment

**Verdict:** **READY FOR STAGING / PHYSICAL DEVICE QA**  
All functional, regression (`57/57`), Playwright E2E (`12/12`), WCAG 2.2 AA (`0` Axe violations, `100` Lighthouse A11y), CTA non-overlap, and lazy-loaded image checks (`30/30` runs) pass cleanly on `site/dist/`. **Do not declare full public production sign-off** until staging CDN compression + mobile Lighthouse `Performance >= 90` and real Android/iOS/TikTok in-app browser checks are completed.
