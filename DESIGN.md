# DESIGN.md — b-shirt Immersive Hybrid Design System

**Versi:** 4.0 · **Tanggal:** 25 November 2026  
**Arah:** Immersive fashion retail + brand experience · **Tanpa profil founder**

## 1. Design North Star

Buat b-shirt terasa seperti **digital fashion world** yang editorial, tactile, berkarakter, dan premium—tetapi tetap mudah dipakai sebagai katalog belanja. Pengalaman 3D harus terasa sengaja dirancang dan terintegrasi dengan layout, bukan widget yang ditempelkan.

**Hierarchy:** product clarity → brand storytelling → immersive spectacle. Jika ada konflik, produk dan usability menang.

Hybrid berarti commerce + immersive brand experience. Jangan membuat halaman founder, biodata, personal portfolio, foto pendiri, atau detail pribadi.

## 2. Visual Direction

### 2.1 Mood
- Immersive, editorial, tactile, contemporary fashion, confident, refined.
- Komposisi berani dengan whitespace yang terkontrol.
- Depth dan lighting yang memberi kesan ruang, bukan efek visual berlebihan.
- Tipografi display yang ekspresif dipasangkan dengan sans-serif UI yang sangat terbaca.
- Product photography tetap autentik dan dominan pada kartu produk.

### 2.2 Anti-slop rules
- Jangan gunakan gradient neon generik di seluruh halaman.
- Jangan menumpuk glassmorphism, blur, glow, particle, outline, dan rounded cards sekaligus.
- Jangan membuat semua elemen bergerak.
- Jangan memakai 3D stock object yang tidak punya hubungan dengan art direction.
- Hindari template landing page generik, pill buttons berlebihan, oversized heading tanpa hierarchy, dan decorative UI yang tampak clickable tetapi tidak berfungsi.
- Setiap motion harus punya tujuan: orientasi, feedback, reveal, atau storytelling.
- Gunakan satu signature visual kuat, lalu biarkan katalog tetap tenang dan jelas.

## 3. Design Principles

1. **Commerce first:** harga, foto, nama, kategori, dan CTA terbaca cepat.
2. **Immersion with restraint:** satu scene utama yang kuat lebih baik daripada banyak scene kecil.
3. **Progressive enhancement:** konten tampil sebelum WebGL.
4. **Editorial rhythm:** variasi skala dan komposisi, tetapi grid tetap konsisten.
5. **Touch-native:** interaksi mobile tidak bergantung hover atau gesture kompleks.
6. **Accessible by default:** semantic HTML, keyboard, contrast, reduced motion.
7. **Performance is design:** jangan mengorbankan responsivitas demi shader/texture.
8. **Brand truth:** jangan mengarang informasi produk/perusahaan.

## 4. Information Architecture & Layout

Urutan halaman: announcement (conditional) → sticky header → editorial hero/3D → category discovery → New Arrivals → Wanita → Pria → service info/status → footer → floating WhatsApp.

- Gunakan container responsif dengan max-width yang konsisten dan gutters adaptif.
- Grid desktop dapat memakai editorial asymmetry pada hero; grid produk tetap mudah dipindai.
- Product cards mempertahankan rasio gambar 3:4 dan `image_position` dari data.
- Jangan mengubah ID anchor eksisting: `#new-arrivals`, `#area-cewek`, `#area-cowok`, dan anchor bantuan yang sudah ada.
- Header sticky tidak boleh menutupi target scroll; gunakan `scroll-margin-top`.
- Floating WhatsApp tidak boleh menutupi CTA atau konten penting.

## 5. Hero & 3D Composition

### 5.1 Hero layout
- Editorial headline, short supporting copy, CTA utama, CTA sekunder opsional.
- 3D focal visual berada pada area komposisi tersendiri dan tidak menutupi teks.
- CTA campaign dan informasi promo tetap DOM HTML, bukan tekstur/canvas.
- Pada mobile, sederhanakan komposisi menjadi 2D poster/fallback atau low-cost scene; jangan memaksa scene desktop.

### 5.2 Signature 3D concept
Pilih dan validasi satu konsep melalui prototype visual. Kandidat arah:
- abstract fabric / folded textile sculpture;
- floating editorial frames / fashion-inspired spatial installation;
- soft metallic or ceramic forms with fabric-like surface treatment;
- layered gradient environment yang bereaksi halus terhadap pointer.

Tidak boleh menampilkan 3D object seolah-olah produk b-shirt yang bisa dibeli. Tidak boleh meniru aset Catalyst Society, FeralUI, atau mesh3d.gallery.

