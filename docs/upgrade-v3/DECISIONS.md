# DECISIONS — upgrade v3

| # | Decision | Alternatives considered | Why |
|---|---|---|---|
| D1 | Keep the static ES-module architecture | Vite, React, React Three Fiber, Next.js | Works, tested, zero dependencies. The prompt forbids migrating only for one scene. |
| D2 | **Raw WebGL1 renderer (~10 KB of our own code), no Three.js** | Three.js r17x vendored (about 600 KB min, about 150 KB gzip) | The scene is one procedural object with one shader. Three.js would add more transfer than all product photos on first view, on TikTok-origin mobile connections. WebGL1 is the widest-supported baseline for in-app WebViews. Trade-off: the code is ours to maintain. It stays isolated in `site/js/3d/`, has unit-tested pure geometry, and has no post-processing. |
| D3 | 3D concept **A: "Garis b-shirt", a sculptural one-line hanger with a draped fabric ribbon** | B clothing tag, C folded geometric token, D rack with garment silhouettes | The official logo is a single continuous line forming a hanger and shirt. Extruding that line language into 3D is ownable and on-brand, and it is clearly not a garment. B duplicates the wordmark; C is generic; D risks implying products. |
| D4 | Gradient in **CSS** (layered radial-gradients from tokens + SVG grain), not WebGL | Shader gradient | The prompt prefers CSS/SVG for static atmospheric layers, and CSS costs nothing at runtime. The canvas only draws the object. |
| D5 | **Collection stage** replaces the static category tiles: the object sits in the centre with three HTML nodes (New Arrivals 4, Wanita 5, Pria 2), each with a real product thumbnail. Desktop shows an orbit-like placement; mobile shows a chip row under a short stage. | Keep tiles and add the stage as an extra section | Adding a section would push New Arrivals further down for TikTok visitors. Merging keeps page length about the same, and nodes remain plain links (no rotating needed). Max 3 nodes, as the prompt asks. |
| D6 | Canvas is **decorative** (`aria-hidden`); all actions are HTML links | Interactive canvas with ARIA | The prompt says not to put essential content in the canvas. Pointer tilt is cosmetic, so it needs no keyboard equivalent. A **"Jeda animasi / Putar animasi"** toggle (pattern seen on Catalyst) is provided and remembered for the session. |
| D7 | Scene lifecycle | | Lazy-loads with `import()` when the stage is within 200px of the viewport **and** after `load` plus idle. Renders only while visible and the tab is visible. DPR is capped at 1.75 (1.5 on small screens). Handles `webglcontextlost` by showing the poster. Static poster when: reduced motion, Save-Data, ≤2 CPU cores or ≤2 GB memory, WebGL unavailable, or `?scene=off` (QA override). |
| D8 | Poster/fallback = official `logo-icon.png` (the logo's own hanger-shirt line art) over the same CSS gradient | Pre-rendered PNG of the 3D object | Fallback uses the real approved brand asset and needs no extra file. Layout is identical with or without WebGL (fixed aspect box, so no CLS). |
| D9 | Active nav state via IntersectionObserver (`aria-current="true"`) | Scroll-position math | Cheap and accurate; no scroll listeners. |
| D10 | No backend added | Serverless analytics or CMS | No requirement exists that the owner can configure (see BACKEND_AND_DATA_DECISION.md). |
| D11 | New analytics event `collection_nav` (location: header, stage) and `scene_motion_toggle` | — | Anonymous, privacy-light. They are no-op custom events unless a provider is added. |

## Changes after owner instructions (25 Nov 2026, during v3)
| # | Instruction | Decision |
|---|---|---|
| D12 | "Gunakan zip yang baru" (`Downloads/Gembul.zip`) | The zip was extracted over the project; all 99 files were verified identical to the zip by SHA-256. The previous working copy was backed up to `Downloads/Gembul-backup-v3-20261125-1031/`. Every document in the zip was already byte-identical, and the zip predates v3, so the v3 source changes were re-applied as a diff on top of the zip base. |
| D13 | "Output akhir berupa web 3D interaktif" | **D3/D5 were superseded.** The decorative hanger plus three links became an **interactive product orbit**: the 7 real product photos hang on a 3D ring around the hanger, with drag/swipe, inertia, snap, tap-to-select, filters, and an HTML panel with the Tokopedia button. Real photos only, so no garment is fabricated in 3D. The collection-node code was removed as dead code. |
| D14 | New Tokopedia URL for **all** products | `site_config.global_shop_url` was set to the new 511-character URL byte-for-byte, and every `product_url` is null. The old URL was replaced in `docs/redesign-v2/PRD.md` and `SRS.md`. A unit test asserts the exact string. |
| D15 | 12 new images (`Baju/Model Cowok/Cewek`) | **Not published.** They have no product name or price, and some carry third-party trademarks (Polo Ralph Lauren logo, Sanrio My Melody) or look like screenshots or generated images. They were converted to WebP in `product-intake/`; see `INTAKE.md` for the data needed to list them. |

## Unresolved contradictions / owner inputs
- **Cowok/Cewek accents:** the v2 DESIGN.md removed the pastel accents as dominant colours; the v3 prompt says to keep them "only as controlled wayfinding cues". I use them only as faint tints inside the gradient behind the matching stage node. No full-bleed blocks.
- **Section order:** the v3 prompt suggests "Cowok then Cewek"; the implemented v2 order (approved earlier) is **Wanita (cewek) then Pria (cowok)**. Per "follow the latest implemented v2 design unless the user approves a change", **v2 order is kept**.
- `site_url` (absolute og:image and canonical) is still unknown, so canonical is **not** added.
- The campaign headline copy is still awaiting owner approval (carried over from v2).

## v4.0 decisions (25 Nov 2026)
| # | Decision | Why |
|---|---|---|
| D16 | v4.0 PRD/SRS/DESIGN installed at root, with an owner-revision addendum | The owner supplied them; the later chat instruction (publish new photos, set prices, ambassadors) overrides their "keep intake unpublished / 7 products" lines |
| D17 | The 3D rack moves **into the hero** (one canvas); the campaign photo pair is the poster/LCP and the same-footprint fallback | v4 §6 asks for an editorial hero with the immersive scene; the rack is the brand signature; core content still paints first |
| D18 | Category tiles restored (data-driven) | SRS v4 FR-005 |
| D19 | Display face = system serif stack (Iowan / Palatino / Georgia), headlines only | Editorial character with no font download (v4 §7: audit font loading before adding families) |
| D20 | 8 products appended after the baseline 7 with `is_new:false`, `price_source:"proposal"` | Keeps New Arrivals = 4 and the baseline order; prices are clearly marked as proposals |
| D21 | Ambassadors are imagery plus collection links only | No invented names, quotes or product claims (v4 brand truth) |
| D22 | `"published": false` flag for products and ambassadors | Lets the owner pull trademark-risk items without deleting data |
| D23 | Events renamed to `collection_navigation` / `scene_interaction` | SRS v4 FR-019 names; existing three events are unchanged |
