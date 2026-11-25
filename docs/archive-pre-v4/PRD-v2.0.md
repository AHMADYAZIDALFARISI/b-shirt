# PRD — b-shirt Official Web Catalog

**Versi:** 2.0 (Final MVP — source baseline)  
**Tanggal sumber:** 24 November 2026  
**Status dokumen:** Baseline kebutuhan produk  
**Jenis produk:** Mobile-first web catalog & Shop bridge

> Dokumen ini mempertahankan kebutuhan bisnis dari PRD sumber. Rekomendasi atau keputusan tambahan yang belum disetujui ditandai sebagai catatan, bukan dianggap sebagai requirement yang sudah disahkan.

---

## 1. Informasi Produk

| Atribut | Detail |
|---|---|
| Nama produk | b-shirt Official Web Catalog |
| Model bisnis | Online-only fashion store; tanpa toko fisik/alamat |
| Sumber traffic utama | TikTok bio: https://www.tiktok.com/@b_shirt_co |
| Kanal transaksi | Shop \| Tokopedia (redirect langsung) |
| Kanal layanan pelanggan | WhatsApp Admin: 082230089520 |
| Jam operasional | Senin–Sabtu, 08.00–17.00 WIB |
| Zona waktu | Asia/Jakarta |

## 2. Ringkasan Eksekutif

b-shirt membutuhkan website katalog yang ringan dan cepat diakses, terutama melalui TikTok In-App Browser. Website menjadi etalase utama untuk menemukan produk, membandingkan harga promo, dan berpindah ke kanal transaksi Shop | Tokopedia.

### Tujuan utama
1. **Mempercepat konversi tanpa hambatan:** tidak ada registrasi atau keranjang internal; pengunjung melihat produk, membandingkan harga, lalu menuju kanal pembelian.
2. **Menonjolkan produk baru dan promo:** New Arrivals berada di bagian atas; harga promo dan diskon dikelola melalui data.
3. **Memisahkan koleksi Cowok dan Cewek:** zona Cowok menggunakan biru muda; zona Cewek menggunakan pink muda, dengan identitas brand netral tetap dominan.

## 3. Masalah & Peluang

Pengunjung datang dari media sosial dengan perhatian terbatas dan kemungkinan menggunakan browser dalam aplikasi. Pengalaman harus mengurangi langkah, menjaga halaman ringan, dan memperlihatkan produk dengan cepat.

Peluang produk:
- Menjadikan katalog sebagai tujuan utama dari TikTok.
- Memudahkan pengunjung membedakan koleksi.
- Menampilkan promo dan produk baru secara terstruktur.
- Menyediakan bantuan admin ketika pengunjung membutuhkan informasi tambahan.

## 4. Tujuan dan Non-Tujuan

### In-scope MVP
- Mobile-first responsive catalog.
- TikTok In-App Browser compatibility.
- Announcement bar untuk promo.
- Status operasional otomatis berdasarkan Asia/Jakarta.
- Sticky header dan quick jump Cowok/Cewek.
- New Arrivals otomatis berdasarkan `is_new`.
- Section Cowok dan Cewek dengan warna berbeda.
- Harga normal, harga promo, dan persentase diskon otomatis.
- Redirect ke global Shop | Tokopedia dengan dukungan override URL per produk.
- WhatsApp Admin dan TikTok profile links.
- Data katalog terpisah dari tampilan (JSON; dapat dipetakan ke Sheets/CMS ringan).

### Out-of-scope MVP
- Instagram integration.
- Alamat fisik, lokasi offline, Google Maps.
- Shopping cart, akun/login, payment gateway internal.
- Kalkulator ongkir dan pelacakan resi internal.
- Order management internal.

## 5. Target Pengguna & Kebutuhan

### Pengunjung dari TikTok
Membutuhkan akses cepat ke katalog dan produk baru tanpa harus membaca banyak konten pengantar.

### Pengunjung yang membandingkan produk
Membutuhkan foto, nama, harga normal, harga promo, dan diskon yang konsisten.

### Pengunjung yang membutuhkan bantuan
Membutuhkan akses WhatsApp Admin yang jelas dan informasi jam operasional.

## 6. User Journey