### 5.3 Technical visual behavior
- Satu canvas/renderer maksimal.
- Lazy-load saat idle/near viewport setelah konten utama siap.
- Pause saat tab hidden/offscreen; resume saat visible.
- Batasi DPR; adaptasi kualitas berdasar device capability.
- Cleanup geometry, material, texture, listeners, observer, renderer.
- Handle WebGL unavailable, context loss, dynamic import failure, and runtime error.
- Poster/fallback punya ukuran/layout sama agar tidak terjadi layout shift.
- No autoplay sound, no forced loading, no scroll hijack.

## 6. Color & Material System

Bangun token dari logo/foto/brand asset yang ada, jangan mengasumsikan warna brand baru tanpa inspeksi. Gunakan:
- neutral base untuk background dan surface;
- high-contrast text;
- satu accent brand utama dari asset resmi;
- satu accent sekunder hanya bila membantu hierarchy;
- gradient sebagai atmosfer terlokalisasi, bukan background yang mengalahkan konten.

3D material: soft satin, matte ceramic, translucent resin, textile-inspired roughness; hindari chrome/neon sebagai default. Lighting harus memberi volume dengan highlight terkendali.

Semua warna dan state wajib lolos contrast check. Jangan menaruh teks penting di atas area gradient yang berubah tanpa overlay/contrast treatment.

## 7. Typography

- Pertahankan font yang sudah ada jika konsisten dan performanya baik; audit font loading sebelum menambah family baru.
- Display face: editorial, karakter kuat, digunakan terbatas untuk headline/section title.
- UI/body: sans-serif sangat terbaca untuk nama produk, harga, navigasi, status, dan bantuan.
- Gunakan fluid type scale (`clamp`) secara terkendali.
- Harga memakai tabular numerals bila tersedia.
- Hindari paragraph panjang di hero; jangan membuat teks produk terlalu kecil.

## 8. Motion & Interaction

| Interaction | Desktop | Mobile | Guardrail |
|---|---|---|---|
| Hero depth/parallax | Pointer-based subtle response | Static/low amplitude | Tidak mengubah layout atau mengganggu CTA |
| 3D scene | Slow idle motion + bounded pointer response | Reduced scene or poster | Pause offscreen; reduced motion support |
| Product card | Subtle image/position feedback | Pressed state | Hover hanya pada hover-capable device |
| Navigation | Active section/underline | Clear tap state | DOM anchors selalu tersedia |
| Section reveal | Optional opacity/translate | Minimal | Content tidak hidden sebelum JS |
| CTA | Hover/focus/pressed | Tap feedback | Feedback cepat dan jelas |

- Default microinteraction 120–220ms.
- Gunakan easing natural, tidak overshoot berlebihan.
- `prefers-reduced-motion: reduce` mematikan parallax, auto-rotation, reveal, dan nonessential motion.
- Jangan memaksa pengguna menunggu animasi sebelum bisa klik.

## 9. Responsive Behavior

### Mobile (360–767px)
- Product discovery diprioritaskan.
- Header ringkas; nav dapat menjadi menu accessible bila diperlukan.
- 3D fallback atau low-quality scene dengan no pointer dependency.
- CTA dan harga jelas; tap target minimal sekitar 44×44 CSS px.
- Tidak ada horizontal scroll.

### Tablet (768–1023px)
- Grid fleksibel; 3D scene dikurangi sesuai capability.
- Pertahankan hierarchy hero dan kategori.

### Desktop (1024px+)
- Hero editorial lebih lapang; 3D scene penuh jika performance memadai.
- Hover/motion hanya sebagai enhancement.
- Konten tidak melebar berlebihan; gunakan max-width.

Uji setidaknya 360×800, 390×844, 768×1024, 1024×768, 1440×900.

## 10. Accessibility

- Semantic landmarks, heading order, accessible names, alt text produk.
- Semua fungsi canvas tersedia sebagai DOM control/link jika interaktif.
- Keyboard focus visible dan logical.
- Contrast minimal WCAG AA untuk teks normal dan besar.
- Reduced motion dan no flashing.
- Informasi tidak dibedakan dengan warna saja.
- Menu dan tombol floating bisa diakses keyboard/screen reader.

## 11. Performance & Asset Budget

Target harus diukur, bukan diasumsikan:
- LCP mobile target <=2.5s pada test condition yang disepakati.
- Lighthouse mobile Performance >=90, Accessibility >=95, Best Practices >=95, SEO >=95 sebagai target.
- Core content dan product cards tidak menunggu 3D.
- Lazy-load product imagery below fold.
- Gunakan responsive image variants yang sudah tersedia.
- Hindari font blocking dan oversized textures.
- Catat ukuran scene bundle, texture resolution, triangle count, render DPR, serta fallback mode.
- Gunakan CSS/SVG/static art bila kualitas 3D tidak sebanding dengan biaya runtime.

