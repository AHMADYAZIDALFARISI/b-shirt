# AUDIT REPORT — b-shirt Official Web Catalog (Stitch prototype)

**Audit date:** 25 November 2026
**Audited artifact:** Stitch project `8341589564107848949` ("b-shirt Fashion Catalog Prototype"), screen `cf40d3612da349f48a6304dd6dc07983` ("b-shirt Official Web Catalog", desktop design, 2560px canvas).
**Evidence copy:** [audit/stitch-prototype-snapshot.html](audit/stitch-prototype-snapshot.html) — byte-for-byte HTML export downloaded through the Stitch MCP. All `Lx` line references below point to this file. (Lines 4 and 591 are very long single lines that contain the fixed header and the footer/floating WhatsApp respectively.)
**Source of truth:** [PRD.md](PRD.md) v2.0, [SRS.md](SRS.md) v1.0, [DESIGN (2).md](<DESIGN (2).md>) v1.0.
**Mode:** read-only. No application code, Stitch screen, design token or asset was modified.

---

## 1. Executive summary

The prototype is a **visually competent but commercially non-functional** Stitch export. It looks like a tidy modern storefront in a desktop screenshot, but it fails the core job the PRD gives it: sending a TikTok visitor to the **correct** purchase destination with **truthful** information.

**Overall weighted score: 4.1 / 10 — not launch-ready.**

The five problems that matter most:

1. **Every purchase link goes to `https://tokopedia.com`** (13 links: 11 "Beli Sekarang", header "Tokopedia Bridge", footer "b-shirt Official Store"). This is exactly the substitution the PRD/SRS forbid. And the real URL **does not exist anywhere in the workspace**: PRD §11 itself contains only the placeholder `"USE THE EXACT FULL URL FROM THE SOURCE PRD"`. → **Blocking: the owner must supply the full Shop | Tokopedia URL.**
2. **No real product photography.** All product images are Stitch AI-generated (`lh3.googleusercontent.com/aida-public/...`). None of the seven PRD asset files (`WhatsApp Image 2026-11-24 at 20.36.xx`) are present in the workspace or the Stitch project. The same product shows **a different generated model in New Arrivals vs. its collection section**, and the Koleksi Cowok image for cw-01 is literally **a generated screenshot of another website's product page** (nav bar "Now In / Collections / Men / Sale", size buttons, a "$289" price) cropped into the card (verified in browser at 390px).
3. **Contradictory operating status on the same screen.** The promo bar hardcodes `Admin Online • 08:00 - 17:00 WIB` (L4) while the JS-driven capsule correctly showed `Di Luar Jam Operasional` during the test (Wednesday 00:17 WIB). A customer sees both at once.
4. **Unsupported claims** throughout: "Ready Stock", "Bahan katun dingin & jahitan presisi", "Katun combed 24s", "material nyaman", "Paling Diminati", "terjamin melalui official shop", "proses pengiriman terjadwal setiap hari kerja", "Libur Nasional: Offline", "Secure Bridge to Tokopedia Official Ecosystem", "crafted for Indonesian silhouettes". None are in the PRD; BR-09 and SRS 3.11 prohibit them.
5. **Not a production artifact.** Runs on the Tailwind Play CDN (explicitly not for production), has no `<title>`, meta description, Open Graph or favicon, hardcodes all seven products twice in markup (no data layer), has a broken logo image (private Stitch asset URL returns nothing), and product `<img>` elements have **no `alt` attribute at all** (descriptions were put in a non-standard `data-alt`).

What is genuinely good and should be **retained**: the section order matches the PRD; prices and discount percentages are all correct; the Cowok/Cewek tint colours match the PRD exactly; anchor IDs `#area-cowok` / `#area-cewek` exist; the operating-status function uses `Asia/Jakarta` and the correct 08:00–16:59 rule; outbound `target="_blank"` links carry `rel="noopener noreferrer"`; no horizontal overflow at any tested width; zero measured layout shift.

---

## 2. Current implementation overview

| Aspect | Finding |
|---|---|
| Workspace contents | Only `PRD.md`, `SRS.md`, `DESIGN (2).md`. **No code, no assets, no logo, no product photos.** |
| Prototype location | Stitch cloud project only; one DESIGN screen + one uploaded image (`WhatsApp Image 2026-11-24 at 19.32.39.jpeg`, 895×895 — not one of the seven PRD product filenames; likely the logo/brand image, but it is **not used** by the screen HTML). |
| Format | Single 590-line standalone HTML file. Tailwind via `cdn.tailwindcss.com` with inline config (Material-3-style generated tokens). Google Fonts: Inter, Plus Jakarta Sans, Material Symbols (loaded **twice**, L3 and L4). ~60 lines of inline JS. No framework, no build, no data file. |
| Product data | Hardcoded in markup. Each New Arrival product is written twice (New Arrivals + its collection), with different images and different copy. |
| Logic | One status function (only drives the capsule, not the promo bar) + an anchor-scroll handler with a fixed 96px offset. |