1. Pengunjung membuka tautan website dari bio TikTok.
2. Halaman menampilkan promo, status admin, navigasi Cowok/Cewek, dan New Arrivals.
3. Pengunjung menekan quick navigation atau scroll ke koleksi.
4. Pengunjung membandingkan foto, nama, harga normal, harga promo, dan diskon.
5. Pengunjung memilih Beli Sekarang atau area kartu produk.
6. Website membuka tujuan Shop | Tokopedia pada tab baru.
7. Jika perlu bantuan, pengunjung membuka WhatsApp dengan pesan pembuka.

## 7. Functional Requirements

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| FR-01 | Promo bar & operating status | Promo tampil hanya jika `promo_banner.active === true`; label jam operasional tampil; status menggunakan `Asia/Jakarta`; Senin–Sabtu 08:00–16:59 = Admin Online, selain itu Di Luar Jam Operasional | P0 |
| FR-02 | Sticky header & quick jump | Logo b-shirt; tombol Cowok/Cewek menuju `#area-cowok` dan `#area-cewek`; smooth scroll memperhitungkan tinggi sticky header | P0 |
| FR-03 | New Arrivals | Otomatis memfilter `is_new === true`; NEW badge; tampil di atas setelah header; mobile memakai grid dua kolom atau carousel scroll-snap | P0 |
| FR-04 | Men's collection | Background `#EFF6FF`, border `#DBEAFE`; accent `#1E3A5F`; heading Koleksi Cowok; semua `gender === "cowok"` ditampilkan | P0 |
| FR-05 | Women's collection | Background `#FFF1F2`, border `#FCE7E7`? **Source PRD: `#FCE7F3`**; accent `#9D174D`; heading Koleksi Cewek; semua `gender === "cewek"` ditampilkan; featured item span 2 columns pada mobile untuk jumlah ganjil | P0 |
| FR-06 | Product cards, pricing, redirect | Rasio image 3:4; NEW badge; discount badge; nama max 2 baris; harga; Beli Sekarang; diskon dihitung otomatis; URL `product.product_url ?? site_config.global_shop_url`; target blank + noopener noreferrer | P0 |
| FR-07 | WhatsApp, trust information, footer | Floating WhatsApp dengan pesan default; trust information menjelaskan online store, transaksi Shop \| Tokopedia, jam admin; footer berisi logo, jam, WhatsApp, TikTok | P0 |

## 8. Non-Functional Requirements

### NFR-01 Performance
- Lighthouse Mobile target >=90.
- LCP target <=2.5 detik pada kondisi 4G pengujian.
- Gambar di bawah fold menggunakan lazy loading.
- Hindari layout shift dengan dimensi/aspect ratio gambar.

### NFR-02 Compatibility
- TikTok In-App Browser Android dan iOS.
- Chrome Mobile.
- Safari iOS.
- Rentang mobile 360–430px.
- Tidak ada clipping atau layout shift yang mengganggu.

### NFR-03 External link safety
- Outbound links memakai `rel="noopener noreferrer"` saat `target="_blank"`.
- URL Shop | Tokopedia lengkap, termasuk `encode_params`, tidak boleh diubah atau dipotong.

### NFR-04 Accessibility
- Kontras teks normal >=4.5:1.
- Target interaksi minimal 44×44px.
- Navigasi keyboard dan focus state.
- Status tidak hanya dibedakan dengan warna.

### NFR-05 Metadata
- Favicon dari ikon gantungan baju/logo b-shirt.
- Open Graph: `og:title`, `og:description`, `og:image`.

## 9. Design & Content Constraints

- Dominasi putih/hitam mengikuti identitas logo.
- Cowok: `#EFF6FF`, accent `#1E3A5F`, border `#DBEAFE`.
- Cewek: `#FFF1F2`, accent `#9D174D`, border `#FCE7F3`.
- Font: Plus Jakarta Sans atau Inter.
- Image ratio 3:4; object-fit cover.
- On-model/mannequin: object-position top jika ditentukan.
- Flatlay/trousers: object-position center jika ditentukan.
- Mobile grid 2 kolom, gap 12px.
- Tablet 3 kolom, gap 16px.
- Desktop 4 kolom, gap 20px; max container 1140px.

## 10. Product Catalog — Initial Data

