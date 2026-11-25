// Outbound destinations (SRS 3.8, 3.9, 6.4).

// Hosts accepted as a Shop | Tokopedia destination. shop-id.tokopedia.com is the host of the
// owner-supplied URL (25 Nov 2026). The other hosts cover the main site; extend only for a
// host the owner actually uses.
export const ALLOWED_SHOP_HOSTS = ['shop-id.tokopedia.com', 'tokopedia.com', 'www.tokopedia.com'];

// The generic homepage is explicitly forbidden as a substitute (SRS 3.8).
const GENERIC_HOMEPAGES = ['https://tokopedia.com', 'https://www.tokopedia.com'];

export function isAllowedShopUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  if (!ALLOWED_SHOP_HOSTS.includes(parsed.hostname)) return false;
  const bare = url.replace(/\/+$/, '');
  return !GENERIC_HOMEPAGES.includes(bare);
}

/**
 * product.product_url ?? site_config.global_shop_url, validated.
 * Returns null when no valid destination exists; callers must then render a disabled CTA.
 * The returned string is the configured value byte-for-byte (never rebuilt or normalised).
 */
export function resolvePurchaseUrl(product, siteConfig) {
  const candidate = product.product_url ?? siteConfig.global_shop_url;
  return isAllowedShopUrl(candidate) ? candidate : null;
}

/** Prefilled WhatsApp message for a specific product (P3-05). */
export function productQuestion(product) {
  return `Halo Admin b-shirt, saya ingin bertanya mengenai produk "${product.name}" di katalog web.`;
}

export function buildWhatsAppUrl(whatsapp, message = whatsapp.default_message) {
  if (!whatsapp || !/^\d{8,15}$/.test(String(whatsapp.number))) return null;
  const base = `https://wa.me/${whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