### Page structure (as rendered)
1. Fixed wrapper (L4): promo `<aside>` + `<header>` (logo text, desktop nav with 4 links, TikTok pill, "Tokopedia Bridge" button, profile avatar).
2. Intro section (L6–40): "Katalog Resmi • Ready Stock" chip, H1 "Modern Everyday Fashion", paragraph, status capsule, Cowok/Cewek jump pills with counts.
3. New Arrivals (L42–187): 4 cards.
4. Koleksi Cowok `#area-cowok` (L189–277): 2 horizontal cards.
5. Koleksi Cewek `#area-cewek` (L279–455): featured ce-01 + 4 cards on a 12-col grid.
6. Trust section `#tentang-bshirt` (L457–524): 4 pillars + "Konsultasi Ukuran" banner.
7. Floating WhatsApp + footer (L591).

---

## 3. Overall score

| Dimension | Weight | Score | Weighted |
|---|---:|---:|---:|
| Product strategy & information architecture | 10% | 5.5 | 0.55 |
| UI/UX quality | 15% | 5.0 | 0.75 |
| E-commerce CRO | 15% | 3.0 | 0.45 |
| Fashion art direction | 10% | 3.0 | 0.30 |
| Design system consistency | 10% | 4.0 | 0.40 |
| Interaction & motion | 8% | 5.0 | 0.40 |
| Mobile experience | 12% | 4.5 | 0.54 |
| Accessibility | 8% | 4.0 | 0.32 |
| Frontend engineering | 8% | 3.0 | 0.24 |
| Content & business-logic accuracy | 4% | 3.0 | 0.12 |
| **Total** | **100%** | | **4.07 → 4.1 / 10** |

### Score rationale (evidence → biggest weakness → path to ≥9)

**Product strategy & IA — 5.5.** Section order matches DESIGN.md §2 and PRD journey. *Weakness:* an intro block (L6–40) sits between header and products, pushing the first product card to **y≈696px at 390px** (below the 844px fold only partially — just the top of the image is visible); header nav adds "Katalog Lengkap" (`href="#"`) and "Cara Order Tokopedia" (`#tentang-kami`, **a dead anchor** — the section is `#tentang-bshirt`), neither in the PRD. *To 9:* collapse intro into the header strip, keep only Cowok/Cewek quick-jump (PRD FR-02), fix/remove dead nav.

**UI/UX — 5.0.** Clean cards, consistent price/CTA placement inside New Arrivals. *Weakness:* three different card layouts for the same product type (vertical in New Arrivals; horizontal 50/50 in Cowok; mix of 6-col horizontal and 3-col vertical in Cewek), redundant badges (NEW + COWOK + FEATURED + discount + "Paling Diminati"), duplicate "Jam Operasional" headings. *To 9:* one product-card component with a single "featured" variant.

**CRO — 3.0.** Main conversion target is wrong for all 13 purchase links; the store link in the footer is labelled "b-shirt Official Store" but goes to the Tokopedia homepage (misleading label). Floating "Chat Admin" overlaps "Beli Sekarang" buttons on mobile. *To 9:* real URL wired through config, honest labels, non-overlapping WhatsApp action, status-aware WhatsApp copy.

**Art direction — 3.0.** AI-generated, inconsistent, one corrupted image (website screenshot), landscape 512×279 sources forced into 3:4 frames (6 of 12 product images). *To 9:* the seven real photos, consistent crop and background treatment, one image per product used everywhere.

**Design system — 4.0.** Tailwind config carries ~50 generated M3 colour tokens unrelated to DESIGN.md, while the PRD colours are inlined as arbitrary values (`bg-[#EFF6FF]`, `text-[#9D174D]` …) 30+ times. Radius token `full` is redefined to `0.75rem`, so `rounded-full` pills are not pills. *To 9:* a single token file with DESIGN.md names; zero arbitrary hex in markup.

**Interaction & motion — 5.0.** Smooth scroll, hover states and colour transitions exist. *Weakness:* decorative `animate-pulse` dots and 500ms image zoom; **no `prefers-reduced-motion` rule anywhere** (verified: no such media rule in loaded stylesheets); smooth scroll is forced on `<html>` and in JS. *To 9:* reduced-motion support, pressed states for touch, remove pulse.

