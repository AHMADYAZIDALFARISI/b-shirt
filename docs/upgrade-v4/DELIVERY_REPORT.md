# DELIVERY REPORT — b-shirt v4.0 Immersive Hybrid

**Date:** 25 Nov 2026 · **Build output:** `site/dist/` · **Specs:** root `PRD.md`, `SRS.md`, `DESIGN.md` (v4.0 + owner-revision addendum)

## 1. Executive summary
b-shirt is now an **immersive hybrid fashion experience** that is still a fast, truthful catalog:
- **Immersive hero:** an editorial serif headline, campaign copy and the CTA (all semantic DOM) beside the **one-canvas 3D rack**. The rack is the brand's one-line hanger floating above a rotating ring of real product photos. Visitors drag or swipe to rotate (with inertia and snap), tap to select, use the Semua / New Arrivals / Wanita / Pria filters, the ← → buttons or the arrow keys, and buy from the panel.
- **Poster:** the campaign photo pair is the first paint (LCP) and the same-footprint fallback when WebGL is off.
- **Category tiles** (Wanita 7 / Pria 8) are restored from `site_config.category_tiles`.
- **Owner revision:**
  - all **8 new garments** are listed with proposed prices;
  - the **4 model photos** form a **"Brand Ambassador · Wajah b-shirt"** editorial section, with no invented names, quotes or product claims.
- Header carries Wanita / Pria / New Arrivals / **Bantuan** on every screen size.
- **No founder identity anywhere.**

## 2. Changed files and why
| File | Change |
|---|---|
| `PRD.md`, `SRS.md`, `DESIGN.md` (root) | Replaced with the supplied v4.0 docs plus the owner-revision addendum. Old versions are in `docs/archive-pre-v4/`. |
| `site/catalog.json` | +8 products (`cw-03…cw-08`, `ce-06`, `ce-07`), `category_tiles`, `ambassadors`, `stage` copy. **The baseline 7 products and the global URL are untouched** (asserted by tests). |
| `site/assets/products/*` | 8 new WebP pairs (400/720). `cw-04` has only its "1/3" screenshot strip cropped off; the garment is not altered. |
| `site/assets/ambassadors/*` | 4 WebP pairs |
| `site/index.html` | v4 header (Bantuan), immersive hero (copy + poster + canvas + rack panel), category tiles, ambassadors section |
| `site/css/tokens.css`, `styles.css` | Display-serif token (system fonts, no download); hero, poster, rack, tiles, ambassador styles; a global `[hidden]` guard |
| `site/js/lib/render.js` | `campaignCopyHtml`, `campaignPosterHtml`, `categoryTilesHtml`, `ambassadorsHtml` |
| `site/js/lib/catalog.js` | `publishedProducts` (`"published": false` hides an entry); validation of campaign, tile and stage references |
| `site/js/app.js`, `js/stage.js` | Published filter; hero poster/2D behaviour; v4 event names |
| `site/js/3d/orbit-scene.js` | Ring radius and camera scale with product count (15 cards without overlap) |
| `site/js/lib/track.js` | `collection_navigation`, `scene_interaction` (SRS v4 FR-019). `shop_click`, `whatsapp_click` and `tiktok_click` are unchanged. |
| `site/build.mjs` | Pre-renders hero copy/poster, tiles and ambassadors; validates ambassador images |
| `site/tests/*` | Baseline-lock test, owner-revision tests, tiles/ambassadors/published/validation tests |

## 3. Architecture & 3D decisions
- Static HTML/CSS/ES modules and `build.mjs`, unchanged. **No new dependencies; no framework, backend or analytics vendor.**
- **One canvas, raw WebGL1** in `site/js/3d/`, 15.6 KB gzip, no external models or textures. Card textures are the real product WebP files.

| Item | Value |
|---|---|
| Hanger | 6,048 triangles |
| Ribbon | 1,296 triangles |
| Cards | 2 triangles each |
| DPR cap | 1.5 on phones, 1.75 elsewhere |

- **Loading:** after first engagement (scroll, touch, pointer or key) and when the rack is near the viewport. It pauses off-screen and when the tab is hidden, and is disposed on unload. Context loss, import failure or missing WebGL fall back to the poster.
- **Reduced motion:** a still frame; the ring moves only when the user interacts.
- Every rack action has an HTML control, and the canvas is `aria-hidden`.
- Reference principles only (Catalyst Society, FeralUI, mesh3d.gallery); no layouts, code or assets copied.

