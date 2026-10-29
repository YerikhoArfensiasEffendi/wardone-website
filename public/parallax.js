/**
 * WARDONE — MULTIPLANE PARALLAX MOVING BACKGROUND CONTROLLER
 * - Standar Igloo Inc & AAA Game Landing: Multi-layer depth tracking for Section 1.
 * - Buttery smooth damped lerp interpolation (matching 3D mascot 60fps).
 * - Micro ambient drift (gentle floating islands & cloud breathing).
 * - Auto-pauses when scrolled past Section 1 to conserve 100% GPU/CPU.
 */

import { subscribeGyro } from './gyro.js';

export function initParallax() {
  const stage = document.getElementById('parallax-bg-stage');
  if (!stage) return;

  const layers = Array.from(stage.querySelectorAll('.parallax-layer')).map((el) => ({
    el,
    depth: parseFloat(el.getAttribute('data-depth')) || 0.2,
    drift: parseFloat(el.getAttribute('data-drift')) || 0,
  }));

  if (!layers.length) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isVisible = true;
  let rafId = null;

  const MAX_OFFSET_X = 100; // px max travel horizontally (aktif & berasa)
  const MAX_OFFSET_Y = 46;  // px max travel vertically (kedalaman 3D terasa)

  function onPointerMove(e) {
    if (e.pointerType === 'mouse') {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Mobile Gyroscope motion engine
  const unsubscribeGyro = subscribeGyro((gx, gy) => {
    targetX = gx;
    targetY = gy;
  });

  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || ('ontouchstart' in window));

  // Paus kalkulasi jika Section 1 sudah keluar dari viewport (hemat resource baterai & GPU)
  function checkVisibility() {
    const cutoff = window.innerHeight * (isMobile ? 0.95 : 1.15);
    isVisible = window.scrollY < cutoff;
  }
  window.addEventListener('scroll', checkVisibility, { passive: true });

  const startTime = performance.now();

  function loop() {
    rafId = requestAnimationFrame(loop);

    if (!isVisible) return;

    // Smooth lerp damping (0.065 per frame)
    const diffX = targetX - currentX;
    const diffY = targetY - currentY;
    currentX += diffX * 0.065;
    currentY += diffY * 0.065;

    // Mobile: Jika HP diam (perubahan gyro < 0.001), hindari repaint berulang pada DOM
    if (isMobile && Math.abs(diffX) < 0.0008 && Math.abs(diffY) < 0.0008) {
      return;
    }

    const elapsed = performance.now() - startTime;

    for (let i = 0; i < layers.length; i++) {
      const { el, depth, drift } = layers[i];

      // Parallax mouse travel (berlawanan arah pandang untuk ilusi kedalaman)
      const px = -currentX * MAX_OFFSET_X * depth;
      const py = -currentY * MAX_OFFSET_Y * depth;

      // Organic multi-frequency ambient breathing/drift (terasa hidup alami seperti melayang di awan)
      let ambientX = 0;
      let ambientY = 0;
      if (drift > 0) {
        ambientX = (Math.sin((elapsed * 0.0007) + (i * 1.4)) * 2.8 + Math.cos((elapsed * 0.0003) + (i * 0.8)) * 1.4) * drift;
        ambientY = (Math.cos((elapsed * 0.0009) + (i * 1.8)) * 3.8 + Math.sin((elapsed * 0.0004) + (i * 1.1)) * 1.6) * drift;
      }

      const totalX = px + ambientX;
      const totalY = py + ambientY;

      el.style.transform = `translate3d(${totalX.toFixed(2)}px, ${totalY.toFixed(2)}px, 0)`;
    }
  }

  rafId = requestAnimationFrame(loop);

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', checkVisibility);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/**
 * WARDONE — INTERACTIVE ROLES CLAIM PARALLAX CONTROLLER
 * - Multi-layer depth tracking for Section 4 Roles Claim (PNG Objects).
 * - Buttery smooth damped lerp interpolation (60fps).
 * - Micro ambient drift (gentle breathing & floating).
 * - IntersectionObserver auto-pauses when scrolled away (100% GPU/CPU conserved).
 */
export function initRolesParallax() {
  const stage = document.getElementById('roles-parallax-stage');
  if (!stage) return;

  const layers = Array.from(stage.querySelectorAll('.roles-parallax-layer')).map((el) => ({
    el,
    depth: parseFloat(el.getAttribute('data-depth')) || 0.15,
    drift: parseFloat(el.getAttribute('data-drift')) || 0,
  }));

  if (!layers.length) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isVisible = false;
  let rafId = null;

  const MAX_OFFSET_X = 64; // px max travel horizontally
  const MAX_OFFSET_Y = 32; // px max travel vertically

  function onPointerMove(e) {
    if (e.pointerType === 'mouse') {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Mobile Gyroscope motion engine for Roles Section
  const unsubscribeRolesGyro = subscribeGyro((gx, gy) => {
    targetX = gx;
    targetY = gy;
  });

  // IntersectionObserver to pause when out of viewport
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { rootMargin: '120px 0px 120px 0px' });
  observer.observe(stage);

  const startTime = performance.now();

  function loop() {
    rafId = requestAnimationFrame(loop);

    if (!isVisible) return;

    // Smooth lerp damping (0.065 per frame)
    currentX += (targetX - currentX) * 0.065;
    currentY += (targetY - currentY) * 0.065;

    const elapsed = performance.now() - startTime;

    for (let i = 0; i < layers.length; i++) {
      const { el, depth, drift } = layers[i];

      // Parallax mouse travel
      const px = -currentX * MAX_OFFSET_X * depth;
      const py = -currentY * MAX_OFFSET_Y * depth;

      // Micro ambient drift (gentle floating)
      let ambientX = 0;
      let ambientY = 0;
      if (drift > 0) {
        ambientX = Math.sin((elapsed * 0.0008) + (i * 1.5)) * 2.2 * drift;
        ambientY = Math.cos((elapsed * 0.001) + (i * 1.8)) * 3.2 * drift;
      }

      const totalX = px + ambientX;
      const totalY = py + ambientY;

      el.style.transform = `translate3d(${totalX.toFixed(2)}px, ${totalY.toFixed(2)}px, 0)`;
    }
  }

  rafId = requestAnimationFrame(loop);

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    observer.disconnect();
    if (rafId) cancelAnimationFrame(rafId);
  };
}
