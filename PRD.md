# PRD — b-shirt Immersive Hybrid Fashion Experience

**Versi:** 4.0 · **Tanggal:** 25 November 2026  
**Status:** Approved product direction · **Brand:** b-shirt  
**Arah:** Hybrid fashion retail + immersive brand experience (tanpa identitas founder)

## 1. Ringkasan Produk

b-shirt adalah toko fashion online-only. Website berfungsi sebagai katalog produk dan jembatan menuju transaksi di Shop | Tokopedia, dengan WhatsApp sebagai kanal bantuan dan TikTok sebagai sumber traffic utama.

Versi 4.0 menggabungkan dua lapisan yang saling mendukung:
1. **Commerce layer:** katalog, kategori Wanita/Pria, New Arrivals, harga, promo, CTA Tokopedia, WhatsApp, TikTok, status admin, dan informasi layanan. Semua fungsi yang sudah berjalan wajib dipertahankan.
2. **Immersive brand-experience layer:** art direction premium, visual storytelling, 3D/WebGL brand environment, spatial navigation sebagai enhancement opsional, mesh gradients, depth, lighting, scroll-linked transitions yang terkendali, dan micro-interactions.

Hybrid di sini **bukan** profil founder, biodata, personal portfolio, atau halaman “about the owner”. Tidak boleh menambahkan nama, foto, jabatan, riwayat, atau kontak pribadi pendiri. Personal-branding feel diwujudkan lewat karakter visual dan kualitas presentasi brand b-shirt saja.

**Prinsip utama:** immersive, commerce-first, brand-led, mobile-first, fast-by-default, accessible, truthful, progressive enhancement.

## 2. Fakta Bisnis — Immutable

| Atribut | Fakta yang harus dipertahankan |
|---|---|
| Brand | b-shirt |
| Model bisnis | Toko fashion online-only; tidak ada toko fisik/alamat offline untuk ditampilkan |
| Traffic utama | TikTok: https://www.tiktok.com/@b_shirt_co |
| Kanal transaksi | Shop | Tokopedia melalui external redirect |
| WhatsApp admin (display) | 082230089520 |
| WhatsApp admin (international) | 6282230089520 (sesuai konfigurasi) |
| Pesan default WA | “Halo Admin b-shirt, saya ingin bertanya mengenai produk di katalog web.” |
| Jam layanan | Senin–Sabtu, 08.00 inklusif sampai 17.00 eksklusif |
| Zona waktu | Asia/Jakarta (WIB) |
| Arsitektur | Static HTML/CSS/ES modules; `site/catalog.json` sebagai sumber data; `build.mjs` menghasilkan `dist/`; Node built-in tests |
| Jumlah produk baseline | 7 |
| New Arrivals | 4 |
| Cowok | 2 |
| Cewek | 5 |
| Featured | `ce-01` |

Sumber kebenaran untuk URL Tokopedia, konfigurasi campaign, promo banner, category tiles, asset path, dan product data adalah `site/catalog.json`. **Jangan menulis ulang, decode, shorten, normalize, mengganti, atau membuat URL Tokopedia baru.** Pertahankan URL global beserta encoded query string dan dukung `product_url` override bila tersedia.

## 3. Tujuan Produk

- Menciptakan website fashion yang terasa premium, hidup, interaktif, khas, dan profesional.
- Menghadirkan 3D sebagai bagian dari identitas b-shirt, bukan tempelan dekoratif generik.
- Menggabungkan storytelling visual dengan jalur belanja yang jelas dan singkat.
- Memperkuat discovery koleksi Wanita, Pria, dan New Arrivals.
- Mempertahankan seluruh fungsi dan fakta bisnis yang ada.
- Memastikan pengalaman tetap lengkap tanpa WebGL, pada perangkat low-power, dan pada browser in-app TikTok.
- Membangun sistem desain dan kode yang mudah diuji, dipelihara, dan dikembangkan.

## 4. Non-Goals

Tidak termasuk tanpa persetujuan terpisah:
- Profil founder, personal portfolio, biodata, personal social links, atau identitas pribadi.
- Internal cart, checkout, payment gateway, login, akun, wishlist, order management.
- Database/backend/CMS baru hanya untuk menambah kompleksitas.
- Klaim stok, rating, review, testimonial, size, material, fit, origin, care, shipping estimate, atau garansi yang tidak ada di data resmi.
- Model 3D pakaian yang diklaim sebagai representasi akurat item katalog tanpa model produk terverifikasi.
- AI-generated product photos sebagai pengganti foto produk asli.
- Alamat toko fisik, peta toko, atau klaim memiliki offline store.
- Forced intro, splash-screen blocker, scroll hijacking, autoplay audio, atau loading gate.
- Menyalin source code, model, shader, preset, atau aset dari referensi tanpa lisensi.

