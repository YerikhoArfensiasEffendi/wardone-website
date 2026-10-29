/**
 * WARDONE — MASKOT 3D (Landing Viewport & Section 2 Basecamp)
 * - Format: Google Draco (.drc / Draco GLB) super ringan & stabil 60 FPS.
 * - Epic Character Entry: Maskot muncul DARI BAWAH KE TENGAH dengan gerakan
 *   bouncy spring & personality yang hidup.
 * - Section 2 Vibe Mascot: Muncul bouncy di kanan, interaktif mengikuti pergerakan kursor mouse.
 * - Dynamic Mouse Tracking: Responsif & ekspresif (yaw, pitch, roll, and position parallax).
 * - Lifecycle Event: Memanggil callback saat tiba di tengah agar background & awan masuk secara staged.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { subscribeGyro } from './gyro.js';

const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth <= 768 || ('ontouchstart' in window));
const targetDPR = isMobileDevice 
  ? 1.0 
  : Math.min(window.devicePixelRatio || 1, 2);

const ENTRY_MS = 1350; // Durasi maskot meluncur naik dari bawah ke tengah (1.35s)

// ═════════════════════════════════════════════════════════════════
// 1. MASKOT UTAMA (SECTION 1 — HERO LANDING)
// ═════════════════════════════════════════════════════════════════
const canvas = document.getElementById('webgl-canvas');
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobileDevice,
    powerPreference: isMobileDevice ? 'default' : 'high-performance',
    precision: isMobileDevice ? 'mediump' : 'highp'
  });
  renderer.setPixelRatio(targetDPR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
} catch (err) {
  console.warn('[Wardone] WebGL Hero init fallback:', err);
}

const scene = new THREE.Scene();

// Kamera Perspektif eye-level stabil untuk karakter showcase
const CAMERA_FOV = 36;
const CAMERA_DIST = 4.3;
const TARGET_CAMERA_Y = 0.35;
const camera = new THREE.PerspectiveCamera(CAMERA_FOV, innerWidth / innerHeight, 0.1, 50);
camera.position.set(0, TARGET_CAMERA_Y, CAMERA_DIST);

const pivot = new THREE.Group();
scene.add(pivot);

// Pencahayaan studio natural & realistis
const ambientLight = new THREE.AmbientLight(0xffffff, 0.32);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfffaf0, 0.65);
dirLight.position.set(2, 4, 3);
scene.add(dirLight);

// Soft rim light dari belakang untuk kontur 3D realistis
const rimLight = new THREE.DirectionalLight(0xd4e5ff, 0.28);
rimLight.position.set(-2.5, 2.5, -2);
scene.add(rimLight);

// ═════════════════════════════════════════════════════════════════
// 2. MASKOT SECTION 2 (KENAPA HARUS NONGKRONG DI WARDONE?)
//    Bouncy entrance, 3D interactive gaze, continuous mouse tracking
// ═════════════════════════════════════════════════════════════════
const vibeCanvas = document.getElementById('webgl-canvas-vibe');
let vibeRenderer = null;
let vibeScene = null;
let vibeCamera = null;
let vibePivot = null;
let vibeEntryStart = null;
let vibeIsEntered = false;
let vibeBaseScale = 1;
let vibeBaseY = 0;
let vibeInView = false;
let currentVibeRotY = 0;
let currentVibeRotX = 0;
let currentVibeRotZ = 0;
let currentVibePosX = 0;
const VIBE_ENTRY_MS = 1000;
const VIBE_FOV = 35;
const VIBE_DIST = 4.3;

if (vibeCanvas && !isMobileDevice) {
  try {
    vibeRenderer = new THREE.WebGLRenderer({
      canvas: vibeCanvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    vibeRenderer.setPixelRatio(targetDPR);
    vibeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    vibeRenderer.toneMappingExposure = 0.90;

    vibeScene = new THREE.Scene();
    vibeCamera = new THREE.PerspectiveCamera(VIBE_FOV, 1, 0.1, 50);
    vibeCamera.position.set(0, 0, VIBE_DIST);
    vibeCamera.lookAt(0, 0, 0);

    // Pencahayaan studio Section 2
    const vAmbient = new THREE.AmbientLight(0xffffff, 0.38);
    vibeScene.add(vAmbient);
    const vDir = new THREE.DirectionalLight(0xfffaf0, 0.72);
    vDir.position.set(2, 4, 3);
    vibeScene.add(vDir);
    const vRim = new THREE.DirectionalLight(0xd4e5ff, 0.35);
    vRim.position.set(-2.5, 2.5, -2);
    vibeScene.add(vRim);

    vibePivot = new THREE.Group();
    vibeScene.add(vibePivot);
  } catch (err) {
    console.warn('[Wardone] Vibe WebGL init fallback:', err);
  }
}

// ═════════════════════════════════════════════════════════════════
// 3. MASKOT SECTION 4 (DITENAGAI BOT KHUSUS WARDONE)
//    Center mascot in the spatial 3D bot hub
// ═════════════════════════════════════════════════════════════════
const botCanvas = document.getElementById('webgl-canvas-bot');
let botRenderer = null;
let botScene = null;
let botCamera = null;
let botPivot = null;
let botEntryStart = null;
let botIsEntered = false;
let botBaseScale = 1;
let botBaseY = 0;
let botInView = false;
let currentBotRotY = 0;
let currentBotRotX = 0;
let currentBotRotZ = 0;
let currentBotPosX = 0;
const BOT_ENTRY_MS = 1000;
const BOT_FOV = 35;
const BOT_DIST = 4.3;

if (botCanvas && !isMobileDevice) {
  try {
    botRenderer = new THREE.WebGLRenderer({
      canvas: botCanvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    botRenderer.setPixelRatio(targetDPR);
    botRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    botRenderer.toneMappingExposure = 0.90;

    botScene = new THREE.Scene();
    botCamera = new THREE.PerspectiveCamera(BOT_FOV, 1, 0.1, 50);
    botCamera.position.set(0, 0, BOT_DIST);
    botCamera.lookAt(0, 0, 0);

    // Pencahayaan studio Section 4
    const bAmbient = new THREE.AmbientLight(0xffffff, 0.38);
    botScene.add(bAmbient);
    const bDir = new THREE.DirectionalLight(0xfffaf0, 0.72);
    bDir.position.set(2, 4, 3);
    botScene.add(bDir);
    const bRim = new THREE.DirectionalLight(0xd4e5ff, 0.35);
    bRim.position.set(-2.5, 2.5, -2);
    botScene.add(bRim);

    botPivot = new THREE.Group();
    botScene.add(botPivot);
  } catch (err) {
    console.warn('[Wardone] Bot WebGL init fallback:', err);
  }
}

// Setup DRACO WebAssembly Decoder (standar Igloo Inc)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./vendor/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const modelSize = new THREE.Vector3();
let entryStart = null;
let swoopFinished = false;
let onSwoopCompleteCallback = null;
let bottomWorldY = 0;
let targetHeight = 0;

// Tracking coordinates (smooth lerp)
const targetMouse = { x: 0, y: 0 };
const mouse = { x: 0, y: 0 };

function fit() {
  if (!renderer) return;
  const width = innerWidth;
  const height = innerHeight;
  const aspect = width / height;

  renderer.setSize(width, height, false);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  if (modelSize.y > 0) {
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * CAMERA_DIST;
    const isMobile = width <= 768;

    // Mobile portrait: skala maskot pas & proporsional agar ada ruang lega untuk logo & bubble
    targetHeight = isMobile ? vh * 0.56 : vh * 0.82;
    const maxW = isMobile ? (vh * aspect * 0.65) : (vh * aspect * 0.90);
    const scale = Math.min(targetHeight / modelSize.y, maxW / Math.max(modelSize.x, modelSize.z));
    pivot.scale.setScalar(scale);

    bottomWorldY = isMobile ? TARGET_CAMERA_Y - (vh * 0.49) : TARGET_CAMERA_Y - (vh / 2);

    // Jika animasi masuk belum mulai, sembunyikan maskot di bawah layar
    if (entryStart === null) {
      pivot.position.y = bottomWorldY - (targetHeight * 1.25);
    } else if (swoopFinished) {
      pivot.position.y = bottomWorldY;
    }
  }
}

function fitVibe() {
  if (!vibeRenderer || !vibeCanvas) return;
  const rect = vibeCanvas.parentElement ? vibeCanvas.parentElement.getBoundingClientRect() : null;
  const isMobile = innerWidth <= 768;
  const defaultW = isMobile ? 150 : 460;
  const defaultH = isMobile ? 240 : 520;
  const w = rect && rect.width > 0 ? rect.width : (vibeCanvas.clientWidth || defaultW);
  const h = rect && rect.height > 0 ? rect.height : (vibeCanvas.clientHeight || defaultH);

  vibeRenderer.setSize(w, h, false);
  vibeCamera.aspect = w / h;
  vibeCamera.updateProjectionMatrix();

  if (modelSize.y > 0) {
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(VIBE_FOV / 2)) * VIBE_DIST;
    const desiredH = vh * (isMobile ? 0.62 : 0.68);
    vibeBaseScale = Math.min(desiredH / modelSize.y, (vh * (w / h) * 0.75) / Math.max(modelSize.x, modelSize.z));
    vibeBaseY = -(modelSize.y * vibeBaseScale * 0.50);
    if (vibeIsEntered && vibeEntryStart === null && vibePivot) {
      vibePivot.scale.setScalar(vibeBaseScale);
      vibePivot.position.y = vibeBaseY;
    }
  }
}

function fitBot() {
  if (!botRenderer || !botCanvas) return;
  const rect = botCanvas.parentElement ? botCanvas.parentElement.getBoundingClientRect() : null;
  const isMobile = innerWidth <= 768;
  const defaultW = isMobile ? 110 : 440;
  const defaultH = isMobile ? 170 : 480;
  const w = rect && rect.width > 0 ? rect.width : (botCanvas.clientWidth || defaultW);
  const h = rect && rect.height > 0 ? rect.height : (botCanvas.clientHeight || defaultH);

  botRenderer.setSize(w, h, false);
  botCamera.aspect = w / h;
  botCamera.updateProjectionMatrix();

  if (modelSize.y > 0) {
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(BOT_FOV / 2)) * BOT_DIST;
    const desiredH = vh * (isMobile ? 0.62 : 0.68);
    botBaseScale = Math.min(desiredH / modelSize.y, (vh * (w / h) * 0.75) / Math.max(modelSize.x, modelSize.z));
    botBaseY = -(modelSize.y * botBaseScale * 0.50);
    if (botIsEntered && botEntryStart === null && botPivot) {
      botPivot.scale.setScalar(botBaseScale);
      botPivot.position.y = botBaseY;
    }
  }
}

// Mouse movement listener (desktop cursor tracking)
window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') {
    targetMouse.x = (e.clientX / innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / innerHeight) * 2 + 1;
  }
}, { passive: true });

// Gyroscope tilt tracking (mobile/tablet physical orientation)
subscribeGyro((gx, gy) => {
  targetMouse.x = gx;
  targetMouse.y = -gy; // Invert Y so tilting phone back looks up, forward looks down
});

// Cubic Overshoot Spring Ease (Pixar/AAA bouncy character curve)
function easeOutBack(t) {
  const c1 = 0.95;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export const mascotReady = renderer ? Promise.all([
  new HDRLoader().loadAsync('./assets/textures/environment_map.hdr').catch(() => null),
  gltfLoader.loadAsync('./assets/3d/maskot.draco.glb').catch(() => null)
]).then(([env, gltf]) => {
  if (!gltf) return;
  if (env) {
    env.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = env;
    scene.environmentIntensity = 0.70;
    if (vibeScene) {
      vibeScene.environment = env;
      vibeScene.environmentIntensity = 0.72;
    }
    if (botScene) {
      botScene.environment = env;
      botScene.environmentIntensity = 0.72;
    }
  }

  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  box.getSize(modelSize);
  const center = box.getCenter(new THREE.Vector3());

  // Pusatkan X/Z dan letakkan dasar model tepat di Y=0 dari pivot
  model.position.set(-center.x, -box.min.y, -center.z);

  // Tambahkan model utama ke Section 1
  pivot.add(model);
  fit();
  addEventListener('resize', fit);

  // Standby di bawah layar sebelum trigger animasi
  if (targetHeight > 0) {
    pivot.position.y = bottomWorldY - (targetHeight * 1.25);
  }

  // Tambahkan model klon ke Section 2
  if (vibePivot) {
    const vibeModel = model.clone(true);
    vibePivot.add(vibeModel);
    // Skala awal 0 (tersembunyi hingga discroll ke Section 2)
    vibePivot.scale.set(0, 0, 0);
    fitVibe();
    addEventListener('resize', fitVibe);

    try {
      vibeRenderer.compile(vibeScene, vibeCamera);
      vibeRenderer.render(vibeScene, vibeCamera);
    } catch (err) {
      console.warn('[Wardone] Vibe WebGL pre-warm note:', err);
    }
  }

  // Tambahkan model klon ke Section 4 (Bot Hub)
  if (botPivot) {
    const botModel = model.clone(true);
    botPivot.add(botModel);
    // Skala awal 0 (tersembunyi hingga discroll ke Section 4)
    botPivot.scale.set(0, 0, 0);
    fitBot();
    addEventListener('resize', fitBot);

    try {
      botRenderer.compile(botScene, botCamera);
      botRenderer.render(botScene, botCamera);
    } catch (err) {
      console.warn('[Wardone] Bot WebGL pre-warm note:', err);
    }
  }

  // WebGL Pre-Warm Pipeline Section 1
  try {
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
  } catch (err) {
    console.warn('[Wardone] WebGL pre-warm note:', err);
  }

  // Render Loop 60fps native — buttery smooth & responsive
  renderer.setAnimationLoop(() => {
    // Lerp mouse damping
    mouse.x += (targetMouse.x - mouse.x) * 0.065;
    mouse.y += (targetMouse.y - mouse.y) * 0.065;

    // ── RENDER MASKOT SECTION 1 ──
    const heroMaxScroll = window.innerHeight * (isMobileDevice ? 0.95 : 1.95);
    if (window.scrollY < heroMaxScroll) {
      if (entryStart !== null) {
        const elapsed = performance.now() - entryStart;
        const k = Math.min(elapsed / ENTRY_MS, 1.0);

        if (k < 1.0) {
          const ease = easeOutBack(k);
          const startPosY = bottomWorldY - (targetHeight * 1.25);

          // Maskot meluncur naik dari bawah ke tengah
          pivot.position.y = startPosY + ((bottomWorldY - startPosY) * ease);
          pivot.position.x = mouse.x * 0.18 * k;

          // Sedikit anggukan kepala lembut saat melesat naik
          pivot.rotation.x = (0.10 * (1 - k)) + (-mouse.y * 0.28 * k);
          pivot.rotation.y = mouse.x * 0.46 * k;
          pivot.rotation.z = -mouse.x * 0.08 * k;

          camera.position.x = mouse.x * 0.10 * k;
          camera.position.y = TARGET_CAMERA_Y + (mouse.y * 0.06 * k);
        } else {
          // Tiba di tengah: Picu callback masuknya background, awan & UI
          if (!swoopFinished) {
            swoopFinished = true;
            if (onSwoopCompleteCallback) onSwoopCompleteCallback();
          }

          // Dynamic Camera Pull-Back saat scroll (kamera menjauh dari maskot secara halus & tidak terlalu jauh)
          currentPullBack += (targetPullBack - currentPullBack) * 0.085;

          // Subtle, noble pull-back (CAMERA_DIST 4.3 -> max 5.85)
          const currentCamDist = CAMERA_DIST + (currentPullBack * 1.55);
          const currentCamY = TARGET_CAMERA_Y + (currentPullBack * 0.12);
          const mouseDamp = 1 - (currentPullBack * 0.18);

          camera.position.x = mouse.x * 0.12 * mouseDamp;
          camera.position.y = currentCamY + (mouse.y * 0.08 * mouseDamp);
          camera.position.z = currentCamDist;

          // Gerakan tracking mouse penuh setelah settle + elevasi mikro halus saat menjauh
          pivot.position.y = bottomWorldY + (currentPullBack * 0.10);
          pivot.position.x = mouse.x * 0.18 * mouseDamp;
          pivot.rotation.y = mouse.x * 0.46 * mouseDamp; // Menoleh kiri-kanan
          pivot.rotation.x = -mouse.y * 0.28 * mouseDamp; // Mendongak-menunduk
          pivot.rotation.z = -mouse.x * 0.08 * mouseDamp; // Natural tilt
        }
      } else {
        // Standby di bawah layar
        if (targetHeight > 0) {
          pivot.position.y = bottomWorldY - (targetHeight * 1.25);
        }
      }

      renderer.render(scene, camera);
    }

    // ── RENDER MASKOT SECTION 2 (KENAPA HARUS NONGKRONG DI WARDONE?) ──
    const canRenderVibe = isMobileDevice 
      ? (vibeInView && window.scrollY >= window.innerHeight * 0.72) 
      : (vibeInView || vibeEntryStart !== null);

    if (vibeRenderer && vibeScene && vibeCamera && canRenderVibe) {
      const time = performance.now() * 0.0015;

      // Target mouse gaze yang santai & lembut (tidak terlalu sensitif)
      const targetRotY = mouse.x * 0.16;
      const targetRotX = -mouse.y * 0.09;
      const targetRotZ = -mouse.x * 0.03;
      const targetPosX = mouse.x * 0.025;

      // Damped lerp: pergerakan super halus, mengalir alami tanpa snap/jerk
      currentVibeRotY += (targetRotY - currentVibeRotY) * 0.045;
      currentVibeRotX += (targetRotX - currentVibeRotX) * 0.045;
      currentVibeRotZ += (targetRotZ - currentVibeRotZ) * 0.045;
      currentVibePosX += (targetPosX - currentVibePosX) * 0.045;

      const breathY = Math.sin(time * 1.5) * 0.016;

      if (vibeEntryStart !== null) {
        const elapsed = performance.now() - vibeEntryStart;
        const k = Math.min(elapsed / VIBE_ENTRY_MS, 1.0);

        // Bouncy character pop spring entrance
        const ease = easeOutBack(k);
        vibePivot.scale.setScalar(vibeBaseScale * ease);
        vibePivot.position.y = (vibeBaseY - 0.25 * (1 - ease)) + breathY;
        vibePivot.position.x = currentVibePosX * k;

        // Welcoming tilt & head turn as it bounces out
        vibePivot.rotation.z = (0.04 * (1 - k)) + (currentVibeRotZ * k);
        vibePivot.rotation.y = currentVibeRotY * k;
        vibePivot.rotation.x = currentVibeRotX * k;

        if (k >= 1.0) {
          vibeEntryStart = null;
        }
      } else if (vibeIsEntered) {
        // Continuous smooth, damped mouse gaze tracking & gentle breathing
        vibePivot.scale.setScalar(vibeBaseScale);
        vibePivot.position.y = vibeBaseY + breathY;
        vibePivot.position.x = currentVibePosX;
        vibePivot.rotation.y = currentVibeRotY;
        vibePivot.rotation.x = currentVibeRotX;
        vibePivot.rotation.z = currentVibeRotZ;
      }

      vibeRenderer.render(vibeScene, vibeCamera);
    }

    // ── RENDER MASKOT SECTION 4 (DITENAGAI BOT KHUSUS WARDONE) ──
    const canRenderBot = isMobileDevice ? botInView : (botInView || botEntryStart !== null);
    if (botRenderer && botScene && botCamera && canRenderBot) {
      const time = performance.now() * 0.0015;

      const targetRotY = mouse.x * 0.16;
      const targetRotX = -mouse.y * 0.09;
      const targetRotZ = -mouse.x * 0.03;
      const targetPosX = mouse.x * 0.025;

      currentBotRotY += (targetRotY - currentBotRotY) * 0.045;
      currentBotRotX += (targetRotX - currentBotRotX) * 0.045;
      currentBotRotZ += (targetRotZ - currentBotRotZ) * 0.045;
      currentBotPosX += (targetPosX - currentBotPosX) * 0.045;

      const breathY = Math.sin(time * 1.5) * 0.016;

      if (botEntryStart !== null) {
        const elapsed = performance.now() - botEntryStart;
        const k = Math.min(elapsed / BOT_ENTRY_MS, 1.0);

        // Bouncy character pop spring entrance
        const ease = easeOutBack(k);
        botPivot.scale.setScalar(botBaseScale * ease);
        botPivot.position.y = (botBaseY - 0.25 * (1 - ease)) + breathY;
        botPivot.position.x = currentBotPosX * k;

        // Welcoming tilt & head turn
        botPivot.rotation.z = (0.04 * (1 - k)) + (currentBotRotZ * k);
        botPivot.rotation.y = currentBotRotY * k;
        botPivot.rotation.x = currentBotRotX * k;

        if (k >= 1.0) {
          botEntryStart = null;
        }
      } else if (botIsEntered) {
        // Continuous smooth, damped mouse gaze tracking & gentle breathing
        botPivot.scale.setScalar(botBaseScale);
        botPivot.position.y = botBaseY + breathY;
        botPivot.position.x = currentBotPosX;
        botPivot.rotation.y = currentBotRotY;
        botPivot.rotation.x = currentBotRotX;
        botPivot.rotation.z = currentBotRotZ;
      }

      botRenderer.render(botScene, botCamera);
    }
  });
}) : Promise.resolve();

let currentPullBack = 0;
let targetPullBack = 0;

export function setHeroPullBack(ratio) {
  targetPullBack = Math.max(0, Math.min(1, ratio));
}

export function enterMascot(onComplete) {
  if (!renderer) {
    if (onComplete) onComplete();
    return;
  }
  entryStart = performance.now();
  onSwoopCompleteCallback = onComplete;
}

export function enterVibeMascot() {
  if (vibeIsEntered) return;
  vibeIsEntered = true;
  vibeEntryStart = performance.now();
  fitVibe();
}

export function setVibeInView(visible) {
  vibeInView = visible;
  if (visible) {
    fitVibe();
  }
}

export function enterBotMascot() {
  if (botIsEntered) return;
  botIsEntered = true;
  botEntryStart = performance.now();
  fitBot();
}

export function setBotInView(visible) {
  botInView = visible;
  if (visible) {
    fitBot();
  }
}
