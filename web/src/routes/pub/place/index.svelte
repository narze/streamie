<script context="module">
  export const prerender = false
  const height = 32
  const width = 32

  export async function load({ fetch }) {
    const url = `/api/place?rows=${height}`
    const response = await fetch(url)

    return {
      status: response.status,
      props: {
        data: response.ok && (await response.json()),
      },
    }
  }
</script>

<script lang="ts">
  import { io } from "socket.io-client"

  import { onMount } from "svelte"

  export let data: { place: Array<[number, number, string]> }

  const board: string[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill("FFF"))

  function paint(x, y, colorHex) {
    board[y][x] = colorHex
  }

  function paintCache() {
    data.place.forEach(([x, y, colorHex]) => paint(x, y, colorHex))
  }

  function connectSocket() {
    const socket = io("ws://streamie-socket.narze.live")

    socket.on("place", ({ x, y, c }) => {
      console.log({ x, y, c })
      // return if array index overflow
      if (x <= 0 || x > width || y <= 0 || y > height) {
        console.log("overflow!")
        return
      }
      paint(x - 1, y - 1, c)
    })
  }

  onMount(() => {
    connectSocket()
    paintCache()
  })
</script>

<main class="w-full h-screen overflow-hidden">
  <div class="bg-white relative w-full h-full">
    {#each board as row, y}
      {#each row as cell, x}
        {#if cell !== "FFF"}
          <div
            class={`h-12 w-12 border-gray-100  absolute`}
            style={`background-color: #${cell}; top: ${y * 3}rem; left: ${x * 3}rem;`}
          />
        {/if}
      {/each}
    {/each}
  </div>
</main>

<style>
  :global(html, body) {
    background-color: rgba(0, 0, 0, 0) !important;
  }
</style>
