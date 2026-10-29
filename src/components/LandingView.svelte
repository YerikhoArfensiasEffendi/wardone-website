<script>
  export let canvasElement = null;
</script>

<!-- ═════════════════════════════════════════════════════════════════
     SEGMEN 2: LANDING VIEWPORT (100% CLEAN - SISI KANAN/KIRI/BAWAH BERSIH)
     ═════════════════════════════════════════════════════════════════ -->
<main class="landing-viewport" aria-label="Landing Viewport">
  <div class="canvas-container">
    <canvas bind:this={canvasElement} id="webgl-canvas"></canvas>
  </div>
</main>

<style>
  .landing-viewport {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-color: #dce7ee;
    background-image: url('./assets/images/clean_background.png'), url('/assets/images/clean_background.png');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    overflow: hidden;
  }

  .canvas-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  #webgl-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