| ID | Gender | Product name | New | Featured | Original | Promo | Discount |
|---|---|---|---:|---:|---:|---:|---:|
| cw-01 | Cowok | Korean Camel Oversized Coat & Turtleneck Look | Yes | No | Rp349.000 | Rp249.000 | 29% |
| cw-02 | Cowok | Basic White Tee & Light-Wash Baggy Jeans | Yes | No | Rp229.000 | Rp169.000 | 26% |
| ce-01 | Cewek | Earth-Tone Knit Vest & Pleated Culotte Set | Yes | Yes | Rp269.000 | Rp189.000 | 30% |
| ce-02 | Cewek | Sky Blue Lace-Trim Wide Leg Trousers | Yes | No | Rp179.000 | Rp129.000 | 28% |
| ce-03 | Cewek | Ivory High-Waist Corduroy Wide Pants | No | No | Rp189.000 | Rp139.000 | 26% |
| ce-04 | Cewek | Black Midi Dress & Cream Cropped Cardigan Set | No | No | Rp249.000 | Rp179.000 | 28% |
| ce-05 | Cewek | Blush Floral Ruffle Dress & Crochet Bolero Set | No | No | Rp259.000 | Rp185.000 | 29% |

Expected counts:
- Total: 7.
- New Arrivals: 4.
- Cowok: 2.
- Cewek: 5.
- Featured: ce-01.

Product images must map to the source PRD asset filenames. Do not invent fabric, size, stock, fit, origin, or care details.

## 11. Site Configuration

```json
{
  "site_config": {
    "brand_name": "b-shirt",
    "logo_path": "/assets/logo-bshirt.webp",
    "global_shop_url": "USE THE EXACT FULL URL FROM THE SOURCE PRD",
    "whatsapp": {
      "display": "0822-3008-9520",
      "number": "6282230089520",
      "default_message": "Halo Admin b-shirt, saya ingin bertanya mengenai produk di katalog web."
    },
    "tiktok_url": "https://www.tiktok.com/@b_shirt_co",
    "operating_hours": {
      "label": "Senin - Sabtu, 08.00 - 17.00 WIB",
      "timezone": "Asia/Jakarta",
      "days_open": [1, 2, 3, 4, 5, 6],
      "open_hour": 8,
      "close_hour": 17
    },
    "promo_banner": {
      "active": true,
      "event_label": "12.12 SALE",
      "text": "PROMO TANGGAL KEMBAR: Diskon hingga 30% untuk Koleksi Baru!"
    }
  }
}
```

**Implementation note:** replace the placeholder `global_shop_url` with the complete literal URL from the original PRD. Preserve it exactly; do not reconstruct or shorten it.

## 12. Success Metrics / KPI

- Outbound Shop CTR target: 25%–35% of visitors from TikTok bio click a product toward Shop | Tokopedia.
- WhatsApp Inquiry Rate: users who need help can contact admin in one click with contextual message.
- Promo update efficiency: promo text, NEW flags, and prices can be updated in under 5 minutes through the data file.

These are targets from the source PRD, not measured results. Instrument analytics before reporting actual performance.

## 13. Launch Checklist

- [ ] Seven product images and logo optimized to WebP.
- [ ] Full Tokopedia URL works from TikTok In-App Browser.
- [ ] Operating status tested during open and closed hours.
- [ ] Discount math and Rupiah formatting correct.
- [ ] WhatsApp and TikTok links verified.
- [ ] No Instagram or physical address references.
- [ ] No unsupported product or trust claims.
- [ ] Mobile widths 360–430px verified.
- [ ] Accessibility and performance targets measured.

## 14. Open Decisions / Risks

1. Confirm whether the Tokopedia destination is a global shop/product landing URL or whether each product requires a dedicated product URL. The source PRD specifies global URL with future per-product override.
2. Confirm final logo and product asset availability in the implementation workspace.
3. Confirm whether the `12.12 SALE` banner is active for the actual launch date; promo activation must be configurable.
4. Trust copy must be limited to verified facts. The source PRD requests “jaminan transaksi aman”; wording should not imply a guarantee beyond what the Shop | Tokopedia platform itself provides.
5. KPI targets require analytics instrumentation and should not be reported as achieved without data.
