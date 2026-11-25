# DESIGN DIRECTION — b-shirt Official Web Catalog (proposal)

**Status:** proposal for approval, not implemented. Grounded in [AUDIT_REPORT.md](AUDIT_REPORT.md), [DESIGN_REFERENCE_RESEARCH.md](DESIGN_REFERENCE_RESEARCH.md) and the PRD/DESIGN.md constraints. Where this proposal differs from DESIGN.md, the difference is called out with the reason.

---

## 1. Concept: "The rack, not the shop window"

A phone-first **clothing rack**. The visitor arrives from TikTok and is already looking at the clothes on the first screen. The photos are the interface. Type, colour and chrome stay quiet and exact, as on a well-printed price tag.

- **Brand personality:** clear, everyday-stylish, honest, quick. A friendly shop assistant who shows you the rack and the price, then points you to the till (Tokopedia) or to the admin (WhatsApp). Not luxury, not "tech".
- **Why:** the audit found the prototype's weakest points are generic AI-template chrome and a slow path to the products. The strongest research reference (a neutral, photo-first catalog style) shows that consistent photography alone can carry a page.

## 2. Retain / refine / rebuild / remove

| Decision | Item | Reason (audit evidence) |
|---|---|---|
| **Retain** | Section order (promo → header → New Arrivals → Cowok → Cewek → info → footer → FAB) | Matches PRD/DESIGN.md |
| Retain | Cowok/Cewek tints and accents | Exact PRD values, contrast passes (10.57:1 / 7.18:1) |
| Retain | 3:4 frames with cover-fit and per-product position | PRD; zero CLS measured |
| Retain | Price-then-CTA order within the card | Readable, consistent in New Arrivals |
| **Refine** | Promo bar → one line, configurable, promo only | Wraps to 2 lines + status today |
| Refine | Header → 56px: logo + Cowok/Cewek switch | 80px + 64px promo = 144px chrome |
| Refine | CTA label → "Beli di Tokopedia" | Current label hides that the user leaves the site |
| Refine | FAB → 48px+, safe-area, status-aware | Overlaps CTAs today |
| **Rebuild** | Product card as one component with a `featured` variant | 5 variants today |
| Rebuild | Info section → 4 plain verified facts, no icon pillars | 3 of 4 pillars contain unsupported claims |
| Rebuild | Tokens → DESIGN.md names in a single file | M3 token soup + 30 arbitrary hex values |
| **Remove** | Intro block (chip, H1 paragraph, duplicate pills) | Pushes products below the fold |
| Remove | Avatar, "Katalog Lengkap", "Cara Order Tokopedia", "Dedicated Ambiance", product IDs, "Paling Diminati", pulse dots, every unverified claim | Not in PRD / misleading / noise |

## 3. First-screen strategy (390×844)

```
┌──────────────────────────────┐
│ 12.12 SALE · Diskon s.d. 30% │  32px promo (only if active)
├──────────────────────────────┤
│ b-shirt      [Cowok][Cewek]  │  56px sticky header
├──────────────────────────────┤
│ New Arrivals · 4 produk      │  section title (H1 visually small)
│ ┌──────────┐ ┌──────────┐    │
│ │ photo    │ │ photo    │    │  first row of products
│ │ NEW  -29%│ │ NEW  -26%│    │  fully in view
│ └──────────┘ └──────────┘    │
│ Korean Camel…  Basic White…  │
│ Rp249.000      Rp169.000     │
│ ~~Rp349.000~~  ~~Rp229.000~~ │
│ [Beli di Tokopedia]  [Beli…] │
└──────────────────────────(wa)┘  FAB, clear of the CTAs
```
- The H1 is semantic: "b-shirt — Katalog Fashion Cowok & Cewek", visually hidden or set small in the header. The page answers "what is this?" with the logo, the Cowok/Cewek switch and the clothes themselves, not with a paragraph.
- Admin status moves out of the promo bar into a small line under the New Arrivals title or into the FAB label. It appears in one place only.

## 4. Product discovery & layout

- **New Arrivals:** 2-col grid (mobile), 3 (640–1023), 4 (≥1024). Gap 12/16/20px. Max 1140px. A grid, not a carousel: with 4 items a carousel hides half of them behind a swipe (DESIGN.md §6.4 allows either; the grid exposes all products).
- **Cowok (2):** the same 2-col grid on mobile (currently 1-col). On desktop the 2 cards sit in the 4-col grid, left-aligned, with a short collection note filling the remaining columns. Count "2 produk".
- **Cewek (5, odd):** ce-01 spans 2 columns on mobile in a **horizontal** featured layout (image 50% / text 50%), then a 2×2 grid. On tablet/desktop, ce-01 spans 2 columns of the 3-/4-col grid and keeps the same card anatomy, so the rhythm stays intact.
- **Info section:** a 2-column definition list ("Toko online", "Pembelian", "Bantuan", "Jam admin") with no icons and no marketing adjectives.
- **Footer:** logo, one-line description (verified facts only), hours, WhatsApp, TikTok, © current year.

## 5. Product card (single component)

