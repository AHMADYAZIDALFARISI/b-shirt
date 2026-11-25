# TECHNICAL AUDIT — b-shirt Official Web Catalog (Stitch prototype)

**Artifact:** [audit/stitch-prototype-snapshot.html](audit/stitch-prototype-snapshot.html) (Stitch screen `cf40d3612da349f48a6304dd6dc07983`). `Lx` = line in that file.
**Test environment:** Claude desktop built-in browser (Chromium), device emulation at 360×780, 390×844, 768×1024 and 1280×800. The file was served from `http://127.0.0.1:8765` (a local copy in a scratch folder; the workspace was not touched).
**Not available:** real iOS/Android devices, the TikTok in-app browser, Lighthouse under 4G throttling, and screen readers. Anything that depends on these is marked **NOT VERIFIED**.

---

## 1. Architecture

| Item | State |
|---|---|
| Files | One HTML file, no external CSS/JS of its own |
| Styling | `https://cdn.tailwindcss.com` (Tailwind Play CDN: runtime JIT compiler in the browser) plus an inline `tailwind.config` with ~50 generated Material-3 colours (L4) |
| Fonts | Google Fonts: Inter 400–700, Plus Jakarta Sans 600–700, Material Symbols Outlined (**requested twice** with different axes, L3 and L4) |
| Images | 12 `lh3.googleusercontent.com/aida-public/…` (Stitch AI generations, publicly reachable) plus 2 `lh3.googleusercontent.com/aida/…` (private Stitch asset that **fails to load**: header avatar and footer logo) |
| Data | None. 7 products hand-written as 11 `<article>` blocks |
| JS | Inline IIFE (L526–590): operating status + anchor scroll |
| Build / deploy | None |

**Verdict:** a design mock, not an application. Production needs a rebuild. The easy route is plain HTML/CSS/JS with compiled Tailwind or hand-written CSS, rendered from `catalog.json`. The visual structure can be kept.

## 2. Code quality

| Issue | Evidence |
|---|---|
| Duplicated product markup with diverging content | cw-01, cw-02, ce-01, ce-02 each appear twice with different images, eyebrow labels, descriptions and button colours |
| 5 card variants for one data shape | New Arrivals vertical; Cowok 50/50 horizontal; Cewek featured horizontal; Cewek 3-col vertical; Cewek 6-col horizontal |
| Arbitrary values instead of tokens | 30+ `[#EFF6FF]`, `[#1E3A5F]`, `[#9D174D]`, `[#F472B6]`, `[#93C5FD]`, `text-[15px]`, `text-[10px]`, `text-[11px]`, 6 custom `shadow-[…]` |
| Token set unrelated to DESIGN.md | M3 names (`surface-container-highest`, `on-tertiary-fixed-variant` …), mostly unused |
| Radius tokens redefine meaning | `full: 0.75rem`, so `rounded-full` ≠ pill |
| Inconsistent focus styles | `focus:ring-2` on 7 of 11 buy buttons; none on ce-02/03/04/05 buttons (L359, L386, L416, L446); logo `focus:outline-none` |
| Inconsistent button padding | `py-2.5` vs `py-2` across Beli Sekarang buttons (36px vs 32px tall) |
| Dead attributes | `data-path`, `data-active-classes` (Stitch editor metadata), `data-alt` |
| Hidden scrollbars | `::-webkit-scrollbar{display:none}` globally (L4): removes a scroll-position cue on desktop |
| `overscroll-behavior:none` on body | Can interfere with pull-to-refresh and in-app browser gestures (NOT VERIFIED on device) |

## 3. Broken links & external destinations

| Link | Count | Issue |
|---|---:|---|
| `https://tokopedia.com` | 13 | Generic homepage. **P0.** The real URL is also missing from PRD §11 (placeholder) |
| `#tentang-kami` | 1 | Target id does not exist (`#tentang-bshirt`) |
| `#` (logo, "Katalog Lengkap") | 2 | Scroll-to-top; acceptable for the logo, vague for nav |
| WhatsApp FAB | 1 | Number correct; message text differs from PRD (`tentang` ≠ `mengenai`) |
| WhatsApp footer | 1 | No message, no `target`; different behaviour from the FAB |
| WhatsApp "Konsultasi Ukuran" | 1 | Third, different message; not in PRD |
| TikTok | 2 | Correct string; live page NOT VERIFIED |

All `target="_blank"` links have `rel="noopener noreferrer"` ✓ (NFR-03).

## 4. Data integrity

- **Prices & discounts:** all 7 correct; formula `Math.round(((o−p)/o)*100)` gives 29, 26, 30, 28, 26, 28, 29 ✓. Discounts are hardcoded strings, not computed, so the next price change can silently desync.
- **Counts:** 7 / 4 / 2 / 5 ✓; featured ce-01 ✓. All hardcoded (`2`, `5`, `2 Produk`, `5 Produk`, `4 Desain Rilis Terbaru`).
- **image_position:** cw-01 `top` ✓, cw-02 `center` ✓; **ce-01 is `center`, but DESIGN.md §7 says `top`** ✗.
- **Images:** not the PRD assets (see AUDIT_REPORT C4). Filename → product-ID mapping missing from the PRD.
- **Rupiah format:** `Rp249.000`; DESIGN.md example `Rp 189.000`. Ambiguous, so decide and use `Intl.NumberFormat`.
- **Operating status:** two sources (static bar L4 vs. JS capsule). **P0.**
- **Promo banner:** not configurable (no `active` flag); always rendered.

