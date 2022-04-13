<script lang="ts">
  const width = 32
  const height = 32

  const board: string[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(""))

  function paint(x, y, colorHex) {
    board[y][x] = colorHex
  }
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
