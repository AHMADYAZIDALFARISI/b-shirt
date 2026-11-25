# SRS — b-shirt Immersive Hybrid Fashion Experience

**Versi:** 4.0 · **Tanggal:** 25 November 2026  
**System:** Static website + optional progressive 3D module

## 1. Purpose & Scope

Dokumen ini mendefinisikan kebutuhan sistem untuk mengembangkan website b-shirt menjadi fashion retail experience dengan immersive brand layer. Sistem tetap katalog online dan external purchase bridge, bukan full e-commerce checkout. Tidak ada founder profile atau identitas pribadi.

## 2. Existing Architecture & Constraints

- Static HTML, CSS, JavaScript ES modules.
- `site/catalog.json` adalah source of truth untuk site config dan produk.
- `site/build.mjs` membangun output `site/dist/`.
- Node built-in tests di `site/tests/`.
- Existing modules: catalog, price, links, status, render, tracking, app.
- `dist/` adalah generated output; jangan hand-edit.
- Pertahankan arsitektur kecuali audit membuktikan migrasi benar-benar perlu.
- Tidak menambah backend, database, framework, analytics vendor, atau dependency runtime tanpa justifikasi dan approval.

## 3. Immutable Business/Data Constraints

1. Brand b-shirt, online-only.
2. TikTok URL tetap `https://www.tiktok.com/@b_shirt_co`.
3. WhatsApp display `082230089520`, number `6282230089520`, default message dipertahankan dari config.
4. Admin Mon–Sat 08:00 inclusive sampai 17:00 exclusive, timezone `Asia/Jakarta`.
5. Global Tokopedia URL harus dipertahankan byte-for-byte dari `catalog.json`; jangan decode/rebuild/normalize.
6. Per-product `product_url` override mengalahkan global URL bila valid.
7. Product IDs, names, gender, prices, flags, image mapping, image positions, and order remain unchanged.
8. Canonical gender values `cowok` dan `cewek`; labels UI mengikuti existing configuration (Pria/Wanita).
9. No internal cart, checkout, payment, login, order management, stock, review, rating, or unsupported claims.
10. No founder profile, founder identity, personal biography, or personal links.

## 4. Functional Requirements

### FR-001 Announcement
- Render only when `site_config.promo_banner.active === true`.
- Display configured `event_label` and `text` exactly as configured.
- Do not invent countdown or urgency.
- If inactive/invalid, omit cleanly.

### FR-002 Operating Status
- Calculate using configured days/hours and `Asia/Jakarta`, independent of device timezone.
- Monday–Saturday 08:00 inclusive through 16:59:59: online.
- At 17:00 or later, before 08:00, and Sunday: offline.
- Calculation failure must return neutral safe state, never falsely claim online.
- Preserve existing next-open label behavior if present and tested.

### FR-003 Header & Navigation
- Use official logo/wordmark assets if configured/available.
- Links: Wanita, Pria, New Arrivals, Bantuan.
- Preserve existing anchors; sticky header must not obscure targets.
- Standard DOM navigation works independently of 3D.
- Mobile nav supports keyboard and touch.

### FR-004 Campaign Hero
- Read campaign fields from `site_config.campaign`.
- Resolve campaign product images from actual catalog IDs/local assets.
- Compute `{max_new_discount}` from catalog data; do not hardcode.
- CTA target must resolve to an existing anchor or valid external URL.
- Headline, promo and CTA remain semantic DOM content, never canvas-only.
- 3D must not cover text or block CTA.

### FR-005 Category Tiles
- Render from `site_config.category_tiles`.
- Preserve canonical values and target anchors.
- Image comes from configured product ID.
- Provide accessible label and visible focus state.

### FR-006 New Arrivals
- Derive from `products[].is_new === true`; no hardcoded count.
- Preserve canonical order unless explicit config says otherwise.
- Label is data-driven.

### FR-007 Wanita Collection
- Filter by `gender === "cewek"`.
- Preserve current section ID and anchor.

### FR-008 Pria Collection
- Filter by `gender === "cowok"`.
- Preserve current section ID and anchor.

### FR-009 Product Card
- Display local authentic product image, alt text, product name, original price, promo price, computed discount, and purchase CTA when valid URL exists.
- Preserve 3:4 ratio and `image_position`.
- Never substitute 3D render or AI-generated fashion image.
- Never invent rating, stock, reviews, size, material, or best-seller claims.
- Invalid/missing purchase URL disables or omits CTA safely.
- External target blank must use `rel="noopener noreferrer"`.

### FR-010 Price
- Source prices remain integer numeric values.
- Format as Indonesian Rupiah.
- Discount calculation deterministic and tested.
- If promo is invalid or not below original, do not show misleading discount.

### FR-011 Tokopedia Redirect
- Resolve `product.product_url ?? site_config.global_shop_url` after validation.
- Preserve exact configured URL string; do not decode, shorten, reconstruct, or normalize.
- Follow existing allowed-host/protocol validation.
- Keep existing `shop_click` tracking behavior.
- Communicate external destination clearly.

