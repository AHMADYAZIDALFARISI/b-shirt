// Accessible extensible Product Detail Modal (<dialog>) for b-shirt.
// Displays only verified fields present in catalog.json; missing optional fields are omitted cleanly.
import { escapeHtml, GENDER_LABEL, productDetailSpecs, imageAttrs } from '../lib/render.js';
import { calcDiscount, formatRupiah, hasValidPromo } from '../lib/price.js';
import { resolvePurchaseUrl, buildWhatsAppUrl, productQuestion } from '../lib/links.js';
import { track, EVENTS } from '../lib/track.js';

const EXTERNAL_ICON =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 2h5v5h-1.5V4.6L7 10.1 5.9 9l5.5-5.5H9zM3 4h4v1.5H3.5v7h7V9H12v5H2V4z"/></svg>';

function bestPhoto(product) {
  const sources = Array.isArray(product.image_sources) && product.image_sources.length
    ? product.image_sources
    : [{ src: product.image, w: 400 }];
  return sources[sources.length - 1]?.src || product.image;
}

export function renderModalBody(product, config) {
  const e = escapeHtml;
  const promo = hasValidPromo(product);
  const discount = calcDiscount(product);
  const savings = promo ? formatRupiah(product.original_price - product.promo_price) : '';
  const collection = GENDER_LABEL[product.gender] || '';
  const specs = productDetailSpecs(product);
  const buyUrl = resolvePurchaseUrl(product, config);
  const waUrl = buildWhatsAppUrl(config.whatsapp, productQuestion(product));
  const hiRes = bestPhoto(product);

  const specsHtml = specs.length
    ? `<dl class="pmodal__specs">${specs.map(([label, val]) => `<div class="pmodal__spec"><dt>${e(label)}</dt><dd>${e(val)}</dd></div>`).join('')}</dl>`
    : '';

  const buyBtn = buyUrl
    ? `<a class="buy pmodal__buy" href="${e(buyUrl)}" target="_blank" rel="noopener noreferrer" data-product-id="${e(product.id)}" data-section="detail-modal" aria-label="${e(`Beli di Tokopedia: ${product.name} (membuka tab baru)`)}">Beli di Tokopedia${EXTERNAL_ICON}</a>`
    : '<span class="buy buy--disabled pmodal__buy" role="link" aria-disabled="true">Link toko belum tersedia</span>';

  const waBtn = waUrl
    ? `<a class="ask pmodal__ask" href="${e(waUrl)}" target="_blank" rel="noopener noreferrer" data-wa-link-product="${e(product.id)}" aria-label="${e(`Tanya Admin tentang ${product.name} via WhatsApp (membuka tab baru)`)}">Tanya Admin</a>`
    : '';

  return `<div class="pmodal__card">` +
    `<button class="pmodal__close" type="button" data-modal-close aria-label="Tutup detail produk"><span aria-hidden="true">✕</span></button>` +
    `<div class="pmodal__layout">` +
      `<div class="pmodal__media"><img src="${e(hiRes)}" ${imageAttrs(product, '(min-width: 768px) 420px, 90vw').replace(/^src="[^"]*"\s*/, '')} alt="${e(product.name)}" data-position="${e(product.image_position || 'top')}" width="600" height="800"></div>` +
      `<div class="pmodal__body">` +
        `<div class="pmodal__badges">` +
          `<span class="pmodal__cat">${e(collection)}</span>` +
          (product.is_new ? '<span class="badge badge--new pmodal__badge">NEW</span>' : '') +
          (discount > 0 ? `<span class="badge badge--sale pmodal__badge">-${discount}%</span>` : '') +
        `</div>` +
        `<h2 class="pmodal__title" id="pmodal-title">${e(product.name)}</h2>` +
        `<p class="pmodal__price">` +
          `<span class="price__now${promo ? ' price__now--sale' : ''}">${e(formatRupiah(promo ? product.promo_price : product.original_price))}</span>` +
          (promo ? `<s class="price__was">${e(formatRupiah(product.original_price))}</s>` : '') +
          (savings ? `<span class="pmodal__save">Hemat ${e(savings)}</span>` : '') +
        `</p>` +
        specsHtml +
        `<p class="pmodal__note">Katalog resmi b-shirt (toko online). Transaksi diselesaikan di Shop | Tokopedia; tanya Admin via WhatsApp pada jam operasional.</p>` +
        `<div class="pmodal__actions">${buyBtn}${waBtn}<button class="pmodal__rack" type="button" data-modal-rack="${e(product.id)}">Lihat di Rak 3D</button></div>` +
      `</div>` +
    `</div>` +
  `</div>`;
}

export function initProductModal({ products, config, onSelectInRack, bindDelegation = true } = {}) {
  const dialog = document.getElementById('product-modal');
  if (!dialog || !Array.isArray(products)) return { open: () => {}, close: () => {} };
  const byId = new Map(products.map((p) => [p.id, p]));
  let lastTrigger = null;

  function close() {
    if (dialog.open) dialog.close();
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  function open(productId, triggerEl = null) {
    const product = byId.get(productId);
    if (!product) return;
    lastTrigger = triggerEl || document.activeElement;
    dialog.innerHTML = renderModalBody(product, config);
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector('[data-modal-close]')?.focus();
    track(EVENTS.DETAIL_OPEN, { product_id: product.id, location: 'modal' });
  }

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-modal-close]')) {
      close();
      return;
    }
    const rackBtn = e.target.closest('[data-modal-rack]');
    if (rackBtn) {
      const id = rackBtn.dataset.modalRack;
      close();
      onSelectInRack?.(id);
    }
  });

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  if (bindDelegation) {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest?.('[data-product-detail]');
      if (trigger) {
        e.preventDefault();
        open(trigger.dataset.productDetail, trigger);
      }
    });
  }

  return { open, close };
}
