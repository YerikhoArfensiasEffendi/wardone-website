<script>
  import { onMount } from 'svelte';
  import LoadingScreen from './components/LoadingScreen.svelte';
  import LandingView from './components/LandingView.svelte';

  let progress = 0;
  let statusText = 'INITIALIZING GRAPHICS PIPELINE...';
  let isLoaded = false;
  let canvasElement = null;

  onMount(() => {
    console.log('[Wardone Basecamp] Initializing Svelte Architecture...');

    // Simulasi loading transisi awal
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (current <= 40) statusText = 'STREAMING 3D MESH & TEXTURES...';
      else if (current <= 70) statusText = 'PARSING RADIANCE ENVIRONMENT...';
      else if (current <= 90) statusText = 'WARMING UP WEBGL 2.0 FRAMEBUFFER...';
      else statusText = 'BASECAMP ENGINE READY.';

      progress = current;

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          isLoaded = true;
        }, 450);
      }
    }, 280);
  });
</script>

<!-- SEGMEN 1: LOADING SCREEN -->
<LoadingScreen {progress} {statusText} {isLoaded} />

<!-- SEGMEN 2: LANDING SCREEN / VIEWPORT -->
<LandingView bind:canvasElement>
  <!-- Slot konten yang akan kita rancang bertahap -->
</LandingView>
