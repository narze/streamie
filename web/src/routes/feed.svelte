<script lang="ts">
  import { io } from "socket.io-client"
  import { onMount } from "svelte"
  import { fly } from "svelte/transition"
  import { flip } from "svelte/animate"

  let messages = {}
  let msgIdx = 0

  onMount(() => {
    const socket = io("ws://localhost:8080")

    socket.on("airdrop", ({ viewerCount }) => {
      msgIdx += 1

      addTempMessage(msgIdx, `🎁 (${viewerCount})`)
    })
  })

  function addTempMessage(key, text) {
    messages = { ...messages, [key]: text }

    setTimeout(() => {
      delete messages[key]
      messages = messages
    }, 5000)
  }
</script>

<main class="p-4">
  {#each Object.entries(messages) as [key, msg] (key)}
    <div in:fly={{ y: 200 }} out:fly={{ y: -200 }} animate:flip={{ duration: 200 }}>{msg}</div>
  {/each}
</main>

<style>
  main {
    /* background-color: #0f0; */
    height: 100vh;
    width: 100%;
  }
</style>
