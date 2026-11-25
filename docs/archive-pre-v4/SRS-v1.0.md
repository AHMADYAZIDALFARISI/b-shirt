# SRS — b-shirt Official Web Catalog

**Software Requirements Specification**  
**Version:** 1.0  
**Basis:** PRD b-shirt v2.0, 24 November 2026  
**System type:** Responsive single-page web catalog / external commerce bridge

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional, interface, data, integration, quality, and acceptance requirements for the b-shirt Official Web Catalog.

### 1.2 Scope
The system presents a catalog of fashion products and directs customers to Shop | Tokopedia. It also provides WhatsApp customer support and a TikTok profile link.

The system does not process orders or payments internally.

### 1.3 Definitions
- **Product:** A catalog item with identity, category, prices, image, and flags.
- **New Arrival:** Product with `is_new = true`.
- **Featured:** Product with `is_featured = true`.
- **Global shop URL:** Default external purchase destination.
- **Product URL override:** Optional per-product external destination.
- **WIB:** Western Indonesian Time, represented by `Asia/Jakarta`.
- **CTA:** Call to action.

### 1.4 Intended audience
Product owner, UI/UX designer, frontend developer, QA engineer, and future maintainer.

---

## 2. Overall Description

### 2.1 Product perspective
A single-page, responsive frontend. Product and site configuration data are maintained separately from presentation, initially through JSON or equivalent configuration.

### 2.2 User classes
1. TikTok visitor browsing new arrivals.
2. Customer comparing men's or women's products.
3. Customer seeking product assistance from the admin.

### 2.3 Operating environment
- TikTok In-App Browser on Android and iOS.
- Chrome Mobile.
- Safari iOS.
- Modern desktop browsers.
- Viewport range from 360px mobile through large desktop.

### 2.4 Constraints
- No physical store address.
- No internal cart, checkout, payment, login, or order tracking.
- All purchase actions go to configured Shop | Tokopedia destinations.
- No unsupported product claims.
- All time-based status uses `Asia/Jakarta`.

### 2.5 Assumptions and dependencies
- The owner supplies the official logo and seven actual product photos.
- The owner supplies/maintains the full Shop | Tokopedia URL.
- External Tokopedia, WhatsApp, and TikTok services are available independently of this website.
- Product data is valid and maintained by the owner.

---

## 3. System Features & Functional Requirements

### 3.1 Promo announcement (SYS-FR-001)
**Description:** Display a configurable announcement bar.

**Inputs:**
- `promo_banner.active`
- `promo_banner.event_label`
- `promo_banner.text`

**Rules:**
- Render only when `active === true`.
- Render configured label and text.
- No flashing or forced animation.
- Text must wrap safely on narrow screens.

**Acceptance:**
- Given `active` is true, the bar is visible with configured copy.
- Given `active` is false, the bar is not rendered.
- Text does not overflow at 360px viewport.

### 3.2 Operating status (SYS-FR-002)
**Description:** Show admin availability based on Jakarta time.

**Configuration:**
- Timezone: `Asia/Jakarta`.
- Days open: Monday through Saturday.
- Open hour: 08:00 inclusive.
- Close hour: 17:00 exclusive for status calculation.

**Rules:**
- Monday–Saturday 08:00:00 to 16:59:59: `Admin Online`.
- Before 08:00, from 17:00 onward, and all Sunday: `Di Luar Jam Operasional`.
- Display operating label: `Senin–Sabtu, 08.00–17.00 WIB`.
- All status displays must call the same shared status function.

**Acceptance:**
- Status is correct at boundary tests: 07:59, 08:00, 16:59, 17:00.
- Sunday always shows outside operating hours.
- Result does not change based on visitor's device timezone.

### 3.3 Sticky header and collection navigation (SYS-FR-003)
**Elements:**
- b-shirt logo.
- Cowok navigation.
- Cewek navigation.

**Rules:**
- Header remains sticky according to approved design.
- Cowok navigation targets `#area-cowok`.
- Cewek navigation targets `#area-cewek`.
- Smooth scrolling is used when reduced motion is not requested.
- Anchor target includes sufficient scroll offset for sticky header.

**Acceptance:**
- Each navigation action reaches the correct section.
- Heading is not obscured by sticky header.
- Keyboard users can activate both navigation items.

### 3.4 New Arrivals (SYS-FR-004)
**Rules:**
- Derive New Arrivals from the canonical product collection where `is_new === true`.
- Do not maintain a separate manually duplicated New Arrivals list.
- Display NEW badge on applicable product image.
- Display all four initial new products.

**Acceptance:**
- Initial count is four.
- Changing a product's `is_new` value changes New Arrivals automatically.
- No product appears twice within the same section due to filtering error.

### 3.5 Men's collection (SYS-FR-005)
**Rules:**
- Section ID `area-cowok`.
- Background `#EFF6FF`.
- Accent `#1E3A5F`.
- Border `#DBEAFE`.
- Filter products where `gender === "cowok"`.
- Display section heading and count.

**Acceptance:**
- Initial count is two.
- Every men's product appears exactly once in this collection.

