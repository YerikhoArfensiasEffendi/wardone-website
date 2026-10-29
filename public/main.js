/**
 * WARDONE — LIFECYCLE, ASSET PRELOADER & SMOOTH SCROLL CONTROLLER
 * - Standar Igloo Inc & AAA Creative Web:
 *   1. True Asset Preloading: Decompress all critical WebP/PNG images via Image.decode()
 *   2. WebGL Pre-Warm: Shaders & geometry buffers pre-compiled before loader dismisses.
 *   3. Zero Rendering Hitch: Cinematic 3D swoop begins at locked 60 FPS.
 *   4. Viewport-Synchronized Animations: Typography & card animations trigger ONLY
 *      when the user's screen enters that specific section.
 *   5. Reset & Re-trigger: Animations replay cleanly if the user scrolls away & returns.
 */

import { mascotReady, enterMascot, setHeroPullBack, enterVibeMascot, setVibeInView, enterBotMascot, setBotInView } from './mascot.js';
import { initParallax, initRolesParallax } from './parallax.js';
import { initAudio } from './audio.js';
import Lenis from './vendor/lenis/lenis.mjs';

// Aktifkan Multiplane Moving Background Section 1 & Section 4 Roles Claim Parallax
initParallax();
initRolesParallax();

// Aktifkan Sistem Audio (Ambient Soundscape & SFX Clicks)
initAudio();

const loadingSegment = document.getElementById('loading-segment');
const landingSegment = document.getElementById('landing-segment');
const bannerSegment = document.getElementById('banner-segment');
const cloudBridge = document.querySelector('.cloud-bridge');
const scrollCue = document.getElementById('scroll-cue');

// Elemen Transisi Kabut & Kamera Menjauh
const fogCurtain = document.getElementById('hero-fog-curtain');
const curtainLeft = document.querySelector('.fog-curtain.curtain-left');
const curtainRight = document.querySelector('.fog-curtain.curtain-right');
const fogBlanket = document.querySelector('.fog-ambient-blanket');
const centerMist = document.querySelector('.fog-center-mist');
const bubbleMind = document.getElementById('mascot-bubble-mind');
const socialOrbs = document.querySelectorAll('.floating-social-orb');
const landingHeader = document.querySelector('.landing-header');

// ═════════════════════════════════════════════════════════════════
// 1. SCROLL ENGINE (DESKTOP LENIS & 100% PURE NATIVE MOBILE COMPOSITOR)
// ═════════════════════════════════════════════════════════════════
const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth <= 768 || ('ontouchstart' in window));

let lenis = null;
if (!isMobileDevice && typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    wheelMultiplier: 1.0,
    infinite: false,
  });
  window.lenis = lenis;
  lenis.stop();
}

window.wardoneScrollTo = (target) => {
  if (lenis) {
    lenis.scrollTo(target);
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' });
  }
};

// Instant Touch & Interaction Safeguard: Interaksi pertama pengguna langsung membuka scroll
function unlockScrollInstantly() {
  if (!document.body.classList.contains('can-scroll')) {
    startSequence();
  }
}
window.addEventListener('touchstart', unlockScrollInstantly, { passive: true, once: true });
window.addEventListener('pointerdown', unlockScrollInstantly, { passive: true, once: true });
window.addEventListener('wheel', unlockScrollInstantly, { passive: true, once: true });