## 12. Content & Product Truth

- Gunakan data nama, harga, kategori, promo, dan gambar dari `catalog.json`.
- Jangan menambahkan rating, stok, size, bahan, review, testimonial, atau detail produk yang tidak ada.
- Jangan mengganti foto asli dengan hasil render 3D/AI.
- Foto tambahan yang belum memiliki metadata/rights approval tetap tidak dipublikasikan.
- Promo banner dan campaign tetap data-driven.

## 13. Reference Study

- Catalyst Society: immersive storytelling, spatial rhythm, transition choreography.
- FeralUI Gradients: mesh gradient, blending, grain, aurora.
- mesh3d.gallery: lighting, shader craft, material response, real-time composition.

Ambil prinsip, bukan template. Catat inspirasi yang dipakai dan pastikan tidak menyalin layout, code, model, texture, atau asset.

## 14. Design QA Checklist

- [ ] Hero terbaca dan CTA terlihat tanpa menunggu 3D.
- [ ] Visual 3D terasa terintegrasi dan khas, tidak generik.
- [ ] Product photography tetap menjadi representasi produk.
- [ ] Product card konsisten, harga mudah dibaca.
- [ ] Tidak ada fake interaction atau decorative controls.
- [ ] Reduced motion berjalan.
- [ ] Keyboard/focus/contrast diperiksa.
- [ ] Mobile tidak overflow dan CTA tidak tertutup.
- [ ] Fallback memiliki komposisi yang disengaja, bukan error state.
- [ ] No founder profile/personal identity content.

---

## Addendum — Owner revision, 25 November 2026 (after v4.0 approval)

The owner instructed in chat, after providing this v4.0 document: *"tampilkan juga semua foto baru nya (dari folder Baju/Model Cowok/Cewek); untuk baju atur aja harga nya dan untuk model cowok/cewek gunakan sebagai brand ambassador di web itu."*

This **supersedes** the v4.0 statements that the 12 intake images must stay unpublished and that the catalog stays at 7 products:
1. **8 garment photos are added as products** `cw-03`…`cw-08` and `ce-06`…`ce-07`. Names describe only what is visible (no material, size, stock or origin claims). **Prices are proposals set by the implementer at the owner's request** (25–28% promo, so "Diskon hingga 30%" stays true) and must be confirmed against the Tokopedia listing. All products use the global Shop URL (`product_url: null`).
2. The original 7 products are **unchanged** (IDs, names, prices, flags, images, order). New counts: **15 total · New Arrivals 4 · Cowok 8 · Cewek 7 · featured ce-01**.
3. **4 model photos are shown as "Brand Ambassador" imagery**, without invented names, quotes, testimonials or claims about which product they wear.
4. **Known risks, flagged to the owner:** `cw-03` shows a Polo Ralph Lauren logo; `ce-06` shows the Sanrio *My Melody* character; `cw-04` came from a screenshot with a "1/3" overlay; some model images may be stock or generated and their usage rights are unverified. Each product and ambassador entry can be hidden with `"published": false` in `catalog.json`.

---

## Addendum v5 — Immersive Brand & Accessibility Synchronization (25 November 2026)

1. **Art Direction & Material System:**
   - Memperbarui seluruh token warna pada `site/css/tokens.css` (`styles.css` bersih dari warna literal `#hex`/`rgb`/`rgba`). Warna `--color-accent` dipergelap menjadi `#954530` agar melampaui rasio kontras WCAG 2.2 AA (`>= 4.5:1`) di semua permukaan katalog dan dialog modal.
   - Mengadaptasi konsep *MeshGradient/Grain/GodRays/Silk* (`shaders.paper.design`, `reactbits.dev`) secara terkontrol pada satu shader backdrop latar belakang panggung 3D, serta tekstil tenun linen prosedural & fisika kain Verlet (`MengTo/threeui`), header pill atas bergaya editorial (`style.ai.id`), dan sorotan kartu terarah tanpa *excessive glassmorphism* berlapis.
2. **Motion & Performance Governance:**
   - Efek tilt 3D (`[data-tilt-card]`) dipromosikan ke lapis GPU (`data-tilting="1"`) **hanya saat hover aktif pada pointer presisi**, dan seluruh animasi serta glare nonaktif otomatis pada `prefers-reduced-motion: reduce`.
   - Poster hero LCP (`cw-01`, `ce-01`) memenuhi ruang frame secara seimbang, Tile kategori menyesuaikan `object-position` berdasarkan `data-position`, dan foto ambassador menggunakan layout 2×2 pada mobile dengan numeral `01`–`04`.
   - Referensi dan atribusi inspirasi open-source dicatat di `THIRD_PARTY_NOTICES.md`.
