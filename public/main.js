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
// 1. LENIS SMOOTH SCROLL ENGINE (PREMIUM FLUID MOMENTUM)
// ═════════════════════════════════════════════════════════════════
const lenis = new Lenis({
  autoRaf: true,
  smoothWheel: true,
  duration: 1.25,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  wheelMultiplier: 1.0,
  touchMultiplier: 1.2,
  infinite: false,
});
window.lenis = lenis;

// Kunci scroll selama loading & cinematic entry berlangsung
lenis.stop();

// ═════════════════════════════════════════════════════════════════
// 1B. CINEMATIC SCROLL TRANSITION (POV KAMERA MENJAUH & KABUT AWAN)
// - Saat scroll: POV kamera Three.js menjauh dari maskot secara halus & proporsional
// - Awan menutup dari kanan & kiri seperti kabut tebal menyelimuti hero (volumetrik tanpa potongan)
// - Saat tiba di Segmen 2: Awan terbuka kembali mengungkap konten komunitas
// - Buttery smooth via Lenis sub-pixel scroll engine
// ═════════════════════════════════════════════════════════════════
lenis.on('scroll', (e) => {
  const scrollY = e.scroll;
  const H = window.innerHeight;

  // 1. 3D Camera Pull-Back: Kamera menjauh dari maskot secara halus (fase 0 -> 0.42*H)
  const rawRatio = Math.min(1, Math.max(0, scrollY / (H * 0.42)));
  const pullBackRatio = Math.sin((rawRatio * Math.PI) / 2); // Smooth ease-out sine
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
  //    - Fase 1 (Tutup): Awan menutup dari kiri & kanan seperti kabut (scrollY: 0.32*H -> 0.82*H)
  //    - Fase 2 (Buka): Awan terbuka kembali mengungkap Segmen 2 (scrollY: 0.82*H -> 1.38*H)
  if (fogCurtain && curtainLeft && curtainRight) {
    if (scrollY < H * 0.30) {
      // Sebelum kabut masuk: Maskot terlihat jelas saat kamera menjauh
      fogCurtain.classList.remove('is-active');
      curtainLeft.style.transform = 'translate3d(-115%, 0, 0)';
      curtainRight.style.transform = 'translate3d(115%, 0, 0)';
      if (fogBlanket) fogBlanket.style.opacity = '0';
      if (centerMist) centerMist.style.opacity = '0';
    } else if (scrollY >= H * 0.30 && scrollY <= H * 0.82) {
      // Fase A: Menutup seperti kabut tebal
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
      // Fase B: Terbuka kembali mengungkap Segmen 2
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
      // Selesai transisi: Deaktifkan agar Segmen 2 tampil murni tanpa halangan
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
});

// Klik Scroll Cue meluncur lembut ke Section 2
if (scrollCue) {
  scrollCue.addEventListener('click', () => {
    lenis.scrollTo(window.innerHeight * 1.25, {
      duration: 1.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
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

  // Sinkronisasi real-time via Lenis scroll position
  lenis.on('scroll', (e) => {
    // Saat scroll masuk ke Section 2 (setelah awan mulai terbuka >= 88% tinggi viewport)
    if (e.scroll >= window.innerHeight * 0.88) {
      if (!bannerSegment.classList.contains('section-entered')) {
        bannerSegment.classList.add('section-entered');
      }
    }
    // Saat kembali ke Section 1 (scroll < 60% tinggi viewport): reset untuk re-trigger
    else if (e.scroll < window.innerHeight * 0.60) {
      if (bannerSegment.classList.contains('section-entered')) {
        bannerSegment.classList.remove('section-entered');
      }
    }
  });
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
      } else {
        // Jika user scroll kembali ke atas, kembalikan ke state baur (re-trigger)
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight * 0.88) {
          entry.target.classList.remove('is-revealed');
        }
      }
    });
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.15
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
      if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
        botSegment.classList.add('section-entered');
        enterBotMascot();
      } else if (!entry.isIntersecting) {
        // Reset saat scroll jauh keluar agar re-trigger bouncy pop saat kembali
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight * 0.95 || rect.bottom < 0) {
          botSegment.classList.remove('section-entered');
        }
      }
    });
  }, { threshold: [0, 0.15, 0.4] });

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
      } else {
        // Reset saat scroll kembali ke atas untuk re-trigger bouncy
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
// 2E. BASECAMP CREW FLOATING MENU & SPOTLIGHT CONTROLLER
// ═════════════════════════════════════════════════════════════════
const crewPills = document.querySelectorAll('.crew-pill-btn');
const crewCards = document.querySelectorAll('.crew-full-card');

if (crewPills.length > 0 && crewCards.length > 0) {
  crewPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const targetId = pill.getAttribute('data-crew-target');

      // Update active state di floating menu
      crewPills.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      // Bersihkan spotlight sebelumnya
      crewCards.forEach((c) => {
        c.classList.remove('card-spotlight');
      });

      if (targetId === 'all') {
        const teamSec = document.getElementById('team-segment');
        if (teamSec && typeof lenis !== 'undefined') {
          lenis.scrollTo(teamSec, { offset: -40, duration: 1.1 });
        } else if (teamSec) {
          teamSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        const targetCard = document.getElementById(targetId);
        if (targetCard) {
          // Scroll halus ke card yang dituju
          if (typeof lenis !== 'undefined') {
            lenis.scrollTo(targetCard, { offset: -80, duration: 1.1 });
          } else {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          // Trigger spotlight pulse highlight
          targetCard.classList.remove('card-spotlight');
          void targetCard.offsetWidth; // force reflow
          targetCard.classList.add('card-spotlight');
          setTimeout(() => {
            targetCard.classList.remove('card-spotlight');
          }, 2400);
        }
      }
    });
  });
}

