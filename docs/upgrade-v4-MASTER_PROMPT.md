# MASTER EXECUTION PROMPT — GEMBUL v4.0
## Claude Code Opus · Principal Product, Creative Development, Frontend & QA Team

**Mission:** Upgrade the existing Gembul/b-shirt website into an immersive hybrid fashion retail + brand experience. This is NOT a founder portfolio and must NOT display founder identity. Preserve every existing business fact, product record, link, behavior, and purchase path.

**Operating mode:** inspect → baseline tests → audit → experience architecture → visual prototype → implement → test → build → visual QA → report. Do not stop at recommendations. Work in the supplied repository and preserve its architecture unless evidence justifies a change.

---

# 0. NON-NEGOTIABLE PRODUCT DECISION

The user selected:
- Product direction: **HYBRID**
- Visual style: **IMMERSIVE**

Interpretation:
- Keep b-shirt as the fashion brand and online catalog.
- Add an immersive, distinctive brand experience using deliberate 3D/WebGL, art direction, gradients, depth, transitions, and micro-interactions.
- The “personal branding” quality means a professional, memorable brand presentation—not a founder profile.
- **DO NOT add founder name, portrait, biography, personal links, CV, social accounts, or personal portfolio.**
- Commerce remains the primary functional purpose. Immersion must improve brand perception and exploration, never obstruct shopping.

# 1. TEAM ROLES

Operate as one senior multidisciplinary team:
1. Principal Product Manager / Business Analyst — protect business facts, user journeys, acceptance criteria.
2. Creative Director / Art Director — define a distinctive immersive visual language, avoid generic AI-slop aesthetics.
3. Principal UI/UX Designer — information architecture, hierarchy, responsive interaction, accessibility.
4. Senior Frontend Engineer — semantic HTML, CSS, ES modules, state, performance, browser behavior.
5. Creative Developer / WebGL Engineer — Three.js/WebGL only when justified, shader/material/lighting, lifecycle, fallback.
6. QA / Performance Engineer — tests, regression, visual QA, Lighthouse, device/browser evidence.
7. Technical Writer — update PRD, DESIGN.md, SRS, decisions, and implementation report.

# 2. SOURCE OF TRUTH & REPOSITORY RULES

1. Inspect the complete repository before changing code.
2. Read root `PRD.md`, `DESIGN.md`, `SRS.md`, `TECHNICAL_AUDIT.md`, `DESIGN_DIRECTION.md`, `IMPROVEMENT_ROADMAP.md`, `site/README.md`, `site/package.json`, `site/catalog.json`, source modules, tests, and `product-intake/INTAKE.md` if present.
3. `site/catalog.json` is canonical for product and site configuration.
4. Static HTML/CSS/ES modules and `site/build.mjs` are the baseline architecture. Do not migrate framework or introduce a backend/CMS/database without a documented, compelling requirement and owner approval.
5. Never hand-edit generated `site/dist/`; change source and run build.
6. Preserve existing tests and add regression coverage.
7. Do not overwrite/lose uncommitted user work. Inspect git status and diff before changes. Work safely around existing changes.

# 3. IMMUTABLE BUSINESS FACTS — DO NOT ALTER

- Brand: b-shirt.
- Business: online-only fashion store; no physical store/address to show.
- Main traffic source: https://www.tiktok.com/@b_shirt_co
- Purchase destination: Shop | Tokopedia via external redirect.
- WhatsApp display number: 082230089520.
- WhatsApp configured international number: 6282230089520.
- Default WhatsApp message: “Halo Admin b-shirt, saya ingin bertanya mengenai produk di katalog web.”
- Admin hours: Monday–Saturday, 08:00 inclusive to 17:00 exclusive.
- Timezone: Asia/Jakarta.
- Architecture: static HTML/CSS/ES modules; `catalog.json` source; `build.mjs` creates `dist/`; Node built-in tests.
- Baseline catalog: 7 products; 4 New Arrivals; 2 Cowok; 5 Cewek; featured `ce-01`.
- Existing announcement/campaign/category tile settings must remain data-driven.

**Critical URL rule:** Preserve the exact `global_shop_url` string from `site/catalog.json`, including its encoded query string. Do not decode, shorten, rebuild, normalize, replace, or manually retype it. A valid per-product `product_url` overrides global URL exactly as existing behavior specifies.

**Operating status rule:** Asia/Jakarta, Monday–Saturday 08:00 inclusive through 16:59:59 online; from 17:00 offline; Sunday offline. Device timezone must not affect result.

# 4. CATALOG INTEGRITY — EXACT BASELINE

Do not modify IDs, names, gender, prices, new/featured flags, image mapping, image position, product order, or product URLs without explicit approval.

