# Evaluasi Usabilitas Pelanggan & Rencana Pengukuran Konversi — b-shirt v5

> **Catatan Metodologi (Transparansi):** Skenario di bawah ini disusun melalui **evaluasi heuristik & simulasi walkthrough** berbasis inspeksi kode dan pengujian browser Chromium/Chrome DevTools. Pengujian langsung bersama responden pelanggan nyata maupun uji pada perangkat fisik (iOS Safari, Android Chrome, dan browser in-app TikTok) belum dilakukan pada tahap ini dan masuk ke daftar verifikasi lapangan pada `RELEASE_READINESS_CHECKLIST.md`.

---

## 1. Evaluasi Heuristik Perjalanan Pelanggan (Task 4.7)

### Skenario A — Pengunjung dari TikTok ingin langsung memahami brand
- **Tujuan pengguna:** Mengenali brand `b-shirt`, posisi toko (online-only, bukan penipuan alamat palsu), serta koleksi utama dalam 3 detik pertama.
- **Jalur yang diharapkan:** Promo strip / Header glass pill → Hero judul editorial + foto/rak 3D → CTA *"Lihat New Arrivals"*.
- **Jalur aktual:** Judul, subjudul promo data-driven (`Diskon hingga 30%`), CTA utama, dan poster LCP ganda tampil langsung pada paint pertama tanpa menunggu WebGL. Setelah interaksi pertama, panggung 3D terintegrasi dengan siluet gantungan khas `b-shirt`.
- **Friksi yang ditemukan & disempurnakan:** Sebelumnya tombol `wa-fab` melayang di pojok kanan bawah menyentuh tombol aksi rak pada layar 360–390px, dan foto poster hero berukuran kecil dengan margin tebal. Diperbaiki via padding aman kanan pada `.pick__*`, penyembunyian dinamis `.wa-fab--away` saat bertabrakan dengan CTA aktif, dan poster hero penuh bingkai.
- **Tingkat keparahan awal → status:** Tinggi (overlap mobile) → **Teratasi & diverifikasi lewat browser E2E**.

### Skenario B — Pengunjung mencari produk spesifik yang dilihat di media sosial
- **Tujuan pengguna:** Menemukan produk tertentu dari koleksi New Arrivals, Wanita, atau Pria dengan cepat dan memeriksa harga promo.
- **Jalur yang diharapkan:** Filter cepat pada rak (`Semua` / `New Arrivals` / `Wanita` / `Pria`) atau navigasi header → Kartu produk dengan badge `NEW`, persentase diskon, harga coret, dan tombol `Detail`.
- **Jalur aktual:** Filter menggeser pil penanda dan memperbarui penghitung `tabular-nums`, tombol panah `← →` dan keyboard Arrow menavigasi kartu, serta kartu grid aktif ditandai `.card--active` saat dipilih di rak. Tombol **Detail** membuka modal informasi lengkap (`720w` WebP, penghematan Rupiah terhitung, tautan Tokopedia & WhatsApp).
- **Friksi tersisa (catatan jujur):** Dengan 15 produk, belum ada kolom pencarian teks/sortir harga karena skala katalog masih ringkas (`<= 15` item); jika katalog tumbuh melampaui ~30 SKU di fase mendatang, pertimbangkan filter pencarian teks lokal tanpa backend.
- **Status:** **Diverifikasi lewat browser E2E**.

### Skenario C — Eksplorasi koleksi Pria dan Wanita
- **Tujuan pengguna:** Membandingkan koleksi Wanita dan Pria tanpa bingung dengan urutan atau jumlah produk.
- **Jalur yang diharapkan:** Tile kategori (`Wanita 7 produk` / `Pria 8 produk`) → Scroll menuju `#area-cewek` atau `#area-cowok` atau pilih via filter rak 3D.
- **Jalur aktual:** Kedua tile kategori kini memusatkan foto garmen (`object-position: 50% 48%`, scrim bersih `58%`) dengan angka jumlah produk yang berasal langsung dari data `catalog.json`. Navigasi sticky memiliki `scroll-padding-top: 78px` sehingga judul seksi tidak tertutup header.
- **Status:** **Diverifikasi lewat visual check & E2E**.

### Skenario D — Pengunjung Smartphone Layar Sempit (`360px`–`430px`)
- **Tujuan pengguna:** Menjelajah seluruh halaman secara nyaman dengan satu tangan tanpa elemen menutupi konten atau terpotong menyamping.
- **Jalur yang diharapkan:** Header pill satu baris tanpa scroll horizontal, grid katalog 2 kolom rapi, seksi editorial tidak memanjang berlebihan, dan tombol WA mudah dijangkau tanpa mengganggu kartu.
- **Jalur aktual:** Header bertahan pada satu baris ringkas hingga lebar `360px`; 4 filter chip muat pada 1 baris penuh; seksi *Brand Ambassador / Wajah b-shirt* diringkas menjadi **grid lookbook 2×2** pada mobile; `.wa-fab` tampil ringkas tanpa label panjang dan otomatis menyingkir saat menutup CTA aktif.
- **Status:** **Diverifikasi lewat simulasi Chrome pada `360×800`, `390×844`, `430×932`; perangkat fisik belum diuji**.

