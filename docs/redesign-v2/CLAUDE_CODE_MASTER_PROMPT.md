# CLAUDE CODE MASTER IMPLEMENTATION PROMPT — b-shirt Retail Redesign

You are acting as a Principal Product Designer, Fashion E-commerce Art Director, Senior UX Architect, CRO Specialist, Design Systems Engineer, Senior Frontend Engineer, Accessibility Specialist, and QA Lead.

## Mission
Redesign and implement the existing b-shirt website as a polished fashion-retail experience. Use the quality principles of UNIQLO's retail website as a benchmark for navigation clarity, editorial merchandising, category discovery, product presentation, and disciplined visual hierarchy. Do NOT copy UNIQLO's identity, assets, copy, exact layouts, or proprietary design.

## Read these files first
1. `DESIGN.md` — visual and interaction source of truth.
2. `PRD.md` — product scope and business requirements.
3. `SRS.md` — functional and technical acceptance requirements.

If they conflict, preserve the business constraints in PRD/SRS and follow DESIGN.md for visual execution. Do not invent business requirements.

## Step 0 — Environment and skill audit (mandatory)
- Inspect the actual repository, framework, routes, assets, package scripts, existing components, data files, and deployment setup.
- Search the environment for a skill named exactly `taste-skills` (including project-local and user-level skill directories supported by the installed agent runtime).
- If found, read its complete instructions and apply them. Record the skill path/version in the final report.
- If not found, explicitly report `taste-skills unavailable`; do not fabricate its instructions, create a fake skill, or claim it was used.
- Inspect available MCP resources (Jiro, Design Spells, Refero Styles, SupaHero, Mobbin) only if the MCP is actually connected and accessible. Do not claim a source was inspected unless you accessed it.

## Step 1 — Baseline audit
Before changing code:
- Run the current app and inspect existing pages at mobile and desktop sizes.
- Identify the reasons the current result feels generic or unlike a fashion retailer.
- Audit layout, typography, spacing, image crops, product cards, navigation, conversion path, accessibility, performance and mobile browser behavior.
- Create a concise implementation plan with risks and files to change.
- Preserve existing working infrastructure unless a change is justified.

## Step 2 — Art direction
Explore at least three distinct directions:
A. Editorial campaign-led retail.
B. Category-first retail.
C. Product-first compact storefront.

Select the best direction for TikTok-origin traffic and the actual seven-product catalog. Explain the decision in a short design rationale. Do not spend time building three complete implementations.

Desired visual language:
- Contemporary everyday fashion retail.
- Neutral white/black/gray palette.
- Large, deliberate product photography.
- Strong but restrained typography.
- Clear retail navigation.
- Editorial campaign composition using actual b-shirt imagery.
- Consistent, easy-to-scan product grid.
- Sale red reserved for actual discounts.
- No full-bleed pastel gender blocks.

Strictly avoid:
- Generic AI landing page formula.
- Gradient blobs, glassmorphism, random bento cards, fake metrics, fake reviews.
- SaaS/dashboard appearance.
- Excessive rounded cards and shadows.
- Decorative 3D, parallax, scroll hijacking, autoplay carousels.
- Stock/generated apparel images replacing actual product photos.
- UNIQLO logo, copy, exact design replication or brand identity.

## Step 3 — Implement
Implement the full responsive experience described in DESIGN.md:
- Configurable announcement bar.
- b-shirt retail header/navigation.
- Editorial campaign using actual approved assets.
- Wanita/Pria category discovery.
- New Arrivals derived from canonical data.
- Sale section only when eligible products exist and it improves discovery.
- Complete Wanita and Pria collections.
- Consistent product cards and correct prices/discounts.
- Reliable Shop | Tokopedia outbound links.
- WhatsApp support and TikTok footer.
- Service information and responsive footer.

Do not create internal cart, checkout, account, login, payment, order tracking, product-detail routes, physical store locator, or unsupported features.

## Step 4 — Business data integrity
Preserve:
- Seven existing product IDs, names, prices, flags, image mappings and crop settings.
- Initial counts: 7 total, 4 New Arrivals, 5 Wanita, 2 Pria.
- `gender` canonical values `cowok` and `cewek`; presentation labels may be `Pria` and `Wanita`.
- WhatsApp `6282230089520`.
- TikTok `https://www.tiktok.com/@b_shirt_co`.
- Operating hours Mon–Sat 08:00 inclusive to 17:00 exclusive, timezone `Asia/Jakarta`.
- Exact global Shop URL from PRD. Do not decode, shorten, normalize, reconstruct, or alter its query string.
- Product URL override takes precedence when non-null.

Do not fabricate campaign images, product attributes, stock, sizes, reviews, shipping claims, ratings, guarantees or best-seller status.

## Step 5 — Design quality review
After implementation, inspect actual screenshots at:
360x800, 390x844, 430x932, 768x1024, 1024x768, 1440x900.

Review:
- First viewport usefulness.
- Header/navigation density.
- Campaign crop and text contrast.
- Category discovery clarity.
- Product image consistency.
- Price hierarchy and CTA visibility.
- Section rhythm and whitespace.
- Footer and floating WhatsApp overlap.
- Whether the result looks like a real fashion retail storefront rather than a template.

Perform at least two refinement passes. Fix visual defects; do not merely describe them.

## Step 6 — QA
Run available lint, typecheck, build and tests. Add/execute tests for:
- Product filtering/counts.
- Discount calculation and Rupiah formatting.
- Product URL override/fallback and exact URL preservation.
- Operating status boundary cases and Sunday.
- Anchor navigation.
- Responsive overflow.
- Missing assets and invalid configuration.
- Accessibility basics and reduced motion.

Test external links in a browser where possible. If a real TikTok in-app browser is unavailable, state that limitation; do not claim it was tested.

## Step 7 — Final report
Return:
1. Summary of changes.
2. Final chosen design direction and rationale.
3. Components/files changed.
4. `taste-skills` availability and whether it was actually applied.
5. Screenshots or preview evidence for mobile and desktop.
6. Build/test results.
7. Remaining risks or owner decisions.
8. Explicit confirmation that the Shop URL was preserved exactly.

Do not stop after writing a plan or generating a static mockup. Implement the working website in the existing project.
