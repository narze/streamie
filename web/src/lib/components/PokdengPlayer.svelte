<script lang="ts">
  import { fly } from "svelte/transition"
  import { cardToString, handResult, type IPlayer } from "$lib/pokdeng"

  export let player: IPlayer
  export let gameState: string
  export let isDealer: boolean = false
  export let el: HTMLElement = null
</script>

<div
  in:fly={{ x: 300, duration: 800 }}
  bind:this={el}
  class="flex flex-col border-2 border-white rounded p-1 gap-1 min-w-fit max-w-xs items-center bg-gray-900 bg-opacity-50"
>
  <span>
    {player.name}
    {#if !isDealer}({player.amount}){/if}
  </span>
  {#if player.cards.length}
    <div class="flex gap-1">
      {#each player.cards as card, idx (idx)}
        <span
          in:fly|local={{ y: 300, delay: idx < 2 ? idx * 300 : 0 }}
          class="bg-white rounded px-1"
        >
          {#if isDealer && gameState === "Playing"}
            <span class="text-black">??</span>
          {:else}
            <span class={`${card.suit % 2 == 0 ? "text-black" : "text-[#FF0000]"}`}>
              {cardToString(card.suit, card.value)}
            </span>
          {/if}
        </span>
      {/each}
    </div>
  {/if}

  {#if isDealer}
    {#if gameState == "Ending"}
      <div class="flex gap-1">
        {#key player.cards.length}
          <span in:fly={{ y: 300, delay: 200 }}>{handResult(player)}</span>
        {/key}
      </div>
    {/if}
  {:else if gameState != "Waiting"}
    <div class="flex gap-1">
      {#key player.cards.length}
        <span in:fly={{ y: 300, delay: 200 }}>{handResult(player)}</span>
      {/key}
      {#if gameState == "Ending"}
        <span class="">
          ({player.resultAmount > 0 ? `+${player.resultAmount}` : player.resultAmount})
        </span>
      {/if}
    </div>
  {/if}
</div>
