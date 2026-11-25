// Shared HTML renderer used by the browser (dev) and by build.mjs (pre-rendered production HTML).
// Every data value is escaped, so string rendering is safe (SRS 6.4).
import { calcDiscount, formatRupiah, hasValidPromo } from './price.js';
import { resolvePurchaseUrl, buildWhatsAppUrl, productQuestion } from './links.js';
import { newArrivals, byGender, featuredForOddGrid } from './catalog.js';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
const e = escapeHtml;

/** Presentation labels for canonical gender values (data stays cowok/cewek). */
export const GENDER_LABEL = Object.freeze({ cewek: 'Wanita', cowok: 'Pria' });

const EXTERNAL_ICON = '<span class="buy__ext" aria-hidden="true">↗</span>';

const SIZES = {
  card: '(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw',
  featured: '(min-width: 1024px) 620px, (min-width: 640px) 66vw, 50vw',
  campaign: '(min-width: 1024px) 420px, 50vw',
  tile: '(min-width: 1024px) 620px, 50vw',
};

/**
 * Responsive image attributes. Self-hosted photos list their WebP widths in image_sources;
 * Google-hosted illustrations accept a size/format suffix (=w360-rw).
 */
export function imageAttrs(productOrUrl, sizes = SIZES.card) {
  const product = typeof productOrUrl === 'string' ? { image: productOrUrl } : productOrUrl;
  const url = product.image;
  if (Array.isArray(product.image_sources) && product.image_sources.length) {
    const srcset = product.image_sources.map((s) => `${s.src} ${s.w}w`).join(', ');
    return `src="${e(url)}" srcset="${e(srcset)}" sizes="${sizes}"`;
  }
  if (/^https:\/\/lh3\.googleusercontent\.com\/aida-public\/[A-Za-z0-9_-]+$/.test(url)) {
    const srcset = [240, 360, 480, 720].map((w) => `${url}=w${w}-rw ${w}w`).join(', ');
    return `src="${e(`${url}=w360-rw`)}" srcset="${e(srcset)}" sizes="${sizes}"`;
  }
  return `src="${e(url)}"`;
}

function imgHtml(product, { sizes, eager = false, priority = false, alt = product.name } = {}) {
  return `<img ${imageAttrs(product, sizes)} alt="${e(alt)}" data-position="${e(product.image_position)}" ` +
    `loading="${eager ? 'eager' : 'lazy'}"${priority ? ' fetchpriority="high"' : ' decoding="async"'} width="600" height="800">`;
}

function buyHtml(product, config, section) {
  const url = resolvePurchaseUrl(product, config);
  if (!url) {
    return '<span class="buy buy--disabled" role="link" aria-disabled="true">Link toko belum tersedia</span>';
  }
  return `<a class="buy" href="${e(url)}" target="_blank" rel="noopener noreferrer" data-product-id="${e(product.id)}" data-section="${e(section)}" aria-label="${e(`Beli di Tokopedia: ${product.name} (membuka tab baru)`)}">Beli di Tokopedia${EXTERNAL_ICON}</a>`;
}

function askHtml(product, config) {
  const url = buildWhatsAppUrl(config.whatsapp, productQuestion(product));
  if (!url) return '';
  return `<a class="ask" href="${e(url)}" target="_blank" rel="noopener noreferrer" data-wa-link-product="${e(product.id)}" aria-label="${e(`Tanya Admin tentang ${product.name} via WhatsApp (membuka tab baru)`)}">Tanya Admin</a>`;
}

function priceHtml(product) {
  if (!hasValidPromo(product)) {
    return `<p class="price"><span class="price__now">${e(formatRupiah(product.original_price))}</span></p>`;
  }
  return `<p class="price"><span class="sr-only">Harga promo </span><span class="price__now price__now--sale">${e(formatRupiah(product.promo_price))}</span>` +
    `<span class="sr-only">, harga normal </span><s class="price__was">${e(formatRupiah(product.original_price))}</s></p>`;
}

const OPTIONAL_SPEC_FIELDS = [
  ['description', 'Deskripsi'],
  ['color', 'Warna'],
  ['size', 'Ukuran'],
  ['material', 'Bahan'],
  ['fit', 'Potongan'],
  ['care', 'Perawatan'],
  ['variants', 'Varian'],
];

/** Extracts verified optional product fields only when present and non-empty in catalog data. */
export function productDetailSpecs(product) {
  if (!product || typeof product !== 'object') return [];
  const rows = [];
  for (const [key, label] of OPTIONAL_SPEC_FIELDS) {
    const raw = product[key];
    if (Array.isArray(raw)) {
      const joined = raw.map((item) => String(item ?? '').trim()).filter(Boolean).join(', ');
      if (joined) rows.push([label, joined]);
    } else if (typeof raw === 'string' && raw.trim()) {
      rows.push([label, raw.trim()]);
    }
  }
  return rows;
}

function detailButtonHtml(product) {
  return `<button class="ask ask--detail" type="button" data-product-detail="${e(product.id)}" aria-label="${e(`Lihat detail ${product.name}`)}">Detail</button>`;
}