// ═════════════════════════════════════════════════════════════════
// 2F. GALERI MABAR FLOATING FILTER & VIDEO PREVIEW MODAL CONTROLLER
// ═════════════════════════════════════════════════════════════════
const galleryPills = document.querySelectorAll('.gallery-pill-btn');
const clipCards = document.querySelectorAll('.gallery-clip-card');
const previewModal = document.getElementById('clip-preview-modal');
const modalBackdrop = document.getElementById('clip-modal-backdrop');
const modalCloseBtn = document.getElementById('clip-modal-close');
const modalVideo = document.getElementById('modal-video-player');
const modalClipTitle = document.getElementById('modal-clip-title');
const modalClipGame = document.getElementById('modal-clip-game');

// 1. Floating Category Filter Tabs
if (galleryPills.length > 0 && clipCards.length > 0) {
  galleryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const filter = pill.getAttribute('data-clip-filter');

      // Update active state di floating nav
      galleryPills.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      // Filter cards
      clipCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('is-filtered-out');
        } else {
          card.classList.add('is-filtered-out');
        }
      });
    });
  });
}

// 2. Video Preview Modal Controller
function openClipModal(videoSrc, title, game) {
  if (!previewModal) return;
  if (modalClipTitle && title) modalClipTitle.textContent = title;
  if (modalClipGame && game) modalClipGame.textContent = game;
  if (modalVideo) {
    if (videoSrc && !modalVideo.src.includes(videoSrc.replace('./', ''))) {
      modalVideo.src = videoSrc;
    }
    modalVideo.currentTime = 0;
  }
  previewModal.classList.add('active');
  previewModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (typeof lenis !== 'undefined') lenis.stop();

  if (modalVideo) {
    modalVideo.play().catch(() => {});
  }
}

function closeClipModal() {
  if (!previewModal) return;
  previewModal.classList.remove('active');
  previewModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (typeof lenis !== 'undefined') lenis.start();

  if (modalVideo) {
    modalVideo.pause();
  }
}

