<script lang="ts">
  import MainFullVh from "$lib/components/MainFullVh.svelte"
  import Middle from "$lib/components/Middle.svelte"
  import { io } from "socket.io-client"
  import { onMount } from "svelte"

  let messages = []
  let autoread = false
  let clicked = false

  onMount(() => {
    const socket = io("ws://localhost:8080")

    // send a message to the server
    socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) })

    // receive a message from the server
    socket.on("hello from server", (...args) => {
      // ...
      console.log({ args })
    })

    socket.on("message", ({ message, username }) => {
      messages = [...messages, `${username}: ${message}`]

      if (autoread) {
        read(message)
      }
    })
  })

  function read(message: string) {
    new Audio(`https://tts-api.vercel.app/api/tts?text=${message}&lang=th-TH`).play()
  }
</script>

<MainFullVh class="p-4">
  <Middle class="p-8 border rounded-xl">
    <h1 class="text-3xl">ReadME</h1>

    <p>
      {#if !clicked}
        <button on:click={() => (clicked = autoread = true)} class="btn">
          Click me to activate autoreading
        </button>
      {:else}
        <button on:click={() => (autoread = !autoread)} class="btn">
          Autoread : {autoread ? "🔊" : "🔇"}
        </button>
      {/if}
    </p>

    {#each messages as message}
      <p>{message} <button on:click={() => read(message)}>🔉</button></p>
    {/each}
  </Middle>
</MainFullVh>
