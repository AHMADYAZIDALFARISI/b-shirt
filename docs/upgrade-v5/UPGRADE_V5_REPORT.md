# Laporan Upgrade Arsitektur 3D & UI/UX — b-shirt v5

Dokumen ini merangkum pembaruan v5 (termasuk lanjutan **Stage 2 UX/Conversion**, **Stage 3 QA/Engineering Maturity**, dan **Stage 4 Immersive Brand Experience**). Lihat laporan audit menyeluruh beserta hasil Lighthouse & WCAG 2.2 AA terbaru pada [../reports/GEMBUL_V5_STAGE_2_3_4_FINAL_AUDIT.md](../reports/GEMBUL_V5_STAGE_2_3_4_FINAL_AUDIT.md) serta daftar kesiapan rilis di [../reports/RELEASE_READINESS_CHECKLIST.md](../reports/RELEASE_READINESS_CHECKLIST.md).

## Ringkasan Komponen Kunci

- **Panggung WebGL1 4-Pass (`site/js/3d/`):** `backdrop-shader.js` (GLSL ES 1.00 mesh/grain/god-rays/silk), `cloth.js` (Simulasi kain Verlet 551 simpul & kanvas linen prosedural 512×512), `geometry.js` (splines gantungan `logo-icon.png`, kartu melengkung `buildCurvedCard`, cincin lantai `buildFloorRing`), dan `orbit-scene.js` (prioritas tekstur depan-ke-samping, adaptasi kualitas mobile `'medium'`, `destroy()` GPU cleanup, serta fallback `scene_fallback`).
- **UI & Konversi Stage 2 (`site/js/ui/`, `site/js/lib/`, `site/css/`):**
  - Modal detail produk ekstensibel (`product-modal.js`, `<dialog id="product-modal">`) yang hanya merender atribut opsional bila valid di `catalog.json` (`productDetailSpecs`), lengkap dengan hitung penghematan Rupiah, CTA Tokopedia/WhatsApp, tombol *"Lihat di Rak 3D"*, serta pemulihan fokus keyboard.
  - Grid Brand Ambassador mobile diringkas menjadi 2×2 dengan numeral `01`–`04`.
  - `.wa-fab` dilengkapi `env(safe-area-inset-*)`, ruang aman mobile, dan deteksi anti-tumbukan CTA dinamis (`.wa-fab--away` tetap dapat difokus keyboard).
  - Warna `--color-accent: #954530` memenuhi rasio kontras WCAG AA (`>= 4.5:1`), `styles.css` bersih dari literal warna, dan efek `tilt-spotlight.js` dipromosikan ke GPU hanya saat hover pointer aktif (`data-tilting="1"`).
- **Verifikasi Terakhir (Pasca-Suntingan Final):**
  - `npm test`: **57 / 57 lulus** (`0 fail`, `548.61 ms`)
  - `npm run build`: `dist/` terbangun (`91,322 B` HTML, `30,924 B` inline CSS, `1,513,582 B` total)
  - `npm run test:e2e`: **12 / 12 skenario Playwright E2E + Axe WCAG 2.2 AA lulus** (`0` page violations, `0` modal violations)
  - `tools/screenshots.mjs`: **30 / 30 run** (`10` viewport × `3` mode) → `overflow=false`, `dead=0`, **`imgs=29`, `failedImg=0`**, `small=0`, `overlap=0`, `errors=0`
  - `npm run audit:lighthouse` (server lokal tanpa kompresi): Mobile `Perf 63 / A11y 100 / BP 100 / SEO 100` (`FCP 1.2s`, `LCP 3.2s`, `TBT 2,620ms`, `CLS 0`), Desktop `Perf 65 / A11y 100 / BP 100 / SEO 100` (`FCP 1.5s`, `LCP 3.5s`, `TBT 250ms`, `CLS 0`).