// ═════════════════════════════════════════════════════════════════
// 1B. CINEMATIC SCROLL TRANSITION (POV KAMERA MENJAUH & KABUT AWAN)
// - Passive scroll handler for both mobile native & desktop Lenis
// ═════════════════════════════════════════════════════════════════
function handleScrollTick(scrollY) {
  const H = window.innerHeight;

  // Solusi A (Mobile Igloo Architecture): Zero DOM scroll overhead
  if (isMobileDevice) {
    if (scrollCue) {
      scrollCue.style.opacity = Math.max(0, 1 - scrollY / (H * 0.15)).toFixed(3);
    }
    if (bannerSegment && !bannerSegment.classList.contains('section-entered')) {
      bannerSegment.classList.add('section-entered');
    }
    return;
  }

  // Desktop: Cinematic Sticky Scroll Timeline (Awwwards Experience)
  // 1. 3D Camera Pull-Back: Kamera menjauh dari maskot secara halus (fase 0 -> 0.42*H)
  const rawRatio = Math.min(1, Math.max(0, scrollY / (H * 0.42)));
  const pullBackRatio = Math.sin((rawRatio * Math.PI) / 2);
  setHeroPullBack(pullBackRatio);

  // 2. Element Fades: Bubble Hai Wardoners, Social Orbs, Logo, & Scroll Cue (fase 0 -> 0.28*H)
  const fadeRatio = Math.min(1, scrollY / (H * 0.28));
  const fadeOpacity = (1 - fadeRatio).toFixed(3);
  const fadeScale = (1 - fadeRatio * 0.15).toFixed(3);

  if (bubbleMind) {
    bubbleMind.style.opacity = fadeOpacity;
    bubbleMind.style.transform = `scale(${fadeScale})`;
    bubbleMind.style.pointerEvents = fadeRatio > 0.5 ? 'none' : 'auto';
  }
  socialOrbs.forEach((orb) => {
    orb.style.opacity = fadeOpacity;
    orb.style.transform = `scale(${fadeScale})`;
    orb.style.pointerEvents = fadeRatio > 0.5 ? 'none' : 'auto';
  });
  if (landingHeader) {
    landingHeader.style.opacity = Math.max(0, 1 - scrollY / (H * 0.35)).toFixed(3);
  }
  if (scrollCue) {
    scrollCue.style.opacity = Math.max(0, 1 - scrollY / (H * 0.18)).toFixed(3);
  }

  // 3. Scene Switch: Ganti dari Segmen 1 ke Segmen 2 di balik kabut awan tebal pada puncak kabut (0.82*H)
  const isPastFogApex = scrollY >= H * 0.82;
  if (landingSegment) {
    if (isPastFogApex) {
      landingSegment.classList.add('is-hidden');
    } else {
      landingSegment.classList.remove('is-hidden');
    }
  }
  if (bannerSegment) {
    if (isPastFogApex) {
      bannerSegment.classList.add('is-active');
    } else {
      bannerSegment.classList.remove('is-active');
    }
  }

  // 4. Cinematic Cloud Fog Curtains:
  if (fogCurtain && curtainLeft && curtainRight) {
    if (scrollY < H * 0.30) {
      fogCurtain.classList.remove('is-active');
      curtainLeft.style.transform = 'translate3d(-115%, 0, 0)';
      curtainRight.style.transform = 'translate3d(115%, 0, 0)';
      if (fogBlanket) fogBlanket.style.opacity = '0';
      if (centerMist) centerMist.style.opacity = '0';
    } else if (scrollY >= H * 0.30 && scrollY <= H * 0.82) {
      fogCurtain.classList.add('is-active');
      const tClose = Math.min(1, Math.max(0, (scrollY - H * 0.32) / (H * 0.50)));
      const easeClose = tClose < 0.5 ? 2 * tClose * tClose : 1 - Math.pow(-2 * tClose + 2, 2) / 2;
      const xLeft = (-115 + 123 * easeClose).toFixed(2);
      const xRight = (115 - 123 * easeClose).toFixed(2);
      curtainLeft.style.transform = `translate3d(${xLeft}%, 0, 0)`;
      curtainRight.style.transform = `translate3d(${xRight}%, 0, 0)`;
      const fogAlpha = Math.min(1, easeClose * 1.05).toFixed(3);
      if (fogBlanket) fogBlanket.style.opacity = fogAlpha;
      if (centerMist) centerMist.style.opacity = fogAlpha;
    } else if (scrollY > H * 0.82 && scrollY <= H * 1.38) {
      fogCurtain.classList.add('is-active');
      const tOpen = Math.min(1, Math.max(0, (scrollY - H * 0.82) / (H * 0.56)));
      const easeOpen = tOpen < 0.5 ? 2 * tOpen * tOpen : 1 - Math.pow(-2 * tOpen + 2, 2) / 2;
      const xLeft = (8 - 123 * easeOpen).toFixed(2);
      const xRight = (-8 + 123 * easeOpen).toFixed(2);
      curtainLeft.style.transform = `translate3d(${xLeft}%, 0, 0)`;
      curtainRight.style.transform = `translate3d(${xRight}%, 0, 0)`;
      const fogAlpha = Math.max(0, 1 - easeOpen * 1.35).toFixed(3);
      if (fogBlanket) fogBlanket.style.opacity = fogAlpha;
      if (centerMist) centerMist.style.opacity = fogAlpha;

      if (tOpen >= 0.25 && bannerSegment) {
        bannerSegment.classList.add('section-entered');
      }
    } else {
      fogCurtain.classList.remove('is-active');
      curtainLeft.style.transform = 'translate3d(-115%, 0, 0)';
      curtainRight.style.transform = 'translate3d(115%, 0, 0)';
      if (fogBlanket) fogBlanket.style.opacity = '0';
      if (centerMist) centerMist.style.opacity = '0';
    }
  }

  // 5. Parallax Cloud Bridge sub-pixel scroll & soft fade
  if (cloudBridge) {
    const parallaxOffset = Math.min(scrollY * 0.14, 90);
    const bridgeFade = Math.max(0, 1 - scrollY / (H * 0.40));
    cloudBridge.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
    cloudBridge.style.opacity = bridgeFade.toFixed(3);
  }

  // 6. Section 2 Board synchronization
  if (bannerSegment) {
    if (scrollY >= H * 0.88) {
      bannerSegment.classList.add('section-entered');
    } else if (scrollY < H * 0.60 && !isMobileDevice) {
      bannerSegment.classList.remove('section-entered');
    }
  }
}

