<script lang="ts">
  import MainFullVh from "$lib/components/MainFullVh.svelte"
  import Middle from "$lib/components/Middle.svelte"
  import { io } from "socket.io-client"
  import { onMount } from "svelte"

  let messages = []
  let autoread = false
  let clicked = false

  onMount(() => {
    const socket = io("ws://streamie.narze.live")

    socket.on("message", ({ message, username, language, slow }) => {
      messages = [...messages, `${username}: ${message} (${language ?? "th"})`]

      if (autoread) {
        read(message, language, slow)
      }
    })
  })

  function read(message: string, language: string = "th", slow: boolean = false) {
    if (!canRead) {
      return
    }

    new Audio(
      `https://tts-api.vercel.app/api/tts?text=${message}&lang=${language}&slow=${slow ? "1" : ""}`
    ).play()
  }

  function canRead(message: string): boolean {
    return message.length <= 200
  }
</script>

<MainFullVh class="p-4">
  <!-- <Middle class="p-8 border rounded-xl"> -->
  <h1 class="text-3xl">ReadME</h1>

  <p>พิมพ์ !say ตามด้วยข้อความใน Twitch</p>
  <p>
    {#if !clicked}
      <button on:click={() => (clicked = autoread = true)} class="btn btn-sm">
        Click me to activate autoreading
      </button>
    {:else}
      <button on:click={() => (autoread = !autoread)} class="btn btn-sm">
        Autoread : {autoread ? "🔊" : "🔇"}
      </button>
    {/if}
  </p>

  {#each messages as message}
    <p>
      {message}
      <button on:click={() => read(message)}>🔉</button>
    </p>
  {/each}
  <!-- </Middle> -->
</MainFullVh>
