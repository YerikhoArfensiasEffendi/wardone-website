# 📐 Spesifikasi Arsitektur Sistem Web WARDONE

## 1. Stack Teknologi
- **Framework**: Svelte + Vite (ES Modules)
- **3D Engine**: Three.js (WebGL 2.0, ACESFilmicToneMapping, SRGBColorSpace)
- **Audio Engine**: Web Audio API (Native `AudioContext` dengan Range 206 Streaming)
- **Motion**: `svelte/motion` (`spring`, `tweened`) & GSAP

## 2. Alur 2 Segmen
- **Segmen 1 (Loading Screen)**:
  - Berada di `src/components/LoadingScreen.svelte`.
  - Mengelola *pre-warming* GPU shader & pelacakan download Three.js.
  - Membuka transisi tirai ke Segmen 2 setelah mencapai 100%.
- **Segmen 2 (Landing Viewport)**:
  - Berada di `src/components/LandingView.svelte`.
  - Berisi Canvas WebGL 3D (`clean_background.png` + Maskot WARDONE setengah badan).

## 3. Pemetaan Aset (`public/assets/`)
- `3d/maskot.glb`: Model 3D GLTF Binary (810K verteks).
- `images/clean_background.png`: Background kutub murni tanpa vignette.
- `images/cloud_left.png` & `cloud_right.png`: Aset ornamen awan framing.
- `textures/environment_map.hdr`: Radiance equirectangular map untuk pantulan PBR.
- `audio/ambient.ogg`: Soundscape ambient streaming loop.
- `audio/beep.ogg`: Tactile UI interaction sound effect.
