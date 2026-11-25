# Third-Party Notices & Architectural Provenance

`b-shirt` maintains a zero-runtime-dependency static bundle (`site/dist/`) to guarantee sub-second mobile loading in TikTok in-app WebViews and low-power 4G devices. Rather than shipping heavy runtime frameworks or duplicating third-party npm packages verbatim, selected algorithms, shader formulations, and UI physics were adapted into vanilla ES modules (`site/js/3d/*` and `site/js/ui/*`) and design tokens (`site/css/*`).

## Adapted Open-Source Engineering References (MIT License)

1. **MengTo/threeui** (`https://github.com/MengTo/threeui`, MIT License)
   - **Adapted concepts & math:**
     - Real-time Verlet cloth constraint solver (`structural`, `shear`, `gravity`, `wind`, pinned shoulder crossbar) and procedural woven linen canvas texture with topstitch hem detailing -> implemented in vanilla WebGL1/2D Canvas in `site/js/3d/cloth.js` and `site/js/3d/orbit-scene.js`.
     - Sculptural studio ring/gallery spatial composition, tactile glass elevation, and iridescent grazing Fresnel highlights -> adapted in `site/js/3d/geometry.js`, `site/js/3d/orbit-scene.js`, and `site/css/styles.css`.

2. **Paper Shaders (`@paper-design/shaders`)** (`https://shaders.paper.design`, MIT License)
   - **Adapted concepts & GLSL math:**
     - Organic domain-warped `MeshGradient` interpolation, procedural `GrainGradient` surface noise, and soft overhead `GodRays` lighting cone -> adapted to GLSL ES 1.00 (`WebGL1`) in `site/js/3d/backdrop-shader.js`.

3. **ReactBits (`DavidHDev/react-bits`)** (`https://reactbits.dev`, MIT License)
   - **Adapted concepts & physics:**
     - `TiltedCard` damped spring 3D perspective tilt, inner depth parallax, and specular radial glare -> implemented without React runtime in `site/js/ui/tilt-spotlight.js` (`initTiltCards`).
     - `SpotlightCard` pointer-tracked radial card illumination -> implemented in `site/js/ui/tilt-spotlight.js` (`initSpotlightSurfaces`) and `site/css/styles.css`.
     - `CircularGallery` curved spatial plane geometry & `Silk` surface light bands -> adapted in `site/js/3d/geometry.js` (`buildCurvedCard`), `site/js/3d/backdrop-shader.js`, and `site/js/3d/orbit-scene.js`.

## Visual & Interactive Design References

4. **style.ai.id** (`https://style.ai.id`)
   - **UI/UX patterns studied & adapted:**
     - Floating frosted liquid-glass header pill with specular top highlight (`inset 0 1px 0`) and balanced horizontal navigation.
     - Curved architectural hero framing (`border-bottom-left/right-radius`), sliding spring segmented filter pill indicator with `tabular-nums` counts (`.chips__pill`), crisp bordered showcase cards, and high-contrast dark editorial showcase featuring oversized `01`–`04` backdrop numerals tucked cleanly behind card left edges.

5. **Unicorn Studio** (`https://unicorn.studio`)
   - **Creative shader direction studied & adapted:**
     - Layered WebGL studio lighting cones, pointer-reactive focal illumination, and traveling liquid-metal specular edge sweeps around highlighted hero cards in `site/js/3d/orbit-scene.js`.
