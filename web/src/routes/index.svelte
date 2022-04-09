<script lang="ts">
  import MainFullVh from "$lib/components/MainFullVh.svelte"
  import Middle from "$lib/components/Middle.svelte"
  import { io } from "socket.io-client"
  import { onMount } from "svelte"

  let messages = []
  let audioQueue: Array<HTMLAudioElement> = []
  let autoread = false
  let clicked = false

  onMount(() => {
    const socket = io("ws://streamie-socket.narze.live")

    socket.on("say", ({ message, username, language, slow }) => {
      messages = [...messages, `${username}: ${message} (${language ?? "th"})`]

      if (autoread) {
        addToReadQueue(message, language, slow)
      }
    })

    setInterval(() => {
      playAudioQueue()
    }, 5000)
  })

  $: if (audioQueue.length > 0) {
    playAudioQueue()
  }

  function playAudioQueue() {
    const audio = audioQueue[0]

    if (audio && audio.paused) {
      audio.addEventListener("ended", (e) => {
        audioQueue = audioQueue.slice(1)
      })

      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch(function (error) {
          audioQueue = audioQueue.slice(1)
        })
      }
    }
  }

  function addToReadQueue(message: string, language: string = "th", slow: boolean = false) {
    if (!canRead) {
      return
    }

    const audio = new Audio(
      `https://tts-api.vercel.app/api/tts?text=${message}&lang=${language}&slow=${slow ? "1" : ""}`
    )

    audioQueue = [...audioQueue, audio]
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
      <!-- <button on:click={() => read(message)}>🔉</button> -->
    </p>
  {/each}
  <!-- </Middle> -->
</MainFullVh>
