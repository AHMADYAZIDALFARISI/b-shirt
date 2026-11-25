// Progressive-enhanced 3D UI micro-interactions for b-shirt:
// 1. Damped spring 3D TiltedCard + specular glare + inner depth parallax (ReactBits + ThreeUI).
// 2. Cursor-tracking SpotlightCard radial surface & rim glow (ReactBits + style.ai.id).
// 3. Sliding spring pill indicator for segmented collection filters (style.ai.id .t-tabs-pill).
// Strictly honors prefers-reduced-motion: reduce and pointer capability (hover-only tilt).

function canTilt() {
  const fineHover = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return fineHover && !reduced;
}

function isReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Attaches damped spring 3D perspective tilt (`--tc-rx`, `--tc-ry`, `--tc-tz`, `--tc-gx`, `--tc-gy`,
 * `--tc-px`, `--tc-py`, `--tc-glow`) to all `[data-tilt-card]` elements.
 * Idempotent: skips elements already wired (`dataset.tiltWired`).
 */
export function initTiltCards(root = document) {
  if (!root || !canTilt()) return () => {};
  const els = [...root.querySelectorAll('[data-tilt-card]')];
  const controllers = [];

  for (const el of els) {
    if (el.dataset.tiltWired === '1') continue;
    el.dataset.tiltWired = '1';
    if (!el.querySelector(':scope > .tilt-glare')) {
      const glare = document.createElement('span');
      glare.className = 'tilt-glare';
      glare.setAttribute('aria-hidden', 'true');
      el.appendChild(glare);
    }

    const maxDeg = Number(el.dataset.tiltDeg) || 8;
    const state = {
      rx: 0, ry: 0, trx: 0, try: 0,
      gx: 50, gy: 35, tgx: 50, tgy: 35,
      glow: 0, tglow: 0,
      raf: 0,
    };

    const apply = () => {
      el.style.setProperty('--tc-rx', `${state.rx.toFixed(2)}deg`);
      el.style.setProperty('--tc-ry', `${state.ry.toFixed(2)}deg`);
      el.style.setProperty('--tc-tz', `${(state.glow * 12).toFixed(2)}px`);
      el.style.setProperty('--tc-gx', `${state.gx.toFixed(1)}%`);
      el.style.setProperty('--tc-gy', `${state.gy.toFixed(1)}%`);
      el.style.setProperty('--tc-px', `${(state.ry / maxDeg * -5).toFixed(2)}px`);
      el.style.setProperty('--tc-py', `${(state.rx / maxDeg * 5).toFixed(2)}px`);
      el.style.setProperty('--tc-glow', state.glow.toFixed(3));
    };

    const tick = () => {
      state.raf = 0;
      if (isReducedMotion()) {
        reset(true);
        return;
      }
      const ease = 0.16;
      state.rx += (state.trx - state.rx) * ease;
      state.ry += (state.try - state.ry) * ease;
      state.gx += (state.tgx - state.gx) * ease;
      state.gy += (state.tgy - state.gy) * ease;
      state.glow += (state.tglow - state.glow) * 0.14;
      apply();
      const moving =
        Math.abs(state.trx - state.rx) > 0.03 ||
        Math.abs(state.try - state.ry) > 0.03 ||
        Math.abs(state.tglow - state.glow) > 0.01;
      if (moving) {
        state.raf = requestAnimationFrame(tick);
      } else if (state.tglow === 0) {
        delete el.dataset.tilting;
      }
    };

    const kick = () => {
      el.dataset.tilting = '1';
      if (!state.raf) state.raf = requestAnimationFrame(tick);
    };

    const reset = (snap = false) => {
      state.trx = 0;
      state.try = 0;
      state.tgx = 50;
      state.tgy = 35;
      state.tglow = 0;
      if (snap) {
        if (state.raf) cancelAnimationFrame(state.raf);
        state.raf = 0;
        state.rx = state.ry = state.glow = 0;
        state.gx = 50;
        state.gy = 35;
        apply();
        delete el.dataset.tilting;
      } else {
        kick();
      }
    };

    const onMove = (e) => {
      if (isReducedMotion()) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      state.try = Math.max(-1, Math.min(1, nx)) * maxDeg;
      state.trx = Math.max(-1, Math.min(1, -ny)) * maxDeg;
      state.tgx = Math.max(0, Math.min(100, (nx * 0.5 + 0.5) * 100));
      state.tgy = Math.max(0, Math.min(100, (ny * 0.5 + 0.5) * 100));
      state.tglow = 1;
      kick();
    };

    const onLeave = () => reset(false);

    el.addEventListener('pointerenter', onMove);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    controllers.push(() => {
      if (state.raf) cancelAnimationFrame(state.raf);
      el.removeEventListener('pointerenter', onMove);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      delete el.dataset.tiltWired;
    });
  }

  return () => controllers.forEach((fn) => fn());
}

/**
 * Cursor-tracking SpotlightCard glow (`--sp-x`, `--sp-y`, `--sp-op`) on cards & service panels.
 */
export function initSpotlightSurfaces(root = document, selector = '[data-spotlight], .card, .service__item') {
  if (!root || typeof matchMedia !== 'function' || !matchMedia('(hover: hover)').matches) return () => {};
  const els = [...root.querySelectorAll(selector)];
  const cleanups = [];

  for (const el of els) {
    if (el.dataset.spotWired === '1') continue;
    el.dataset.spotWired = '1';

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sp-x', `${(e.clientX - r.left).toFixed(1)}px`);
      el.style.setProperty('--sp-y', `${(e.clientY - r.top).toFixed(1)}px`);
      el.style.setProperty('--sp-op', '1');
    };
    const onLeave = () => {
      el.style.setProperty('--sp-op', '0');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      delete el.dataset.spotWired;
    });
  }

  return () => cleanups.forEach((fn) => fn());
}

/**
 * Synchronizes a sliding glass pill (`<span class="chips__pill">`) behind the active
 * `[data-orbit-filter][aria-pressed="true"]` chip inside `chipsEl` (style.ai.id pattern).
 */
export function initSlidingChips(chipsEl) {
  if (!chipsEl) return { sync: () => {}, destroy: () => {} };
  let pill = chipsEl.querySelector('.chips__pill');
  if (!pill) {
    pill = document.createElement('span');
    pill.className = 'chips__pill';
    pill.setAttribute('aria-hidden', 'true');
    chipsEl.prepend(pill);
  }
  chipsEl.dataset.pillReady = '1';

  const sync = () => {
    const active = chipsEl.querySelector('[data-orbit-filter][aria-pressed="true"]');
    if (!active) {
      pill.style.opacity = '0';
      return;
    }
    const w = active.offsetWidth;
    const h = active.offsetHeight;
    const x = active.offsetLeft;
    const y = active.offsetTop;
    pill.style.opacity = '1';
    pill.style.width = `${w}px`;
    pill.style.height = `${h}px`;
    pill.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  requestAnimationFrame(sync);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(sync) : null;
  ro?.observe(chipsEl);
  addEventListener('resize', sync);
  document.fonts?.ready?.then?.(sync);

  return {
    sync,
    destroy() {
      ro?.disconnect();
      removeEventListener('resize', sync);
    },
  };
}

/**
 * Convenience boot helper called once on DOM ready from app.js.
 */
export function initUiEffects(root = document) {
  const stopTilt = initTiltCards(root);
  const stopSpot = initSpotlightSurfaces(root);
  return () => {
    stopTilt();
    stopSpot();
  };
}
