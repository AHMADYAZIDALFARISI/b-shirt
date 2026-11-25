import { getAdminStatus, nextOpenLabel } from './lib/status.js';
import { resolvePurchaseUrl, buildWhatsAppUrl } from './lib/links.js';
import { validateCatalog, publishedProducts } from './lib/catalog.js';
import { track, eventFromLink, EVENTS } from './lib/track.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const GRID_KEYS = ['new', 'cewek', 'cowok'];

/** Swap a failed image for a neutral placeholder and flag it (SRS §7). */
function replaceBrokenImage(img) {
  if (!img.closest('.card__media, .poster__figure, .tile__media, .amb__media') || img.dataset.failed) return;
  img.dataset.failed = '1';
  const name = img.getAttribute('alt');
  const placeholder = document.createElement('div');
  placeholder.className = 'img-placeholder';
  if (name) {
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', `Foto ${name} belum tersedia`);
  }
  img.replaceWith(placeholder);
  console.warn(`[b-shirt] Missing image: ${img.currentSrc || img.src}`);
}
// Capture phase: image "error" events do not bubble.
document.addEventListener('error', (event) => {
  if (event.target instanceof HTMLImageElement) replaceBrokenImage(event.target);
}, true);

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function renderSections(config, products) {
  // Dev only — production dist/ HTML already marks slots with data-prerendered, skipping JS string synthesis completely.
  const needsRender = ['[data-campaign-copy]', '[data-campaign-poster]', '[data-categories]', '[data-ambassadors]', ...GRID_KEYS.map((k) => `[data-grid="${k}"]`)]
    .some((sel) => {
      const node = $(sel);
      return node && !node.hasAttribute('data-prerendered');
    });

  if (needsRender) {
    const r = await import('./lib/render.js');
    const fill = (slot, html) => {
      if (!slot || slot.hasAttribute('data-prerendered')) return;
      slot.innerHTML = html;
    };
    fill($('[data-campaign-copy]'), r.campaignCopyHtml(config, products));
    fill($('[data-campaign-poster]'), r.campaignPosterHtml(config, products));
    fill($('[data-categories]'), r.categoryTilesHtml(config, products));
    const amb = r.ambassadorsHtml(config);
    if (!amb && !$('[data-ambassadors]')?.hasAttribute('data-prerendered')) $('[data-ambassadors-section]')?.remove();
    else fill($('[data-ambassadors]'), amb);

    for (const key of GRID_KEYS) {
      fill($(`[data-grid="${key}"]`), r.gridItemsHtml(key, products, config));
      const count = $(`[data-count="${key}"]`);
      if (count) count.textContent = `${r.productsFor(key, products).length} produk`;
    }
  } else if (config.ambassadors?.active !== true) {
    $('[data-ambassadors-section]')?.remove();
  }
  // Images that failed before this script ran.
  $$('img').forEach((img) => { if (img.complete && img.naturalWidth === 0) replaceBrokenImage(img); });
}

function renderStatus(config) {
  const hours = config.operating_hours;
  const status = getAdminStatus(hours);
  const nextOpen = status.known && !status.online ? nextOpenLabel(hours) : null;
  for (const node of $$('[data-status]')) {
    node.dataset.online = String(status.online);
    $('[data-status-text]', node).textContent = nextOpen ? `${status.label} · buka ${nextOpen}` : status.label;
  }
  // The WhatsApp button sets expectations outside operating hours.
  const fab = $('.wa-fab');
  if (fab) {
    // Short visible label (never covers products); the reply time is in the accessible name and
    // the status line in Info Belanja.
    const label = nextOpen ? `Chat Admin via WhatsApp, dibalas ${nextOpen}` : 'Chat Admin via WhatsApp';
    fab.setAttribute('aria-label', `${label} (membuka tab baru)`);
  }
}

