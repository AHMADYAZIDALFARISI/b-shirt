# Implementation Report — b-shirt Retail Redesign (v2)

**Date:** 25 November 2026 · **Code:** [site/](../../site/) · **Specs:** [DESIGN.md](DESIGN.md), [PRD.md](PRD.md), [SRS.md](SRS.md)

## 1. Summary of changes
- Neutral retail look: white/ink/gray tokens, Inter as the only font, square 2px corners, no full-bleed pastel blocks, red used only for discounts.
- New page order:
  1. Announcement strip
  2. Sticky header (Wanita / Pria / New Arrivals, plus a quiet "Bantuan" link on desktop)
  3. Editorial campaign
  4. Wanita/Pria category tiles
  5. New Arrivals
  6. Wanita
  7. Pria
  8. Info Belanja (live admin status)
  9. Footer
  10. Floating WhatsApp button
- **The 7 photos you supplied** are converted to self-hosted WebP at 400px and up to 720px, with `srcset`. The AI illustrations and the "Ilustrasi" labels are removed.
- Campaign, category tiles and promo are driven by `catalog.json` (`site_config.campaign`, `category_tiles`). The campaign's discount figure is calculated from the data (`{max_new_discount}`), so it can never overstate the real discount.
- Data labels are mapped in the presentation layer: `cewek` displays as Wanita and `cowok` as Pria. Canonical data values are unchanged.
- The build pre-renders every section, so the first paint is already final. It also validates that every image file exists, and switches to the official logo automatically once it is added (see §7).

## 2. Design direction and rationale
Three directions were considered:

| Direction | Verdict |
|---|---|
| **A** Editorial campaign-led | Credible, but a large hero pushes products down |
| **B** Category-first | Too thin with only two categories |
| **C** Product-first compact | Fast, but reads like the "basic catalog" being replaced |

**Chosen: a compact version of A.**
- On mobile, two real product photos sit side by side (camel coat + earth-tone vest, which share a warm palette). Below them: a short headline, one CTA, and the Wanita/Pria tiles.
- At 390×844 the campaign CTA ends at 544px and the category tiles at 742px, so a shopping route is visible on the first screen.
- On desktop it becomes an editorial split: copy on the left, two photos on the right.

**Sale section omitted** under DESIGN §6.6: all 7 products are discounted, so a Promo section would repeat the entire catalog. Every card still shows its discount.

## 3. Files changed
- `site/index.html`: new structure
- `site/css/tokens.css`, `site/css/styles.css`: rewritten
- `site/js/lib/render.js`: campaign, tiles, cards, gender labels
- `site/js/app.js`
- `site/build.mjs`: pre-render of all sections, image-existence check, logo swap
- `site/catalog.json`: photos, campaign and tile config, `site_url`, WhatsApp display
- `site/assets/products/*.webp`
- `site/tools/make_logo_assets.py`: new
- `site/tests/render.test.js`, `site/tests/lib.test.js`

## 4. taste-skills
**Unavailable.** No skill named `taste-skills` exists in `~/.claude/skills` or in the project (only unrelated gstack skills). It was not applied, and no substitute was claimed.

MCP design sources: none of Jiro, Design Spells, Refero, SupaHero or Mobbin is connected as an MCP. The earlier public-web research is in [DESIGN_REFERENCE_RESEARCH.md](../../DESIGN_REFERENCE_RESEARCH.md). UNIQLO was used only as a principle reference (from the screenshot you supplied); no assets, copy or exact layout were taken from it.

## 5. Visual QA (built-in browser, device emulation)
Screenshots reviewed at 360×800, 390×844, 430×932, 768×1024, 1024×768 and 1440×900. No horizontal overflow at any of these widths.

Two refinement passes were made:
- **Pass 1:** removed the campaign photo captions on small screens; removed the redundant Wanita/Pria label inside the gender sections (it is kept in New Arrivals, which mixes both).
- **Pass 2:** fixed the footer spacing ("WhatsApp082230089520"); limited campaign captions to desktop; shortened the WhatsApp button's visible label so it no longer covers products on tablet. The reply-time text moved into its accessible name and the status line.

## 6. Build, tests and performance
- `node --test tests/*.test.js`: **27/27 pass**. Coverage includes:
  - counts 7/4/5/2
  - discounts and Rupiah formatting
  - exact URL preservation, override and fallback, and the disabled state
  - status boundaries, Sunday, and device timezone
  - next-open label
  - campaign and tile anchors
  - escaping
  - promo on/off
  - photo files exist
- Browser check:
  - 11/11 buy links plus the footer link equal the configured URL byte-for-byte, with `noopener noreferrer`
  - 0 dead anchors and 0 targets under 44px
  - 1 `h1`, every image has an `alt`, no console errors
- **Lighthouse Mobile** (simulated 4G, local Python server, 3 runs on `dist/`):

  | Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
  |---|---|---|---|---|---|---|
  | 1 | 97 | 100 | 100 | 100 | 2.3 s | 0.001 |
  | 2 | 89 | 100 | 100 | 100 | 2.3 s | 0 |
  | 3 | 97 | 100 | 100 | 100 | 2.1 s | 0 |

  **LCP now meets ≤2.5 s.** The one remaining accessibility warning (tile label mismatch) was fixed after these runs.
- **Not tested:** TikTok in-app browser (Android/iOS), Safari iOS, screen reader, 375/414/640/1280/1920px individually.

## 7. Remaining risks and owner decisions
1. **Official logo: done.** Source: `brand-source/WhatsApp Image 2026-11-24 at 19.32.39.jpeg`. `tools/make_logo_assets.py` cropped it (no redrawing) into `site/assets/brand/`:
   - header wordmark, shown 28px tall
   - full stacked logo in the footer, 88px wide
   - favicon (32px) and apple-touch-icon (180px), using the hanger-shirt icon

   Verified in the browser at 390px and 1440px, with no overflow.
2. Three supplied photos (khaki jacket, plaid shirt, pink shirt dress) are **not used**: they are not in the 7-product catalog, and showing them would imply products that are not listed.
3. Campaign headline "Gaya harian untuk pria dan wanita" is new copy; owner approval is needed (DESIGN §6.3).
4. `site_url` is `null`, so og:image is relative. Set it after deploy so link previews in TikTok and WhatsApp show the image.
5. The Tokopedia URL is a single product page; all 7 products open that same listing.

## 8. Shop URL
**Confirmed preserved exactly.** It is stored once in `site_config.global_shop_url` and appears byte-for-byte in every buy link and the footer link. The string ends in `…IGa5CbU%3D` and was never decoded or re-encoded; this is checked by unit tests and in the browser.
