# SRS — b-shirt Fashion Retail Redesign

**Version:** 2.0  
**Basis:** PRD v3.0 and original b-shirt PRD v2.0  
**System:** Responsive single-page fashion catalog / external commerce bridge

## 1. Purpose and scope

This SRS defines implementation-level requirements for the redesigned b-shirt catalog. The system presents products and collections and directs customers to Shop | Tokopedia. It provides WhatsApp support and a TikTok profile link. It does not process orders or payments.

## 2. System context

### 2.1 Users
- TikTok-origin mobile visitor.
- Customer browsing Wanita/Pria collections.
- Customer seeking WhatsApp assistance.

### 2.2 Runtime targets
- TikTok In-App Browser Android/iOS.
- Chrome Mobile.
- Safari iOS.
- Current desktop browsers.

### 2.3 Constraints
- Online-only store; no physical address.
- No cart, internal checkout, login, payment gateway, shipping calculator, or order tracking.
- Product data is canonical and separate from presentation.
- All time calculations use `Asia/Jakarta`.

## 3. Functional requirements

### SYS-FR-001 — Announcement bar
Inputs: `promo_banner.active`, `event_label`, `text`.
- Render only when active is true.
- Use configured content.
- Wrap safely on narrow screens.
- No marquee, flashing, or forced animation.
Acceptance: active/inactive behavior works; no overflow at 360px.

### SYS-FR-002 — Operating status
Configuration:
- Timezone `Asia/Jakarta`.
- Days open Monday through Saturday.
- Start 08:00 inclusive.
- End 17:00 exclusive.
Rules:
- Monday–Saturday 08:00:00 through 16:59:59: `Admin Online`.
- Before 08:00, 17:00 onward, and Sunday: `Di Luar Jam Operasional`.
- Visible hours label: `Senin–Sabtu, 08.00–17.00 WIB`.
- All status components use one shared function.
Acceptance: boundary tests 07:59, 08:00, 16:59, 17:00 and Sunday pass; device timezone does not affect result.

### SYS-FR-003 — Header and retail navigation
- Render official b-shirt logo.
- Provide valid anchors for Wanita, Pria and New Arrivals.
- Render Sale navigation only if a Sale section is present.
- Sticky behavior must not obscure anchors.
- Keyboard and touch activation required.
Acceptance: all navigation targets resolve and headings remain visible.

### SYS-FR-004 — Editorial campaign
- Use approved b-shirt assets only.
- No generated/stock fashion imagery replacing actual products.
- CTA must point to a real section anchor.
- Campaign copy must be approved and must not invent product claims.
- Provide responsive image crop/art direction.
Acceptance: CTA works; no missing/fake asset; mobile composition remains legible.

### SYS-FR-005 — Category discovery
- Render two category discovery items: Wanita and Pria.
- Use actual product imagery as previews.
- Link to `#area-cewek` and `#area-cowok` respectively.
Acceptance: correct target and accessible labels.

### SYS-FR-006 — New Arrivals
- Derive from canonical product array where `is_new === true`.
- Initial count = 4.
- Do not maintain a duplicated manual list.
- Product may also appear in its full collection.
Acceptance: changing `is_new` updates New Arrivals automatically.

### SYS-FR-007 — Sale/Promo collection
- Eligible if `promo_price` is numeric, non-negative, and lower than `original_price`.
- Omit section if no eligible products.
- Never infer best seller, low stock, urgency, or limited availability.
Acceptance: only eligible products appear.

### SYS-FR-008 — Wanita collection
- Anchor ID `area-cewek`.
- Filter `gender === "cewek"`.
- Initial count = 5.
Acceptance: every matching product appears exactly once.

### SYS-FR-009 — Pria collection
- Anchor ID `area-cowok`.
- Filter `gender === "cowok"`.
- Initial count = 2.
Acceptance: every matching product appears exactly once.

### SYS-FR-010 — Product card
Required fields:
- `id`, `name`, `gender`, `is_new`, `is_featured`
- `original_price`, `promo_price`
- `image`, `image_position`, `product_url`

