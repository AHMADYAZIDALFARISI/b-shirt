# DESIGN.md — b-shirt Fashion Retail Redesign

**Version:** 2.0 — Retail editorial direction  
**Status:** Design source of truth for redesign  
**Reference benchmark:** UNIQLO Indonesia (principles and experience patterns only)  
**Product scope:** Single-page catalog and external Shop | Tokopedia bridge

## 1. Design mandate

Redesign b-shirt as a credible, contemporary fashion-retail storefront. The desired quality bar is informed by the clarity, product discovery, editorial merchandising, disciplined typography, and retail navigation of UNIQLO's website. This is not a pixel recreation.

**Translate principles, not identity.** Do not copy UNIQLO's logo, proprietary graphics, exact page composition, campaign assets, copy, iconography, or distinctive brand treatments. b-shirt must remain recognizably b-shirt.

The previous design direction is superseded where it conflicts with this document. In particular:
- Do not make pastel gender-colored full-width blocks the dominant visual identity.
- Do not make the page feel like a generic small-business landing page.
- Do not use a large abstract hero, gradients, glassmorphism, decorative blobs, oversized rounded cards, or dashboard-style components.
- Do not add shopping capabilities that are outside the approved MVP.

## 2. Product truth and constraints

b-shirt is an online-only fashion store. Main acquisition comes from TikTok profile `@b_shirt_co`. The website is a catalog and purchase bridge; transactions continue on Shop | Tokopedia.

Keep:
- b-shirt brand and official logo asset.
- Seven supplied product images and approved product names/prices/flags.
- Product purchase redirect to the exact configured Shop | Tokopedia URL.
- WhatsApp Admin `082230089520`, `https://wa.me/6282230089520`.
- TikTok profile `https://www.tiktok.com/@b_shirt_co`.
- Operating hours Monday–Saturday, 08.00–17.00 WIB, timezone `Asia/Jakarta`.
- One-page experience unless product owner explicitly approves more pages.

Do not invent: product materials, sizes, colors beyond visible product evidence, availability, stock, shipping, returns, ratings, reviews, best-seller claims, guarantees, physical address, or payment methods.

## 3. Experience strategy

### Primary audience
Visitors arriving from TikTok, mostly on mobile and often inside an in-app browser.

### Core journey
1. Land and understand the brand/current campaign.
2. Identify a relevant shopping route: Wanita, Pria, New Arrivals, or Sale (only if sale products exist).
3. Scan fashion imagery and product information.
4. Open the product purchase destination on Shop | Tokopedia.
5. Contact WhatsApp if they need help.

### Experience principles
- **Retail first:** make browsing and merchandise discovery feel like a real fashion store.
- **Image-led:** use actual b-shirt product photography as the main visual content.
- **Editorial hierarchy:** campaign, category discovery, curated products, then complete collections.
- **Low-friction:** make the purchase handoff obvious and reliable.
- **Restraint:** strong layout, typography, scale and whitespace; minimal decoration.
- **Truthful merchandising:** no invented social proof or unsupported product claims.
- **Mobile-native behavior:** responsive, touch-friendly, fast, no hover-dependent functionality.

## 4. Information architecture

Recommended single-page sequence:

1. Optional announcement strip (only when campaign is active)
2. Header: b-shirt logo + navigation
3. Editorial campaign / seasonal feature
4. Category discovery: Wanita and Pria
5. New Arrivals
6. Sale / Promo selection (only when valid sale data exists; otherwise omit)
7. Wanita collection
8. Pria collection
9. Service / trust information
10. Footer
11. Floating WhatsApp support

The page may reorder category and product sections if prototype testing demonstrates a better mobile discovery flow, but campaign must not push the first useful product content excessively far below the fold.

### Navigation model
- Desktop: brand left; compact text navigation (Wanita, Pria, New Arrivals, Sale if available); WhatsApp/help can sit as a quiet utility action.
- Mobile: compact brand header and a horizontally scrollable or wrapped category navigation. No hamburger menu unless the final information architecture genuinely requires it.
- Use clear active/hover/focus states. Avoid pill-heavy navigation that resembles a SaaS filter toolbar.
- Navigation labels must match the available destinations and anchors.