**Mobile — 4.5.** No horizontal overflow at 360/390/768/1280 (measured `scrollWidth === clientWidth`). *Weakness:* fixed header is **144px tall at 390px** (17% of the viewport) while `<main>` only pads **112px**, so 32px of content starts hidden; Cowok collection is **1 column** on mobile (357×476 images) against the 2-column spec; ce-01 "featured" is just a tall single card, not the horizontal composition; strikethrough prices clip at 360px ("Rp349…"); WhatsApp FAB covers CTAs. *To 9:* compact 56–64px header, consistent 2-col grid, featured horizontal card, FAB with safe area and bottom padding.

**Accessibility — 4.0.** Landmarks exist, H1→H2→H3 order is valid. *Weakness:* product images have no `alt`; 20 interactive targets under 44px; logo link removes focus outline (`focus:outline-none`); icon font ligature text ("chat", "check_circle") is read aloud; status depends partly on dot colour; no `aria-live` for status. *To 9:* see TECHNICAL_AUDIT §6.

**Frontend engineering — 3.0.** Tailwind Play CDN, no data separation, duplicated markup, broken images, no metadata, fragile timezone parsing. *To 9:* small static build (Vite or plain HTML + compiled CSS) rendering from `catalog.json`.

**Content & business logic — 3.0.** Prices/discounts all correct, but purchase URL, operating status consistency, WhatsApp message text, footer WhatsApp link, copyright year (© 2024) and ~12 unsupported claims are wrong. *To 9:* data-driven rendering + claim register (§9).

---

## 4. Critical bugs (P0)

| # | Bug | Evidence | Impact |
|---|---|---|---|
| C1 | All purchase links → `https://tokopedia.com` | 13 `href="https://tokopedia.com"` (L4, L85, L116, L147, L178, L235, L268, L329, L359, L386, L416, L446, L591) | Every buyer lands on a generic marketplace homepage and must search for the shop; conversion path broken. Violates SRS 3.8 "Never replace missing configuration with a generic Tokopedia homepage". |
| C2 | Real shop URL missing from source of truth | PRD §11 `global_shop_url: "USE THE EXACT FULL URL FROM THE SOURCE PRD"`; SRS §4.1 same placeholder | Cannot be fixed by design or engineering. **Owner input required.** |
| C3 | Operating status contradiction | Promo bar static text L4 vs dynamic capsule L23–25/L529–562. Browser test Wed 00:17 WIB: bar "Admin Online", capsule "Di Luar Jam Operasional" | Customer distrust; WhatsApp messages sent at night with expectation of an answer. Violates SRS 3.2 "All status displays must call the same shared status function". |
| C4 | Fake / wrong product imagery | All 12 product images are `aida-public` AI images; cw-01 Cowok image is a website screenshot with "$289" (browser-verified at 390px); same product uses different images in two sections | Customer buys a garment that does not match the picture; brand credibility. Violates DESIGN.md §3 "Foto stok atau AI-generated yang menggantikan foto produk asli". |
| C5 | Unsupported product & trust claims | L12, L18, L204, L227, L260, L294, L315, L321, L408, L438, L488, L498, L508, L591 (see §9) | Misleading commercial claims; PRD BR-09 / SRS 3.11 violation; consumer-protection risk. |
| C6 | Fallback status text "Admin Tokopedia Aktif" | L560 (catch block shows *online* on error) | If timezone formatting fails the site claims an online admin that may not exist; should fail closed. |

---

## 5. Findings by specialist role

### 5.1 Principal Product Designer — journeys

**Journey 1 — TikTok → New Arrivals → Product → Tokopedia**
1. Lands (in-app browser, ~390px). Sees promo bar (2 lines + status pill) + 80px header = 144px chrome.
2. Sees "Katalog Resmi • Ready Stock", H1, 3-line paragraph, status, two pills. First product image only begins at ~696px.
3. Scrolls, taps "Beli Sekarang" → **Tokopedia homepage**. Must search "b-shirt" inside Tokopedia, find the right shop (risk of copycat shops), find the product.
*Friction:* 1 unnecessary scroll; 2–4 extra steps after leaving the site; loss of product context. **Fix:** show products in first viewport; direct product/shop URL.

**Journey 2 — TikTok → Cowok/Cewek → compare → Tokopedia**
1. Header nav is hidden below 768px (`hidden md:flex`, L4), so quick-jump exists only in the intro pills — which scroll away. After scrolling there is no way back to Cowok/Cewek except scrolling.
2. Cowok on mobile: one product per row at 357×476 → comparing two products requires scrolling between them; price of the first card is pushed below the fold by its own image.
3. Cewek: product IDs ("ID: CE-02") are shown as eyebrow labels — internal data leaking into customer UI, consuming the line where the collection label could go.
*Fix:* sticky compact Cowok/Cewek switch in the header (PRD FR-02 requires it), uniform 2-col grid.

