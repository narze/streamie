<script lang="ts">
  import { io } from "socket.io-client"
  import { onDestroy, onMount } from "svelte"
  import { createMachine, assign } from "xstate"
  import { useMachine } from "$lib/useMachine"
  import {
    calculateResult,
    cardsToDeng,
    cardsToScore,
    isPok,
    type ICard,
    type IPlayer,
    type IPokdengCommand,
  } from "$lib/pokdeng"

  const socket = io("ws://streamie-socket.narze.live")

  let command = ""
  let dealer: IPlayer = { name: "Dealer", amount: 0, cards: [] }
  let players: Array<IPlayer> = []

  $: playersCanDraw = players.map((_player, idx) => {
    if (!$state.matches("Playing")) {
      return false
    }
    return canDraw(idx)
  })
  $: dealerCanDraw = $state.matches("Playing") && dealer.cards.length < 3 && !isPok(dealer.cards)

  let cards = shuffle(generateDeck())

  const machineData = {
    id: "Pokdeng",
    initial: "Waiting",
    states: {
      Waiting: {
        entry: ["clearPlayers"],

        on: {
          START: {
            target: "Playing",
          },
        },
      },
      Playing: {
        entry: ["distributeCards"],

        on: {
          END: {
            target: "Ending",
          },
        },
      },
      Ending: {
        entry: ["calculateAndPayout"],

        on: {
          RESTART: {
            target: "Waiting",
          },
        },
      },
    },
  }

  const options = {
    actions: {
      distributeCards: () => {
        cards = shuffle(generateDeck())
        dealer = { ...dealer, cards: [cards.shift(), cards.shift()] }
        players = players.map((player) => {
          return {
            ...player,
            cards: [cards.shift(), cards.shift()],
          }
        })

        cards = cards
      },
      clearPlayers: () => {
        players = []
        dealer = { ...dealer, cards: [] }
      },
      calculateAndPayout: () => {
        players = players.map((player) => {
          const resultAmount = calculateResult(dealer, player)
          return { ...player, resultAmount }
        })
      },
      // startTickInterval,
      // stopTickInterval,
      // setWorkEndTime: () => {
      //   // console.log({ workEndTime })
      //   workEndTime = dayjs().add(workTimer, "second")
      //   tick()
      // },
    },
  }
  const toggleMachine = createMachine(machineData, options)
  const { state, send } = useMachine(toggleMachine)

  function onCommand(command: string, name: string, args?: Array<string | number>) {
    console.log({ command, args })

    if (command == "join" && $state.matches("Waiting")) {
      const amount = +args[0] || 1

      addPlayer(name, amount)
    }

    if (command == "draw" && $state.matches("Playing")) {
      drawCard(name)
    }
  }

  onMount(() => {
    window["command"] = onCommand

    socket.on("pokdeng", (args: IPokdengCommand) => {
      if (args.command == "join") {
        const amount = args.amount!

        onCommand("join", args.name, [amount])
      }

      if (args.command == "draw") {
        onCommand("draw", args.name)
      }
    })
  })

  onDestroy(() => {
    socket.off("pokdeng")
  })

  function drawCard(name: string) {
    const playerIndex = players.findIndex((player) => player.name == name)

    if (playerIndex == -1) {
      return
    }

    if (players[playerIndex].cards.length < 3) {
      players[playerIndex] = {
        ...players[playerIndex],
        cards: [...players[playerIndex].cards, cards.shift()],
      }

      cards = cards
      players = players
    }
  }

  function dealerDrawCard() {
    if (dealer.cards.length < 3) {
      dealer = {
        ...dealer,
        cards: [...dealer.cards, cards.shift()],
      }

      cards = cards
    }
  }

  function canDraw(playerId) {
    if (!$state.matches("Playing")) {
      return false
    }

    const player = players[playerId]
    if (player.cards.length < 3 && !isPok(player.cards)) {
      return true
    }
    return false
  }

  function sendCommand(e) {
    if (e.key === "Enter") {
      onCommand(command, "narze-test")
      command = ""
    }
  }

  function addPlayer(name, amount) {
    // Update player if already exists
    const playerIndex = players.findIndex((player) => player.name == name)

    if (playerIndex == -1) {
      players = [...players, { name, amount, cards: [] }]
    } else {
      players[playerIndex] = { name, amount, cards: [] }
      players = players
    }
  }

  function generateDeck() {
    const deck = []

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 13; j++) {
        deck.push({
          suit: i,
          value: j,
        })
      }
    }

    return deck
  }

  function cardToString(suit: number, value: number) {
    const suits = ["♠", "♥", "♣", "♦"]
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    return `${suits[suit]}${values[value]}`
  }

  function shuffle<T>(deck: Array<T>) {
    const shuffled = []

    while (deck.length) {
      const i = Math.floor(Math.random() * deck.length)
      shuffled.push(deck.splice(i, 1)[0])
    }

    return shuffled
  }
</script>

<main class="p-4 min-h-screen w-full flex flex-col items-center justify-center gap-4">
  <h1 class="text-3xl text-black">ป๊อกเด้ง</h1>

  <!-- <input
    bind:value={command}
    type="text"
    class="input bg-gray-400 text-black"
    on:keydown={sendCommand}
  /> -->

  <div class="flex flex-col gap-4 container mx-auto">
    <div class="flex items-center">
      <div class="flex-1">{dealer.name}</div>
      {#if $state.matches("Ending")}
        <div class="flex-1">
          {dealer.cards.map((card) => cardToString(card.suit, card.value)).join(", ")}
        </div>
        <div class="flex-1">Score: {cardsToScore(dealer.cards)}</div>
        <div class="flex-1">ป๊อก: {isPok(dealer.cards)}</div>
        <div class="flex-1">เด้ง: {cardsToDeng(dealer.cards)}</div>
        {#if dealerCanDraw}
          <button class="btn btn-primary" on:click={() => dealerDrawCard()}> จั่วเพิ่ม </button>
        {/if}
      {:else}
        ****
      {/if}
    </div>

    {#each players as { name, amount, cards, resultAmount }, idx}
      <div class="flex items-center">
        <div class="flex-1">{name}</div>
        <div class="flex-1">{amount}</div>
        <div class="flex-1">
          {cards.map((card) => cardToString(card.suit, card.value)).join(", ")}
        </div>
        <div class="flex-1">Score: {cardsToScore(cards)}</div>
        <div class="flex-1">ป๊อก: {isPok(cards)}</div>
        <div class="flex-1">เด้ง: {cardsToDeng(cards)}</div>
        {#if playersCanDraw[idx]}
          <button class="btn btn-primary" on:click={() => drawCard(name)}> จั่วเพิ่ม </button>
        {/if}
        <div class="flex-1">Result: {resultAmount}</div>
      </div>
    {/each}
  </div>

  <section class="p-4 flex flex-col gap-2 border rounded">
    State: {$state.value}

    {#if $state.matches("Waiting")}
      <button class="btn btn-primary" on:click={() => send("START")}> Start </button>
    {:else if $state.matches("Playing")}
      <button class="btn btn-primary" on:click={() => send("END")}> End </button>
    {:else if $state.matches("Ending")}
      <button class="btn btn-primary" on:click={() => send("RESTART")}> Restart </button>
    {/if}
  </section>

  <!-- <div class="grid grid-cols-8 gap-2 items-center">
    {#each cards as card}
      <div>{cardToString(card.suit, card.value)}</div>
    {/each}
  </div> -->

  <!-- Cards left in deck: {cards.length} -->
</main>