async function renderConfig(config) {
  const promoNode = $('[data-promo]');
  if (promoNode && !promoNode.hasAttribute('data-prerendered')) {
    const { promoHtml } = await import('./lib/render.js');
    const promo = promoHtml(config.promo_banner);
    if (!promo) $('[data-promo-bar]')?.remove();
    else promoNode.innerHTML = promo;
  } else if (config.promo_banner?.active !== true) {
    $('[data-promo-bar]')?.remove();
  }

  for (const node of $$('[data-hours-label]')) {
    if (!node.textContent) node.textContent = config.operating_hours.label;
  }

  const waUrl = buildWhatsAppUrl(config.whatsapp);
  for (const link of $$('[data-wa-link]')) {
    if (!waUrl) { link.hidden = true; continue; }
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  for (const node of $$('[data-wa-display]')) node.textContent = config.whatsapp.display;
  for (const link of $$('[data-tiktok-link]')) link.href = config.tiktok_url;

  const shopSlot = $('[data-shop-footer]');
  const shopUrl = resolvePurchaseUrl({ product_url: null }, config);
  shopSlot.innerHTML = shopUrl
    ? `<a href="${escapeText(shopUrl)}" target="_blank" rel="noopener noreferrer">Belanja di Tokopedia</a>`
    : '<span class="link-disabled">Tokopedia: link belum tersedia</span>';

  const shopInfo = $('[data-shop-info]');
  if (shopInfo && shopUrl) {
    shopInfo.innerHTML = `Transaksi dilanjutkan di <a href="${escapeText(shopUrl)}" target="_blank" rel="noopener noreferrer">Shop | Tokopedia</a>.`;
  }

  $('[data-year]').textContent = String(new Date().getFullYear());
}

function showConfigWarnings(config, errors) {
  const problems = [...errors];
  if (!resolvePurchaseUrl({ product_url: null }, config)) problems.push('global_shop_url belum diisi / tidak valid');
  if (!problems.length) return;
  console.error('[b-shirt] Configuration problems:', problems);
  // Visible only on local preview so customers never see internal config messages.
  if (['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:') {
    const box = $('[data-config-warning]');
    box.textContent = `Mode pratinjau — perlu dilengkapi: ${problems.join('; ')}.`;
    box.hidden = false;
  }
}

/**
 * The floating WhatsApp button must not sit on top of a primary/secondary CTA: it avoids CTA
 * intersections dynamically, hides on scroll-down, and returns cleanly on clear top/end states or focus.
 */
function setupFab() {
  const fab = $('.wa-fab');
  if (!fab) return;
  let lastY = window.scrollY;
  let ticking = false;

  const overlapsCta = () => {
    const fr = fab.getBoundingClientRect();
    if (!fr.width || !fr.height) return false;
    const targets = document.querySelectorAll('a.buy, .ask, .hero__cta, .pick__see, .pick__detail, .amb__link, .tile, .chip');
    for (const el of targets) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.right > fr.left - 4 && r.left < fr.right + 4 && r.bottom > fr.top - 4 && r.top < fr.bottom + 4) {
        return true;
      }
    }
    return false;
  };

  const update = () => {
    const y = window.scrollY;
    const nearTop = y < 120;
    const nearEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 280;
    const focused = document.activeElement === fab;
    const scrollingDown = y > lastY + 4;
    const blockedByCta = !nearTop && !nearEnd && !focused && overlapsCta();

    if (!focused && (blockedByCta || (!nearTop && !nearEnd && scrollingDown))) {
      fab.classList.add('wa-fab--away');
    } else if (nearTop || nearEnd || y < lastY - 4 || focused) {
      fab.classList.remove('wa-fab--away');
    }
    lastY = y;
    ticking = false;
  };

  const scheduleUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  fab.addEventListener('focus', () => fab.classList.remove('wa-fab--away'));
}

/** Header reflects the section in view (aria-current), so long pages keep their bearings. */
function setupActiveNav() {
  const links = [...document.querySelectorAll('.nav__link[href^="#"]')];
  const byId = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const inView = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) inView.add(en.target.id); else inView.delete(en.target.id); });
    const current = sections.find((sec) => inView.has(sec.id))?.id;
    links.forEach((l) => {
      if (l.getAttribute('href') === '#' + current) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((sec) => io.observe(sec));
}

async function init() {
  let data;
  try {
    // Plain request so it matches the <link rel="preload">; the build versions the URL by hash.
    const response = await fetch(window.CATALOG_URL || 'catalog.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.error('[b-shirt] Failed to load catalog.json', error);
    for (const key of GRID_KEYS) {
      const grid = $(`[data-grid="${key}"]`);
      if (grid && !grid.hasAttribute('data-prerendered')) {
        grid.innerHTML = '<li class="grid__empty">Katalog sedang tidak dapat dimuat. Silakan hubungi Admin via WhatsApp.</li>';
      }
    }
    return;
  }

  const config = data.site_config;
  const products = publishedProducts(data.products ?? []);

  await renderConfig(config);
  await renderSections(config, products);
  renderStatus(config);
  setInterval(() => renderStatus(config), 60_000);
  showConfigWarnings(config, validateCatalog(data));
  setupFab();
  setupActiveNav();
  track(EVENTS.PAGE_VIEW, { location: 'catalog' });

  // Defer pointer micro-interactions until after critical paint; load modal code lazily on first click.
  (window.requestIdleCallback || ((cb) => setTimeout(cb, 200)))(() => {
    import('./ui/tilt-spotlight.js').then((m) => m.initUiEffects(document)).catch(() => {});
  }, { timeout: 900 });

  let modalCtrlPromise = null;
  const ensureModal = () => {
    if (!modalCtrlPromise) {
      modalCtrlPromise = import('./ui/product-modal.js').then((m) => m.initProductModal({
        products,
        config,
        bindDelegation: false,
        onSelectInRack(id) {
          window.dispatchEvent(new CustomEvent('bshirt:select-product', { detail: { id } }));
          document.querySelector('[data-orbit]')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        },
      }));
    }
    return modalCtrlPromise;
  };
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('[data-product-detail]');
    if (trigger) {
      event.preventDefault();
      ensureModal().then((ctrl) => ctrl.open(trigger.dataset.productDetail, trigger));
    }
  });
  // Yield after first paint before initializing the interactive stage controller so FCP/LCP stay unblocked.
  setTimeout(() => {
    import('./stage.js')
      .then((m) => m.initStage(config, products))
      .catch((err) => console.warn('[b-shirt] stage init skipped:', err?.message || err));
  }, 50);

  // One delegated listener for outbound click events; never prevents or delays navigation.
  document.addEventListener('click', (event) => {
    const mapped = eventFromLink(event.target.closest?.('a'));
    if (mapped) track(...mapped);
  });
}

init();
