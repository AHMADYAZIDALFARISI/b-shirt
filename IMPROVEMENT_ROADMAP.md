# IMPROVEMENT ROADMAP — b-shirt Official Web Catalog

Based on [AUDIT_REPORT.md](AUDIT_REPORT.md) and [TECHNICAL_AUDIT.md](TECHNICAL_AUDIT.md). Effort: **S** ≤ 2h, **M** ≤ 1 day, **L** > 1 day (one frontend developer).

## P0 progress — 25 Nov 2026

The new implementation lives in [site/](site/). The Stitch prototype was not modified. `cd site && npm test` runs 12 unit tests, all passing. Checked in the browser at 360, 390, 768 and 1280px: no horizontal overflow, first product row fully visible at 390×844.

| ID | Status | Notes |
|---|---|---|
| P0-01 | **Done** | The owner supplied a single `shop-id.tokopedia.com/view/product/…?encode_params=…` URL on 25 Nov, and **all 11 buy buttons + the footer link use it byte-for-byte** (verified in the browser and by a unit test). It is a *product* page, so every product leads to that same listing; per-product `product_url` can be filled in later. |
| P0-02 | **Done** | One `getAdminStatus()` (Intl `formatToParts`, fails closed); one status element; boundary tests pass. |
| P0-03 | **Interim (owner-approved)** | On the owner's instruction ("gunakan gambar yang relevan"), each product now uses the most suitable Stitch AI illustration, one image per product used everywhere. The corrupted cw-01 website screenshot is excluded, and portrait sources are preferred. Each image carries a visible "ILUSTRASI" label (`image_is_illustration: true`). The images are hotlinked from `lh3.googleusercontent.com` and may expire. **Replace with real photos (OI-2) before or soon after launch.** |
| P0-04 | **Done** | All unverified claims removed; the info section states only the 4 verified facts; footer © is the current year. |
| P0-05 | **Done** | `site/catalog.json` → rendered by `site/js/app.js`. New Arrivals, counts, discounts and the featured span are all derived from the data. |
| P0-06 | **Done (interim)** | Title, description, og:title, og:description, og:image (ce-01 illustration) and a hanger favicon are in place. Swap og:image and the favicon for the real photo/logo when available. |
| P0-07 | **Done** | `alt` = product name; placeholders have `role="img"` with a label. |

## P1 progress — 25 Nov 2026

| ID | Status | Notes |
|---|---|---|
| P1-01 | Done | Intro block cut to one line; promo + header = 129px at 390px; first product row fully visible at 390×844 |
| P1-02 | Done | Sticky header with Cowok/Cewek links; `scroll-margin-top` keeps headings clear of the header |
| P1-03 | Done | Promo renders only if `promo_banner.active`; if inactive, the bar shows only the status line |
| P1-04 | Done | One `ProductCard`; 2/3/4 columns; ce-01 horizontal featured card on mobile |
| P1-05 | Done | FAB is a 52×52 icon on mobile (labelled from 640px), respects the safe area, hides while scrolling down, returns on scroll-up/top/bottom, never hidden while focused; page has bottom padding |
| P1-06 | Done | One `buildWhatsAppUrl`; all 3 links identical, with the PRD message |
| P1-07 | Done | No avatar, dead links or jargon; footer link "Belanja di Tokopedia" (label fits a product-page URL). Real logo still needs OI-2 |
| P1-08 | Done | Targets ≥44px (except the inline WhatsApp number in an info sentence, which the WCAG inline exception covers); focus-visible; no icon fonts; strikethrough `#6B7280` (4.83:1) |
| P1-09 | Done | No Tailwind CDN; one font family; inline SVG icons |
| P1-10 | Done | First 2 images eager, first one `fetchpriority="high"` |
| P1-11 | Done | "Beli di Tokopedia" + external icon + descriptive `aria-label` |

Checked in the browser at 360, 390, 768 and 1280px: no horizontal overflow; the FAB hide/show works. 14/14 unit tests pass.
## P2 progress — 25 Nov 2026