## 4. Functional parity checklist
| Item | Evidence |
|---|---|
| Promo banner `active` behaviour | `promoHtml` tests ✅ |
| Admin status: 07:59 / 08:00 / 16:59 / 17:00 / Sunday, device-timezone independent, fail-closed | unit tests ✅ |
| Next-open label | unit tests ✅ |
| Anchors `#new-arrivals`, `#area-cewek`, `#area-cowok`, `#info-belanja` | 0 dead anchors at 10 viewports ✅ |
| Campaign from config; `{max_new_discount}` computed (still 30) | render test ✅ |
| Category tiles from config | test ✅ |
| New Arrivals = 4 (from `is_new`); Wanita 7; Pria 8; featured ce-01 | tests ✅ |
| Baseline 7 products identical (IDs, names, prices, flags, images, order) | test ✅ |
| **Exact global Shop URL (511 chars), all `product_url` null** | test ✅ |
| WhatsApp number and encoded default message; TikTok URL | tests ✅ |
| Events `shop_click`, `whatsapp_click`, `tiktok_click` preserved | test ✅ |
| No cart, ratings, stock, sizes, materials or founder section | ✅ (name-claim test on new products) |

## 5. Commands & exact results
```
node --test tests/*.test.js   → tests 49, pass 49, fail 0
node build.mjs                → Built dist/ — css 21921 B inlined, catalog v=5245f60980, LCP preload: cw-01
node tools/screenshots.mjs http://127.0.0.1:8781/dist/index.html ../docs/upgrade-v4/screenshots/<mode>   (normal / no-webgl / reduced-motion)
npx lighthouse@12.6.1 <url> --form-factor=mobile --throttling-method=simulate   (5 runs)
```

## 6. Lighthouse (mobile, simulated 4G, local Python server **without compression**, Windows laptop)
| Run | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| 1 | 95 | 100 | 100 | 100 | 2.0 s | 2.7 s | 70 ms | 0 |
| 2 | 96 | 100 | 100 | 100 | 1.9 s | 2.5 s | 0 ms | 0 |
| 3 | 81 | 100 | 100 | 100 | 1.9 s | 2.7 s | 560 ms | 0 |
| 4 | 96 | 100 | 100 | 100 | 1.9 s | 2.6 s | 0 ms | 0 |
| 5 | 94 | 100 | 100 | 100 | 2.0 s | 2.8 s | 70 ms | 0 |
| **Median** | **95** | 100 | 100 | 100 | 1.9 s | **2.7 s** | 70 ms | 0 |

Targets Performance ≥90 and A11y/BP/SEO ≥95 are met (median). **LCP 2.7 s is above the 2.5 s target** under these local conditions. The page now carries 8 more products and 4 portraits (426 KB vs 343 KB), and Lighthouse estimates 89 KB of savings from text compression that this local server does not apply. Re-measure on the real host with gzip/brotli before deciding on further work. Raw reports: `docs/upgrade-v4/lighthouse/`.

## 7. Responsive / browser / device verification
- **Simulated (Chrome DevTools Protocol, device emulation):** 10 viewports (360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920) × 3 modes (normal, WebGL disabled, reduced motion). 0 overflow, 0 dead anchors, 0 broken images, 0 targets under 44px, 0 console errors (`docs/upgrade-v4/screenshots/*/checks.json`).
- **Built-in Chromium browser:** visual review at 390 and 1440. Two refinement passes:
  1. The selected-product photo showed over the poster because `img{display:block}` beat `[hidden]` → global guard added.
  2. The WhatsApp button overlapped the rack panel text on mobile → right gutter added.
- **Physical devices: NOT tested.** No iOS Safari, Android Chrome or TikTok in-app browser testing was performed.

## 8. Remaining risks & owner decisions
1. **Trademark / rights (flagged, published at owner request):**
   - `cw-03` shows a **Polo Ralph Lauren** logo;
   - `ce-06` shows the **Sanrio My Melody** character;
   - the ambassador photos' usage rights are unverified, and some may be stock or AI-generated;
   - presenting people as "Brand Ambassador" implies a relationship with b-shirt; confirm that is true.

   To hide any item, set `"published": false` in `catalog.json` and rebuild.
2. **Prices of the 8 new products are proposals** (`price_source: "proposal"`). Confirm them against Tokopedia; all of them open the same global Tokopedia URL.
3. LCP on the live host still needs measuring (see §6). Set `site_url` for an absolute `og:image`.
4. The campaign headline still awaits copy approval.

## 9. Deployment
```
cd site
node --test tests/*.test.js
node build.mjs
```
Upload the **contents of `site/dist/`** to any static host (Netlify, Vercel, Cloudflare Pages). Enable gzip/brotli, then set `site_config.site_url` and rebuild.