**Journey 3 — Uncertain shopper → WhatsApp → purchase**
1. "Chat Admin" FAB visible always — good. But it sends a generic message and does not say which product the user was looking at.
2. Night/Sunday: FAB still invites chat with no expectation-setting; promo bar says "Admin Online".
3. Trust banner offers "Konsultasi Ukuran" — but there is no size data anywhere, so this CTA promises size guidance the site cannot verify the admin provides (it is plausible, but not in PRD).
*Fix:* status-aware FAB microcopy ("Balas Senin 08.00 WIB"), optional per-product WhatsApp message (PRD KPI mentions "contextual message").

**Cognitive load.** Above the fold at 390px there are 7 interactive elements competing (Tokopedia Bridge, avatar, 2 jump pills, status capsule, FAB, promo) and two different status widgets. "Tokopedia Bridge" is internal jargon (the PRD calls the product a "Shop bridge"; customers don't). "Dedicated Ambiance" (L196, L286) is meaningless English filler shown twice.

### 5.2 Senior UI/UX — section by section

| Section | Observations | Severity |
|---|---|---|
| Promo bar | Wraps to 2 lines + status pill at 390px → ~64px. Mixes promo and status (two unrelated messages). Status hardcoded (C3). "12.12 SALE" while today is 25 Nov — PRD Open Decision #3 says activation must be configurable; it is hardcoded. | P0 / P1 |
| Header | `h-20` (80px) at all sizes. Text logo "B-SHIRT" in uppercase CSS while brand is lowercase "b-shirt" (PRD). Avatar "Profile" image is broken (shows alt text "Prof") and is an account affordance DESIGN.md §6.2 forbids. At 768px the nav labels wrap to 2–3 lines and the logo breaks into "B- / SHIRT" (screenshot verified). No Cowok/Cewek on mobile. | P1 |
| Intro block | Not in PRD/DESIGN IA. Generic H1 "Modern Everyday Fashion". Unsupported "Ready Stock". | P1 |
| New Arrivals | Correct 4 products, NEW badge, discounts. Two badges stacked on the left + one right covers ~25% of a 172px-wide image. "B-SHIRT • MENSWEAR" eyebrow repeats brand on every card. Grid is 4 columns from 768px (spec: 3 cols 640–1023). | P2 |
| Koleksi Cowok | `grid-cols-1` mobile; desktop constrained to `max-w-3xl` leaving ~40% of the row empty at 1280px (screenshot verified). Unsupported material claims. Section claim "Bahan katun dingin & jahitan presisi". | P1 |
| Koleksi Cewek | Featured ce-01 gets `col-span-2` on mobile but stacks vertically (`sm:flex-row` only) → a 357×476 image card, not the horizontal featured composition DESIGN.md §5 asks for. On desktop ce-04/ce-05 are 6-col horizontal while ce-02/03 are 3-col vertical → mixed rhythm. Accent colours correct. | P1 |
| Trust section | 4 pillars; 3 contain unsupported claims (see §9). Duplicates operating hours (also in bar, capsule, footer = 4 places). Heading "Transparansi & Kenyamanan Belanja" is generic. | P0 (claims) / P2 (redundancy) |
| Footer | WhatsApp number link has no `target`/message, so it differs from the FAB (SRS 3.9 says both use same config). "© 2024". "Minggu & Libur Nasional: Offline" — public-holiday rule not in PRD and not implemented in JS. Logo image broken. | P1 |
| Floating WhatsApp | `bottom-6 right-6`, 128×36px — below 44px height. No `env(safe-area-inset-bottom)`. Overlaps "Beli Sekarang" of right-column cards (screenshots at 360/390). | P1 |

### 5.3 E-commerce CRO — CTA inventory

| CTA label | Location | Current destination | Intended destination | Works? | Label accurate? | Clear next step? |
|---|---|---|---|---|---|---|
| Beli Sekarang ×11 | Every product card | `https://tokopedia.com` | `product.product_url ?? global_shop_url` | Opens, **wrong place** | Partly — it does not buy, it leaves to Tokopedia; no hint until the ↗ glyph | No |
| Tokopedia Bridge | Header | `https://tokopedia.com` | `global_shop_url` | Wrong place | No — jargon | No |
| b-shirt Official Store | Footer | `https://tokopedia.com` | `global_shop_url` | Wrong place | **Misleading** — label promises the store | No |
| TikTok / @b_shirt_co | Header (≥640px), footer | `https://www.tiktok.com/@b_shirt_co` | same | Yes (URL correct; live page NOT VERIFIED — no navigation performed) | Yes | Yes |
| Chat Admin (FAB) | Fixed bottom-right | `wa.me/6282230089520?text=…bertanya tentang produk…` | `wa.me/6282230089520?text=…bertanya mengenai produk…` | Number correct; **message text differs from PRD** ("tentang" vs "mengenai") | Yes | Yes |
| Konsultasi Ukuran | Trust banner | `wa.me/…?text=…konsultasi ukuran produk.` | Not in PRD | Number correct | Implies size service (unverified) | Yes |
| 082230089520 | Footer | `https://wa.me/6282230089520` (no text, same tab) | same config as FAB | Number correct | OK | Inconsistent behaviour |
| Koleksi Cowok/Cewek pills & nav | Intro, header (≥768px) | `#area-cowok`, `#area-cewek` | same | Yes (verified: heading lands 20px below header) | Yes | Yes |
| Katalog Lengkap | Header | `#` | Not in PRD | Scrolls to top | Vague | — |
| Cara Order Tokopedia | Header | `#tentang-kami` | Not in PRD | **Broken** (no such id) | No | No |

**CRO recommendations (impact ↓ / effort):**
1. Real purchase URL + per-product override support — *highest impact, low effort once URL known.*
2. Products visible in first viewport on 390px — *high / low.*
3. Real photography, one image per product — *high / medium (owner supplies).*
4. Single truthful status + status-aware WhatsApp microcopy — *high trust / low.*
5. Replace "Beli Sekarang ↗" with "Beli di Tokopedia" (tells the user they will leave) — *medium / trivial.*
6. Sticky compact Cowok/Cewek switch — *medium / low.*
7. Remove all unsupported claims (honesty beats invented urgency) — *trust / trivial.*
No numeric uplift is predicted; PRD KPIs (Shop CTR 25–35%) are targets and need analytics instrumentation (not present) before any claim.

### 5.4 Fashion Art Director

- **Does it look like a real fashion brand?** It looks like a well-made *template*. Uppercase "B-SHIRT" in Plus Jakarta Sans bold, black pill buttons, M3 lilac-grey surfaces (`#f9f9ff`, `#e7eefe`) and pulse dots are the default Stitch/AI-commerce look. Nothing is ownable.
- **Photography:** generated, studio-perfect models in a style the real WhatsApp product photos (per PRD filenames, likely phone shots) will not match. Switching to real photos later will make the layout look broken unless the art direction is designed *for* the real photos now.
- **Consistency:** cw-01 appears as two different men; ce-01 as two different women; ce-02 as two different trousers. A shopper comparing sections will think these are different products.
- **Crop:** 6 of 12 sources are landscape (512×279) in 3:4 frames → heavy side cropping; the website-screenshot image proves nobody looked at the crops.
- **Featured product:** ce-01 is "featured" only by a magenta badge and a "Paling Diminati" (unverified) pill; on mobile it is the same tall card as everything else.
- **Collection colours:** the pale blue/pink tints are correctly restrained (PRD), but the cards inside are white with tinted borders, so the tint only shows in gutters — fine. The red promo colour (`#bb0112`) competes with the Cewek magenta in the same section.
- **Generic AI patterns identified:** eyebrow + dot + label above every heading ("Koleksi Terkini •", "Dedicated Ambiance •", "Standard Pelayanan"); icon-in-circle 4-pillar trust grid; pill everything; pulse "live" dots; English marketing filler ("Curated contemporary apparel crafted for Indonesian silhouettes"); "Secure Bridge to … Ecosystem" footer slogan.

### 5.5 Design System Architect

| DESIGN.md token | Value | Implementation | Status |
|---|---|---|---|
| `--color-bg` | `#FFFFFF` | Body uses `bg-surface` `#f9f9ff` (lilac tint) | Mismatch |
| `--color-text` | `#111827` | `on-surface` `#151c27` / `primary` `#000000` | Mismatch (close) |
| `--color-muted` | `#6B7280` | `on-surface-variant` `#45464c` | Mismatch |
| `--color-price-original` | `#9CA3AF` | `outline` `#76777d` | Mismatch — and note DESIGN.md's own value **fails contrast (2.54:1)** |
| `--color-promo` | `#DC2626` | `secondary` `#bb0112` | Mismatch |
| `--color-new-bg` | `#111827` | `primary` `#000000` | Mismatch (close) |
| Men / Women tints, borders, accents | PRD values | Inlined arbitrary values | Values match; not tokenised |
| Typography | "Choose one primary family" | Both Inter **and** Plus Jakarta Sans + Material Symbols | Mismatch |
| Spacing | 4px scale | Mix of token names (`space-md`) and raw Tailwind (`py-2.5`, `p-3`, `gap-1.5`) | Inconsistent |
| Radius | Shared tokens | `DEFAULT 0.125rem`, `lg 0.25rem`, `xl 0.5rem`, `full 0.75rem` (so `rounded-full` ≠ pill) | Confusing |
| Grid gaps | 12 / 16 / 20px | `gap-3` (12) mobile, `gap-space-md` (16) everywhere else; no 20px | Partial |
| Shadows | "only where they improve separation" | 6 distinct arbitrary shadows incl. tinted ones | Over-used |
| Container | 1140px | Sections 1140px, header/footer `max-w-7xl` (1280px) | Misaligned edges at ≥1280px |

**Components that should exist** (currently duplicated markup): `PromoBar`, `StatusBadge` (single source), `Header` + `CollectionSwitch`, `SectionHeader`, `ProductCard` (variants: `default`, `featured`), `PriceBlock`, `Badge` (`new`, `discount`), `BuyButton`, `WhatsAppFab`, `Footer`. Today there are **5 visually different product card variants** for one data shape.

### 5.6 Interaction & Motion

| Motion | Where | Classification | Verdict |
|---|---|---|---|
| Smooth anchor scroll (JS + `scroll-smooth`) | Jump pills, nav | Navigation assistance | Keep, but respect reduced motion; compute offset from real header height (hardcoded 96 vs actual 144 mobile / 108 desktop) |
| Card hover border + shadow | All cards | Functional feedback (pointer) | Keep, simplify to one shadow |
| Image `scale-105` over 500ms | All cards | Visual enhancement | Optional; shorten to ~200ms, disable on touch & reduced motion |
| `animate-pulse` status dots | Promo bar, capsule, online state | Unnecessary decoration (and misleading: pulses even when hardcoded) | Remove |
| FAB `hover:-translate-y-0.5` | WhatsApp | Visual enhancement | Fine; add `:active` pressed state |
| Pressed/tap states | — | Missing | Add `:active` to all CTAs (DESIGN.md §9 requires) |
| Focus states | Only on buy buttons (`focus:ring-2`) | Partial; logo explicitly removes outline | Add `:focus-visible` globally |
| Reduced motion | — | **Absent** | Required by SRS 6.3 |

### 5.7 Mobile Experience (tested in browser pane, Chromium device emulation)

| Width | Overflow | Fixed chrome | Notes |
|---|---|---|---|
| 360 | none | 144px | Strikethrough price clipped; FAB covers right-column CTA |
| 375 / 414 / 430 | NOT VERIFIED individually (behaviour inferred from 360/390 CSS — same breakpoints) | — | Re-test after fixes |
| 390 | none | 144px (main padding only 112px → 32px hidden) | First product at ~696px; Cowok 1-col; ce-01 tall single card |
| 768 | none | 108px | Header labels wrap to 2–3 lines; logo breaks; 4-col grid (spec 3) |
| 1024 / 1440 | NOT VERIFIED | — | |
| 1280 | none | 108px | Cowok section uses only ~60% width; header container 1280 vs content 1140 |

**TikTok in-app browser: NOT VERIFIED** (no device available). Known risks from code: Tailwind Play CDN executes in the browser before styles exist (flash of unstyled content on slow 4G); three Google Fonts requests; `overscroll-behavior:none` on body and hidden scrollbars (`::-webkit-scrollbar{display:none}`) can fight the in-app browser's own gestures; `100vh`-style `min-h-screen` on `<main>`.

### 5.8 Accessibility (WCAG 2.2 AA) — exact failures

| Element | Failure | WCAG | Correction |
|---|---|---|---|
| 12 product `<img>` (L64, L95, L126, L157, L212, L245, L302, L339, L369, L396, L426) | No `alt` attribute (text placed in `data-alt`) — screen readers announce file name/URL | 1.1.1 | `alt="{product name}"`; decorative duplicates `alt=""` |
| Header avatar, footer logo | Broken image; alt "Profile" meaningless | 1.1.1 | Remove avatar; logo `alt="b-shirt"` |
| 20 targets < 44px (e.g. Beli Sekarang 148×32–36, jump pills 145×40, FAB 128×36, footer links ~15px tall) | Below project NFR 44×44 (WCAG 2.5.8 minimum 24px passes, project rule fails) | 2.5.8 + NFR-04 | min-height 44px |
| Logo link (L4) | `focus:outline-none`, no replacement | 2.4.7 | `focus-visible` ring |
| Material Symbols spans ("chat", "check_circle", "storefront"…) | Ligature text read aloud ("chat Chat Admin") | 1.1.1 / 4.1.2 | `aria-hidden="true"` |
| Status dots | Colour conveys state (text exists in capsule, so partial) | 1.4.1 | Keep text; add icon/shape difference |
| Status capsule | Updates every 60s silently | 4.1.3 | `role="status"` |
| Strikethrough price `#76777d` on white, 12px | **4.46:1** < 4.5 | 1.4.3 | Darken to `#6B7280` (4.83:1) |
| DESIGN.md `--color-price-original #9CA3AF` | **2.54:1** — the spec itself would fail | 1.4.3 | Update DESIGN.md |
| Strikethrough meaning | Visual only | 1.3.1 | Visually hidden "Harga normal" / "Harga promo" |
| `<html lang="id">` but English UI strings mixed | Partial language mismatch | 3.1.2 | Translate or `lang="en"` on English fragments |
| Discount badge "-29%" | Read as "minus 29 percent" | Advisory | `aria-label="Diskon 29%"` |
Passing: landmarks present; heading order valid; contrast of accents and body text passes (cowok 10.57:1, cewek 7.18:1, muted 8.56:1, white on red 6.72:1, closed-status amber 6.40:1). Keyboard order: NOT fully verified with a screen reader.

### 5.9 Senior Frontend / Performance — summary
See [TECHNICAL_AUDIT.md](TECHNICAL_AUDIT.md). Headlines: Tailwind Play CDN in production path; no data layer; duplicated product markup; broken private image URLs; no metadata; JS timezone parsing via `new Date(toLocaleString())` (works in tested Chromium, fragile by spec); fixed scroll offset. **Lighthouse/Core Web Vitals were NOT measured** under the PRD's 4G condition; the only numbers taken were on unthrottled localhost with warm cache (LCP 336ms, CLS 0.000) and are not representative.

### 5.10 QA — reproducible defects
1. Open at 390px between 17:00 and 08:00 WIB (or Sunday) → bar says "Admin Online", capsule says closed.
2. Tap any "Beli Sekarang" → lands on tokopedia.com homepage.
3. At ≥768px tap "Cara Order Tokopedia" → nothing happens.
4. Scroll to Koleksi Cowok at 390px → first image shows a cropped website with "$289".
5. Load any page → header avatar and footer logo render as broken images.
6. Footer WhatsApp number opens without prefilled message, in same tab; FAB opens with a different message.

---

## 6. Content accuracy — product catalogue validation

| ID | Name ✓ | Gender ✓ | NEW ✓ | Featured | Original ✓ | Promo ✓ | Discount shown | Formula | Image |
|---|---|---|---|---|---|---|---|---|---|
| cw-01 | ✓ | ✓ | ✓ | ✓ (no) | 349.000 | 249.000 | 29% | 28.65→29 ✓ | AI, 2 different; Cowok one corrupted |
| cw-02 | ✓ | ✓ | ✓ | ✓ | 229.000 | 169.000 | 26% | 26.20→26 ✓ | AI, 2 different |
| ce-01 | ✓ | ✓ | ✓ | ✓ (yes) | 269.000 | 189.000 | 30% | 29.74→30 ✓ | AI, 2 different |
| ce-02 | ✓ | ✓ | ✓ | ✓ | 179.000 | 129.000 | 28% | 27.93→28 ✓ | AI, 2 different |
| ce-03 | ✓ | ✓ | – ✓ | ✓ | 189.000 | 139.000 | 26% | 26.46→26 ✓ | AI |
| ce-04 | ✓ | ✓ | – ✓ | ✓ | 249.000 | 179.000 | 28% | 28.11→28 ✓ | AI |
| ce-05 | ✓ | ✓ | – ✓ | ✓ | 259.000 | 185.000 | 29% | 28.57→29 ✓ | AI |

Counts: total 7 ✓, New Arrivals 4 ✓, Cowok 2 ✓, Cewek 5 ✓, featured ce-01 ✓ (but "FEATURED" badge also shown in New Arrivals, which the spec does not require).
Rupiah format: rendered `Rp249.000` (no space). DESIGN.md §6.7 example is `Rp 189.000` (with space); `Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'})` produces `Rp 249.000` with a non-breaking space. **Ambiguity to resolve** — pick one and use the formatter.
Image ↔ asset mapping: **cannot be verified** — the PRD lists 7 filenames but the PRD table that maps filename → product ID is not present in the workspace PRD (DESIGN.md §7 says "Map each filename to the corresponding ID exactly as shown in PRD"; the PRD has no such mapping). **Clarification required.**

---

## 7. External links

| Link | Expected | Found | Status |
|---|---|---|---|
| Shop | full `global_shop_url` | `https://tokopedia.com` | ❌ P0, and source value missing |
| WhatsApp FAB | `https://wa.me/6282230089520?text=Halo%20Admin%20b-shirt%2C%20saya%20ingin%20bertanya%20mengenai%20produk%20di%20katalog%20web.` | same but `tentang` instead of `mengenai` | ⚠ P1 |
| WhatsApp footer | same as FAB | no text, no target | ⚠ P1 |
| TikTok | `https://www.tiktok.com/@b_shirt_co` | identical (header + footer) | ✓ string verified; live profile NOT VERIFIED |
| Instagram / address | must not exist | none found | ✓ |

---

## 8. What to retain

- Section order and anchor IDs.
- Correct prices, discounts and counts.
- PRD collection colours (as tokens).
- `Asia/Jakarta` status rule (08:00 ≤ t < 17:00, Mon–Sat) — move to a shared function.
- `rel="noopener noreferrer"` on new-tab links.
- 3:4 image frames with `object-fit: cover` and top/center positions (cw-01 `top` matches DESIGN.md; ce-01 is `center` in the code but DESIGN.md says `top` → fix).
- No-overflow layout and zero CLS behaviour.

---

## 9. Claim register

| Claim (location) | Classification | Action |
|---|---|---|
| "Ready Stock" (L12) | Unverified | Remove |
| "harga transparan", "pemesanan langsung via Tokopedia" (L18) | Supported (prices shown; purchases via Tokopedia) | Keep, rephrase |
| "material nyaman, dan potongan proporsional" (L18) | Unverified | Remove |
| "Update Musim Ini" / "Kurasi produk terbaru musim ini" (L50, L53) | Unverified (no season concept in PRD) | Remove or replace with "Produk terbaru" |
| "potongan spesial hingga 30%" (L53) | Supported by data (max discount 30%) | Keep — but derive from data |
| "4 Desain Rilis Terbaru" (L56) | Supported (count) | Derive from data |
| "Bahan katun dingin & jahitan presisi" (L204) | Unverified | Remove |
| "material hangat namun bernapas" (L227) | Unverified | Remove |
| "Katun combed 24s … denim washed premium" (L260) | Unverified, specific spec | Remove |
| "Drape jatuh halus & siluet flattering" (L294) | Unverified | Remove |
| "Paling Diminati" (L315) | Unverified popularity claim | Remove |
| "vest rajut premium … celana kulot lipit bertekstur" (L321) | Partly from name; "premium" unverified | Remove descriptions or limit to name |
| "nuansa Parisian santai" (L408), "bolero crochet berbobot ringan" (L438) | Unverified | Remove |
| "Berbelanja aman" (L478) | Unverified | Remove |
| "checkout, verifikasi pembayaran, dan logistik ekspedisi terjamin" (L488) | **Contradictory** to PRD Open Decision #4 (must not imply guarantee beyond platform) | Replace: "Transaksi dilanjutkan di Shop \| Tokopedia" |
| "konsultasi panduan ukuran, detail bahan, ketersediaan model" (L498) | Unverified service scope | Replace with "tanya produk ke Admin via WhatsApp" |
| "Respon cepat dan proses pengiriman terjadwal setiap hari kerja" (L508) | Unverified delivery promise | Remove |
| "Minggu & Libur Nasional: Offline" (L591) | Holiday part unverified and not implemented | Keep "Minggu: tutup"; drop holiday unless owner confirms |
| "100% Online Store", "tanpa gerai fisik" | Verified (PRD §1) | Keep |
| "Secure Bridge to Tokopedia Official Ecosystem", "Official Tokopedia … Official Store", "official shop Tokopedia" | Unverified — implies Tokopedia "Official Store" status which the PRD never states | Remove "Official Store" wording unless confirmed |
| "Curated contemporary apparel crafted for Indonesian silhouettes" (L591) | Unverified | Remove |
| "© 2024 b-shirt Indonesia" | Contradictory (year; legal entity name unverified) | Use current year, "b-shirt" |
| "Admin Tokopedia Aktif" (L560) | Contradictory (admin is WhatsApp, not Tokopedia) | Remove |

---

## 10. Open questions for the owner (blocking or ambiguous)

1. **Full Shop | Tokopedia URL** (exact, with query parameters). Is it a shop URL or will each product get its own URL?
2. **Seven product photos + logo files** and the filename → product-ID mapping.
3. Is the "12.12 SALE" banner active for launch, and when does it start/stop?
4. Is b-shirt's Tokopedia shop an "Official Store" (Tokopedia badge) or a regular/Power Merchant shop? Copy must match.
5. Public holidays: should admin be offline on Indonesian national holidays? If yes, who maintains the list?
6. Rupiah format with or without space ("Rp249.000" vs "Rp 249.000").
7. Is the uploaded `WhatsApp Image 2026-11-24 at 19.32.39.jpeg` in Stitch the official logo?
