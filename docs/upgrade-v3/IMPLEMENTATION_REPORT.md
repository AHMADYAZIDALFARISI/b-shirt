# IMPLEMENTATION REPORT — upgrade v3: interactive 3D web

## 1. What changed and why
- **Base:** the project was reset to `Downloads/Gembul.zip`, as the owner asked (SHA-256 verified). The prior working copy is backed up at `Downloads/Gembul-backup-v3-20261125-1031/`.
- **Interactive 3D product orbit** ("Jelajahi koleksi 3D"):
  - the brand's one-line hanger in WebGL with draped, folded fabric
  - the 7 real product photos on a rotating ring: drag/swipe with inertia and snap, tap to select
  - filters, prev/next and arrow keys
  - an HTML panel with exact prices and **"Beli di Tokopedia"**

  It meets the owner's request for an interactive 3D website without fabricating garments.
- **All products → the new Tokopedia URL** (exact, 511 characters).
- Retail UX:
  - active-section underline in the header
  - 44px targets everywhere (header and footer "Pria" fixed)
  - pressed states
  - mesh-gradient and grain atmosphere tokens
- Performance: engagement-gated 3D, deferred non-blocking font, and a cheap static grain. All three were measured, as recorded in QA_REPORT §3.

## 2. Architecture & dependencies
- Static HTML, CSS and ES modules plus `build.mjs`, as before. **Dependencies added: none.** No Three.js; raw WebGL1 in 15.6 KB gzip (DECISIONS D2).
- `app.js` (catalog, links, status, FAB, active nav, tracking) loads `stage.js` with dynamic `import()`. `stage.js` loads `3d/orbit-scene.js` only after engagement and when the stage is near the viewport.
- **New files:**
  - `js/stage.js`
  - `js/3d/{capability, geometry, mat4, scene, orbit-model, orbit-scene}.js`
  - `assets/textures/grain.png`
  - `tests/{scene, orbit}.test.js`
  - `tools/screenshots.mjs`
- **Changed files:** `index.html`, `css/{tokens, styles}.css`, `js/app.js`, `js/lib/{render, track}.js`, `build.mjs`, `catalog.json`, `tests/{lib, render}.test.js`, `docs/redesign-v2/{PRD, SRS}.md` (URL only).

## 3. 3D concept, interaction, fallback
See [3D_IMPLEMENTATION.md](3D_IMPLEMENTATION.md):
- **Modes:** live / still / 2D poster. Reduced motion gives a still frame; WebGL-off, Save-Data and low-power devices get the 2D panel with photos; context loss falls back to 2D.
- **Lifecycle:** paused off-screen and in hidden tabs; GPU resources disposed on unload.

## 4. Backend decision
No backend (see [BACKEND_AND_DATA_DECISION.md](BACKEND_AND_DATA_DECISION.md)). Analytics remain an event hook; a new event, `scene_motion_toggle`, was added, and `collection_nav` now also covers the orbit.

## 5. Commands executed (key)
```
node --test tests/*.test.js                       # 43/43 pass
node build.mjs                                    # dist/ built, data + image validation
node tools/screenshots.mjs <url> <out>            # 10 viewports × normal / reduced-motion / no-WebGL
npx lighthouse@12.6.1 <url> --form-factor=mobile --throttling-method=simulate
```

## 6. Results
- Tests: **43/43 pass**.
- QA: **30/30** viewport/mode captures with no overflow, dead anchors, broken images, small targets or console errors.
- Lighthouse final (3 runs):

  | Metric | Result |
  |---|---|
  | Performance | 97 / 96 / 94 |
  | Accessibility, Best Practices, SEO | 100 |
  | LCP | 2.5 s |
  | TBT | 0–160 ms |
  | CLS | 0 |

  Conditions: local server without compression, so scores vary by ±10 on this machine.
- Screenshots: `docs/upgrade-v3/screenshots/{baseline, v3, v3-no-webgl, v3-reduced-motion}/`, with `checks.json` in each.

## 7. Shop URL confirmation
`site_config.global_shop_url` is exactly the owner-supplied URL ending in `…nUaU4o%3D` (511 characters).
- Every `product_url` is null.
- Every buy link in the grids, the orbit panel and the footer resolves to that exact string, with `target="_blank" rel="noopener noreferrer"`.
- Verified by unit test (exact equality) and in the browser.

## 8. Remaining limitations & owner decisions
1. **TikTok in-app browser / Safari iOS: not verified** (needs real devices after deploy).
2. Deploy `site/dist/` to a host with compression, then re-run Lighthouse there. Set `site_url` for an absolute `og:image`.
3. 12 new images are staged in `product-intake/` and need names and prices (some have trademark issues), see `INTAKE.md`.
4. The campaign headline is still awaiting copy approval.
5. Inter now loads with `display=optional`: first-time visitors on slow networks may see the system font. This is intentional for speed; self-hosting Inter would make it consistent (owner choice).
6. `taste-skills`: **not available** in this environment (only unrelated gstack skills); not used.

## 9. Reference study
Studied live in the built-in browser:
- **Catalyst Society:** orbit with an explicit instruction, numbered nodes and a visible "Pause animation" control. Its pause pattern was adopted.
- **FeralUI gradients:** 4-colour mesh fields with low noise. Recreated independently in CSS tokens.
- **mesh3d.gallery:** gallery index only. The listed sites were not opened, so no claims are made about them.

No assets, code or exact layouts were copied.
