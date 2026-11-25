// Interactive 3D product orbit controller.
// The HTML controls (filters, prev/next, panel, buy link) work on their own — in 2D — as soon as
// this file runs. The WebGL ring is loaded on top of them only when the visitor has engaged with
// the page and the stage is near the viewport, so it never delays products or the Tokopedia CTA.
import { decideSceneMode, probeWebGL, cappedDpr } from './3d/capability.js';
import { FILTERS, orbitProducts, stepIndex } from './3d/orbit-model.js';
import { orbitView, orbitChipsHtml, orbitPanelHtml } from './lib/render.js';
import { initSlidingChips, initTiltCards, initSpotlightSurfaces } from './ui/tilt-spotlight.js';
import { publishedProducts } from './lib/catalog.js';
import { track } from './lib/track.js';

const MOTION_KEY = 'bshirt:scene-motion';
const readPref = () => { try { return sessionStorage.getItem(MOTION_KEY); } catch { return null; } };
const writePref = (v) => { try { sessionStorage.setItem(MOTION_KEY, v); } catch { /* private mode */ } };

function tokenColors(el) {
  const css = getComputedStyle(el);
  const get = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  return {
    line: get('--scene-line', '#1c1a18'),
    ink: get('--color-ink', '#111111'),
    blank: get('--scene-card-back', '#e7e3dd'),
    new: get('--scene-fabric', '#d9c7b0'),
    women: get('--scene-fabric-women', '#d8b3ad'),
    men: get('--scene-fabric-men', '#a9b8c8'),
  };
}

/**
 * @param {object} config  site_config
 * @param {object[]} products canonical products
 */