| ID | Status | Notes |
|---|---|---|
| P2-01 | Done | Tokens moved to `site/css/tokens.css`; `styles.css` has **0 raw colour values**. DESIGN.md `--color-price-original` updated to `#6B7280` with a change note |
| P2-02 | Done | `prefers-reduced-motion` turns off smooth scroll, transitions and press-scale; no pulse animations |
| P2-03 | Done | `scroll-margin-top: var(--header-h)`; JS scroll handler removed |
| P2-04 | Done | `Intl.DateTimeFormat#formatToParts`, injectable date, boundary unit tests |
| P2-05 | Done | Max 2 badges (NEW, discount) plus the honest "Ilustrasi" label |
| P2-06 | Done | No product IDs in the UI |
| P2-07 | Done | One 1140px container. **Koleksi Cewek grid fixed:** mobile = ce-01 spans 2 columns horizontally; tablet (3 cols) = ce-01 spans 2 columns; desktop (4 cols) = ce-01 is a 2×2 tile. All three fill complete rows (measured at 390/768/1280) |
| P2-08 | Done | Allow-list: https + `shop-id.tokopedia.com` / `tokopedia.com` / `www.tokopedia.com`; generic homepage rejected |
| P2-09 | Done | © current year; no holiday claim; no "Official Store" wording |
| P2-10 | Done (hooks only) | `site/js/lib/track.js`: `shop_click` (product_id, section, location), `whatsapp_click` (location: fab/footer/info), `tiktok_click`. Events are pushed to `window.dataLayer` if present and dispatched as the `bshirt:track` DOM event. **No analytics tool is installed yet**; it needs the owner's choice (e.g. GA4 via GTM). Verified in the browser: 4 test clicks → 4 events |

## P3 progress — 25 Nov 2026

| ID | Status | Notes |
|---|---|---|
| P3-01 | Done | Tabular numerals; price line-height tightened |
| P3-02 | Done | `:active` scale on buy buttons, collection links and the FAB (off under reduced motion) |
| P3-03 | Done | 200ms fade on the collection heading after a Cowok/Cewek jump (`:target`), off under reduced motion |
| P3-04 | Done | Outside hours the status line reads "Di Luar Jam Operasional · buka Besok 08.00 WIB" (or "Hari ini" / day name); the FAB label/aria says "dibalas …". Unit-tested; the status line is fixed to one line so it never shifts layout |
| P3-05 | Done | A quiet "Tanya Admin" link on every card opens WhatsApp prefilled with that product's name; tracked as `whatsapp_click` with product_id |

## Performance work & production build
- `site/build.mjs` → `site/dist/`: inlined, minified CSS; **pre-rendered product grids, counts and promo** (final first paint, CLS 0); LCP image preloaded with matching `imagesrcset`; `catalog.json?v=<hash>` cache-busting; data validation fails the build.
- The web font loads non-blocking; module preloads.
- Illustrations are served as resized WebP (`=w240…720-rw` srcset).

## Quality gates — status

| Gate | Result |
|---|---|
| G1 Data | ✅ 22/22 unit tests (counts 7/4/2/5, discounts, validation, escaping) |
| G2 Links | ✅ All 11 buy links + footer = the configured URL byte-for-byte; WhatsApp/TikTok exact; `rel` correct. ⏳ **TikTok in-app browser on Android/iOS not tested** (needs your phone) |
| G3 Status | ✅ Boundary tests, device-timezone independence, one status element |
| G4 Content | ✅ No unverified claims rendered; illustrations labelled "Ilustrasi" |
| G5 Mobile | ✅ No overflow at 360/390/768/1280; first row visible at 390×844; FAB hides while scrolling down. ⏳ 375/414/430/1024/1440 not individually measured |
| G6 A11y | ✅ Lighthouse Accessibility 100; targets ≥44px; focus-visible; reduced motion. ⏳ No manual screen-reader pass |
| G7 Performance | ⚠️ Lighthouse Mobile (simulated 4G, local Python server, 6 runs on `dist/`): **Performance 94–96** (one outlier 88), **CLS 0**, TBT 0–40ms, FCP 1.5s, **LCP 2.7–3.0s, above the 2.5s target.** The local server has no compression and ~460ms server response time, which accounts for much of the gap. Re-measure on the real host; self-hosted WebP photos (OI-2) should also help |
| G8 Metadata | ✅ Lighthouse SEO 100; title, description, OG, favicon (og:image and favicon are interim) |

**Remaining before or at launch (owner):** deploy `site/dist/` to a host with compression; re-run Lighthouse on the live URL; test the live link from the TikTok bio on Android and iOS; supply real photos and logo (OI-2); pick an analytics tool; confirm the 12.12 SALE dates (OI-3).

---

## Launch blockers needing owner input (cannot be solved by design or engineering)

| ID | Needed from owner | Blocks |
|---|---|---|
| OI-1 | Exact full Shop \| Tokopedia URL (with query/encoded params); and are per-product URLs coming? | P0-01 |
| OI-2 | 7 real product photos + logo + filename → product-ID mapping | P0-03, all art direction |
| OI-3 | Is the "12.12 SALE" banner live at launch? Start/end dates | P1-03 |
| OI-4 | Is the Tokopedia shop an "Official Store"? Public-holiday closure rule? | P0-04 copy |
| OI-5 | Rupiah format with or without space | P2 formatting |