### Skenario E — Pengunjung Siap Membeli atau Bertanya
- **Tujuan pengguna:** Menuju tautan resmi Shop | Tokopedia untuk membeli, atau menghubungi WhatsApp Admin `082230089520` dengan pertanyaan tentang item spesifik.
- **Jalur yang diharapkan:** Klik `Beli di Tokopedia` di kartu/rak/modal (atau pada seksi `#info-belanja`), atau klik `Tanya Admin` yang mengisi nama produk secara otomatis pada URL `wa.me`.
- **Jalur aktual:** Seluruh tautan menggunakan URL `global_shop_url` (atau override bila ada) apa adanya tanpa normalisasi, terbuka di tab aman (`rel="noopener noreferrer"`), dan pesan WhatsApp otomatis menyertakan nama produk terkait.
- **Status:** **Diverifikasi unit test + browser E2E** (status akhir transaksi di halaman eksternal Tokopedia bergantung pada koneksi/sistem Tokopedia di luar kendali frontend statis).

---

## 2. Naskah Pengujian Usabilitas Lapangan (Siap Pakai untuk Pemilik)

Pemilik dapat menjalankan tes 10 menit ini dengan 3–5 calon pembeli di HP mereka masing-masing (terutama lewat tautan bio TikTok):

1. **Konteks pembuka (1 menit):**  
   *"Buka link ini langsung dari profil TikTok kami di HP kamu. Jangan takut salah klik — katakan saja dengan suara keras apa yang kamu lihat dan pikirkan."*
2. **Tugas 1 — Kesan pertama (2 menit):**  
   *"Menurutmu ini toko apa, cara belinya lewat mana, dan jam operasional adminnya kapan?"*  
   → Amati apakah partisipan langsung melihat status toko online, Tokopedia, dan jam admin tanpa ragu.
3. **Tugas 2 — Penemuan produk & detail (3 menit):**  
   *"Coba cari produk koleksi Pria atau New Arrivals yang paling menarik menurutmu, buka detailnya, dan lihat harganya."*  
   → Amati apakah partisipan menemukan tombol filter / kartu / tombol `Detail` dengan mudah tanpa merasa 3D mengganggu.
4. **Tugas 3 — Niat beli & tanya admin (2 menit):**  
   *"Seandainya kamu mau beli baju ini atau mau tanya stok/ukuran ke admin, kamu klik yang mana?"*  
   → Pastikan partisipan memahami bahwa pembelian dilanjutkan di Shop | Tokopedia dan chat admin melalui WhatsApp, serta tidak mengira tombol WA menghalangi tombol beli.
5. **Penutup (2 menit):**  
   *"Bagian mana yang terasa lambat, membingungkan, atau kurang meyakinkan di HP kamu?"*

---

## 3. Rencana Pengukuran Konversi Sadar-Privasi (Task 4.8)

Implementasi berada di [site/js/lib/track.js](../../site/js/lib/track.js) (`EVENTS`) menggunakan pola *provider-neutral*: mendorong event ke `window.dataLayer` bila tersedia dan memancarkan `CustomEvent("bshirt:track")` di `window`. **Tidak ada script analitik pihak ketiga yang dimuat secara default**, tidak ada cookie tracking tambahan, dan **tidak ada PII** (`email`, nama pengguna, nomor HP, atau user agent) yang dikumpulkan. Hanya `event`, `product_id`, `section`, dan `location` yang diizinkan oleh `buildEvent()`.

| Event | Pemicu | Parameter Diizinkan | KPI Terkait |
|---|---|---|---|
| `page_view` | Halaman selesai inisialisasi | `location: "catalog"` | Baseline kunjungan |
| `collection_navigation` | Klik link header, tile kategori, CTA hero, ambassador, filter rak, atau `Lihat koleksi` | `section`, `location` | Navigasi & engagement kategori |
| `scene_interaction` | Tap kartu 3D, geser orbit, keyboard nav rak, klik tombol rak modal, atau toggle `Jeda/Putar animasi` | `product_id`, `location` | Engagement pengalaman 3D |
| `scene_fallback` | Mode fallback poster aktif (no WebGL / reduced motion override / context lost / runtime error) | `location` | Rasio kompabilitas WebGL perangkat nyata |
| `detail_open` | Pembukaan modal detail produk (`Detail`) | `product_id`, `location: "modal"` | Product detail-view rate |
| `shop_click` | Klik `Beli di Tokopedia` di kartu, rak 3D, modal detail, Info Belanja, atau footer | `product_id`, `section`, `location` | Outbound Tokopedia CTR (tujuan konversi utama) |
| `whatsapp_click` | Klik `Tanya Admin` per produk, link WA Info Belanja, Footer, atau FAB | `product_id`, `location` | Inquiry conversion rate |
| `tiktok_click` | Klik tautan TikTok `@b_shirt_co` di footer | `location: "footer"` | Cross-channel engagement |
