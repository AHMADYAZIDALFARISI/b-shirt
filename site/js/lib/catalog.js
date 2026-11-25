// Catalog derivation and validation (SRS §4.3, BR-01…BR-04).

/** Products shown on the site: everything except entries explicitly set to "published": false. */
export const publishedProducts = (products) => (products || []).filter((p) => p.published !== false);

export const newArrivals = (products) => products.filter((p) => p.is_new === true);
export const byGender = (products, gender) => products.filter((p) => p.gender === gender);

/** Product that spans two columns on mobile when the collection count is odd (BR-04). */
export function featuredForOddGrid(products) {
  if (products.length % 2 === 0) return null;
  return products.find((p) => p.is_featured === true) ?? products[0] ?? null;
}

/** Returns a list of human-readable problems; empty means the data is valid. */
export function validateCatalog(data) {
  const errors = [];
  const products = Array.isArray(data?.products) ? data.products : [];
  if (!products.length) errors.push('Catalog has no products');
  const ids = new Set();
  for (const p of products) {
    if (!p.id || ids.has(p.id)) errors.push(`Duplicate or missing id: ${p.id}`);
    ids.add(p.id);
    if (!['cowok', 'cewek'].includes(p.gender)) errors.push(`${p.id}: invalid gender`);
    if (!['top', 'center'].includes(p.image_position)) errors.push(`${p.id}: invalid image_position`);
    if (!Number.isFinite(p.original_price) || p.original_price < 0) errors.push(`${p.id}: invalid original_price`);
    if (!Number.isFinite(p.promo_price) || p.promo_price < 0) errors.push(`${p.id}: invalid promo_price`);
    if (typeof p.name !== 'string' || !p.name.trim()) errors.push(`${p.id}: missing name`);
  }
  // v4: configured references must point at real products / anchors (SRS §5).
  const cfg = data?.site_config || {};
  for (const id of cfg.campaign?.product_ids || []) if (!ids.has(id)) errors.push(`campaign.product_ids: unknown product ${id}`);
  for (const t of cfg.category_tiles || []) {
    if (t.product_id && !ids.has(t.product_id)) errors.push(`category_tiles: unknown product ${t.product_id}`);
    if (!/^#[a-z0-9-]+$/.test(t.target || '')) errors.push(`category_tiles: invalid target ${t.target}`);
  }
  if (cfg.stage?.default_product && !ids.has(cfg.stage.default_product)) errors.push(`stage.default_product: unknown product ${cfg.stage.default_product}`);
  return errors;
}