### FR-012 WhatsApp
- Use configured number and default message.
- Encode message safely; preserve correct `wa.me` destination.
- Floating action cannot obscure key content or CTA.
- Accessible name identifies WhatsApp Admin.
- Keep `whatsapp_click` event behavior.

### FR-013 TikTok
- Use configured TikTok URL.
- Keep safe external link attributes and `tiktok_click` event.

### FR-014 Service/Footer
- Display online-only service truthfully, admin hours/status, configured Shop, WhatsApp, TikTok.
- Do not invent address, map, offline store, delivery promise, or guarantee.

### FR-015 Immersive 3D Scene
- Isolated module (e.g. `site/js/3d/scene.js`).
- One canvas/renderer maximum.
- Scene is abstract brand storytelling, not a purchasable product representation.
- Lazy-load after critical content ready or near viewport.
- Never block catalog rendering, navigation, or purchase actions.
- Provide same-footprint poster/CSS fallback.
- Handle WebGL unavailable, context creation failure/loss, dynamic import failure, runtime exception.
- Pause when offscreen or document hidden; resume appropriately.
- Dispose geometry, materials, textures, renderer, observers, listeners, animation loops.
- Cap DPR and reduce scene complexity on low-power/mobile devices.
- Support `prefers-reduced-motion` by disabling continuous movement/parallax.
- Document external asset license, texture dimensions, triangle count, and scene bundle size.

### FR-016 3D Interaction
- Desktop pointer response is subtle and bounded.
- Touch interaction must not hijack vertical scrolling.
- Any scene action has equivalent semantic DOM control and keyboard support.
- No essential navigation/product information exists only inside canvas.
- Spatial/orbit selector is optional; if present, nodes map to actual DOM anchors and conventional navigation remains visible.

### FR-017 Gradient/Effects
- Prefer CSS/SVG gradient over shader when visually sufficient.
- Shader requires measurable visual justification and profiling.
- Respect reduced motion; no flashing/high-frequency noise/heavy bloom by default.
- Preserve text contrast.
- No unlicensed copied presets/assets/code.

### FR-018 Motion
- Buttons have hover/focus/pressed states.
- Hover-only behavior only on hover-capable devices.
- Section reveal cannot hide content before JS.
- No scroll hijacking, forced intro, autoplay audio.
- Microinteraction duration generally 120–220ms.

### FR-019 Analytics Compatibility
- Preserve `window.dataLayer` and `bshirt:track` event behavior.
- Existing events: `shop_click`, `whatsapp_click`, `tiktok_click`.
- Optional new events: `collection_navigation`, `scene_interaction`.
- No analytics provider by default; no-op/custom event if not configured.
- No fingerprinting or sensitive personal data.

## 5. Data Integrity & Validation

- Parse `catalog.json` as canonical source.
- Assert 7 product IDs unique; baseline count 7, new 4, cowok 2, cewek 5, featured exactly `ce-01`.
- Preserve exact product fields and asset paths.
- Validate campaign product IDs and category tile product IDs/targets.
- Validate numeric prices and product/global URL rules.
- Build must fail with actionable error for invalid critical config; optional visual config may fallback safely.

## 6. Non-Functional Requirements

### NFR-001 Performance
- Core content first; 3D lazy-load.
- Target LCP <=2.5s under documented mobile test conditions.
- Lighthouse mobile Performance >=90 target; report actual measured values.
- Optimize textures, DPR, model complexity, JS chunks, image loading.

### NFR-002 Compatibility
- Responsive 360px through wide desktop.
- Verify current Chromium desktop, Safari/iOS where available, Android Chrome, and TikTok in-app browser on real devices when possible.
- Do not claim physical device testing unless actually performed.

### NFR-003 Accessibility
- WCAG AA contrast target.
- Semantic HTML, keyboard navigation, focus visibility, meaningful alt, reduced motion.
- Canvas is supplementary only.

### NFR-004 Reliability
- 3D errors must not break catalog or navigation.
- Fallback must render deterministically.
- Avoid uncaught exceptions and console errors.

### NFR-005 Security/Privacy
- No secrets in frontend.
- External links use safe rel attributes.
- No new tracking provider without approval.
- Do not collect sensitive personal data.

### NFR-006 Maintainability
- Keep concerns modular.
- Add tests for new behavior.
- Document setup, build, test, deployment, 3D asset provenance and fallback behavior.

## 7. Build, Test & Delivery

- Run existing Node built-in test suite before and after changes.
- Run `npm` scripts only as defined by existing package; inspect package before execution.
- Run production build and validate `dist/` output.
- Add tests for WebGL fallback, lifecycle cleanup where feasible, reduced motion, and data integrity.
- Check all local assets and links.
- Run responsive visual QA at 360, 390, 768, 1024, 1440 widths.
- Check browser console, horizontal overflow, layout shift, CTA visibility.
- Report exact commands, pass/fail, limitations, measured performance, and what was not tested.

