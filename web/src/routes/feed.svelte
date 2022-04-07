<script lang="ts">
  import { io } from "socket.io-client"
  import { onMount } from "svelte"
  import { fly } from "svelte/transition"
  import { flip } from "svelte/animate"

  let messages = {}
  let msgIdx = 0

  interface GachaResult {
    data: {
      state: "win" | "lose"
      bet: number
      win: number
      balance: number
    }
  }

  onMount(() => {
    const socket = io("ws://streamie.narze.live")

    socket.on("airdrop", ({ viewerCount }) => {
      msgIdx += 1

      addTempMessage(msgIdx, `🎁 (${viewerCount})`)
    })

    socket.on("gacha", ({ data, name }: { data: GachaResult["data"]; name: string }) => {
      console.log({ data, name })
      msgIdx += 1

      if (data.state === "win") {
        addTempMessage(msgIdx, `@${name} +${data.win} $OULONG 🤑 (${data.balance})`)
      } else {
        addTempMessage(msgIdx, `@${name} -${data.bet} $OULONG 💸 (${data.balance})`)
      }
    })

    socket.on("text", ({ text }) => {
      msgIdx += 1

      addTempMessage(msgIdx, `${text}`)
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

<main class="p-2 text-right flex flex-col gap-2 items-end">
  {#each Object.entries(messages) as [key, msg] (key)}
    <span
      class="feed-item py-1 px-4 rounded w-fit"
      in:fly={{ y: 200 }}
      out:fly={{ y: -200 }}
      animate:flip={{ duration: 200 }}
    >
      {msg}
    </span>
  {/each}
</main>

<style>
  :global(html, body) {
    background-color: rgba(0, 0, 0, 0) !important;
  }

  main {
    background-color: rgba(0, 0, 0, 0);
    height: 100vh;
    width: 100%;
    font-size: 200%;
    font-weight: bold;
    color: white;
  }

  .feed-item {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