Display:
- Actual product image, source ratio/crop respected.
- NEW badge only if `is_new`.
- Discount badge only if valid promo.
- Product name, original price (if valid promo), promo price.
- One clear purchase action.
- Avoid nested links/buttons and ambiguous click areas.
Acceptance: all seven products render with correct data and accessible action labels.

### SYS-FR-011 — Pricing
Discount formula:
`Math.round(((original_price - promo_price) / original_price) * 100)`

Validation:
- Both prices numeric and non-negative.
- `original_price > 0`.
- Promo must be lower than original to show discount.
- Rupiah display uses Indonesian locale, e.g. `Rp249.000`.
Acceptance: all discounts match source data; invalid pricing does not produce NaN or misleading badges.

### SYS-FR-012 — Purchase redirect
Resolution:
```js
const destination = product.product_url ?? site_config.global_shop_url;
```
- Preserve exact destination string and query parameters.
- Open in a new tab/window where supported.
- `target="_blank"` requires `rel="noopener noreferrer"`.
- Never fallback to Tokopedia homepage.
- If URL missing/invalid, disable action and expose a controlled configuration error.
Acceptance: verify exact final href for every card.

### SYS-FR-013 — WhatsApp support
- Number: `6282230089520`.
- Base: `https://wa.me/6282230089520`.
- Default message: `Halo Admin b-shirt, saya ingin bertanya mengenai produk di katalog web.`
- Encode message once.
- Footer and floating actions use the same config.
Acceptance: correct number and message open.

### SYS-FR-014 — TikTok
- URL: `https://www.tiktok.com/@b_shirt_co`.
Acceptance: footer link resolves to official profile.

### SYS-FR-015 — Footer and service information
- State online-only store.
- Explain transaction continues through Shop | Tokopedia.
- Show operating hours and WhatsApp.
- Do not add physical address, map, Instagram, unsupported guarantee or fake trust badges.
Acceptance: all claims trace to approved business information.

## 4. Data model

### 4.1 Site configuration

```json
{
  "site_config": {
    "brand_name": "b-shirt",
    "global_shop_url": "https://shop-id.tokopedia.com/view/product/1738719949914146085?encode_params=MIIBPwQMVRjyj0VLvm4f044-BIIBGw11YrlluB3RqJtuWA9PhVMnv5WvnmodUvqjJNeumWwMEFcT7o_5U8N0cWa_cndbg71YCQL5BFUaaP2u6QGMMvXU6AAVkACoZgWd9mP63KwGLQhkO73SodWMOIDGrqcgYB0aUlby8eNJ4SzYhTBWZqTu07tEg-AAx5WGtA4bUfiW5P8p3vf0slHOhAet8VTw946E-KulTj9S7IYoZcoHUp3MSdLkVhQ02oZO3im4hHaiiaTrniU_8n3pZ-BHQVRNRGrSzP-e2PtEK3nlLTEu17aTmrzd_-hYVulD7pIowMBiFsWvd-Q1W7I3yp_UUVC5jQ9haBH5whd7di-PrrgRQGP2cYNlwke55KnyFJTL8fptUz-4Tev7efdxShEEEIGP1O1LWB1tPHQhenUaU4o%3D",
    "whatsapp": {
      "display": "082230089520",
      "number": "6282230089520",
      "default_message": "Halo Admin b-shirt, saya ingin bertanya mengenai produk di katalog web."
    },
    "tiktok_url": "https://www.tiktok.com/@b_shirt_co",
    "operating_hours": {
      "timezone": "Asia/Jakarta",
      "days_open": [1, 2, 3, 4, 5, 6],
      "open_hour": 8,
      "close_hour": 17
    },
    "promo_banner": {
      "active": true,
      "event_label": "12.12 SALE",
      "text": "PROMO TANGGAL KEMBAR: Diskon hingga 30% untuk Koleksi Baru!"
    }
  }
}
```

### 4.2 Product schema

