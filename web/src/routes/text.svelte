<script lang="ts">
  import { io } from "socket.io-client"

  import { onMount } from "svelte"

  export const prerender = false
  export const ssr = false

  import { svelteStore, connectRoom } from "../lib/synced-store"

  $: text = $svelteStore.data["text"] || " "

  onMount(() => {
    const socket = io("ws://streamie-socket.narze.live")

    socket.on("doing", ({ message }) => {
      $svelteStore.data["text"] = message
    })

    const room = window.location.search
      .slice(1)
      .split("&")
      .find((q) => q.startsWith("room="))
      ?.split("=")[1]

    console.log({ room })
    connectRoom(room)

    // input.focus()
  })

  function onType(e) {
    $svelteStore.data["text"] = e.target.value
  }
</script>

<main class="w-auto h-screen">
  <input
    type="text"
    class="w-full h-full text-2xl p-2 text-center"
    value={text}
    on:keyup={onType}
  />
</main>

<style>
  :global(html, body) {
    background-color: rgba(0, 0, 0, 0) !important;
  }

  input {
    background-color: rgba(0, 0, 0, 0) !important;
    color: white;
  }
</style>
