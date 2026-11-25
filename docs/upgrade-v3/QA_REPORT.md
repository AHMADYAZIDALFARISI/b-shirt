# QA REPORT — upgrade v3 (25 Nov 2026)

Base: `Downloads/Gembul.zip` (as instructed by the owner). The previous working copy is preserved in `Downloads/Gembul-backup-v3-20261125-1031/`.

## 1. Automated tests
`node --test tests/*.test.js` → **43 tests, 43 pass, 0 fail.**

Coverage by area:

| Area | What is tested |
|---|---|
| Catalog | counts 7/4/5/2, validation, escaping |
| Pricing | discounts 29/26/30/28/26/28/29, Rupiah formatting |
| Purchase URL | **exact new Shop URL (511 characters, byte-for-byte)**; every `product_url` is null; override, fallback and invalid cases; generic homepage rejected |
| WhatsApp | encoding, per-product message |
| Admin status | 07:59, 08:00, 16:59, 17:00, Saturday, Sunday; device-timezone independence; fail-closed; next-open label |
| Scene decision | live / still / poster rules, override safety |
| DPR | cap |
| Geometry | finite values, index range, Uint16 budget, unit normals |
| Matrices | finite values |
| Orbit model | filters, ring maths (shortest turn, wrap-around), picking by depth, cover-crop UVs |
| Orbit panel | exact URL, `rel`, disabled state without a valid URL, escaping, filter `aria-pressed` |
| Tracking | `collection_nav`, `scene_motion_toggle` |

Build: `node build.mjs` succeeds from a clean state and validates that every image file exists.

## 2. Browser / device-emulation checks
Tool: `site/tools/screenshots.mjs` drives Chrome through the DevTools Protocol with device emulation at 10 viewports:

360×800, 375×812, 390×844, 414×896, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080.

| Mode | Overflow | Dead anchors | Broken images | Targets < 44px | Console errors | Scene state |
|---|---|---|---|---|---|---|
| Normal (`screenshots/v3/`) | 0/10 | 0 | 0 | 0 | 0 | live |
| WebGL disabled (`screenshots/v3-no-webgl/`) | 0/10 | 0 | 0 | 0 | 0 | poster (2D) |
| Reduced motion (`screenshots/v3-reduced-motion/`) | 0/10 | 0 | 0 | 0 | 0 | live (still mode) |

Interactive checks in the built-in browser (Chromium):

| Check | Result |
|---|---|
| Real mouse **click on the right-hand card** | selected *Sky Blue Lace-Trim Wide Leg Trousers*, panel 4/7 ✓ |
| Real mouse **drag** across the ring | ring rotated, then snapped to a card and updated the panel (3/7) ✓ |
| Next button | 4/7 ✓ |
| Pria filter | 1/2, "Lihat koleksi Pria" → `#area-cowok` ✓ |
| ArrowRight key | next product ✓ |
| Live region | "Basic White Tee & Light-Wash Baggy Jeans, Rp169.000. 2 / 2" ✓ |
| Panel buy link | equals the configured URL, `noopener noreferrer` ✓ |
| Lazy load | `poster` before engagement, `live` after scroll ✓ |
| Off-screen | `running=false` ✓; back in view `running=true` ✓ |
| Pause toggle | `aria-pressed=true`, label "Putar animasi", loop stopped ✓ |
| `?scene=off` | 2D mode; next swaps the photo (alt = product name) ✓ |

**Not verified:**
- TikTok in-app browser on real Android/iOS devices
- Safari iOS
- a screen-reader walk-through
- a real hidden-tab test (the `visibilitychange` handler exists but was not exercised manually)

## 3. Lighthouse (12.6.1, mobile, simulated 4G, local Python server without compression)
| Build | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Baseline (pre-v3), 2 runs | 84 / 73 | 100 | 100 | 100 | 1.6 / 3.0 s | 2.1 / 3.2 s | 540 ms | 0.001 |
| First v3 attempt (3D loaded at idle) | 69–70 | 100 | 100 | 100 | 2.8–2.9 s | 3.1 s | 770–910 ms | 0 |
| **Final v3 (interactive orbit)**, 3 runs | **97 / 96 / 94** | 100 | 100 | 100 | 1.8–1.9 s | **2.5 s** | 0–160 ms | **0** |

### What was measured and fixed on the way
| Problem | Evidence | Fix |
|---|---|---|
| WebGL probe and scene compile during load | TBT 770–910 ms | Engagement + proximity gate; probe moved to just before load (DECISIONS D7) |
| SVG `feTurbulence` grain with a blend mode | ~1.8 s unattributed raster task (no-font experiment) | 2 KB static PNG tile below the canvas |
| Async Google Font | FCP 2.9 s with the font vs 1.7 s without (A/B on a copy) | Font requested after `load` with `display=optional`, so it never blocks or shifts the layout |

Scores on this laptop vary by ±10 points between identical runs; compare like with like. Re-measure on the real host (with gzip/brotli and a CDN) before launch.

## 4. Visual refinement passes
1. **Pass 1:**
   - Object initially too large (hook and ribbon clipped): re-framed.
   - Ribbon read as a flat card: analytic folds added.
   - Back cards rendered as grey slabs: hidden.
   - Selection frame too heavy: thinned.
2. **Pass 2:**
   - Mobile poster image overflowed its box: absolute centring.
   - Orbit pushed New Arrivals far down on phones: stage changed to 5:4 and the chips to a single scrollable row.
   - Hint pill crossed the hanger hook and the WhatsApp button covered the pause toggle: hint moved to bottom-left, toggle to top-right.
   - Footer "Pria" and header "Pria" were under 44px: `min-width` added.

## 5. Acceptance checklist
| Item | Status |
|---|---|
| Product data and image mapping preserved | ✅ |
| Counts 7/4/5/2 | ✅ |
| Prices and discounts | ✅ |
| **Shop URL exact (new owner URL, all products)** | ✅ unit test + browser |
| WhatsApp / TikTok | ✅ |
| Admin hours in Asia/Jakarta | ✅ |
| No fabricated claims | ✅ |
| 3D is lazy, pauses off-screen, respects reduced motion, has a WebGL-off fallback, does not block scrolling | ✅ |
| Keyboard / semantic alternative for the 3D | ✅ |
| Resources disposed on unload | ✅ (code path; not profiled with a memory tool) |
| Lighthouse ≥ 90 and LCP ≤ 2.5 s | ✅ on the final runs (local conditions) |
| TikTok in-app browser | ⏳ **Not verified**: needs real devices |
