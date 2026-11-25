// P2-10: tool-agnostic outbound click events for the PRD KPIs (Shop CTR, WhatsApp inquiry rate).
// No third-party script is loaded here. Events are:
//   1. pushed to window.dataLayer if an analytics tool (e.g. GTM/GA4) is added later, and
//   2. dispatched as a DOM CustomEvent "bshirt:track" so any tool can listen.
// No personal data is collected: only the event name, product id, section and link location.

export const EVENTS = Object.freeze({
  PAGE_VIEW: 'page_view',
  SHOP_CLICK: 'shop_click',
  WHATSAPP_CLICK: 'whatsapp_click',
  TIKTOK_CLICK: 'tiktok_click',
  COLLECTION_NAVIGATION: 'collection_navigation',
  SCENE_INTERACTION: 'scene_interaction',
  SCENE_FALLBACK: 'scene_fallback',
  DETAIL_OPEN: 'detail_open',
});

export function buildEvent(name, detail = {}) {
  if (!Object.values(EVENTS).includes(name)) throw new Error(`Unknown event: ${name}`);
  const clean = {};
  for (const key of ['product_id', 'section', 'location']) {
    if (typeof detail[key] === 'string' && detail[key]) clean[key] = detail[key];
  }
  return { event: name, ...clean };
}

export function track(name, detail, win = globalThis.window) {
  const payload = buildEvent(name, detail);
  if (!win) return payload;
  if (Array.isArray(win.dataLayer)) win.dataLayer.push(payload);
  try {
    win.dispatchEvent(new CustomEvent('bshirt:track', { detail: payload }));
  } catch { /* CustomEvent unsupported: ignore, never block navigation */ }
  return payload;
}

/** Map a clicked element to an event, based on data attributes set by the renderer. */
export function eventFromLink(link) {
  if (!link) return null;
  if (link.matches('a.buy')) {
    return [EVENTS.SHOP_CLICK, { product_id: link.dataset.productId, section: link.dataset.section, location: 'product_card' }];
  }
  if (link.matches('.nav__link, .tile, .hero__cta, .amb__link, .pick__see')) {
    const where = link.matches('.nav__link') ? 'header' : link.matches('.tile') ? 'category_tile' : link.matches('.hero__cta') ? 'hero' : link.matches('.amb__link') ? 'ambassador' : 'rack';
    return [EVENTS.COLLECTION_NAVIGATION, { section: (link.getAttribute('href') || '').replace('#', ''), location: where }];
  }
  if (link.matches('a.ask')) {
    return [EVENTS.WHATSAPP_CLICK, { product_id: link.dataset.waLinkProduct, location: 'product_card' }];
  }
  if (link.matches('[data-shop-footer] a')) return [EVENTS.SHOP_CLICK, { location: 'footer' }];
  if (link.matches('[data-shop-info] a')) return [EVENTS.SHOP_CLICK, { location: 'info' }];
  if (link.matches('[data-wa-link]')) return [EVENTS.WHATSAPP_CLICK, { location: link.dataset.waLocation || 'unknown' }];
  if (link.matches('[data-tiktok-link]')) return [EVENTS.TIKTOK_CLICK, { location: 'footer' }];
  return null;
}