## 5. Target Pengguna & Kebutuhan

1. **TikTok visitor:** ingin cepat melihat produk, harga, dan cara membeli.
2. **Fashion explorer:** ingin menjelajahi koleksi dengan visual menarik tanpa kehilangan orientasi.
3. **Mobile shopper:** memakai layar sentuh dan mungkin koneksi/perangkat terbatas.
4. **Customer support seeker:** ingin menghubungi WhatsApp dan mengetahui jam layanan.
5. **Returning visitor:** ingin langsung menuju kategori atau produk yang diminati.

## 6. Konsep Pengalaman Hybrid Immersive

### 6.1 Dua lapisan yang seimbang
- Layer commerce selalu dominan dalam hierarchy informasi dan tetap dapat diakses langsung.
- Layer immersive membentuk suasana, transisi, kedalaman, dan eksplorasi; tidak boleh menyembunyikan informasi produk atau CTA.
- Brand storytelling berfokus pada mood fashion, kurasi koleksi, editorial composition, dan visual signature b-shirt. Jangan mengarang sejarah atau nilai perusahaan yang belum disediakan.

### 6.2 Experience flow
1. Header/announcement tampil segera.
2. Hero editorial memperlihatkan campaign dan CTA secara langsung; 3D scene menjadi visual focal yang tidak menghalangi teks.
3. Pengunjung dapat memilih kategori melalui navigasi DOM standar. Spatial/orbit navigation hanya shortcut tambahan.
4. New Arrivals dan koleksi ditampilkan dalam product cards berbasis foto asli.
5. Informasi layanan, status admin, Tokopedia, TikTok, dan WhatsApp tetap mudah ditemukan.

### 6.3 3D art direction
- Buat satu visual signature scene yang khas b-shirt: abstract fashion-inspired sculpture, fabric-like folds, floating forms, soft reflective material, layered typography/environment, atau bentuk abstrak yang relevan dengan koleksi.
- 3D bukan produk katalog, bukan mannequin yang mengklaim fitting/ukuran, dan bukan pengganti foto.
- Hindari demo scene generik, template look, neon berlebihan, random particles, dan efek yang tidak punya hubungan dengan art direction.
- Gunakan referensi hanya sebagai inspirasi prinsip: Catalyst Society (immersive storytelling/spatial transition), FeralUI (mesh gradients), mesh3d.gallery (craft WebGL/material/light). Jangan meniru komposisi atau aset spesifik.

## 7. Struktur Halaman

Pertahankan anchor dan fungsi eksisting. Susunan yang direkomendasikan:
1. Announcement strip (hanya bila `promo_banner.active === true`).
2. Sticky header: logo, Wanita, Pria, New Arrivals, Bantuan.
3. Hero editorial + immersive 3D brand scene + CTA campaign.
4. Category discovery Wanita/Pria.
5. New Arrivals.
6. Koleksi Wanita.
7. Koleksi Pria.
8. Info belanja, jam layanan, dan status admin.
9. Footer: Shop, TikTok, WhatsApp, informasi online-only.
10. Floating WhatsApp.

Jangan membuat hero terlalu tinggi sehingga produk utama terdorong jauh ke bawah. Pada mobile, CTA hero dan category discovery harus cepat terjangkau.

## 8. Kebutuhan Produk

| ID | Fitur | Requirement |
|---|---|---|
| PR-01 | Functional parity | Semua fitur katalog eksisting tetap bekerja |
| PR-02 | Immersive hero | Hero editorial dengan 3D focal visual, CTA dan headline tetap jelas |
| PR-03 | Brand visual system | Tipografi, warna, grid, depth, lighting, gradient, spacing konsisten |
| PR-04 | 3D scene | Satu scene terkurasi, terisolasi, lazy-loaded, punya fallback |
| PR-05 | Spatial discovery | Opsional; memetakan shortcut hanya ke anchor/kategori nyata |
| PR-06 | Product catalog | Foto asli, nama, harga, promo, label, CTA sesuai data |
| PR-07 | Micro-interactions | Hover, focus, pressed, transition, scroll response yang bermakna |
| PR-08 | Motion governance | Reduced motion, pause offscreen, no scroll hijack |
| PR-09 | Responsive | 360px hingga desktop wide; touch-first |
| PR-10 | Accessibility | Keyboard, semantic DOM, contrast, screen reader, reduced motion |
| PR-11 | Performance | Core content tidak menunggu WebGL; asset budgets dan profiling |
| PR-12 | Graceful fallback | Konten tetap lengkap saat WebGL/JS/3D gagal sesuai batas teknis |
| PR-13 | Quality assurance | Unit/build, visual, responsive, browser and real-device testing |
| PR-14 | Maintainability | Modul, lifecycle cleanup, documentation, regression tests |