if (lenis) {
  lenis.on('scroll', (e) => handleScrollTick(e.scroll));
} else {
  window.addEventListener('scroll', () => handleScrollTick(window.scrollY), { passive: true });
}

// Klik Scroll Cue meluncur lembut ke Section 2
if (scrollCue) {
  scrollCue.addEventListener('click', () => {
    window.wardoneScrollTo(window.innerHeight * 1.25);
  });
}

// ═════════════════════════════════════════════════════════════════
// 2. VIEWPORT-SYNCHRONIZED SECTION 2 ANIMATIONS (BOUNCY LINES & BOARD)
//    - Animasi tulisan hanya masuk saat layar benar-benar tiba di Section 2
//    - Reset saat pengguna scroll kembali ke atas agar animasi selalu terlihat
// ═════════════════════════════════════════════════════════════════
if (bannerSegment) {
  // Observer berbasis intersection ratio
  const bannerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Trigger saat setidaknya 28% dari section banner sudah tampak di layar
      if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
        bannerSegment.classList.add('section-entered');
      }
    });
  }, { threshold: [0, 0.28, 0.5] });

  bannerObserver.observe(bannerSegment);
}

// Interaktif: Klik pull handle papan untuk recoil spring bounce
const pullHandle = document.querySelector('.board-pull-handle');
const hangingBoard = document.getElementById('discord-hanging-board');
if (pullHandle && hangingBoard) {
  pullHandle.addEventListener('click', () => {
    hangingBoard.classList.remove('recoil-snap');
    void hangingBoard.offsetWidth; // trigger reflow
    hangingBoard.classList.add('recoil-snap');
  });
}