export function initStage(config, allProducts, root = document) {
  const products = publishedProducts(allProducts);
  const section = root.querySelector('[data-orbit]');
  if (!section || !products.length) return;
  const box = section.querySelector('[data-scene]');
  const canvas = box.querySelector('canvas');
  const photo = box.querySelector('[data-orbit-photo]');
  const toggle = box.querySelector('[data-scene-toggle]');
  const chipsEl = section.querySelector('[data-orbit-chips]');
  const panel = section.querySelector('[data-orbit-panel]');
  const live = section.querySelector('[data-orbit-live]');
  const $ = (sel) => panel.querySelector(sel);

  // ── state ────────────────────────────────────────────────────────
  let filter = 'all';
  let list = orbitProducts(products, filter);
  const defaultId = config.stage?.default_product;
  let index = Math.max(0, list.findIndex((p) => p.id === defaultId));
  let orbit = null;
  let userPicked = false; // poster (campaign photos) stays until the visitor chooses something

  if (!chipsEl.hasAttribute('data-prerendered')) chipsEl.innerHTML = orbitChipsHtml(FILTERS, filter);
  chipsEl.querySelectorAll('[data-orbit-filter]').forEach((btn) => {
    if (!btn.querySelector('.chip__count')) {
      const cnt = orbitProducts(products, btn.dataset.orbitFilter).length;
      const span = document.createElement('span');
      span.className = 'chip__count';
      span.textContent = String(cnt);
      btn.appendChild(span);
    }
  });
  let slidingChips = null;
  const ensureSlidingChips = () => {
    if (!slidingChips) slidingChips = initSlidingChips(chipsEl);
    return slidingChips;
  };
  for (const posterFig of section.querySelectorAll('.poster__figure')) {
    posterFig.setAttribute('data-tilt-card', '');
    posterFig.setAttribute('data-tilt-deg', '6');
  }
  (window.requestIdleCallback || ((cb) => setTimeout(cb, 250)))(() => {
    initTiltCards(section);
    initSpotlightSurfaces(section, '.stage__panel');
  }, { timeout: 900 });

  /** Apply the selected product to the panel and the 2D photo (DOM APIs only, no data in innerHTML). */
  function render({ announce = false } = {}) {
    const p = list[index];
    const v = orbitView(p, config, index, list.length);
    if (!panel.querySelector('[data-orbit-name]')) panel.innerHTML = orbitPanelHtml(v); // dev only (build pre-renders)
    $('[data-orbit-collection]').textContent = v.collection;
    $('[data-orbit-new]').hidden = !v.isNew;
    $('[data-orbit-counter]').textContent = v.counter;
    $('[data-orbit-name]').textContent = v.name;
    $('[data-orbit-now]').textContent = v.priceNow;
    $('[data-orbit-was]').textContent = v.priceWas;
    $('[data-orbit-discount]').textContent = v.discount;
    $('[data-orbit-discount]').hidden = !v.discount;
    const buy = $('[data-orbit-buy]');
    if (v.buyUrl && buy.tagName === 'A') {
      buy.href = v.buyUrl;
      buy.dataset.productId = v.id;
      buy.setAttribute('aria-label', `Beli di Tokopedia: ${v.name} (membuka tab baru)`);
    }
    const see = $('[data-orbit-see]');
    see.href = v.seeHref;
    see.textContent = v.seeLabel;
    const detailBtn = $('[data-orbit-detail]');
    if (detailBtn) detailBtn.dataset.productDetail = v.id;
    photo.srcset = v.photo.srcset;
    photo.src = v.photo.src;
    photo.sizes = '(min-width: 1024px) 560px, 90vw';
    photo.alt = v.name;
    photo.dataset.position = v.photo.position;
    section.dataset.accent = v.accent;
    for (const card of document.querySelectorAll('.card')) {
      card.classList.toggle('card--active', card.dataset.productId === v.id);
    }
    if (userPicked) {
      box.dataset.picked = 'true';
      const isWebglLive = Boolean(orbit) || box.dataset.sceneState === 'live';
      if (isWebglLive) {
        photo.hidden = true;
      } else {
        photo.hidden = false;
        if (box.dataset.sceneState === 'poster') box.dataset.sceneState = 'photo';
      }
    }
    if (announce) live.textContent = `${v.name}, ${v.priceNow}. ${v.counter}`;
  }

  function select(i, { source = 'button', announce = true } = {}) {
    index = stepIndex(i, 0, list.length);
    userPicked = true;
    render({ announce });
    if (source !== 'orbit' && source !== 'tap') orbit?.select(index);
    track('scene_interaction', { product_id: list[index].id, location: `rack-${source}` });
  }

  function setFilter(key) {
    if (key === filter) return;
    const current = list[index]?.id;
    filter = key;
    userPicked = true;
    list = orbitProducts(products, filter);
    const keep = list.findIndex((p) => p.id === current);
    index = keep >= 0 ? keep : 0;
    chipsEl.querySelectorAll('[data-orbit-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.orbitFilter === key)));
    ensureSlidingChips().sync();
    orbit?.setFilterTone?.(key);
    orbit?.setItems(orbitItems(), index);
    render({ announce: true });
    live.textContent = `${FILTERS.find((f) => f.key === key)?.label}: ${list.length} produk. ${live.textContent}`;
    track('collection_navigation', { section: key, location: 'rack-filter' });
  }

  const orbitItems = () => list.map((p) => ({
    src: (p.image_sources?.[0]?.src) || p.image,
    position: p.image_position,
    accent: p.gender === 'cewek' ? 'women' : p.gender === 'cowok' ? 'men' : 'new',
  }));

  // ── HTML controls (work with or without WebGL) ───────────────────
  chipsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-orbit-filter]');
    if (b) setFilter(b.dataset.orbitFilter);
  });
  section.querySelector('[data-orbit-prev]').addEventListener('click', () => select(index - 1));
  section.querySelector('[data-orbit-next]').addEventListener('click', () => select(index + 1));
  section.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); select(index - 1, { source: 'key' }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); select(index + 1, { source: 'key' }); }
  });
  window.addEventListener('bshirt:select-product', (e) => {
    const id = e.detail?.id;
    if (!id) return;
    if (filter !== 'all' && !list.some((p) => p.id === id)) setFilter('all');
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) select(idx, { source: 'detail' });
  });

  render();

  // ── 3D layer ─────────────────────────────────────────────────────
  const reducedMq = matchMedia('(prefers-reduced-motion: reduce)');
  const conn = navigator.connection || {};
  const mode = decideSceneMode({
    webgl: true, // the real probe creates a GPU context, so it runs only right before loading
    reducedMotion: reducedMq.matches,
    saveData: !!conn.saveData,
    cores: navigator.hardwareConcurrency,
    memory: navigator.deviceMemory,
    override: new URLSearchParams(location.search).get('scene'),
  });
  box.dataset.sceneMode = mode;
  if (mode === 'poster') {
    box.dataset.sceneState = 'poster';
    track('scene_fallback', { location: 'capability-poster' });
    return;
  }

  let visible = false, loading = false, userPaused = readPref() === 'off';
  const animated = () => mode === 'live' && !userPaused && !reducedMq.matches;
  const setState = (s) => { box.dataset.sceneState = s; };
  const applyRunning = () => {
    if (!orbit) return;
    orbit.setMotion(animated());
    const run = visible && !document.hidden;
    if (run) orbit.start(); else orbit.stop();
    box.dataset.sceneRunning = String(run && animated());
  };
  const syncToggle = () => {
    toggle.hidden = mode !== 'live' || reducedMq.matches;
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.textContent = userPaused ? 'Putar animasi' : 'Jeda animasi';
  };

  async function load() {
    if (orbit || loading) return;
    if (!probeWebGL()) {
      box.dataset.sceneMode = 'poster';
      setState(userPicked ? 'photo' : 'poster');
      photo.hidden = !userPicked;
      track('scene_fallback', { location: 'webgl-unavailable' });
      return;
    }
    loading = true;
    setState('loading');
    try {
      const { mountOrbit } = await import('./3d/orbit-scene.js');
      const quality = (innerWidth < 640 || (Number.isFinite(navigator.hardwareConcurrency) && navigator.hardwareConcurrency <= 4))
        ? 'medium'
        : 'high';
      orbit = mountOrbit(canvas, {
        colors: {
          ...tokenColors(section),
          rim: getComputedStyle(section).getPropertyValue('--scene-metal-rim').trim() || '#c89b6e',
        },
        dpr: cappedDpr(devicePixelRatio, innerWidth),
        animate: animated(),
        quality,
        onSelect: (i, source) => select(i, { source }),
        onLost: () => {
          orbit = null;
          setState(userPicked ? 'photo' : 'poster');
          photo.hidden = !userPicked;
          track('scene_fallback', { location: 'webgl-context-lost' });
        },
      });
      if (!orbit) throw new Error('WebGL context unavailable');
      orbit.setFilterTone?.(filter);
      orbit.setItems(orbitItems(), index);
      photo.hidden = true;
      setState('live');
      syncToggle();
      applyRunning();
    } catch (error) {
      console.warn('[b-shirt] 3D orbit unavailable, using 2D:', error?.message || error);
      setState(userPicked ? 'photo' : 'poster');
      photo.hidden = !userPicked;
      track('scene_fallback', { location: 'runtime-error' });
    } finally {
      loading = false;
    }
  }

  // Engagement + proximity gate (measured: loading 3D during page load cost ~0.8 s TBT on mobile).
  let engaged = false;
  const EVENTS = ['scroll', 'pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'];
  const maybeLoad = () => {
    if (!engaged || !visible || orbit || loading) return;
    (window.requestIdleCallback || ((cb) => setTimeout(cb, 1)))(() => load(), { timeout: 600 });
  };
  const engage = () => {
    if (engaged) return;
    engaged = true;
    EVENTS.forEach((t) => removeEventListener(t, engage));
    maybeLoad();
  };
  EVENTS.forEach((t) => addEventListener(t, engage, { passive: true }));

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    maybeLoad();
    applyRunning();
  }, { rootMargin: '250px 0px' });
  io.observe(box);

  document.addEventListener('visibilitychange', applyRunning);
  reducedMq.addEventListener?.('change', () => { syncToggle(); applyRunning(); });
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    writePref(userPaused ? 'off' : 'on');
    syncToggle();
    applyRunning();
    track('scene_interaction', { location: userPaused ? 'motion-off' : 'motion-on' });
  });

  // Back/forward cache keeps the page alive (persisted): just stop. A real unload frees GPU memory.
  addEventListener('pagehide', (e) => {
    orbit?.stop();
    if (!e.persisted) { io.disconnect(); orbit?.destroy(); orbit = null; }
  });
  addEventListener('pageshow', (e) => { if (e.persisted) applyRunning(); });
}
