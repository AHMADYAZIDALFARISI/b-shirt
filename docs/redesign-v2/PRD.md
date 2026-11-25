# PRD — b-shirt Fashion Retail Redesign

**Version:** 3.0 — Proposed redesign  
**Baseline:** Original b-shirt PRD v2.0 dated 24 November 2026  
**Status:** Product scope preserved; visual merchandising direction revised

## 1. Product summary

b-shirt is an online-only fashion store. Its website is a mobile-first fashion catalog and commerce bridge for visitors arriving primarily from TikTok. Customers discover collections and products on b-shirt, then continue purchasing through Shop | Tokopedia. WhatsApp is available for customer assistance.

The redesign adopts a more mature fashion-retail experience inspired by general patterns observed in UNIQLO's retail website: clear shopping navigation, editorial merchandising, category discovery, consistent product presentation, and restrained visual hierarchy. It must not copy UNIQLO's brand assets, identity, proprietary content, or exact layouts.

## 2. Problem statement

The previous visual direction reads too much like a basic catalog/landing page and does not create a sufficiently polished retail experience. The redesign must improve:
- Perceived brand credibility.
- Product and category discovery.
- Campaign-to-product storytelling.
- Price scanning and purchase handoff.
- Mobile browsing quality for TikTok-origin visitors.

## 3. Goals

1. Present b-shirt as a contemporary fashion retail brand.
2. Make the first screen visually strong but still useful for shopping.
3. Help users navigate Wanita, Pria, New Arrivals and valid promotions.
4. Improve product comparison through consistent imagery, naming and pricing.
5. Preserve a one-click outbound purchase path to Shop | Tokopedia.
6. Maintain fast mobile performance and compatibility with TikTok in-app browser.
7. Keep all business information accurate and configurable.

## 4. Non-goals / out of scope

No internal cart, checkout, payment gateway, login/account, order tracking, shipping calculator, internal product detail pages, physical store locator, map, Instagram integration, fabricated reviews, wishlist, stock indicator, size selector, or unverified best-seller ranking.

No redesign of the Tokopedia destination or WhatsApp/TikTok services.

## 5. Target users

### 5.1 TikTok visitor
Arrives with limited attention, commonly on mobile. Needs a fast and visually understandable path into the catalog.

### 5.2 Fashion browser
Wants to scan apparel imagery, identify the relevant collection, compare price and promo, and decide which product to open.

### 5.3 Customer needing assistance
Needs a clear WhatsApp route and accurate operating-hour information.

## 6. Experience principles

- Fashion retail, not generic landing page.
- Editorial imagery with actual product assets.
- Clear navigation and category discovery.
- Product-first conversion path.
- Restrained neutral visual system.
- Truthful merchandising; no invented commercial claims.
- Mobile-first, touch-friendly and fast.

## 7. Revised information architecture

Recommended single-page order:
1. Optional campaign announcement bar.
2. b-shirt header and retail navigation.
3. Editorial campaign feature.
4. Category discovery (Wanita / Pria).
5. New Arrivals.
6. Sale/Promo selection when valid data exists.
7. Complete Wanita collection.
8. Complete Pria collection.
9. Service/trust information.
10. Footer and floating WhatsApp.

The precise ordering of New Arrivals and category discovery may be validated in prototype testing. Keep a useful product/category action within the first viewport or immediately after the campaign.

## 8. Functional requirements

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| FR-01 | Promo announcement | Renders only when `promo_banner.active === true`; uses configured event label and text; no marquee/flashing | P0 |
| FR-02 | Operating status | Uses `Asia/Jakarta`; Mon–Sat 08:00 inclusive to 17:00 exclusive = Admin Online; otherwise Di Luar Jam Operasional | P0 |
| FR-03 | Retail header/navigation | Official b-shirt logo; anchors for Wanita, Pria, New Arrivals; Sale only if valid promo section exists; all destinations work | P0 |
| FR-04 | Editorial campaign | Uses only supplied/approved b-shirt product imagery; CTA points to a real section; no fabricated campaign claims/assets | P0 |
| FR-05 | Category discovery | Two tiles for Wanita and Pria; use actual product images; link to corresponding collection anchors | P0 |
| FR-06 | New Arrivals | Derived from canonical products with `is_new === true`; initial count 4; all products included | P0 |
| FR-07 | Sale/Promo | Derived only from products with `promo_price < original_price`; omit if none; no unsupported urgency or stock claims | P1 |
| FR-08 | Wanita collection | Shows all products with `gender === "cewek"`; initial count 5 | P0 |
| FR-09 | Pria collection | Shows all products with `gender === "cowok"`; initial count 2 | P0 |
| FR-10 | Product cards/pricing | Correct image, name, NEW/discount state, original and promo prices, clear purchase action | P0 |
| FR-11 | Purchase redirect | Destination is `product.product_url ?? site_config.global_shop_url`; exact URL and query string preserved; target blank uses noopener noreferrer | P0 |
| FR-12 | WhatsApp | Uses configured number and default message; footer and floating action share one source of truth | P0 |
| FR-13 | TikTok | Footer links to official `@b_shirt_co` profile | P0 |
| FR-14 | Footer/trust information | Online-only status, Tokopedia transaction handoff, hours, WhatsApp and TikTok; no invented guarantees/address | P0 |
| FR-15 | Responsive behavior | No overflow at 360–430px; intentional tablet/desktop layouts | P0 |

## 9. Content and catalog baseline

The initial seven products and prices remain unchanged.

