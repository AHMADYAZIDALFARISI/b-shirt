# BACKEND & DATA DECISION — upgrade v3

## Is a backend required? **No.**
Every requirement in PRD/SRS (v2 and v3) is met by static files:
- product browsing
- outbound Tokopedia links
- WhatsApp and TikTok links
- admin hours computed in the browser for `Asia/Jakarta`
- promo and campaign copy from configuration

There is no cart, checkout, login, stock, order or personal-data requirement. A server, database or serverless function would add cost, attack surface and an operator burden with no user-facing benefit, so none was added.

## What stays static
| Concern | Mechanism |
|---|---|
| Catalog and site config | `site/catalog.json`, the single source of truth |
| Validation | `build.mjs` fails the build on invalid data or a missing image file. `validateCatalog()` checks IDs, gender, prices, image_position and names. |
| Rendering | Pre-rendered at build (`js/lib/render.js`), re-used in the browser for dev |
| Admin status | `js/lib/status.js` uses `Intl` with `Asia/Jakarta`, Mon–Sat 08:00 ≤ t < 17:00, and fails closed |
| Purchase URL | `resolvePurchaseUrl` = `product.product_url ?? global_shop_url`. It requires https plus an allow-listed host (`shop-id.tokopedia.com`, `tokopedia.com`, `www.tokopedia.com`) and rejects the generic homepage. The string is used byte-for-byte. |

## Data update workflow
1. Edit `site/catalog.json` (prices, flags, promo, campaign, photos).
2. `node --test tests/*.test.js`
3. `node build.mjs` (validation runs here)
4. Upload `site/dist/`. `catalog.json` is cache-busted by content hash.

## Analytics
- **Event hook only; no provider is installed.** `js/lib/track.js` emits these events, pushed to `window.dataLayer` only if it exists, and always dispatched as a `bshirt:track` DOM event:

  | Event | Fields |
  |---|---|
  | `shop_click` | product_id, section, location |
  | `whatsapp_click` | location or product_id |
  | `tiktok_click` | location |
  | `collection_nav` (new in v3) | location: header / stage, plus section |
  | `scene_motion_toggle` (new in v3) | state: on / off |

- Events carry no personal data, no fingerprinting and no identifiers.

## Optional future recommendations (not implemented, owner decision)
- **Analytics:** GA4 through GTM, or a cookieless tool such as Plausible, if the owner wants to measure the PRD KPI (Shop CTR 25–35%). A consent banner may be needed depending on the tool.
- **CMS:** if non-technical editing becomes frequent, a Google Sheet or headless CMS could feed `catalog.json` at build time. Keep the same validation step.
- **Security headers:** at the static host, set a CSP such as `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'`.
  - `'unsafe-inline'` is currently needed for the inlined CSS, the `CATALOG_URL` inline script and the font `onload`. A hash-based CSP can replace it once the host is known.

## Privacy & security
- No secrets in the client.
- No cookies set by the site.
- No form or personal data collected.
- Third-party requests:
  - Google Fonts (CSS and font files)
  - outbound navigations the user starts (Tokopedia, WhatsApp, TikTok)