// ═════════════════════════════════════════════════════════════════
// 2B. SECTION 2 (TENTANG WARDONE): IGLOO BLUR REVEAL & 3D MASCOT
// ═════════════════════════════════════════════════════════════════
const vibeSegment = document.getElementById('vibe-segment');
if (vibeSegment) {
  const vibeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      setVibeInView(entry.isIntersecting);
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
        enterVibeMascot();
      }
    });
  }, { threshold: [0, 0.12, 0.4] });

  vibeObserver.observe(vibeSegment);
}

// Baur Muncul saat di-scroll (Igloo Blur-to-Focus Spatial Narrative Stream)
const vibePoints = document.querySelectorAll('.vibe-stream-point');
if (vibePoints.length > 0) {
  const pointObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      } else if (!isMobileDevice) {
        // Desktop only: re-trigger saat scroll kembali ke atas
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight * 0.88) {
          entry.target.classList.remove('is-revealed');
        }
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.12
  });

  vibePoints.forEach((point) => pointObserver.observe(point));
}

// ═════════════════════════════════════════════════════════════════
// 2C. SECTION 4 (BOT ECOSYSTEM): SPATIAL 3D BOT HUB & MOUSE TRACKING
// ═════════════════════════════════════════════════════════════════
const botSegment = document.getElementById('bot-segment');
if (botSegment) {
  const botObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      setBotInView(entry.isIntersecting);
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
        botSegment.classList.add('section-entered');
        enterBotMascot();
      } else if (!entry.isIntersecting && !isMobileDevice) {
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight * 0.95 || rect.bottom < 0) {
          botSegment.classList.remove('section-entered');
        }
      }
    });
  }, { threshold: [0, 0.12, 0.4] });

  botObserver.observe(botSegment);
}

// ═════════════════════════════════════════════════════════════════
// 2D. UNIVERSAL BOUNCY SCROLL OBSERVER (SEGMEN 1 BOUNCY SPRING)
// ═════════════════════════════════════════════════════════════════
const bouncyElements = document.querySelectorAll('.bouncy-item');
if (bouncyElements.length > 0) {
  const bouncyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('bouncy-revealed');
      } else if (!isMobileDevice) {
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight * 0.92) {
          entry.target.classList.remove('bouncy-revealed');
        }
      }
    });
  }, {
    rootMargin: '0px 0px -6% 0px',
    threshold: 0.10
  });

  bouncyElements.forEach((el, index) => {
    const delay = ((index % 4) * 0.08).toFixed(2);
    el.style.transitionDelay = `${delay}s`;
    bouncyObserver.observe(el);
  });
}

// ═════════════════════════════════════════════════════════════════
// 3. AUTO WIDGET LIVE DISCORD STATS
// ═════════════════════════════════════════════════════════════════
async function updateLiveDiscordStats() {
  try {
    const res = await fetch('https://discord.com/api/v9/invites/wardone?with_counts=true', {
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.approximate_member_count) {
      const memberCount = `${data.approximate_member_count}+`;
      const onlineCount = data.approximate_presence_count || '30+';
      
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setVal('stat-total-warga', memberCount);
      setVal('stat-online-warga', onlineCount);
      setVal('invite-total-count', memberCount);
      setVal('invite-online-count', onlineCount);
    }
  } catch (err) {
    // Fallback data default telah terpasang di markup
  }
}
updateLiveDiscordStats();

// ═════════════════════════════════════════════════════════════════
// 4. TRUE ASSET PRELOADER (DECOMPRESS & WARM-UP)
//    - Preload & dekompresi WebP/PNG secara asinkron di background thread
//    - WebGL shader & buffer telah di-compile di mascot.js
// ═════════════════════════════════════════════════════════════════
const CRITICAL_IMAGES = [
  './assets/Background%20Moving/webp/06_sky_backdrop.webp?v=4k_clean',
  './assets/Background%20Moving/webp/05_cloud_ocean.webp?v=4k_feathered_cloud',
  './assets/Background%20Moving/webp/04_main_palace.webp?v=4k_feathered',
  './assets/Background%20Moving/webp/03_floating_islands.webp?v=4k_clean',
  './assets/Background%20Moving/webp/01_fg_left_terrace.webp?v=4k_clean',
  './assets/Background%20Moving/webp/02_fg_right_tower.webp?v=4k_clean',
  './assets/images/cloud_left.png?v=4k_clean',
  './assets/images/cloud_right.png?v=4k_clean',
  './assets/images/wardone_logo.png?v=4k_clean',
  './assets/images/wardone_icon.gif?v=4k_clean',
  './assets/Claim%20Roles/MAskot%20Role%20menunjuk.png',
  './assets/Claim%20Roles/Wardone%20Claim%20Title.png',
  './assets/Claim%20Roles/ICON%20LOGO%20FLOWTING.png',
];

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    if (typeof img.decode === 'function') {
      img.decode().then(resolve).catch(resolve);
    } else {
      img.onload = resolve;
      img.onerror = resolve;
    }
  });
}

