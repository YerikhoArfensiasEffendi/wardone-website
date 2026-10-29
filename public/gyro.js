/**
 * WARDONE — UNIVERSAL GYROSCOPE & SPATIAL MOTION ENGINE
 * - Detects device orientation tilt (gamma: X, beta: Y)
 * - Calibrated for natural handheld phone angle (neutral upright ~48°)
 * - Applies low-pass exponential smoothing to eliminate micro sensor jitter
 * - Supports iOS 13+ permission request on user interaction (touch/click)
 * - Auto-initializes on Android / Chrome with zero friction
 */

const subscribers = new Set();
let isListening = false;
let currentGx = 0;
let currentGy = 0;

function handleOrientation(e) {
  if (e.gamma === null || e.beta === null) return;

  // Gamma: Left / Right tilt (-30 deg to +30 deg -> normalized to [-1, 1])
  const rawGx = Math.max(-1, Math.min(1, e.gamma / 26));

  // Beta: Front / Back tilt (Neutral holding angle is ~48 degrees)
  const neutralBeta = 48;
  const rawGy = Math.max(-1, Math.min(1, (e.beta - neutralBeta) / 26));

  // Low-pass exponential smoothing (buttery smooth response without sensor vibration)
  currentGx += (rawGx - currentGx) * 0.16;
  currentGy += (rawGy - currentGy) * 0.16;

  subscribers.forEach((cb) => {
    try {
      cb(currentGx, currentGy);
    } catch (err) {
      console.warn('[Wardone Gyro] Callback error:', err);
    }
  });
}

function startListening() {
  if (isListening) return;
  isListening = true;
  window.addEventListener('deviceorientation', handleOrientation, { passive: true });
}

export function subscribeGyro(callback) {
  if (typeof callback !== 'function') return () => {};
  subscribers.add(callback);

  // iOS 13+ Safari Permission flow
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    const trigger = () => {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            startListening();
          }
        })
        .catch(() => {});
      window.removeEventListener('touchstart', trigger);
      window.removeEventListener('click', trigger);
    };
    window.addEventListener('touchstart', trigger, { passive: true, once: true });
    window.addEventListener('click', trigger, { passive: true, once: true });
  } else if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
    // Android / standard desktop or mobile browsers
    startListening();
  }

  return () => subscribers.delete(callback);
}