## 8. Definition of Done

- All immutable facts/data preserved.
- All existing features work.
- All baseline counts and data assertions pass.
- 3D is progressive, lazy, bounded, and has a graceful fallback.
- Reduced motion, keyboard, and mobile interaction verified.
- No founder identity or portfolio sections.
- Build/tests pass; no broken anchors/assets or uncaught console errors.
- `dist/` generated by build, not manually edited.
- Delivery report includes changed files, architecture decisions, tests, screenshots/viewport notes, performance evidence, and remaining risks.

---

## Addendum — Owner revision, 25 November 2026 (after v4.0 approval)

The owner instructed in chat, after providing this v4.0 document: *"tampilkan juga semua foto baru nya (dari folder Baju/Model Cowok/Cewek); untuk baju atur aja harga nya dan untuk model cowok/cewek gunakan sebagai brand ambassador di web itu."*

This **supersedes** the v4.0 statements that the 12 intake images must stay unpublished and that the catalog stays at 7 products:
1. **8 garment photos are added as products** `cw-03`…`cw-08` and `ce-06`…`ce-07`. Names describe only what is visible (no material, size, stock or origin claims). **Prices are proposals set by the implementer at the owner's request** (25–28% promo, so "Diskon hingga 30%" stays true) and must be confirmed against the Tokopedia listing. All products use the global Shop URL (`product_url: null`).
2. The original 7 products are **unchanged** (IDs, names, prices, flags, images, order). New counts: **15 total · New Arrivals 4 · Cowok 8 · Cewek 7 · featured ce-01**.
3. **4 model photos are shown as "Brand Ambassador" imagery**, without invented names, quotes, testimonials or claims about which product they wear.
4. **Known risks, flagged to the owner:** `cw-03` shows a Polo Ralph Lauren logo; `ce-06` shows the Sanrio *My Melody* character; `cw-04` came from a screenshot with a "1/3" overlay; some model images may be stock or generated and their usage rights are unverified. Each product and ambassador entry can be hidden with `"published": false` in `catalog.json`.

---

## Addendum v5 — System Architecture, QA Gates & Requirements Sync (25 November 2026)

1. **Arsitektur Frontend & Modul Teraktual (`site/`):**
   - **Dependencies Policy:** `package.json` tetap memiliki **0 runtime dependencies**. Playwright, Axe-core, dan Lighthouse dipasang hanya di `devDependencies` untuk pengujian dan tidak ikut dibundel ke `site/dist/`.
   - **Modul Tambahan v5:** `site/js/3d/orbit-scene.js` (4-pass WebGL1), `site/js/3d/cloth.js`, `site/js/3d/backdrop-shader.js`, `site/js/3d/geometry.js` (kurva kartu & cincin lantai), `site/js/ui/tilt-spotlight.js`, dan `site/js/ui/product-modal.js` (diimpor secara *lazy* saat interaksi pengguna pertama).
2. **Sinkronisasi Kebutuhan Fungsional (FR Sync):**
   - **FR-009 Extension (`productDetailSpecs`):** Kartu produk dan modal detail (`<dialog id="product-modal">`) mendukung rendering bidang opsional (`description`, `color`, `size`, `material`, `fit`, `care`, `variants`) **hanya bila terisi valid di `catalog.json`**; bidang kosong selalu disembunyikan.
   - **FR-012 Extension (`setupFab`):** `.wa-fab` menggunakan CSS safe-area insets dan deteksi tumbukan bounding-box agar tidak menimpa tombol CTA, sambil tetap terbuka saat menerima fokus keyboard (`:focus-visible`).
   - **FR-015 Extension (Adaptive 3D):** `stage.js` memilih kualitas `'medium'` pada layar `< 640px` atau CPU `<= 4` core (stride simulasi kain 2×), mengurutkan pemuatan tekstur dari kartu fokus ke kartu terdekat, memantau `webglcontextlost`, dan membersihkan buffer/tekstur/program GPU lewat `destroy()`.
   - **FR-019 Extension (`track.js`):** Event `page_view`, `detail_open`, `scene_fallback`, `shop_click`, `whatsapp_click`, `tiktok_click`, `collection_navigation`, dan `scene_interaction` (tanpa PII, no-op aman tanpa vendor eksternal).
3. **Automated QA & CI Gates (Section 7 Sync):**
   - Unit/Integration suite: `npm test` (`site/tests/*.test.js`).
   - Browser E2E & WCAG 2.2 AA scan: `npm run test:e2e` (`site/tests/e2e.mjs`).
   - Lazy-loading screenshot & overlap verifier: `node tools/screenshots.mjs`.
   - Lighthouse audit: `npm run audit:lighthouse` (`site/tools/lighthouse-audit.mjs`).
   - GitHub Actions quality gate: `.github/workflows/ci.yml`.