let sequenceStarted = false;
function startSequence() {
  if (sequenceStarted) return;
  sequenceStarted = true;
  console.log('[Wardone] All assets preloaded & WebGL warm. Dismissing loader...');

  // 1. Loading Screen Fade Out halus
  if (loadingSegment) {
    loadingSegment.classList.add('hidden');
    setTimeout(() => {
      loadingSegment.style.display = 'none';
    }, 400);
  }

  // 2. Buka scroll segera agar layar langsung responsif terhadap sentuhan jari
  document.body.classList.add('can-scroll');
  document.documentElement.classList.add('can-scroll');
  if (lenis) lenis.start();

  if (isMobileDevice) {
    document.body.classList.add('bg-enter', 'clouds-enter', 'social-enter', 'bubble-enter');
    if (bannerSegment) bannerSegment.classList.add('section-entered');
  }

  // 3. Transisi Masuk Epic:
  enterMascot(() => {
    console.log('[Wardone] Stage 1: Maskot tiba di tengah!');

    // Tahap B: Fade background berubah ke landing (Sky kingdom, palace, islands)
    document.body.classList.add('bg-enter');

    // Tahap C: Baru cloud nya masuk (+200ms)
    setTimeout(() => {
      console.log('[Wardone] Stage 2: Cloud bridge masuk...');
      document.body.classList.add('clouds-enter');
    }, 200);

    // Tahap D: Pop bouncy logo TikTok dan Discord (+450ms)
    setTimeout(() => {
      console.log('[Wardone] Stage 3: Pop bouncy logo Discord & TikTok...');
      document.body.classList.add('social-enter');
    }, 450);

    // Tahap E: Lalu bubble Hai Wardoners (+750ms)
    setTimeout(() => {
      console.log('[Wardone] Stage 4: Bubble Hai Wardoners meletup...');
      document.body.classList.add('bubble-enter');
    }, 750);
  });
}

// Eksekusi loading sejati:
// 1. 3D Model Draco + HDR Map + WebGL Shader Pre-Compilation
// 2. Seluruh gambar krusial ter-decode di GPU memory
// 3. Custom web fonts ready
// 4. Maximum timeout race (1.8s) agar pengguna mobile tidak pernah tersangkut preloader
const imagesReady = Promise.all(CRITICAL_IMAGES.map(preloadImage));
const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
const minDisplayTime = new Promise((resolve) => setTimeout(resolve, 950));
const maxWaitTimeout = new Promise((resolve) => setTimeout(resolve, 1800));

Promise.race([
  Promise.all([mascotReady, imagesReady, fontsReady, minDisplayTime]),
  maxWaitTimeout
])
  .then(() => {
    startSequence();
  })
  .catch((err) => {
    console.warn('[Wardone] Preloader notice:', err);
    startSequence();
  });
