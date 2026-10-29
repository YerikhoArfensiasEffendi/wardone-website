<script>
  export let isLoaded = false;
</script>

<!-- ═════════════════════════════════════════════════════════════════
     SEGMEN 1: LOADING SCREEN (HANYA GIF WARDONE CLEAN & COMPACT)
     ═════════════════════════════════════════════════════════════════ -->
<section class="loading-screen" class:hidden={isLoaded} aria-label="Loading Screen">
  <div class="loader-content">
    <img src="./assets/images/Wardone Loading.gif" alt="Wardone Loading" class="loader-gif"/>
  </div>
</section>

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background-color: #dce7ee;
    background-image: url('./assets/images/clean_background.png'), url('/assets/images/clean_background.png');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.85s ease, visibility 0.85s ease;
  }

  .loading-screen.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .loader-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader-gif {
    width: 100%;
    max-width: 190px;
    height: auto;
    object-fit: contain;
    display: block;
  }
</style>