---

## P0 — Critical (must fix before launch)

| ID | Issue | Evidence | Severity | Recommendation | Expected benefit | Effort | Dependencies |
|---|---|---|---|---|---|---|---|
| P0-01 | All 13 purchase links go to tokopedia.com | AUDIT C1, L85…L591 | P0 | `resolvePurchaseUrl(product) = product.product_url ?? config.global_shop_url`; if both are missing or invalid, the CTA shows disabled "Link belum tersedia" (SRS §8) | Buyers reach the right shop/product | S | OI-1, P0-05 |
| P0-02 | Promo bar "Admin Online" hardcoded; contradicts capsule | AUDIT C3 | P0 | One `getAdminStatus()` drives every status display; fail-closed fallback | Truthful availability | S | P0-05 |
| P0-03 | AI-generated / corrupted / inconsistent product images | AUDIT C4 | P0 | Use the 7 real photos, one image per product reused everywhere; WebP ≤800px; per-product `image_position` | Product truth; trust | M | OI-2 |
| P0-04 | ~20 unsupported or contradictory claims | AUDIT §9 claim register | P0 | Delete them; replace the trust copy with the 4 verified facts (online-only, transaction via Shop \| Tokopedia, WhatsApp, hours) | Legal and trust safety | S | OI-4 |
| P0-05 | No data layer: products and config hardcoded and duplicated | TECH §1–2 | P0 | `catalog.json` (site_config + products per SRS §4) rendered by one script; derive New Arrivals, counts, discounts | Correctness; 5-minute promo updates (PRD KPI) | M | — |
| P0-06 | Missing `<title>`, description, OG, favicon | TECH §9 | P0 (NFR-05) | Add from config; OG image = the real hero product photo | Link previews in TikTok/WhatsApp | S | OI-2 |
| P0-07 | Product images lack `alt` | AUDIT §5.8 | P0 (a11y critical) | `alt` = product name | Screen-reader use | S | P0-05 |

## P1 — High (should fix before launch)

| ID | Issue | Evidence | Severity | Recommendation | Expected benefit | Effort | Dependencies |
|---|---|---|---|---|---|---|---|
| P1-01 | Products start at ~696px on a 390px phone; 144px fixed chrome hides 32px of content | AUDIT §5.7 | P1 | Remove the intro block; compact header (logo + Cowok/Cewek switch, ~56px); a single-line promo bar (~32px) | First products in the first viewport | M | P0-05 |
| P1-02 | No collection navigation on mobile after scrolling | AUDIT J2 | P1 | Sticky Cowok/Cewek segmented switch in the header (PRD FR-02) | Faster comparison | S | P1-01 |
| P1-03 | Promo bar not configurable; mixes promo and status | TECH §4 | P1 | Render only if `promo_banner.active`; move status out of the bar into the header/FAB area | Clean hierarchy | S | P0-05, OI-3 |
| P1-04 | Cowok 1-col on mobile; ce-01 featured is not horizontal; mixed card variants | AUDIT §5.2 | P1 | One `ProductCard` (2-col mobile / 3 tablet / 4 desktop); `featured` variant spans 2 cols with a horizontal layout only when the collection count is odd | Consistent scanning, PRD compliance | M | P0-05 |
| P1-05 | WhatsApp FAB overlaps CTAs, 36px tall, no safe area | AUDIT §5.2 | P1 | 48–56px circular FAB with label on ≥640px; `bottom: calc(16px + env(safe-area-inset-bottom))`; page bottom padding equal to FAB height | No blocked CTAs | S | — |
| P1-06 | Three different WhatsApp messages; footer link same-tab, no text | TECH §3 | P1 | One `buildWhatsAppUrl(message)` from config; optional product-context message variant | Consistency; PRD KPI | S | P0-05 |
| P1-07 | Header problems: broken avatar, wrapping nav at 768px, dead "Cara Order Tokopedia", jargon "Tokopedia Bridge" | AUDIT §5.2 | P1 | Remove the avatar and the extra nav items; real logo; one "Shop" link labelled "Toko di Tokopedia" | Clarity | S | OI-2 |
| P1-08 | Touch targets <44px (20), missing focus-visible, icon ligatures read aloud, strikethrough contrast 4.46 | AUDIT §5.8 | P1 | Per the a11y table | WCAG / NFR-04 | S | — |
| P1-09 | Tailwind Play CDN and duplicated icon fonts | TECH §7 | P1 | Compiled CSS (or hand CSS); 8 inline SVG icons; preload one font family | LCP in the TikTok webview | M | P0-05 |
| P1-10 | Above-the-fold images lazy-loaded | TECH §7 | P1 | Eager-load the first row; `fetchpriority="high"` on the first | LCP | S | P0-03 |
| P1-11 | CTA label "Beli Sekarang ↗" does not say the user leaves the site | AUDIT §5.3 | P1 | "Beli di Tokopedia" plus an external icon with `aria-label` | Honest expectation | S | — |

