# DESIGN REFERENCE RESEARCH — b-shirt Official Web Catalog

**Date:** 25 November 2026
**Method & limits (read first):**
- **No MCP server for Jiro, Design Spells, Refero, SupaHero or Mobbin is connected** to this workspace. The only design MCP available is Stitch (used to retrieve the prototype itself). So the research used plain public web fetches (text only, no login).
- These galleries are mostly thumbnails or videos. A text fetch reads only titles, tags and descriptions, **not the visuals**. Where a layout was not actually seen, this document says so. Refero was the exception: its style pages expose full design tokens as text.
- **Mobbin was not accessible** (library requires an account; `/explore` returned 403). No Mobbin findings are claimed.
- Research is evidence and inspiration, not something to imitate. Nothing here overrides [PRD.md](PRD.md).

---

## 1. Jiro — https://jiro.build/
**Accessed:** home page; `/templates/e-commerce/clothing-ecommerce-landing-page-averra`; `/templates/e-commerce/sneaker-eccommerce-landing-page-partner`. Five e-commerce templates are listed (Premium). Detail pages were truncated before their section breakdown, and the thumbnails could not be viewed.

| Entry | What was readable | Adapt for b-shirt | Do not copy |
|---|---|---|---|
| **Averra** (clothing landing page) | Curated products, trending styles, shop-by-occasion; tags: carousel, elegant, light, minimal, newsletter, photography | Light, photo-led page; collections as the main way to browse (Cowok / Cewek) | Newsletter, testimonials, carousel. With 7 products they only add scrolling before the Buy button; testimonials would also be fabricated social proof |
| **Partner** (sneaker landing page) | 3D WebGL product that turns on scroll; headline word that changes; hover cards with "Add to bag"; mobile layout | Product name + price + action always visible on the card | WebGL (too heavy for the TikTok in-app browser); hover-only actions; "Add to bag" wording (b-shirt has no cart) |