### 3.6 Women's collection (SYS-FR-006)
**Rules:**
- Section ID `area-cewek`.
- Background `#FFF1F2`.
- Accent `#9D174D`.
- Border `#FCE7F3`.
- Filter products where `gender === "cewek"`.
- Display heading and count.
- On mobile, when collection count is odd, featured item spans two columns; if no featured item exists, first item may be used.

**Acceptance:**
- Initial count is five.
- `ce-01` is featured.
- At 360px and 390px, featured layout does not overflow and remaining cards form a balanced two-column layout.

### 3.7 Product card and pricing (SYS-FR-007)
**Required fields:**
- `id`
- `name`
- `gender`
- `is_new`
- `is_featured`
- `original_price`
- `promo_price`
- `image`
- `image_position`
- `product_url`

**Display rules:**
- Image ratio 3:4.
- `object-fit: cover`.
- `image_position` controls top/center crop.
- Product name maximum two lines.
- NEW badge only when `is_new` is true.
- Original price is struck through only when valid promo price is lower.
- Promo price is emphasized.
- Discount is rounded using the specified formula.

**Validation:**
- Prices must be numeric and non-negative.
- `original_price` must be greater than zero before calculating a percentage.
- A promo price equal to or above original price must not display a discount badge.
- Missing optional `product_url` falls back to global URL.

**Acceptance:**
- All seven products render with correct names and prices.
- Discounts are 29%, 26%, 30%, 28%, 26%, 28%, and 29% respectively.
- Rupiah formatting is consistent.

### 3.8 Purchase redirect (SYS-FR-008)
**Resolution:**
```js
destination = product.product_url ?? site_config.global_shop_url;
```

**Rules:**
- Use exact configured URL.
- Open new tab/window as specified by product behavior.
- Set `rel="noopener noreferrer"` for `target="_blank"`.
- Never replace missing configuration with a generic Tokopedia homepage.
- Preserve the full query string and encoded parameters.

**Acceptance:**
- Every product CTA resolves to the correct configured URL.
- If global URL is missing/invalid, show a controlled unavailable state or disable purchase action and flag configuration error; do not send customers to an unrelated destination.
- Verify outbound destination in browser testing.

### 3.9 WhatsApp support (SYS-FR-009)
**Base URL:** `https://wa.me/6282230089520`

**Default message:** `Halo Admin b-shirt, saya ingin bertanya mengenai produk di katalog web.`

**Rules:**
- URL-encode message.
- Floating action and footer link point to the same configured WhatsApp destination.
- Accessible label describes the action.

**Acceptance:**
- Link opens WhatsApp-compatible destination with correct number and message.
- Both footer and floating actions use the same configuration.

### 3.10 TikTok profile (SYS-FR-010)
**URL:** `https://www.tiktok.com/@b_shirt_co`

**Acceptance:**
- Footer TikTok link resolves to the official profile.
- No Instagram link is introduced.

### 3.11 Trust information and footer (SYS-FR-011)
**Rules:**
- State online-only store status.
- State that transactions continue through Shop | Tokopedia.
- Show operating hours and WhatsApp contact.
- Do not add unsupported guarantees, shipping claims, reviews, certifications, or physical address.

**Acceptance:**
- All displayed claims can be traced to verified business information.
- No unsupported marketing claims appear in the rendered page.

---

## 4. Data Requirements

### 4.1 Site configuration schema

```json
{
  "site_config": {
    "brand_name": "b-shirt",
    "logo_path": "/assets/logo-bshirt.webp",
    "global_shop_url": "<exact full URL from approved PRD>",
    "whatsapp": {
      "display": "0822-3008-9520",
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
  "id": "cw-01",
  "name": "Korean Camel Oversized Coat & Turtleneck Look",
  "gender": "cowok",
  "is_new": true,
  "is_featured": false,
  "original_price": 349000,
  "promo_price": 249000,
  "image": "/assets/products/cw-01-camel-coat.webp",
  "image_position": "top",
  "product_url": null
}
```

### 4.3 Data integrity rules
- Product IDs must be unique.
- `gender` must be `cowok` or `cewek`.
- `image_position` must be an allowed value (`top` or `center`) unless explicitly extended.
- Product image must exist.
- Product name must not contain unverified material/specification claims.
- Price values must be numeric.
- New Arrivals and collection sections are derived from product data.

---

## 5. External Interface Requirements

### 5.1 User interface
- Responsive single-page layout.
- Semantic HTML controls.
- Visible focus and pressed states.
- Product images with alt text.
- Minimum target size 44×44px.

### 5.2 External services
- Shop | Tokopedia: external purchase destination.
- WhatsApp: customer support.
- TikTok: official social profile.

No private API integration is required by this MVP.

### 5.3 Browser interface
Support current versions of:
- TikTok in-app browser (Android/iOS).
- Chrome Android.
- Safari iOS.
- Desktop Chrome/Safari/Edge equivalents.

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Lighthouse Mobile target >=90.
- LCP <=2.5s under the defined 4G test setup.
- Lazy-load below-the-fold images.
- Prevent layout shift with explicit dimensions/aspect ratio.
- Optimize images to WebP, width up to 800px, quality around 80 where visually acceptable.