| ID | Gender | Name | New | Featured | Original | Promo |
|---|---|---|---|---|---:|---:|
| cw-01 | cowok | Korean Camel Oversized Coat & Turtleneck Look | true | false | 349000 | 249000 |
| cw-02 | cowok | Basic White Tee & Light-Wash Baggy Jeans | true | false | 229000 | 169000 |
| ce-01 | cewek | Earth-Tone Knit Vest & Pleated Culotte Set | true | true | 269000 | 189000 |
| ce-02 | cewek | Sky Blue Lace-Trim Wide Leg Trousers | true | false | 179000 | 129000 |
| ce-03 | cewek | Ivory High-Waist Corduroy Wide Pants | false | false | 189000 | 139000 |
| ce-04 | cewek | Black Midi Dress & Cream Cropped Cardigan Set | false | false | 249000 | 179000 |
| ce-05 | cewek | Blush Floral Ruffle Dress & Crochet Bolero Set | false | false | 259000 | 185000 |

Expected assertions: total 7, new 4, cowok 2, cewek 5, featured exactly ce-01. Internal gender values stay `cowok` and `cewek`; display labels remain configured (Pria/Wanita).

# 5. EXPERIENCE VISION — IMMERSIVE HYBRID

Create a **digital fashion world**: editorial, tactile, spatial, atmospheric, premium, and memorable. Avoid generic template aesthetics.

Two layers:
- Commerce layer: header/navigation, campaign, product images, product names/prices, categories, purchase CTA, WhatsApp, TikTok, service status.
- Immersive layer: one art-directed 3D signature scene, depth, carefully restrained mesh gradients, lighting/material, spatial transitions, and meaningful micro-interactions.

The commerce layer always wins if there is a conflict. No key information or action may exist only inside WebGL.

## Visual direction

Explore a custom signature scene such as abstract folded textile/fabric sculpture, floating editorial frames, tactile matte/satin forms, or layered spatial installation. Choose one concept after inspecting logo, real product photos, existing colors, and page structure. The scene must feel native to b-shirt—not a random 3D object.

References are principle-only:
- https://catalyst-society.vercel.app/ — immersive storytelling and spatial rhythm.
- https://feralui.dev/gradients — mesh-gradient craft and atmosphere.
- https://mesh3d.gallery/ — WebGL quality, lighting, materials, shaders.
Do not clone layouts, code, models, shaders, presets, or assets.

## Anti-slop art direction

- Avoid default neon gradients, generic floating blobs, excessive glass cards, random particles, overused glow, heavy bloom, gratuitous chromatic aberration, and every-section animation.
- Do not make everything rounded or everything a pill.
- Use intentional typography, grid, whitespace, asymmetry, contrast, and focal hierarchy.
- One memorable signature visual is better than many unrelated effects.
- Each motion must serve orientation, feedback, reveal, or brand storytelling.
- Keep product photos authentic and primary on product cards.
- Do not use AI-generated imagery to replace real product photography.

# 6. PAGE ARCHITECTURE

Preserve existing anchors and functional behavior. Recommended order:
1. Announcement strip only if active.
2. Sticky header: logo, Wanita, Pria, New Arrivals, Bantuan.
3. Editorial hero with immersive scene, clear campaign headline and CTA.
4. Category discovery tiles.
5. New Arrivals.
6. Wanita collection.
7. Pria collection.
8. Shopping information, admin hours/status.
9. Footer with configured Shop, TikTok, WhatsApp links and online-only info.
10. Floating WhatsApp.

Do not push products far below fold. On mobile, CTA and category discovery must be reached quickly.

# 7. FUNCTIONAL PARITY — REGRESSION IS BLOCKING

Preserve and verify:
- Announcement banner active/config behavior.
- Operating status and next-open logic if present.
- Sticky header and all existing anchors.
- Campaign content from config; dynamic `{max_new_discount}` calculation.
- Category tiles from config.
- New Arrivals derived from `is_new`.
- Wanita (`gender === cewek`) and Pria (`gender === cowok`) collections.
- Product images, image position, responsive variants, name, original price, promo price, computed discount.
- Tokopedia global URL and product override priority.
- WhatsApp number/default message and encoded URL.
- TikTok configured URL.
- Footer/service information.
- Existing `window.dataLayer` and `bshirt:track` hooks/events: `shop_click`, `whatsapp_click`, `tiktok_click`.
- Existing tests and build pipeline.

No fake cart, checkout, stock, ratings, reviews, testimonials, sizes, material, shipping promises, guarantees, offline address, or founder section.

# 8. 3D / WEBGL ENGINEERING RULES