export function cardHtml(product, config, { featured = false, section = '', eager = false, priority = false } = {}) {
  const discount = calcDiscount(product);
  // Gender label only where sections mix genders (New Arrivals); redundant inside Wanita/Pria.
  const meta = section === 'new' ? (GENDER_LABEL[product.gender] || '') : '';
  return `<li class="card${featured ? ' card--featured' : ''}" data-product-id="${e(product.id)}">` +
    `<div class="card__media" data-tilt-card data-tilt-deg="7">${imgHtml(product, { sizes: featured ? SIZES.featured : SIZES.card, eager, priority })}` +
      (product.is_new ? '<span class="badge badge--new">NEW</span>' : '') +
      (discount > 0 ? `<span class="badge badge--sale" aria-label="Diskon ${discount}%">-${discount}%</span>` : '') +
      (product.image_is_illustration ? '<span class="card__illustration">Ilustrasi</span>' : '') +
    '</div>' +
    '<div class="card__body">' +
      (meta ? `<p class="card__meta">${e(meta)}</p>` : '') +
      `<h3 class="card__name" title="${e(product.name)}">${e(product.name)}</h3>` +
      priceHtml(product) +
      '<div class="card__actions">' + buyHtml(product, config, section) + `<div class="card__subactions">${detailButtonHtml(product)}${askHtml(product, config)}</div>` + '</div>' +
    '</div></li>';
}

/** Products for each grid key, in display order. */
export function productsFor(key, products) {
  if (key === 'new') return newArrivals(products);
  return byGender(products, key);
}

export function gridItemsHtml(key, products, config, { eagerFirst = 0 } = {}) {
  const list = productsFor(key, products);
  if (!list.length) return '<li class="grid__empty">Belum ada produk di bagian ini.</li>';
  // Featured spanning only applies to the gender collections (odd-count rule).
  const featured = key === 'new' ? null : featuredForOddGrid(list);
  return list.map((p, i) => cardHtml(p, config, {
    featured: p === featured,
    section: key,
    eager: i < eagerFirst,
  })).join('');
}

export function promoHtml(promo) {
  if (promo?.active !== true) return '';
  return `<span class="promo__label">${e(promo.event_label)}</span> <span class="promo__text">${e(promo.text)}</span>`;
}

/** Highest discount among New Arrivals, so campaign copy can never overstate it. */
export function maxNewDiscount(products) {
  return newArrivals(products).reduce((max, p) => Math.max(max, calcDiscount(p)), 0);
}

/** Campaign images resolved from real catalog IDs (FR-004). */
export function campaignProducts(config, products) {
  const c = config.campaign;
  if (!c || c.active !== true) return [];
  return (c.product_ids || []).map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 2);
}

/** Campaign text with {max_new_discount} computed from data (never hardcoded). */
export function campaignText(config, products) {
  const max = maxNewDiscount(products);
  const text = config.campaign?.text || '';
  return text.includes('{max_new_discount}') ? (max > 0 ? text.replace('{max_new_discount}', String(max)) : '') : text;
}

/** Hero copy (v4): semantic headline, supporting line and CTA — always DOM, never canvas. */
export function campaignCopyHtml(config, products) {
  const c = config.campaign;
  if (!c || c.active !== true || !campaignProducts(config, products).length) return '';
  const text = campaignText(config, products);
  return (c.eyebrow ? `<p class="hero__eyebrow">${e(c.eyebrow)}</p>` : '') +
    `<h1 class="hero__title" id="campaign-title">${e(c.title)}</h1>` +
    (text ? `<p class="hero__text">${e(text)}</p>` : '') +
    `<a class="hero__cta" href="${e(c.cta_target)}">${e(c.cta_label)}</a>`;
}

/**
 * Hero poster (v4): the campaign photo pair, shown immediately (LCP) and kept as the same-footprint
 * fallback when WebGL is unavailable. The 3D ring fades in over it after engagement.
 */
export function campaignPosterHtml(config, products) {
  const pics = campaignProducts(config, products);
  return pics.map((p, i) =>
    `<figure class="poster__figure" data-tilt-card data-tilt-deg="6">${imgHtml(p, { sizes: SIZES.campaign, eager: true, priority: i === 0 })}` +
    `<figcaption class="poster__caption">${e(p.name)}</figcaption></figure>`).join('');
}