## P2 — Medium (can follow launch, ideally before)

| ID | Issue | Recommendation | Effort | Dependencies |
|---|---|---|---|---|
| P2-01 | Token set ≠ DESIGN.md; 30+ arbitrary hex values | Single `tokens.css` per DESIGN_DIRECTION §5; fix DESIGN.md `--color-price-original` (fails contrast) | M | — |
| P2-02 | Reduced motion absent; decorative pulse/zoom | `@media (prefers-reduced-motion)`; remove pulse; zoom ≤200ms on hover-capable devices only | S | P2-01 |
| P2-03 | Hardcoded 96px scroll offset vs 144/108px header | Use CSS `scroll-margin-top: var(--header-h)`; drop the JS scroll handler | S | P1-01 |
| P2-04 | Timezone parsing via `new Date(toLocaleString())` | `formatToParts`; injectable date; unit tests | S | P0-02 |
| P2-05 | Badge overload (NEW + COWOK + FEATURED + discount + "Paling Diminati") | Max 2 badges: NEW (top-left), discount (top-right) | S | P1-04 |
| P2-06 | Product IDs shown to customers ("ID: CE-02") | Remove from UI | S | — |
| P2-07 | Desktop Cowok section uses 60% width; header 1280 vs content 1140 | Shared 1140px container; Cowok cards use the same grid | S | P1-04 |
| P2-08 | Outbound URL allow-list (SRS 6.4) | Validate `https:` + Tokopedia hosts | S | P0-01 |
| P2-09 | Footer: © 2024, holiday claim, misleading "Official Store" label | Current year from JS/build; copy per OI-4 | S | OI-4 |
| P2-10 | Analytics for PRD KPIs | Privacy-light outbound click events (shop, WhatsApp) | M | Owner choice of tool |

## P3 — Polish (after launch)

| ID | Item | Effort |
|---|---|---|
| P3-01 | Tabular numerals for prices; tighten price/strikethrough baseline | S |
| P3-02 | Pressed-state micro-feedback on CTAs/FAB (scale 0.98, 100ms) | S |
| P3-03 | Short fade on Cowok/Cewek jump (reduced-motion aware) | S |
| P3-04 | Status-aware FAB microcopy ("Admin online" / "Balas Senin 08.00") | S |
| P3-05 | Per-product WhatsApp message ("…tanya soal {product name}") | S |

---

## Recommended implementation order
1. **Owner inputs** OI-1…OI-5 (parallel to step 2).
2. **Foundation:** P0-05 data layer → P2-01 tokens → P1-09 build without the CDN.
3. **Truth fixes:** P0-01, P0-02, P0-04, P0-06, P0-07, P1-06, P1-11.
4. **Layout:** P1-01 → P1-02 → P1-04 → P1-05 → P1-07 → P2-03/05/06/07.
5. **Assets:** P0-03 + P1-10 as soon as the photos arrive (re-check crops per product).
6. **Quality:** P1-08, P2-02, P2-04, P2-08.
7. **QA gates** (below), then launch; P2-09/P2-10/P3 after.

## Quality gates (all must pass to launch)
| Gate | Pass condition |
|---|---|
| G1 Data | Build-time validation passes; counts 7/4/2/5; discounts 29/26/30/28/26/28/29 |
| G2 Links | Every buy link equals the configured URL byte-for-byte; WhatsApp/TikTok URLs exact; `rel` correct; tested from the TikTok in-app browser on Android + iOS |
| G3 Status | Unit boundary tests pass; one status visible at a time; test in a non-WIB device timezone |
| G4 Content | Claim register has zero "Unverified" or "Contradictory" items rendered |
| G5 Mobile | No overflow at 360–430; first product row visible at 390×844; FAB never overlaps a CTA |
| G6 A11y | axe: 0 serious/critical; all targets ≥44px; visible focus; reduced motion honoured |
| G7 Performance | Lighthouse Mobile ≥90 and LCP ≤2.5s (simulated 4G), measured and recorded |
| G8 Metadata | Title, description, OG image and favicon render correctly in a WhatsApp/TikTok link preview |