1. One canvas/renderer maximum.
2. Isolate scene in a module, e.g. `site/js/3d/scene.js`.
3. Do not migrate the entire app to a framework solely for one scene.
4. Decide Three.js vs CSS 3D/SVG/static composition based on measured quality, bundle size, and runtime cost.
5. Lazy-load after core content is ready or when scene approaches viewport.
6. The page and catalog must render before scene initialization.
7. Provide a same-footprint fallback poster/CSS scene; no layout shift.
8. Handle WebGL unsupported, context creation failure, context loss, dynamic import failure, runtime errors.
9. Pause when offscreen or document hidden; resume safely.
10. Dispose geometry, material, texture, renderer, event listeners, observers, RAF loops.
11. Cap DPR; adapt quality for mobile/low-power.
12. Respect `prefers-reduced-motion`; disable continuous motion/parallax as needed.
13. Touch interaction must not interfere with vertical scrolling.
14. No audio, no forced intro, no loading gate, no scroll hijacking.
15. Record scene bundle size, textures, triangle count, DPR policy, and asset licenses.
16. All navigation, product facts, and CTA remain semantic DOM elements.
17. If the scene does not justify its cost, ship CSS/SVG/static fallback rather than force WebGL.

# 9. ACCESSIBILITY & RESPONSIVE QUALITY

- Semantic landmarks and heading hierarchy.
- Meaningful product alt text.
- Visible focus states and full keyboard support.
- WCAG AA contrast target.
- Touch targets around 44×44 CSS px minimum where practical.
- Reduced motion support.
- No flashing or high-frequency visual noise.
- No horizontal overflow.
- Test widths 360, 390, 768, 1024, 1440px.
- Verify desktop Chromium and, when available, iOS Safari, Android Chrome, and TikTok in-app browser. Be honest about what is physically tested.

# 10. PERFORMANCE & QUALITY GATES

Targets (measure actual results; never claim success without evidence):
- LCP <=2.5s under documented mobile test conditions.
- Lighthouse mobile Performance >=90, Accessibility >=95, Best Practices >=95, SEO >=95.
- Core content never waits for 3D.
- Lazy-load below-fold images and 3D assets.
- Avoid oversized textures and blocking fonts.
- No uncaught console errors, broken images, broken anchors, or CTA occlusion.

# 11. REQUIRED WORKFLOW

## Phase A — Reconnaissance
- Inspect git status/diff; do not overwrite user changes.
- Inspect all docs, package scripts, source, assets, tests, catalog, build pipeline.
- Run baseline tests/build before edits; record exact output.
- Inspect current page at desktop and mobile viewports if browser tooling exists.
- Inventory real brand assets and product photos. Do not infer product facts from unapproved images.

## Phase B — Product/design plan
- Write a concise implementation plan with component map, scene concept, responsive behavior, dependencies, performance risks, and fallback.
- Update PRD.md, DESIGN.md, SRS.md to v4.0 and align them with this prompt.
- Add/update decision log. Clearly label assumptions; do not invent company history or brand values.
- Do not add founder profile.

## Phase C — Prototype the visual system
- Establish typography, color tokens, grid, spacing, hero composition, CTA hierarchy, product-card language.
- Build a quick hero prototype and inspect it at mobile and desktop before expanding.
- Refine until it feels intentionally art-directed, not generic.

## Phase D — Implement
- Keep source modular and preserve existing architecture.
- Implement responsive UI and immersive scene progressively.
- Maintain catalog as single source of truth.
- Ensure no 3D dependency for essential functions.
- Update tests for data integrity, fallback, reduced motion, and interactions.

## Phase E — Verify
- Run all tests and production build.
- Verify 7/4/2/5/featured counts and exact product data.
- Verify URL handling without altering configured URL.
- Verify admin status at boundary times using deterministic tests.
- Verify all CTA destinations and tracking hooks.
- Verify WebGL fallback, context error handling, cleanup, offscreen pause, reduced motion.
- Inspect mobile/desktop screenshots, horizontal overflow, console, focus, contrast, image loading, and CTA placement.
- Run Lighthouse if available and include actual report/score.

## Phase F — Delivery report
Provide:
1. Executive summary of delivered experience.
2. Changed files and why.
3. Architecture and 3D concept decisions.
4. Functional parity checklist.
5. Commands executed and exact test/build outcomes.
6. Lighthouse/performance metrics and test environment.
7. Responsive/browser/device verification, clearly separating simulated from physical device tests.
8. Screenshots or visual evidence if tooling supports it.
9. Remaining issues/risks and owner decisions needed.
10. Deployment instructions and exact build output path.

# 12. STOP CONDITIONS / DO NOT FAKE

- If a business fact conflicts with docs and catalog, preserve the live `catalog.json` values and report conflict; do not silently reconcile.
- If product metadata or rights are unclear, do not publish the asset.
- If browser/device access is unavailable, state that visual/device verification was not performed.
- If performance target is not met, report the result and optimize or document trade-offs.
- Do not invent successful tests, Lighthouse scores, screenshots, deployment, or live URLs.
- Do not claim backend functionality that does not exist.
- Do not add founder identity or personal portfolio content.

**Final quality bar:** b-shirt must feel like a distinctive immersive fashion brand experience while remaining a fast, truthful, usable catalog that preserves every existing business behavior.