## 2. Design Spells — https://designspells.com/
**Accessed:** home list (entries #335–354); `/spells/smooth-transitions-when-browsing-looks-on-doji`; `/spells/butterflies-and-animated-tooltip-appear-when-hovering-on-discords-shop`. A site search found no entries for add-to-cart, sticky header or product-page loading. Entry pages expose only titles and tags (the videos were not watched).

| Entry | Observation | Adapt | Do not copy |
|---|---|---|---|
| **Instagram "Super Like"** (#351) | A long press gives an amplified response | The principle: **every tap gets immediate feedback.** "Beli di Tokopedia" and WhatsApp buttons need a visible `:active` pressed state, because the page is about to leave the site and users double-tap when nothing visibly happens | The playful animation itself |
| **Doji: smooth transitions when browsing looks** | Tagged Mobile / Motion / Transition (no further detail readable) | At most a short (~150–200ms) fade when jumping between Cowok and Cewek, and off under `prefers-reduced-motion` | Long or decorative motion |
| **Discord shop hover tooltip** | Tagged Desktop | Negative lesson: information that only appears on hover never reaches a phone user | Hover-only disclosure |

**Assessment of the prototype against this:** its motion is mostly decorative (pulse dots, 500ms image zoom), and the functional feedback this research points to (pressed states, reduced motion) is missing.

## 3. Refero Styles — https://styles.refero.design/
**Accessed:** home page; `/style/aecf9dda-5cba-4dc7-9e73-59b65d895cdf` (teenage engineering). **No fashion brand is listed** among the 20 styles (Apple, Wise, Linear, etc.; filters include "Dense marketplace" and "Film grain & photos").

**teenage engineering** (a product-catalog style, the closest match to a retail catalog):
- 5 near-neutral colours (`#f6f8f7`, `#000`, `#0f0e12`, `#e5e5e5`, `#b2b2b2`)
- spacing steps of 15 / 22 / 33 / 66px
- 0px corner radius
- borderless product tiles: an edge-to-edge photo, the name, a link, and 1px dividers
- studio photos on plain backdrops

| Decision | Retain / adjust / reject for b-shirt |
|---|---|
| Neutral base and the photo as the hero of each tile | **Adopt.** It matches PRD "Dominasi putih/hitam" and DESIGN.md "product-first", and replaces the prototype's lilac M3 surfaces (`#f9f9ff`, `#e7eefe`) |
| One strict spacing scale | **Adopt**, using DESIGN.md's 4px scale (not TE's values) |
| One accent used for a single purpose | **Adopt:** red only for discount. Buy is black, with the Cowok/Cewek accent inside those sections |
| Borderless tiles with hairline dividers | **Adopt with care.** It removes the "dashboard widget" card look DESIGN.md warns about |
| 13px body text at weight 100 | **Reject.** Too thin and small for a phone in daylight; use 14–16px at weight 400+ |
| Text-only links as primary actions | **Reject.** Buy needs a solid button at least 44px tall |
| 0px radius | Optional. A 2–4px radius keeps a friendlier tone; decide once and tokenise it |

## 4. SupaHero — https://supahero.io/
**Accessed:** home page; `/hero/the-shirt-by-matthew`; `/hero/dolce-gabbana`; `/hero/secchiari-boots`. `/hero/maison-alaia` returned 404 and the-shirt.bymatthew.com returned 502. Entry pages show only title, subtitle and link, so **the hero layouts were not seen.**

- **Observation (limited):** the fashion entries' subtitles name one product or one collection plainly ("The Shirt", "The riding boots", "Velvet collection"). This suggests short, product-first opening text. It is inferred from text only.
- **Applied to b-shirt (TikTok traffic):** the answer to "can a new visitor understand the brand and start browsing immediately?" is **no hero image at all.** Use one short line naming what is sold, then the New Arrivals grid inside the first viewport.
- **Do not copy:** full-screen luxury hero images. They push all 7 products below the fold.

## 5. Mobbin — https://mobbin.com/
**Accessed:** marketing home page and `/llms.txt` only. `/explore` returned **403**, and the library requires an account. **No fashion e-commerce flows were inspected.** No recommendation in the other audit documents relies on Mobbin.

---

## 6. Reference research matrix (accessed sources only)

| Reference | Pattern inspected | Relevant observation | Application to b-shirt | Priority |
|---|---|---|---|---|
| Refero: teenage engineering | Catalog style & tokens | Neutral palette, borderless photo tiles, strict spacing, single accent | Neutral photo-first grid on DESIGN.md tokens; red only for discounts | High |
| Refero: teenage engineering | Type scale | 13px / weight 100 body is too thin | Body 14–16px / 400; prices 15–19px bold (DESIGN.md) | High |
| Jiro: Partner | Product card actions | Hover-revealed "Add to bag" | Always-visible "Beli di Tokopedia"; no cart language | High |
| Design Spells: Instagram Super Like | Tap feedback | Immediate response to press | `:active` pressed states on outbound CTAs and FAB | High |
| Design Spells: Discord shop | Hover tooltip | Desktop-only | No hover-only information | Medium |
| Design Spells: Doji | Mobile transitions | Short transitions between looks | Optional short fade on Cowok/Cewek jump; reduced-motion aware | Medium |
| Jiro: Averra | Clothing landing structure | Collections + extra marketing sections | Keep the collection split; drop newsletter, testimonials, carousel | Medium |
| SupaHero: The Shirt By Matthew, Secchiari | Hero copy (images not viewed) | Plain single-product subtitles | One-line brand statement, then products in the first viewport | Medium |
| Jiro: Partner | 3D WebGL hero | Heavy scroll-driven 3D | Avoid (performance in the TikTok in-app browser) | Low |

## 7. How this research informs b-shirt
1. **Photography is the design.** The strongest catalog reference (Refero / teenage engineering) works because consistent product photos carry the page. This makes the missing real photos (AUDIT_REPORT C4) the biggest design blocker, not a content afterthought.
2. **Less chrome, fewer sections.** Every example's extra sections (newsletter, carousel, big hero) would hurt a 7-product, TikTok-first page.
3. **Feedback over decoration.** Pressed and focus states and reduced motion matter; pulse dots and zoom-on-hover don't.
4. **Honest labels.** "Add to bag"-style wording is wrong for a site that sends people to Tokopedia; the label must say where the tap goes.
