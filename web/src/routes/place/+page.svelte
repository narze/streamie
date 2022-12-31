<script context="module">
  export const prerender = false
  const height = 16
  const width = 16

  export async function load({ params, fetch, session, stuff }) {
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
    const socket = io("wss://streamie-socket.narze.live")

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

<main>
  {#each board as row, rowIndex}
    <div class="flex">
      {#each row as cell, cellIndex}
        <div
          class="flex flex-row border h-12 w-12 border-gray-100"
          style={`background-color: #${cell}; border-color: #${cell}`}
          on:click={() =>
            paint(cellIndex, rowIndex, Math.floor(Math.random() * 16777215).toString(16))}
        >
          <!-- {cell} -->
        </div>
      {/each}
    </div>
  {/each}
</main>

<style>
  :global(html, body) {
    background-color: rgba(0, 0, 0, 0) !important;
  }
</style>