```json
{
  "id": "ce-01",
  "name": "Earth-Tone Knit Vest & Pleated Culotte Set",
  "gender": "cewek",
  "is_new": true,
  "is_featured": true,
  "original_price": 269000,
  "promo_price": 189000,
  "image": "/assets/products/ce-01-actual-file.webp",
  "image_position": "top",
  "product_url": null
}
```

The image path above is illustrative schema only. Implementation must map to the actual repository asset path; do not create a fake file reference.

### 4.3 Data integrity
- Product IDs unique.
- `gender` is `cowok` or `cewek`.
- `image_position` supports approved crop values.
- Product image exists.
- Prices numeric and non-negative.
- New Arrivals, Sale, and collection sections derive from canonical data.
- Product names and attributes remain as approved.

## 5. UI implementation requirements

- Use semantic HTML landmarks and heading order.
- Use a consistent token system from `DESIGN.md`.
- Use reusable components for header, campaign, category tile, product card, price display, status, footer and WhatsApp action.
- Do not duplicate URLs or business config in components.
- Use responsive image sizing and explicit dimensions/aspect ratio.
- Keep mobile and desktop composition intentionally designed.
- No heavy animation or unnecessary dependencies.

## 6. Non-functional requirements

### 6.1 Performance
- Lighthouse Mobile target >=90.
- LCP <=2.5s under agreed 4G test setup.
- Lazy-load below-fold images.
- Avoid layout shift.
- Optimize image sizes and use modern formats when supported.

### 6.2 Compatibility
Test widths: 360, 375, 390, 414, 430, 640, 768, 1024, 1280, 1440, 1920px.
Test TikTok in-app browser Android/iOS, Chrome Mobile and Safari iOS.
No horizontal page overflow.

### 6.3 Accessibility
- WCAG 2.2 AA target.
- Text contrast >=4.5:1.
- Keyboard navigation and visible focus.
- Minimum interactive target 44×44px.
- Descriptive alt text.
- `prefers-reduced-motion`.
- Do not convey state by color alone.

### 6.4 Security
- `noopener noreferrer` for external target blank links.
- Validate URL schemes/hosts.
- Do not insert untrusted HTML.
- No client-side secrets.

### 6.5 Maintainability
- Product data separate from UI.
- One source of truth for site config.
- Shared pricing and operating-hours functions.
- Reusable components and tokens.
- No duplicated business URLs.

## 7. Error and empty states

- Empty catalog: concise empty state; no fabricated products.
- Missing image: neutral placeholder and development warning.
- Missing purchase URL: disabled action with clear internal diagnostic; never generic redirect.
- Invalid price: no discount calculation.
- Inactive promo: hide announcement bar.
- Missing WhatsApp config: hide/disable support action and report configuration issue.
- Missing campaign asset: fall back to compact text-led campaign, not stock/generated apparel.

## 8. Test plan

### Functional
- Promo active/inactive.
- Operating status boundaries and Sunday.
- Header navigation.
- Category discovery anchors.
- New Arrivals derivation.
- Sale eligibility.
- Collection filtering/counts.
- Price formatting and discount calculation.
- Product URL override/global fallback.
- WhatsApp and TikTok destinations.

### Responsive
- All widths listed in section 6.2.
- Header wrapping/sticky behavior.
- Campaign crop and text contrast.
- Product grid.
- Floating WhatsApp overlap.
- Footer.

### Accessibility
- Keyboard-only flow.
- Screen-reader names.
- Focus visibility.
- Contrast.
- Reduced motion.
- Target sizes.

### Performance
- Lighthouse Mobile.
- LCP/CLS.
- Image payload and font loading.
- 4G throttling.

## 9. Acceptance criteria

Release is accepted when:
1. Seven approved products render.
2. Four New Arrivals render.
3. Five Wanita and two Pria products render.
4. All prices and discount calculations are correct.
5. All purchase links resolve to the exact approved URL or product override.
6. Campaign/category/navigation CTAs work.
7. WhatsApp and TikTok links work.
8. Operating status is correct in Asia/Jakarta.
9. No horizontal overflow at required widths.
10. TikTok in-app browser is tested.
11. No unsupported content or fabricated assets.
12. Accessibility and performance results are documented.
