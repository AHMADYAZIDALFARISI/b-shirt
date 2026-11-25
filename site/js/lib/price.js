// Pricing rules (SRS 3.7, BR-05).

export function hasValidPromo(product) {
  const { original_price: o, promo_price: p } = product;
  return Number.isFinite(o) && Number.isFinite(p) && o > 0 && p > 0 && p < o;
}

/** Discount percentage, or 0 when no valid promo exists. */
export function calcDiscount(product) {
  if (!hasValidPromo(product)) return 0;
  return Math.round(((product.original_price - product.promo_price) / product.original_price) * 100);
}

const IDR_FORMAT = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** "Rp249.000" — format used by the prototype; see open question OI-5 (space or not). */
export function formatRupiah(value) {
  return 'Rp' + IDR_FORMAT.format(value);
}
