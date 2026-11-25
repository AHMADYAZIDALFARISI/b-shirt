# 3D IMPLEMENTATION — "Jelajahi koleksi 3D" (interactive product orbit)

## Concept
The owner asked for the final output to be **an interactive 3D website** (25 Nov 2026). The 3D layer is the brand's own one-line hanger (from the logo's line language), floating above a **ring of the 7 real product photos** hung as cards.
- Visitors **drag or swipe** to rotate the ring, which has inertia and snaps to a card.
- **Tapping** a photo turns it to the front and selects it.
- **Filters** (Semua / New Arrivals / Wanita / Pria) rebuild the ring from catalog data.
- The **HTML panel** next to the ring shows the selected product's name, prices, discount, **"Beli di Tokopedia"** (exact configured URL) and "Lihat koleksi …".
- The hanger's fabric ribbon takes the selected collection's tint.

No garment is modelled in 3D. The products are shown only through their real photos, so nothing misrepresents a product. The procedural hanger is a brand sculpture.

## Files
| File | Role | Size (raw) |
|---|---|---|
| `site/js/stage.js` | Controller: HTML controls, state, lazy 3D loading, lifecycle | ~8 KB |
| `site/js/3d/orbit-model.js` | Pure logic: filters, ring maths, picking, cover-crop UVs (unit-tested) | 2.7 KB |
| `site/js/3d/orbit-scene.js` | WebGL1 renderer: hanger + card ring, drag/inertia/snap, tap picking | 17 KB |
| `site/js/3d/scene.js` | Shared hanger shaders (lighting, fabric drape) and helpers | 10.7 KB |
| `site/js/3d/geometry.js` | Procedural hanger tube (rotation-minimising frames) and ribbon grid | 5.8 KB |
| `site/js/3d/mat4.js` | Minimal matrix helpers | 1.4 KB |
| `site/js/3d/capability.js` | Mode decision (live / still / poster), WebGL probe, DPR cap | 2 KB |
| `site/assets/textures/grain.png` | 64×64 noise tile, generated locally | 2.2 KB |

All 3D JavaScript together is **15.6 KB gzip**, with **no third-party library** (see DECISIONS D2).

## Geometry & assets
| Mesh | Vertices | Triangles |
|---|---:|---:|
| Hanger tube (hook + body) | 3,036 | 6,048 |
| Fabric ribbon | 703 | 1,296 |
| Product cards | 4 each | 2 each (7 cards = 14) |

- Textures are the existing product WebP files at 400px wide (11–39 KB each), loaded only after the 3D layer starts.
- Photos are cover-cropped to 3:4 through UV coordinates, respecting each product's `image_position`.
- There are no GLB/HDRI files and no external assets.

## Rendering
- WebGL1 with two programs:
  1. **Hanger/ribbon**: key, fill and rim lighting, wrap lighting for the cloth, analytic normals for the drape waves and static folds.
  2. **Cards**: textured; dimmed as they turn away; a thin ink frame on the selected card; the back of a card is plain paper, never a mirrored photo.
- Cards facing away from the camera (cos θ < −0.05) are skipped.
- DPR is capped at 1.5 on phones and 1.75 elsewhere. No post-processing.

## Interaction & accessibility
| Action | Pointer | HTML equivalent |
|---|---|---|
| Rotate | drag/swipe horizontally on the canvas (`touch-action: pan-y` keeps vertical scrolling native) | ← / → buttons, ArrowLeft/ArrowRight inside the section |
| Select | tap/click a card | ← / → buttons |
| Filter | — | Filter chips (`aria-pressed`) |
| Buy | — | "Beli di Tokopedia" link in the panel |
| Motion | — | "Jeda animasi / Putar animasi" toggle (`aria-pressed`, remembered for the session) |

- The canvas is `aria-hidden`. The selected product is announced through a polite live region, only after user actions.
- The 2D photo carries the product name as `alt`.

## Lifecycle & performance
1. **First paint has no WebGL.** The build pre-renders the filters, the default product panel (ce-01) and its photo, so the section is complete and shoppable without JS or WebGL.
2. `stage.js` is loaded with dynamic `import()` after the catalog is ready. A failure there cannot break the rest of the page.
3. The **WebGL probe and the 3D module load only after the visitor engages** (first scroll, pointer, key or touch) **and** the section is within 250px of the viewport.
   - Measured reason: loading during page load cost about 0.8 s of TBT (QA_REPORT §3).
4. The render loop runs only while the section is visible and the tab is visible. With motion off (reduced motion or paused), frames are drawn only until the ring settles after an interaction.
5. `webglcontextlost` switches back to the 2D photo. `pagehide` stops the loop; a real unload deletes textures, buffers and programs and calls `WEBGL_lose_context`.

## Fallback modes (all tested — QA_REPORT §2)
| Condition | Result |
|---|---|
| WebGL available | `live`: animated orbit |
| `prefers-reduced-motion` | `still`: the orbit draws only on interaction, no idle sway, toggle hidden |
| WebGL unavailable or blocked (`--disable-webgl`) | `poster`: same panel, filters and buttons in 2D, with the product photo |
| Save-Data, ≤2 CPU cores or ≤2 GB memory | `poster` (2D) |
| Context lost | Back to the 2D photo |
| Tab hidden / section off-screen | Loop stopped (`data-scene-running="false"`, verified) |
| JS disabled | The pre-rendered panel shows ce-01 with a working Tokopedia link; the product grids are complete |
| QA override | `?scene=off`, `?scene=still` or `?scene=live` (never enables WebGL where it does not exist) |
