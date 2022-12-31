<script lang="ts">
  import { browser } from "$app/environment"
  import vhCheck from "vh-check"

  if (browser) {
    vhCheck({ cssVarName: "vh-offset", updateOnTouch: false })
  }
</script>

<main class={$$props.class}>
  <slot />
</main>

<style lang="postcss">
  main {
    height: 100vh;
    height: calc(100vh - var(--vh-offset, 0px));
  }
</style>
