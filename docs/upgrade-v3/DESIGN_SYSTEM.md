# DESIGN SYSTEM — upgrade v3

Source of truth: `site/css/tokens.css`. Components in `site/css/styles.css` use **only tokens**: a grep for raw hex or rgba values in `styles.css` returns 0.

## Foundations (unchanged from v2 unless marked v3)
| Group | Tokens |
|---|---|
| Neutral | `--color-white #fff`, `--color-ink #111`, `--color-charcoal #262626`, `--color-gray-700 #4b5563`, `--color-gray-500 #6b7280`, `--color-gray-300 #d1d5db`, `--color-gray-200 #e5e7eb`, `--color-gray-100 #f3f4f4` |
| Sale | `--color-sale #d71920` (discount price and badges only) |
| State | `--color-new #111`, `--color-online #15803d`, `--color-focus #2563eb` |
| **Atmosphere (v3)** | `--mesh-base #f5f2ee`, `--mesh-sand #ead9c4`, `--mesh-stone #dfdcd6`, `--mesh-rose #f0dcd8`, `--mesh-blue #dae2ea`, `--grain-opacity .07` |
| **3D materials (v3)** | `--scene-line #1c1a18` (hanger), `--scene-fabric #d9c7b0` (default ribbon), `--scene-fabric-women #d8b3ad`, `--scene-fabric-men #a9b8c8`, `--scene-card-back #e7e3dd` |
| **Surfaces (v3)** | `--color-surface-raised rgba(255,255,255,.86)` (pills over the stage), `--shadow-card`, `--orbit-line` |
| **Motion (v3)** | `--ease-out cubic-bezier(.2,.7,.2,1)`, `--dur-fast 150ms`, `--dur-base 220ms` |
| Type | Inter (requested after load, `display=optional`), system-ui fallback; sizes 12 / 13 / 15 / 17 px plus headings 22–44 px; tabular numerals for prices |
| Space | 4px scale `--space-1…16`; gutter 16 / 24 / 32; gap 12 / 16 / 24 |
| Shape | `--radius 2px`; pills (999px) only for chips and floating controls |
| Targets | `--tap 44px` minimum for every link and button (verified: 0 violations at 10 viewports) |

The women/men tints appear only as faint wayfinding cues: the mesh backdrop and the 3D ribbon colour. There are no full-bleed pastel blocks (v2 rule kept).

## Components & states
| Component | States |
|---|---|
| Header nav link | default, hover (gray underline), `aria-current="true"` (ink underline, set by IntersectionObserver), focus-visible |
| Campaign CTA, `.buy` | default, hover (charcoal), active (scale .98), focus-visible, disabled (`buy--disabled`) |
| `.ask` (Tanya Admin) | underline link, hover ink |
| Product card | NEW badge, sale badge, struck original price, featured variant (2-col mobile, 2×2 desktop) |
| **Stage visual (v3)** | `data-scene-state`: `poster` (2D photo) → `loading` → `live` (canvas fades in over 400ms); `data-scene-running` true/false |
| **Filter chip (v3)** | `aria-pressed` false (outline) / true (ink fill), hover, active |
| **Pick panel (v3)** | collection label, NEW tag, counter `n / total`, name, prices, discount, buy, "Lihat koleksi …" |
| **Step buttons (v3)** | ← / →, 44px, hover border, active |
| **Motion toggle (v3)** | "Jeda animasi" / "Putar animasi" (`aria-pressed`), hidden in reduced motion or poster mode |
| WhatsApp FAB | icon on mobile, label ≥640px, hides while scrolling down |

## Responsive behaviour
| Width | Stage | Grid |
|---|---|---|
| < 640 | Visual 5:4 full width, panel below, chips on one scrollable row, hint bottom-left, toggle top-right | 2 columns |
| 640–1023 | Visual 4:5 (7fr) next to the panel (5fr) | 3 columns |
| ≥ 1024 | Visual 16:11; title 32px | 4 columns, featured 2×2 |

## Motion specification
| Motion | Duration | Purpose | Reduced motion |
|---|---|---|---|
| Button / chip press | instant scale .97–.98 | Tactile feedback | Disabled |
| Chip / nav colour | 150–220ms | State change | Disabled (transitions off) |
| Canvas fade-in | 400ms | Poster → 3D handoff | Disabled |
| Ring ease to selection | ≈ critically damped (k=7) | Shows which card was chosen | Still eases, but only on interaction; no idle loop |
| Drag inertia + snap | Velocity decay 3.5/s | Physical feel, ends on a card | Same (user-driven) |
| Hanger sway / ribbon drape | Slow 0.35–1.1 rad/s | Brand liveliness | Off (still frame) |
| Section arrive fade | 200ms | Anchor feedback | Off |

## Contrast notes
Measured pairs:

| Pair | Ratio |
|---|---|
| Ink on white | 18.9 |
| Sale red on white | 5.19 |
| White on sale red | 5.19 |
| Gray-500 on white | 4.83 |
| Gray-700 on gray-100 | 6.86 |
| Online green on gray-100 | 4.55 |

Pills over the stage use 86%-opaque white with ink or gray-700 text, which stays above 4.5:1 against the light mesh. No text sits directly on the gradient.

## 3D visual direction & fallback appearance
- **Live:** a matte graphite one-line hanger with a soft folded fabric ribbon tinted by the selected collection, above a ring of photo cards; the front card is framed in ink. The backdrop is a warm mesh gradient with fine grain and, on desktop, a hairline orbit ellipse.
- **Fallback:** the same backdrop with the selected product photo as a framed card (with shadow). The panel and controls are identical, so the experience degrades from 3D to 2D, never to nothing.
