<script lang="ts">
  import { fly } from "svelte/transition"
  import { cardsToDeng, cardsToScore, isPok, type IPlayer } from "$lib/pokdeng"

  export let player: IPlayer
  export let gameState: string
  export let isDealer: boolean = false

  function cardToString(suit: number, value: number) {
    const suits = ["♠", "♥", "♣", "♦"]
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    return `${suits[suit]}${values[value]}`
  }

  function handResult(player: IPlayer) {
    const cards = player.cards

    const results: Array<string> = []

    if (isPok(cards)) {
      results.push("ป๊อก")
    }

    results.push(`${cardsToScore(cards)}`)

    if (!isPok(cards)) {
      results.push("แต้ม")
    }

    const deng = cardsToDeng(cards)

    if (deng > 1) {
      results.push(`${deng} เด้ง`)
    }

    return results.join(" ")
  }
</script>

<div
  in:fly={{ x: 300, duration: 800 }}
  class="flex flex-col border rounded px-2 py-1 gap-2 min-w-fit max-w-xs items-center"
>
  <div class="flex gap-2 justify-center">
    <span>
      {player.name}
      {#if !isDealer}({player.amount}){/if}
    </span>
    {#if player.cards.length}
      <div class="flex gap-1">
        {#each player.cards as card, idx}
          <span
            in:fly={{ y: 300, delay: idx * 300 }}
            class="text-gray-800 rounded border px-1 border-black"
          >
            {#if isDealer && gameState === "Playing"}
              ??
            {:else}
              {cardToString(card.suit, card.value)}
            {/if}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  {#if isDealer}
    {#if gameState == "Ending"}
      <div class="flex gap-1">
        <span class="">{handResult(player)}</span>
      </div>
    {/if}
  {:else if gameState != "Waiting"}
    <div class="flex gap-1">
      <span class="">{handResult(player)}</span>
      {#if gameState == "Ending"}
        <span class="">
          ({player.resultAmount > 0 ? `+${player.resultAmount}` : player.resultAmount})
        </span>
      {/if}
    </div>
  {/if}
</div>
