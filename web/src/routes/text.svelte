<script lang="ts">
  import { onMount } from "svelte"

  export const prerender = false
  export const ssr = false

  import { svelteStore, connectRoom } from "../lib/synced-store"

  let input: HTMLInputElement

  $: text = $svelteStore.data["text"] || "..."

  onMount(() => {
    connectRoom()
    input.focus()
  })

  function onType(e) {
    $svelteStore.data["text"] = e.target.value
  }
</script>

<main class="w-auto h-screen">
  <input
    type="text"
    class="w-full h-full text-3xl p-2 text-center border"
    value={text}
    bind:this={input}
    on:keyup={onType}
  />
</main>

<style>
  :global(html, body) {
    background-color: rgba(0, 0, 0, 0) !important;
  }
</style>