// 3. Attach Click Listeners ke Tombol Play & Tombol Action Preview
const playButtons = document.querySelectorAll('.clip-play-btn, .clip-preview-action-btn');
playButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const video = btn.getAttribute('data-clip-video') || './assets/images/banner_wardone_smooth.mp4';
    const title = btn.getAttribute('data-clip-title') || 'Cuplikan Mabar WARDONE';
    const game = btn.getAttribute('data-clip-game') || 'WARDONE Basecamp';
    openClipModal(video, title, game);
  });
});

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeClipModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener('click', closeClipModal);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && previewModal && previewModal.classList.contains('active')) {
    closeClipModal();
  }
});

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
// 4. SMART MULTI-STAGE ASSET PRELOADER (DECOMPRESS & WARM-UP)
//    - Stage 1 (Critical): Only Hero stage WebP + Clouds + Logo (< 2MB)
//    - Stage 2 (Deferred): Offscreen Section 2/3 assets decode in background
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
  './assets/images/cloud_left_feathered.png',
  './assets/images/cloud_right_feathered.png',
  './assets/images/wardone_logo.png?v=4k_clean',
  './assets/images/wardone_icon.gif?v=4k_clean',
];

const DEFERRED_IMAGES = [
  './assets/images/banner_wardone_smooth.gif?v=4k_clean',
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

function preloadDeferredAssets() {
  const loadDeferred = () => {
    DEFERRED_IMAGES.forEach((url) => {
      const img = new Image();
      img.src = url;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadDeferred, { timeout: 3000 });
  } else {
    setTimeout(loadDeferred, 1200);
  }
}

let sequenceStarted = false;
function startSequence() {
  if (sequenceStarted) return;
  sequenceStarted = true;
  console.log('[Wardone] Hero assets ready. Dismissing loader...');

  // Start background streaming of deferred offscreen assets
  preloadDeferredAssets();

  // 1. Loading Screen Fade Out halus
  if (loadingSegment) {
    loadingSegment.classList.add('hidden');
  }

  // 2. Transisi Masuk Epic:
  // Beri jeda 120ms agar loader mulai larut, lalu maskot muncul DARI BAWAH KE TENGAH
  setTimeout(() => {
    enterMascot(() => {
      console.log('[Wardone] Stage 1: Maskot tiba di tengah!');

      // Tahap B: Fade background berubah ke landing (Sky kingdom, palace, islands)
      document.body.classList.add('bg-enter');

      // Tahap C: Baru cloud nya masuk (+320ms)
      setTimeout(() => {
        console.log('[Wardone] Stage 2: Cloud bridge masuk...');
        document.body.classList.add('clouds-enter');
      }, 320);

      // Tahap D: Pop bouncy logo TikTok dan Discord (+650ms)
      setTimeout(() => {
        console.log('[Wardone] Stage 3: Pop bouncy logo Discord & TikTok...');
        document.body.classList.add('social-enter');
      }, 650);

      // Tahap E: Lalu bubble Hai Wardoners (+1100ms)
      setTimeout(() => {
        console.log('[Wardone] Stage 4: Bubble Hai Wardoners meletup...');
        document.body.classList.add('bubble-enter');
      }, 1100);

      // Tahap F: Setelah seluruh transisi selesai, buka Lenis smooth scroll (+2100ms)
      setTimeout(() => {
        console.log('[Wardone] Epic intro selesai. Lenis smooth scroll aktif.');
        document.body.classList.add('can-scroll');
        document.documentElement.classList.add('can-scroll');
        lenis.start();
      }, 2100);
    });
  }, 120);
}

// Eksekusi loading sejati:
// 1. 3D Model Draco + HDR Map + WebGL Shader Pre-Compilation
// 2. Seluruh gambar Hero ter-decode di GPU memory
// 3. Custom web fonts ready
// 4. Minimum 1.0 detik agar animasi loading sempat bernapas secara rapi
// 5. Fail-safe timeout 4.5s agar tidak pernah stuck di loading
const imagesReady = Promise.all(CRITICAL_IMAGES.map(preloadImage));
const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
const minDisplayTime = new Promise((resolve) => setTimeout(resolve, 1050));
const maxWaitTimeout = new Promise((resolve) => setTimeout(resolve, 4500));

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