## 5. Art direction

### Visual keywords
Modern everyday fashion, clean retail, editorial, confident, approachable, understated, product-led, contemporary Indonesian fashion brand.

### Composition
- Use a neutral canvas: white, warm off-white, charcoal, black, and restrained gray.
- Use large photographic areas with deliberate cropping and consistent aspect ratios.
- Use asymmetry sparingly: a campaign image may be wide or split-layout, while product grids remain disciplined.
- Use thin separators and whitespace instead of cards around every section.
- Keep text overlays legible and minimal.
- Campaign treatment should feel like a fashion editorial, not a SaaS hero.

### Campaign / hero rules
- Use supplied b-shirt product photography only. Do not replace product imagery with stock or generated apparel.
- If a suitable wide campaign asset does not exist, create an editorial composition from an existing product photo (crop/layout only) or use a restrained text-led campaign block. Do not fabricate a lifestyle campaign image.
- Copy must be short, natural Indonesian or concise brand English only if approved.
- CTA must lead to a real on-page collection anchor; no dead links.
- Avoid large blocks of marketing copy.
- On mobile, ensure the image and CTA remain visible without excessive scrolling.

### Color system
The previous pastel blue/pink collection backgrounds are no longer the dominant page treatment. Keep them only as optional, very subtle category cues if they improve wayfinding and remain visually quiet.

| Token | Value | Usage |
|---|---|---|
| `--color-white` | `#FFFFFF` | Main canvas |
| `--color-ink` | `#111111` | Main headings/body |
| `--color-charcoal` | `#262626` | Secondary dark surface |
| `--color-gray-700` | `#4B5563` | Secondary text |
| `--color-gray-500` | `#6B7280` | Metadata |
| `--color-gray-300` | `#D1D5DB` | Borders |
| `--color-gray-100` | `#F3F4F4` | Quiet surface |
| `--color-sale` | `#D71920` | Sale price/discount only |
| `--color-new` | `#111111` | NEW label |
| `--color-focus` | `#2563EB` | Accessible focus ring |
| `--color-women-tint` | `#F7F4F1` | Optional subtle category cue |
| `--color-men-tint` | `#F1F3F4` | Optional subtle category cue |

Do not introduce arbitrary accent colors. Do not use red for general CTAs; reserve it for actual sale information.

### Typography
Choose one family and use it consistently:
- Preferred: Inter or Plus Jakarta Sans (use whichever is already installed/loaded reliably).
- Headings: bold, concise, controlled line lengths.
- Body: 14–16px desktop, 13–15px mobile.
- Product names: 14–16px, medium/semibold.
- Promo price: 16–19px, bold.
- Original price: 12–14px, muted and struck through.
- Use tabular numerals for prices.
- Avoid ultra-light body text, excessive uppercase, and decorative display fonts.

### Spacing and geometry
Use a consistent 4px scale. Use generous section spacing but keep first product discovery close to the first viewport.
- Mobile page gutter: 16px.
- Tablet gutter: 24px.
- Desktop gutter: 32px.
- Desktop content max width: 1280px (campaign may use a wider container if composition requires it).
- Product grid gaps: 10–12px mobile, 16px tablet, 20–24px desktop.
- Product image ratio: 3:4 unless source photography needs a specific crop.
- Product images: square corners or restrained 2–4px radius; avoid card-like rounded frames.
- Buttons: clear rectangular or subtly rounded retail controls, minimum 44px touch height.

## 6. Page sections

### 6.1 Announcement bar
- Render only if `promo_banner.active === true`.
- Use a slim high-contrast strip; no marquee, flashing, or forced animation.
- Preserve current configurable event label and message.
- Keep operating status separate from the promo copy if both compete for space.
- Text wraps safely on 360px screens.