| Part | Spec |
|---|---|
| Image | 3:4, `object-fit: cover`, `object-position` from data; neutral `#F3F4F6` placeholder; `alt` = name |
| Badges | Max 2: **NEW** (top-left, `#111827`/white), **-30%** (top-right, `#B91C1C`/white). No gender/featured badge; the collection context already says it |
| Name | 14–15px / 500, max 2 lines, `#111827` |
| Price | Promo 16–17px / 700 tabular; original 13px strikethrough `#6B7280` (4.83:1) with visually hidden "Harga normal" |
| CTA | Full width, **min 44px**, "Beli di Tokopedia" + external icon; black in New Arrivals, accent colour in Cowok/Cewek; `:hover`, `:focus-visible`, `:active` (scale .98) |
| Whole-card link | Not required. The CTA is the single tap target, to avoid nested interactive elements |
| `featured` variant | Spans 2 columns, horizontal on mobile, same parts at a larger size |

## 6. Typography

- **One family: Plus Jakarta Sans** (400/500/700). DESIGN.md allows Plus Jakarta Sans or Inter but asks for one. Plus Jakarta Sans has more character for a fashion brand and good Latin numerals, so it removes the Inter + Plus Jakarta + Material Symbols load.
- Lowercase wordmark "b-shirt", as the brand writes it (PRD); never CSS-uppercased.
- Scale (mobile → desktop): section title 22→30px/700; product name 14→16px/500; promo price 16→18px/700; meta 12–13px/500; promo bar 12px/600.
- Tabular numerals for all prices. No letter-spacing tricks except on the badge caps (+0.04em).

## 7. Colour system (tokens)

```css
:root{
  --color-bg:#FFFFFF; --color-surface:#F9FAFB; --color-line:#E5E7EB;
  --color-text:#111827; --color-muted:#4B5563;           /* muted darkened for 7.6:1 */
  --color-price-original:#6B7280;                         /* replaces #9CA3AF (2.54:1 fails) */
  --color-promo:#B91C1C;                                  /* DC2626 is 4.83:1 on white; B91C1C gives margin for small badge text */
  --color-new-bg:#111827; --color-new-text:#FFFFFF;
  --men-bg:#EFF6FF; --men-border:#DBEAFE; --men-accent:#1E3A5F;
  --women-bg:#FFF1F2; --women-border:#FCE7F3; --women-accent:#9D174D;
  --radius-sm:4px; --radius-md:8px;  --header-h:56px;
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px; --space-12:48px;
}
```
Deviations from DESIGN.md, which need approval: `--color-price-original` and `--color-muted` are darkened for contrast; `--color-promo` is moved to `#B91C1C` (optional; `#DC2626` passes at 4.83:1 for normal text). Body background is pure white, replacing the prototype's lilac `#f9f9ff`.

## 8. Interaction & motion
- Required: sticky header, anchor scroll via `scroll-margin-top: var(--header-h)`, hover feedback on pointer devices only (`@media (hover:hover)`), `:active` pressed state on touch, `:focus-visible` ring (2px `--color-text`, 2px offset).
- Motion budget: ≤200ms, opacity/transform only, all of it disabled under `prefers-reduced-motion`. No pulse, parallax, or zoom on touch.
- External-link feedback: the CTA shows its pressed state immediately; no fake loading spinners.

## 9. Mobile-first & TikTok in-app browser
- Design at 360px first; test 360–430.
- Chrome total ≤ 88px (32 promo + 56 header).
- FAB 52px, `right: 16px; bottom: calc(16px + env(safe-area-inset-bottom))`; `<main>` gets an equal bottom padding, so the last CTA is never covered.
- No `overscroll-behavior:none`, no hidden scrollbars, no `100vh` traps; use `dvh` only if needed.
- Images: self-hosted WebP, 400w/800w `srcset`, first row eager.

## 10. Accessibility
Real `alt`; one H1; `role="status"` for admin status (text + icon, not colour alone); targets ≥44px; visible focus; `aria-hidden` decorative icons; external links announce "(membuka Tokopedia)"; `lang="id"` with Indonesian UI copy throughout (drop the mixed English filler).

## 11. Frontend component architecture

```
catalog.json            ← site_config + products (single source of truth)
tokens.css              ← §7
index.html              ← static shell, SEO/OG meta from config at build
app.js
 ├─ lib/status.js       getAdminStatus(date, cfg) → {online, label}
 ├─ lib/price.js        calcDiscount(p), formatRupiah(n)
 ├─ lib/links.js        resolvePurchaseUrl(p, cfg), buildWhatsAppUrl(cfg, msg)
 ├─ ui/PromoBar         renders iff promo_banner.active
 ├─ ui/Header           logo + CollectionSwitch
 ├─ ui/Section          title, count, tint variant (default|men|women)
 ├─ ui/ProductGrid      applies the featured/odd-count rule
 ├─ ui/ProductCard      default | featured
 ├─ ui/InfoList, ui/Footer
 └─ ui/WhatsAppFab      status-aware
tests/                  unit (lib/*) + Playwright (widths, links, overlap)
```
No framework is required for 7 products. A plain ES-module build (or Vite with zero runtime dependencies) keeps the page light enough for the TikTok webview. Rendering uses `textContent`/DOM APIs; product names are never inserted with `innerHTML`.

## 12. Design principles (updated)
1. **Clothes before words.** If it pushes a product down, it must justify itself.
2. **Say only what is true.** Every claim must trace to the PRD or the owner.
3. **One of everything.** One card, one status, one WhatsApp link builder, one font, one token file.
4. **Tell people where a tap goes.** Tokopedia and WhatsApp are named on the button.
5. **Phone in one hand, slow 4G, TikTok webview.** That is the design target; desktop is the adaptation.