## 9. Data Katalog Baseline — Jangan Diubah

| ID | Gender | Nama | New | Featured | Harga normal | Promo |
|---|---|---|---:|---:|---:|---:|
| cw-01 | Cowok | Korean Camel Oversized Coat & Turtleneck Look | Ya | Tidak | Rp349.000 | Rp249.000 |
| cw-02 | Cowok | Basic White Tee & Light-Wash Baggy Jeans | Ya | Tidak | Rp229.000 | Rp169.000 |
| ce-01 | Cewek | Earth-Tone Knit Vest & Pleated Culotte Set | Ya | Ya | Rp269.000 | Rp189.000 |
| ce-02 | Cewek | Sky Blue Lace-Trim Wide Leg Trousers | Ya | Tidak | Rp179.000 | Rp129.000 |
| ce-03 | Cewek | Ivory High-Waist Corduroy Wide Pants | Tidak | Tidak | Rp189.000 | Rp139.000 |
| ce-04 | Cewek | Black Midi Dress & Cream Cropped Cardigan Set | Tidak | Tidak | Rp249.000 | Rp179.000 |
| ce-05 | Cewek | Blush Floral Ruffle Dress & Crochet Bolero Set | Tidak | Tidak | Rp259.000 | Rp185.000 |

Expected counts: total 7; New Arrivals 4; Cowok 2; Cewek 5; featured `ce-01`. Kategori internal tetap `cowok`/`cewek`; label UI tetap Pria/Wanita sesuai konfigurasi existing.

## 10. Asset Governance

- Foto produk resmi yang sudah dipetakan di catalog adalah sumber visual produk.
- Jangan menambah 12 foto tambahan ke katalog hanya karena file tersedia. Ikuti `product-intake/INTAKE.md`; perlu nama, harga, gender, ID, foto final, tujuan pembelian, dan verifikasi hak penggunaan.
- Foto yang menampilkan logo/karakter pihak ketiga atau screenshot overlay harus ditahan sampai hak dan kelayakan publikasinya dipastikan.
- 3D brand object boleh dibuat orisinal atau memakai asset dengan lisensi jelas. Simpan catatan sumber/lisensi.
- Jangan menghasilkan klaim visual yang tidak didukung data produk.

## 11. Kriteria Keberhasilan

- Semua fungsi dan data baseline lolos regression tests.
- Pengunjung dapat mencapai koleksi dan CTA beli tanpa harus berinteraksi dengan 3D.
- Core content tidak tertunda oleh scene.
- WebGL unavailable / reduced motion tetap menghasilkan halaman yang utuh.
- Target awal Lighthouse (diukur pada build/deployment yang sama): Performance mobile >=90, Accessibility >=95, Best Practices >=95, SEO >=95; LCP <=2.5s pada kondisi uji yang disepakati. Laporkan hasil aktual, jangan mengklaim target tercapai tanpa pengukuran.
- Shop outbound CTR target existing 25–35% hanya jika analytics memang terkonfigurasi; bukan klaim hasil.
- Tidak ada horizontal overflow, broken images, broken anchors, console errors, atau CTA yang tertutup.

## 12. Acceptance Criteria

1. `site/catalog.json` tidak kehilangan atau berubah data bisnis/product/URL tanpa approval.
2. Semua 7 produk muncul dengan data tepat; New 4, Cowok 2, Cewek 5, featured `ce-01`.
3. Jam admin dihitung dengan timezone Asia/Jakarta: Senin–Sabtu 08:00–16:59 online; mulai 17:00 offline; Minggu offline.
4. Tokopedia global URL dan per-product override dipakai dengan prioritas yang sama seperti existing.
5. WhatsApp, TikTok, promo banner, campaign, category tiles, footer, tracking hooks, dan status admin tetap berfungsi.
6. 3D lazy-load, punya fallback, teardown resource, pause offscreen, dan tidak menghalangi katalog.
7. Tidak ada profil founder/personal identity section.
8. Build dan Node tests lulus; laporan visual QA mencantumkan viewport/browser/perangkat yang benar-benar diuji.