### 6.2 Header and navigation
- Use official b-shirt logo asset.
- Desktop header should feel like retail navigation, not app navigation.
- Mobile header must be compact and sticky only if it does not consume excessive viewport height.
- Links: Wanita, Pria, New Arrivals; Sale only when sale collection exists.
- If original data contract uses `cowok` and `cewek`, map labels at presentation layer; do not mutate canonical values.
- Use anchor offsets so sticky header never obscures section headings.

### 6.3 Editorial campaign
- One primary campaign composition only.
- Use existing product photography; no fabricated lifestyle assets.
- Campaign headline should be short and support the merchandise, not compete with it.
- CTA: `Lihat Koleksi` or similarly clear copy linked to a real section.
- Provide mobile-specific crop and text placement; never shrink desktop hero blindly.
- If no suitable image/copy is approved, use a smaller editorial intro rather than a fake campaign.

### 6.4 Category discovery
- Two clear category tiles/areas: Wanita and Pria.
- Use actual supplied product images as visual previews.
- Each tile links to its collection anchor.
- Do not imply additional category filters or stock.

### 6.5 New Arrivals
- Derived from canonical products where `is_new === true`.
- Show all four initial new products.
- Heading and count are clear.
- Desktop: 4-column grid where space allows.
- Mobile: 2-column grid; do not use autoplay.
- Product may also appear in its complete gender collection; duplication across sections is intentional.
- Do not add “just dropped” dates unless date data exists.

### 6.6 Sale / Promo
- Include only products with a valid promo price lower than original price.
- Do not call products “best seller” or “limited stock” without evidence.
- If every product has a discount, section can be labeled `Promo`; otherwise derive from actual eligible products.
- If no eligible products, omit section.

### 6.7 Gender collections
- Keep all canonical products in the appropriate collection.
- Display full collection count.
- Use neutral backgrounds; optional subtle tint may differentiate Wanita/Pria.
- Avoid the old full-bleed pink/blue blocks.
- Use a consistent product grid.

### 6.8 Product card
Required:
- Actual product image.
- NEW badge if `is_new`.
- Discount badge only if valid.
- Product name (maximum two lines where practical).
- Original price when promo is valid.
- Promo/current price.
- One clear purchase action.
- Entire card may be clickable only if keyboard and screen-reader behavior remain clear; avoid nested interactive controls.

Do not invent colors, size selectors, ratings, wishlist, stock, or quick-add.

### 6.9 Service information and footer
- Clearly state online-only store.
- Explain purchase continues through Shop | Tokopedia.
- Show admin hours and WhatsApp.
- Link TikTok profile.
- No physical address, map, Instagram, unsupported guarantee, or fabricated trust badge.
- Avoid claims such as “100% secure” unless approved and substantiated.

### 6.10 Floating WhatsApp
- Secondary to shopping CTA.
- Must not cover product price, purchase buttons, cookie controls, or footer.
- Minimum 44×44px; accessible label.
- On small screens consider compact icon-only control with accessible text.

## 7. Product data and content

Use the existing seven canonical products; do not rename or rewrite product attributes without owner approval.

| ID | Collection | Product | Original | Promo | New | Featured |
|---|---|---|---:|---:|---|---|
| cw-01 | Pria | Korean Camel Oversized Coat & Turtleneck Look | 349000 | 249000 | Yes | No |
| cw-02 | Pria | Basic White Tee & Light-Wash Baggy Jeans | 229000 | 169000 | Yes | No |
| ce-01 | Wanita | Earth-Tone Knit Vest & Pleated Culotte Set | 269000 | 189000 | Yes | Yes |
| ce-02 | Wanita | Sky Blue Lace-Trim Wide Leg Trousers | 179000 | 129000 | Yes | No |
| ce-03 | Wanita | Ivory High-Waist Corduroy Wide Pants | 189000 | 139000 | No | No |
| ce-04 | Wanita | Black Midi Dress & Cream Cropped Cardigan Set | 249000 | 179000 | No | No |
| ce-05 | Wanita | Blush Floral Ruffle Dress & Crochet Bolero Set | 259000 | 185000 | No | No |