### 6.2 Compatibility
- No horizontal overflow at 360–430px.
- Responsive behavior at 640, 1024, and desktop widths.
- Test TikTok in-app browser Android and iOS.
- Test Chrome Mobile and Safari iOS.

### 6.3 Accessibility
- WCAG 2.2 AA principles.
- Normal text contrast >=4.5:1.
- Keyboard access.
- Visible focus.
- Semantic landmarks.
- Descriptive alt text.
- Reduced motion.
- Minimum target 44×44px.

### 6.4 Security
- External links opened in new tabs must use `noopener noreferrer`.
- Avoid unsafe dynamic HTML insertion.
- Validate outbound URL scheme and host against expected destinations.
- Do not expose secrets; no secrets are required for this MVP.

### 6.5 Maintainability
- Product data separated from rendering.
- Shared design tokens.
- Reusable product card and section components.
- One operating-status calculation.
- No duplicated hardcoded destination URLs in components.

### 6.6 SEO and link previews
- Page title and description.
- Favicon.
- Open Graph title, description, and image.
- Meaningful semantic headings.

---

## 7. Business Rules

| ID | Rule |
|---|---|
| BR-01 | New Arrivals are products with `is_new === true`. |
| BR-02 | Men's section contains `gender === "cowok"`. |
| BR-03 | Women's section contains `gender === "cewek"`. |
| BR-04 | Featured product uses `is_featured === true`; for odd mobile grid without featured product, first item may span. |
| BR-05 | Discount is shown only if promo price is valid and lower than original price. |
| BR-06 | Product URL override takes precedence over global Shop URL. |
| BR-07 | All time calculations use `Asia/Jakarta`. |
| BR-08 | Admin Online applies Monday–Saturday from 08:00 inclusive to 17:00 exclusive. |
| BR-09 | No unverified product specifications or commercial guarantees may be displayed. |

---

## 8. Error & Empty States

- If product list is empty, show a concise empty catalog message; do not show fabricated products.
- If product image is missing, use a neutral branded placeholder and log/flag the missing asset.
- If purchase URL is missing, disable or clearly mark the purchase action unavailable; never redirect to a generic homepage.
- If promo configuration is inactive, omit announcement bar.
- If product pricing is invalid, do not calculate or display an incorrect discount.
- If WhatsApp number is missing, hide or disable the WhatsApp action and flag configuration error.

---

## 9. Test Specification

### 9.1 Functional tests
- Promo active/inactive.
- Operating status boundary times.
- Cowok/Cewek anchor navigation.
- New Arrivals filter.
- Collection filters.
- Featured odd-count layout.
- Discount calculations.
- Product URL override/fallback.
- WhatsApp URL and message.
- TikTok URL.

### 9.2 Responsive tests
Test viewport widths:
360, 375, 390, 414, 430, 768, 1024, 1280, 1440px.

Check:
- Horizontal overflow.
- Text wrapping.
- Sticky header.
- Product grid.
- Image crop.
- Floating WhatsApp overlap.
- Footer layout.

### 9.3 Accessibility tests
- Keyboard-only navigation.
- Focus visibility.
- Contrast.
- Screen reader names.
- Heading structure.
- Reduced-motion preference.
- Target size.

### 9.4 Performance tests
- Lighthouse Mobile.
- LCP and CLS.
- Image payload.
- Font loading.
- Network throttling / 4G simulation.

### 9.5 External link tests
- Verify full Tokopedia URL including encoded query parameters.
- Verify WhatsApp number and message.
- Verify TikTok profile URL.
- Verify `target` and `rel` attributes.

---

## 10. Acceptance Criteria for MVP Release

The MVP may be accepted when:

1. Seven correct products render.
2. Four products appear in New Arrivals.
3. Two products appear in Cowok.
4. Five products appear in Cewek.
5. ce-01 is featured.
6. All prices and discounts are correct.
7. Every purchase action uses the approved configured destination.
8. WhatsApp and TikTok links work.
9. Operating status is correct in Asia/Jakarta.
10. Mobile layouts work at 360–430px without horizontal overflow.
11. TikTok in-app browser compatibility is tested.
12. Accessibility checks have no unresolved critical failures.
13. Performance target is measured and documented.
14. No unsupported claims or fake product details appear.
15. All required metadata is present.

---

## 11. Traceability Matrix

| PRD requirement | SRS section |
|---|---|
| FR-01 Promo/status | 3.1, 3.2 |
| FR-02 Header/navigation | 3.3 |
| FR-03 New Arrivals | 3.4 |
| FR-04 Men's collection | 3.5 |
| FR-05 Women's collection | 3.6 |
| FR-06 Product card/pricing/redirect | 3.7, 3.8 |
| FR-07 WhatsApp/trust/footer | 3.9, 3.11 |
| Performance NFR | 6.1 |
| Compatibility NFR | 6.2 |
| Accessibility NFR | 6.3 |
| Link safety NFR | 6.4 |
| Metadata NFR | 6.6 |
