/**
 * WARDONE — AUDIO CONTROLLER (AMBIENT LOOP & SFX CLICKS)
 * - Standard Igloo Inc & AAA Web Experience:
 *   1. Ambient Soundscape loop (ambient.mp3 / ambient.ogg) with smooth volume fade-in/fade-out
 *   2. Instant 0ms latency UI click sound effect (beep.mp3) on interactive elements
 *   3. Modern Web Audio API context with unlock on first user gesture
 *   4. Controlled via the bottom-left #sound-toggle-btn using official Wardone Display font
 */

let audioCtx = null;
let clickBuffer = null;
let ambientAudio = null;
let isSoundOn = false;

// Pre-load & decode click SFX buffer for instant playback
async function loadClickBuffer() {
  if (clickBuffer) return clickBuffer;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) audioCtx = new AudioContextClass();

    const response = await fetch('./assets/audio/beep.mp3');
    const arrayBuf = await response.arrayBuffer();
    clickBuffer = await audioCtx.decodeAudioData(arrayBuf);
    return clickBuffer;
  } catch (err) {
    console.warn('[Wardone Audio] SFX decode notice:', err);
    return null;
  }
}

// Play click SFX with Web Audio or fallback
export function playClickSfx() {
  if (!isSoundOn) return;

  // Use decoded buffer for 0ms latency
  if (audioCtx && clickBuffer) {
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const source = audioCtx.createBufferSource();
      source.buffer = clickBuffer;
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.55;
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      source.start(0);
      return;
    } catch (_) {}
  }

  // Fallback Audio element
  try {
    const sfx = new Audio('./assets/audio/beep.mp3');
    sfx.volume = 0.45;
    sfx.play().catch(() => {});
  } catch (_) {}
}

// Ambient Soundscape Controller (Smooth Fade In / Fade Out)
let fadeInterval = null;

function fadeInAmbient() {
  if (!ambientAudio) {
    ambientAudio = new Audio('./assets/audio/ambient.mp3');
    ambientAudio.loop = true;
    ambientAudio.volume = 0;
  }

  clearInterval(fadeInterval);
  ambientAudio.play().catch((err) => {
    console.warn('[Wardone Audio] Ambient autoplay notice:', err);
  });

  const targetVol = 0.35;
  fadeInterval = setInterval(() => {
    if (ambientAudio.volume < targetVol) {
      ambientAudio.volume = Math.min(targetVol, ambientAudio.volume + 0.035);
    } else {
      ambientAudio.volume = targetVol;
      clearInterval(fadeInterval);
    }
  }, 60);
}

function fadeOutAmbient() {
  if (!ambientAudio) return;

  clearInterval(fadeInterval);
  fadeInterval = setInterval(() => {
    if (ambientAudio.volume > 0.035) {
      ambientAudio.volume = Math.max(0, ambientAudio.volume - 0.04);
    } else {
      ambientAudio.volume = 0;
      ambientAudio.pause();
      clearInterval(fadeInterval);
    }
  }, 50);
}

// Master Toggle
export function setSoundState(state) {
  isSoundOn = state;
  const toggleBtn = document.getElementById('sound-toggle-btn');

  if (toggleBtn) {
    toggleBtn.setAttribute('aria-pressed', isSoundOn ? 'true' : 'false');
    const stateEl = toggleBtn.querySelector('.sound-state');
    if (stateEl) stateEl.textContent = isSoundOn ? 'ON' : 'OFF';

    if (isSoundOn) {
      toggleBtn.classList.add('sound-active');
    } else {
      toggleBtn.classList.remove('sound-active');
    }
  }

  if (isSoundOn) {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    fadeInAmbient();
    playClickSfx();
  } else {
    fadeOutAmbient();
  }
}

export function initAudio() {
  const toggleBtn = document.getElementById('sound-toggle-btn');
  if (!toggleBtn) return;

  // Pre-load click buffer in background
  loadClickBuffer();

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setSoundState(!isSoundOn);
  });

  // Global Click Listener for interactive elements across all segments
  document.addEventListener('click', (e) => {
    if (!isSoundOn) return;

    // Trigger on any interactive clickable element
    const interactiveTarget = e.target.closest(
      'button:not(#sound-toggle-btn), a, summary, [role="button"], .social-pill, .floating-social-orb, .cta-btn, .cloud-game-tile, .team-pedestal, .deck-module-cell, .faq-line-trigger'
    );

    if (interactiveTarget) {
      playClickSfx();
    }
  }, { capture: true });
}