## 5. Operating-hours logic review (L529–566)

```js
const jakartaString = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
const jakartaDate = new Date(jakartaString);   // re-parses a locale string
```
- **Rule correct:** Mon–Sat (`getDay()` 1–6) and `hours >= 8 && hours < 17` matches SRS 3.2 (07:59 ✗, 08:00 ✓, 16:59 ✓, 17:00 ✗, Sunday ✗).
- **Fragile:** parsing the output of `toLocaleString` with `new Date()` is implementation-defined (it works in tested Chromium). Use `Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta', weekday:'short', hour:'numeric', hourCycle:'h23'}).formatToParts(now)` instead.
- **Fails open:** the `catch` shows "Admin Tokopedia Aktif" (online). It should show neutral hours text.
- **Single source violated:** the promo bar ignores the function.
- **Testability:** the function reads `new Date()` internally. Refactor to `getAdminStatus(date = new Date())` so boundary tests can inject times.
- Browser check: on Wed 25 Nov 2026 at 00:17 WIB the capsule correctly showed "Di Luar Jam Operasional".

## 6. Accessibility (engineering view)

| Fix | Elements |
|---|---|
| Add `alt` (product name) and drop `data-alt` | 12 product images |
| `aria-hidden="true"` on Material Symbols spans | 7 icon spans (L203, L293, L474, L484, L494, L504, L519, FAB) |
| `role="status"` on the status element | capsule |
| `:focus-visible` outline token, applied globally | all links/buttons; remove `focus:outline-none` |
| Minimum 44px targets | 20 measured under 44px at 390px |
| Darken strikethrough colour to ≥4.5:1 | `#76777d` measured at 4.46:1 |
| Visually hidden price labels | price blocks |
| `prefers-reduced-motion` | scroll-behavior, transitions, pulse |
| Remove `user-select`/scrollbar hiding | L4 |

## 7. Performance

**Measured (NOT representative; unthrottled localhost, warm cache, desktop CPU):** DOMContentLoaded 376ms, load 505ms, LCP 336ms (a `<p>` element), CLS 0.000. **Lighthouse Mobile and 4G LCP: NOT MEASURED.** PRD targets (≥90, ≤2.5s) remain unverified.

Risks found in code:
1. **Tailwind Play CDN:** a render-blocking script that compiles CSS at runtime. It is unsuitable for production and is the largest single risk to LCP on mid-range Android over 4G.
2. **4 font stylesheets** (2× Material Symbols, which is a large variable icon font) just for 8 icons. Replace them with 8 inline SVGs.
3. **Images:** 286–512px wide JPEGs at 25–54 KB each (fine), but all `loading="lazy"`, **including above-the-fold New Arrivals**, which delays LCP once real photos are larger. The first 2–4 should be eager, with `fetchpriority="high"` on the first.
4. No `width`/`height` attributes. `aspect-[3/4]` wrappers prevent CLS (measured 0), so this is acceptable.
5. Third-party image host for production images. Self-host WebP at ≤800px wide (SRS 6.1).
6. `setInterval` every 60s is fine.

## 8. Security

- New-tab links: `noopener noreferrer` ✓.
- No dynamic HTML insertion ✓ (but the future data-driven version must use `textContent`, not `innerHTML`, for product names).
- **Outbound URL validation (SRS 6.4)** is not implemented. When `product_url` comes from data, allow-list `https:` + host `tokopedia.com`/`www.tokopedia.com`/`tk.tokopedia.com` (confirm the owner's short-link host) and disable the CTA otherwise.
- No secrets in the page ✓.
- Third-party scripts: Tailwind CDN executes arbitrary remote JS (supply-chain exposure). Remove it in the build.
- No Content-Security-Policy (add once assets are self-hosted).

## 9. SEO & metadata
`<title>` **empty**, no meta description, no Open Graph tags, no favicon, no canonical. All required by NFR-05 / SRS 6.6. The TikTok/WhatsApp link preview will show a blank card.

## 10. Testing requirements (before launch)

**Unit (pure functions):** `getAdminStatus` at 07:59 / 08:00 / 16:59 / 17:00 on Mon and Sat, any time on Sunday, and with a device TZ other than WIB; `calcDiscount` (7 products, promo ≥ original → 0, original 0 → 0, NaN); `formatRupiah`; `resolvePurchaseUrl` (override, fallback, missing → disabled, non-Tokopedia host → disabled); `buildWhatsAppUrl` (encoding).
**Data validation (build-time):** unique IDs, gender ∈ {cowok, cewek}, image exists, numeric prices, counts 7/4/2/5, exactly one featured per odd collection.
**E2E (Playwright, 360/375/390/414/430/768/1024/1280/1440):** no horizontal overflow; header height; first product visible in the first viewport at 390×844; anchor targets not obscured; FAB does not overlap CTAs (bounding-box check); every buy link `href === expected` and `rel` correct.
**Accessibility:** axe-core run with zero serious/critical issues; keyboard walk-through; target-size check.
**Performance:** Lighthouse Mobile (simulated 4G, Moto G Power) ≥90; LCP ≤2.5s; CLS ≤0.1.
**Manual device:** TikTok in-app browser on Android + iOS opening the real Tokopedia URL (does it open the Tokopedia app, a web view, or get blocked?), WhatsApp deep link, Safari iOS, Chrome Android.