Initial counts: 7 total, 4 new, 2 Pria, 5 Wanita.

Asset filenames must be mapped from the original PRD / actual repository assets. Never fabricate paths. Existing `image_position` crop values (`top` / `center`) must be respected.

## 8. Responsive behavior

Test widths: 360, 375, 390, 414, 430, 640, 768, 1024, 1280, 1440, 1920px.

- Mobile: compact header, campaign crop tailored for portrait, category discovery tiles, two-column products.
- Tablet: balanced two/three-column layout depending on available width.
- Desktop: generous container, 4-column product grid, clear editorial composition.
- Never create horizontal page overflow. Horizontal scrolling is allowed only for intentionally scrollable navigation and must have visible affordance.
- Do not hide core content behind hover.

## 9. Interaction and motion

- Motion is purposeful and restrained.
- Hover: subtle image treatment or underline; never required to understand content.
- Pressed: immediate tactile feedback.
- Navigation: smooth anchor scroll unless `prefers-reduced-motion`.
- Image reveal: optional short opacity transition; avoid staggered animation that delays content.
- No autoplay carousel, scroll hijacking, parallax, cursor effects, or animated gradients.
- Respect `prefers-reduced-motion: reduce`.

## 10. Accessibility

- WCAG 2.2 AA target.
- Text contrast >=4.5:1 for normal text.
- Visible keyboard focus.
- Semantic headings/landmarks.
- Meaningful image alt text based on actual product.
- All controls keyboard operable.
- Minimum target size 44×44px.
- Status must include text, not color alone.
- Do not use color alone to distinguish sale/new state.

## 11. Performance

- Prioritize first-screen campaign and product image loading.
- Use responsive images (`srcset`/`sizes`) where appropriate.
- Explicit width/height or aspect ratio to prevent CLS.
- Lazy-load below-the-fold images.
- Avoid heavy animation libraries and unnecessary client-side dependencies.
- Lighthouse Mobile target >=90; LCP <=2.5s under agreed 4G test conditions.
- Test in TikTok in-app browser Android/iOS, Chrome Mobile and Safari iOS.

## 12. Reference research and taste quality gate

Use these sources for targeted research, not wholesale copying:
- UNIQLO Indonesia: retail navigation, campaign merchandising, category discovery, editorial-to-product rhythm.
- Jiro: production-minded composition and layout references.
- Refero Styles: real product typography, color and spacing systems.
- Mobbin: real mobile shopping flows and navigation patterns.
- Design Spells: restrained micro-interactions.
- SupaHero: campaign/hero image-copy balance.
- Scrolltide: motion restraint and scroll behavior.
- Navbar Gallery: responsive retail navigation.
- Footer.design: compact service/footer hierarchy.
- CTA Gallery: action hierarchy.

**Taste-skills requirement:** the user requested `taste-skills`, but it was not present in the available installed skill registry at document preparation time. Claude Code must check the actual project environment for an installed skill with that exact name and read its instructions if found. If absent, report that it is unavailable; do not invent a substitute skill or claim it was applied. Continue using this document's quality gate.

### Mandatory design critique before implementation
Evaluate at least three materially different layout directions internally:
1. Editorial campaign-led retail.
2. Category-first retail.
3. Product-first compact storefront.

Select one and document why it best fits TikTok-origin traffic and seven-product catalog. Then produce desktop and mobile layouts and critique them against:
- Does it look like a real fashion retailer rather than a template?
- Is product discovery immediate?
- Is the campaign authentic to available assets?
- Are price and purchase actions obvious?
- Is the mobile first screen useful?
- Is the visual hierarchy consistent?
- Is any element decorative without purpose?

## 13. Definition of design done

- Desktop and mobile layouts are both intentionally designed.
- Real product assets are used.
- No invented content or unsupported claims.
- Product grid and pricing are consistent.
- Header/navigation destinations work.
- Visual hierarchy resembles a polished fashion retail experience without copying UNIQLO.
- No generic AI landing-page patterns.
- The page remains fast, accessible and usable inside TikTok's in-app browser.