/** Category discovery tiles from site_config.category_tiles (FR-005). */
export function categoryTilesHtml(config, products) {
  const tiles = (config.category_tiles || []).filter((t) =>
    /^#[a-z0-9-]+$/.test(t.target || '') && (t.gender === 'cewek' || t.gender === 'cowok'));
  return tiles.map((t) => {
    const p = products.find((x) => x.id === t.product_id);
    const count = byGender(products, t.gender).length;
    const label = t.label || GENDER_LABEL[t.gender];
    return `<li><a class="tile" href="${e(t.target)}" data-tilt-card data-tilt-deg="9">` +
      (p ? `<span class="tile__media">${imgHtml(p, { sizes: SIZES.tile, alt: '' })}</span>` : '') +
      `<span class="tile__label"><span class="tile__name">${e(label)}</span><span class="tile__count">${count} produk</span></span>` +
      '</a></li>';
  }).join('');
}

/**
 * Brand ambassador imagery (owner request, 25 Nov 2026). No invented names, quotes or claims about
 * which product is worn — each portrait only links to its collection.
 */
export function ambassadorsHtml(config) {
  const a = config.ambassadors;
  if (!a || a.active !== true) return '';
  const people = (a.people || []).filter((p) => p.published !== false && p.image_sources?.length);
  return people.map((p, i) => {
    const label = GENDER_LABEL[p.collection] || '';
    const target = p.collection === 'cewek' ? '#area-cewek' : '#area-cowok';
    const img = { image: p.image_sources[0].src, image_sources: p.image_sources, image_position: p.image_position || 'top' };
    return `<li class="amb amb--${i % 2 ? 'b' : 'a'}">` +
      `<span class="amb__rank" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>` +
      `<figure class="amb__figure">` +
      `<span class="amb__media" data-tilt-card data-tilt-deg="8">${imgHtml(img, { sizes: '(min-width: 1024px) 300px, 50vw', alt: `Brand ambassador b-shirt, koleksi ${label}` })}</span>` +
      `<figcaption class="amb__caption"><span class="amb__role">${e(a.eyebrow || 'Brand Ambassador')}</span>` +
      `<a class="amb__link" href="${target}">Lihat koleksi ${e(label)}</a></figcaption></figure></li>`;
  }).join('');
}

// ── Interactive orbit panel (v3) ──────────────────────────────────────────────────────────
// One view model feeds the pre-rendered HTML (build) and the live updates (stage.js), so the
// panel always shows exactly the catalog data for the selected product.
const COLLECTION_ANCHOR = Object.freeze({ cewek: '#area-cewek', cowok: '#area-cowok' });

export function orbitView(product, config, index, total) {
  const discount = calcDiscount(product);
  const promo = hasValidPromo(product);
  const sources = product.image_sources || [{ src: product.image, w: 400 }];
  return {
    id: product.id,
    name: product.name,
    collection: GENDER_LABEL[product.gender] || '',
    seeHref: COLLECTION_ANCHOR[product.gender] || '#new-arrivals',
    seeLabel: `Lihat koleksi ${GENDER_LABEL[product.gender] || ''}`.trim(),
    counter: `${index + 1} / ${total}`,
    isNew: product.is_new === true,
    priceNow: formatRupiah(promo ? product.promo_price : product.original_price),
    priceWas: promo ? formatRupiah(product.original_price) : '',
    discount: discount > 0 ? `-${discount}%` : '',
    buyUrl: resolvePurchaseUrl(product, config),
    photo: { src: sources[0].src, srcset: sources.map((s) => `${s.src} ${s.w}w`).join(', '), position: product.image_position },
    accent: product.gender === 'cewek' ? 'women' : product.gender === 'cowok' ? 'men' : 'new',
  };
}

export function orbitChipsHtml(filters, active = 'all') {
  return filters.map((f) =>
    `<button class="chip" type="button" data-orbit-filter="${e(f.key)}" aria-pressed="${f.key === active}">${e(f.label)}</button>`).join('');
}

export function orbitPanelHtml(v) {
  const buy = v.buyUrl
    ? `<a class="buy" data-orbit-buy href="${e(v.buyUrl)}" target="_blank" rel="noopener noreferrer" data-product-id="${e(v.id)}" data-section="orbit" aria-label="${e(`Beli di Tokopedia: ${v.name} (membuka tab baru)`)}">Beli di Tokopedia${EXTERNAL_ICON}</a>`
    : '<span class="buy buy--disabled" data-orbit-buy role="link" aria-disabled="true">Link toko belum tersedia</span>';
  return `<p class="pick__meta"><span data-orbit-collection>${e(v.collection)}</span><span class="pick__new" data-orbit-new${v.isNew ? '' : ' hidden'}>NEW</span><span class="pick__counter" data-orbit-counter>${e(v.counter)}</span></p>` +
    `<h3 class="pick__name" data-orbit-name>${e(v.name)}</h3>` +
    `<p class="price pick__price"><span class="sr-only">Harga promo </span><span class="price__now price__now--sale" data-orbit-now>${e(v.priceNow)}</span>` +
    `<span class="sr-only">, harga normal </span><s class="price__was" data-orbit-was>${e(v.priceWas)}</s>` +
    `<span class="pick__discount" data-orbit-discount${v.discount ? '' : ' hidden'}>${e(v.discount)}</span></p>` +
    `<div class="pick__actions">${buy}<button class="pick__detail" type="button" data-orbit-detail data-product-detail="${e(v.id)}">Detail</button><a class="pick__see" data-orbit-see href="${e(v.seeHref)}">${e(v.seeLabel)}</a></div>`;
}