---

## Addendum — Owner revision, 25 November 2026 (after v4.0 approval)

The owner instructed in chat, after providing this v4.0 document: *"tampilkan juga semua foto baru nya (dari folder Baju/Model Cowok/Cewek); untuk baju atur aja harga nya dan untuk model cowok/cewek gunakan sebagai brand ambassador di web itu."*

This **supersedes** the v4.0 statements that the 12 intake images must stay unpublished and that the catalog stays at 7 products:
1. **8 garment photos are added as products** `cw-03`…`cw-08` and `ce-06`…`ce-07`. Names describe only what is visible (no material, size, stock or origin claims). **Prices are proposals set by the implementer at the owner's request** (25–28% promo, so "Diskon hingga 30%" stays true) and must be confirmed against the Tokopedia listing. All products use the global Shop URL (`product_url: null`).
2. The original 7 products are **unchanged** (IDs, names, prices, flags, images, order). New counts: **15 total · New Arrivals 4 · Cowok 8 · Cewek 7 · featured ce-01**.
3. **4 model photos are shown as "Brand Ambassador" imagery**, without invented names, quotes, testimonials or claims about which product they wear.
4. **Known risks, flagged to the owner:** `cw-03` shows a Polo Ralph Lauren logo; `ce-06` shows the Sanrio *My Melody* character; `cw-04` came from a screenshot with a "1/3" overlay; some model images may be stock or generated and their usage rights are unverified. Each product and ambassador entry can be hidden with `"published": false` in `catalog.json`.

---

## Addendum v5 — Stage 2, 3, & 4 Product & UX Evolution (25 November 2026)

1. **Stage 1 (Immutable):** Data produk (`15` item: `7` baseline + `8` item owner revision), harga, foto lokal WebP, URL Tokopedia global, nomor WhatsApp `082230089520`/`6282230089520`, TikTok `@b_shirt_co`, jam admin WIB, serta foto Brand Ambassador tetap dipertahankan tanpa perubahan klaim bisnis.
2. **UX & Konversi (Stage 2):**
   - Tombol mengambang WhatsApp (`.wa-fab`) disesuaikan dengan `env(safe-area-inset-*)`, ruang aman kanan pada panel rak mobile, serta deteksi anti-tabrakan CTA dinamis (`.wa-fab--away` tetap terbuka saat menerima fokus keyboard).
   - Seksi Brand Ambassador mobile diringkas menjadi grid 2×2 agar memotong jarak gulir sambil mempertahankan numeral editorial `01`–`04` dan label koleksi.
   - Menambahkan **Modal Detail Produk** (`<dialog id="product-modal">`) yang hanya menampilkan metadata opsional terverifikasi bila tersedia di `catalog.json`, menghitung penghematan promo secara deterministik, menyediakan CTA Tokopedia, WhatsApp per produk, serta lompatan *"Lihat di Rak 3D"*.
   - Menjadikan informasi pembelian di `#info-belanja` sebagai tautan aktif menuju Shop | Tokopedia yang tervalidasi.
3. **Engineering & QA Maturity (Stage 3) & Pengalaman Brand (Stage 4):**
   - Panggung 3D satu-konteks WebGL1 menggabungkan atmosfer shader adaptif (`backdrop-shader.js`), simulasi kain Verlet (`cloth.js`), siluet gantungan satu garis `b-shirt`, dan kartu melengkung (`geometry.js`, `orbit-scene.js`) dengan prioritas tekstur foreground serta adaptasi kualitas perangkat mobile.
   - Pengukuran analitik (`track.js`) bersifat provider-neutral dan bebas PII (`page_view`, `detail_open`, `scene_fallback`, serta event klik konversi yang ada).
   - Suite uji diperluas dengan unit/integrasi (`node --test`), browser E2E (`tests/e2e.mjs`), pemindaian WCAG 2.2 AA (`axe-core`), verifikasi lazy-loading (`tools/screenshots.mjs`), audit Lighthouse (`tools/lighthouse-audit.mjs`), serta pipeline CI (`.github/workflows/ci.yml`). Lihat `docs/reports/GEMBUL_V5_STAGE_2_3_4_FINAL_AUDIT.md` untuk hasil pengukuran aktual.