| ID | Collection | Product | Original | Promo | New | Featured |
|---|---|---|---:|---:|---|---|
| cw-01 | Pria | Korean Camel Oversized Coat & Turtleneck Look | Rp349.000 | Rp249.000 | Yes | No |
| cw-02 | Pria | Basic White Tee & Light-Wash Baggy Jeans | Rp229.000 | Rp169.000 | Yes | No |
| ce-01 | Wanita | Earth-Tone Knit Vest & Pleated Culotte Set | Rp269.000 | Rp189.000 | Yes | Yes |
| ce-02 | Wanita | Sky Blue Lace-Trim Wide Leg Trousers | Rp179.000 | Rp129.000 | Yes | No |
| ce-03 | Wanita | Ivory High-Waist Corduroy Wide Pants | Rp189.000 | Rp139.000 | No | No |
| ce-04 | Wanita | Black Midi Dress & Cream Cropped Cardigan Set | Rp249.000 | Rp179.000 | No | No |
| ce-05 | Wanita | Blush Floral Ruffle Dress & Crochet Bolero Set | Rp259.000 | Rp185.000 | No | No |

Initial totals: 7 products; 4 New Arrivals; 5 Wanita; 2 Pria. Discount percentages must be calculated from price data, not manually typed.

## 10. Business configuration

- Brand: `b-shirt`
- TikTok: `https://www.tiktok.com/@b_shirt_co`
- WhatsApp display: `082230089520`
- WhatsApp link: `https://wa.me/6282230089520`
- Operating hours: Monday–Saturday, 08.00–17.00 WIB
- Timezone: `Asia/Jakarta`
- Promo initial label: `12.12 SALE`
- Promo initial text: `PROMO TANGGAL KEMBAR: Diskon hingga 30% untuk Koleksi Baru!`
- Promo active state remains configurable.

### Global Shop | Tokopedia URL (preserve exactly)

```text
https://shop-id.tokopedia.com/view/product/1738719949914146085?encode_params=MIIBPwQMVRjyj0VLvm4f044-BIIBGw11YrlluB3RqJtuWA9PhVMnv5WvnmodUvqjJNeumWwMEFcT7o_5U8N0cWa_cndbg71YCQL5BFUaaP2u6QGMMvXU6AAVkACoZgWd9mP63KwGLQhkO73SodWMOIDGrqcgYB0aUlby8eNJ4SzYhTBWZqTu07tEg-AAx5WGtA4bUfiW5P8p3vf0slHOhAet8VTw946E-KulTj9S7IYoZcoHUp3MSdLkVhQ02oZO3im4hHaiiaTrniU_8n3pZ-BHQVRNRGrSzP-e2PtEK3nlLTEu17aTmrzd_-hYVulD7pIowMBiFsWvd-Q1W7I3yp_UUVC5jQ9haBH5whd7di-PrrgRQGP2cYNlwke55KnyFJTL8fptUz-4Tev7efdxShEEEIGP1O1LWB1tPHQhenUaU4o%3D
```

Do not decode, normalize, shorten, reconstruct, or re-encode this URL. Keep the exact query string. Product-level `product_url` override takes precedence when non-null.

## 11. Design requirements

See `DESIGN.md` for complete visual specification. Summary:
- Neutral black/white/gray retail palette.
- Editorial campaign composition using actual b-shirt assets.
- Strong category navigation.
- Clean product grids with consistent image ratio.
- Sale red reserved for real discounts.
- No full-bleed pastel gender blocks.
- No generic gradient hero, glassmorphism, 3D decoration, or dashboard cards.
- Responsive desktop and mobile compositions.

## 12. Non-functional requirements

### Performance
- Lighthouse Mobile target >=90.
- LCP <=2.5 seconds under agreed 4G test conditions.
- Lazy-load below-fold imagery.
- Explicit image dimensions/aspect ratio to reduce CLS.

### Compatibility
- TikTok In-App Browser Android and iOS.
- Chrome Mobile and Safari iOS.
- Mobile widths 360–430px; tablet and desktop breakpoints.
- No clipped buttons or horizontal page overflow.

### Accessibility
- WCAG 2.2 AA target.
- Normal text contrast >=4.5:1.
- Keyboard navigation and visible focus.
- Minimum touch target 44×44px.
- Reduced-motion support.
- Status is communicated by text, not color alone.

### Security
- External target blank links use `rel="noopener noreferrer"`.
- Validate allowed URL schemes/hosts.
- No secrets required in frontend.

## 13. Success metrics

Retain original KPI intent:
- Outbound Shop CTR target: 25–35% of website visitors from TikTok bio (instrumentation/analytics method must be agreed).
- WhatsApp inquiry route works in one action.
- Promo, price and `is_new` updates can be made through the data source without changing layout code.

Do not claim KPI achievement without analytics evidence.

## 14. Open decisions

These are implementation/design decisions, not new business assumptions:
1. Confirm whether the repository contains a wide campaign-ready image. If not, create an editorial crop from existing product photography or use a text-led compact campaign.
2. Confirm whether product cards should open the global Tokopedia destination or a per-product override; default rule is already specified.
3. Confirm whether a dedicated Sale section adds value given the initial catalog's price data; it may be omitted if it creates repetitive content.
4. Confirm the final mobile order using a clickable prototype and first-screen review.

## 15. Release acceptance

- All seven approved products and prices are correct.
- Four New Arrivals; five Wanita; two Pria.
- Category and campaign CTAs lead to real anchors.
- Every purchase action resolves to exact approved URL or product override.
- WhatsApp and TikTok links work.
- Operating status is correct at 07:59, 08:00, 16:59, 17:00 and Sunday.
- Responsive tests pass at required widths.
- No invented assets, product claims, social proof or store information.
- Accessibility and performance checks are recorded.
