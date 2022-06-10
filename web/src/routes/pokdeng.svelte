<script lang="ts">
  import { io } from "socket.io-client"
  import { onMount } from "svelte"
  import { createMachine, assign } from "xstate"
  import { useMachine } from "$lib/useMachine"

  // const socket = io("ws://streamie-socket.narze.live")
  interface IPlayer {
    name: string
    amount: number
    cards: Array<ICard>
  }

  interface ICard {
    suit: number
    value: number
  }

  let command = ""
  let dealer: IPlayer = { name: "Dealer", amount: 0, cards: [] }
  let players: Array<IPlayer> = [
    {
      name: "narze-7zcawjpdt83",
      amount: 20,
      cards: [],
    },
    {
      name: "narze-mjjz3sj65g",
      amount: 30,
      cards: [],
    },
    {
      name: "narze-je23l2jgd7",
      amount: 40,
      cards: [],
    },
  ]

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
        entry: [],

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

  function onCommand(command: string) {
    const [commandName, ...args] = command.split(" ")

    console.log({ commandName, args })

    if (commandName == "join" && $state.matches("Waiting")) {
      const amount = +args[0] || 1
      const name = "narze-" + Math.random().toString(36).substring(2, 15)

      addPlayer(name, amount)
    }

    if (commandName == "draw" && $state.matches("Playing")) {
      const playerId = ~~(Math.random() * players.length)

      drawCard(playerId)
    }
  }

  onMount(() => {
    window["command"] = onCommand
  })

  function drawCard(playerId: number) {
    if (players[playerId].cards.length < 3) {
      players[playerId] = {
        ...players[playerId],
        cards: [...players[playerId].cards, cards.shift()],
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
      onCommand(command)
      command = ""
    }
  }

  function addPlayer(name, amount) {
    players = [...players, { name, amount, cards: [] }]
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

  function cardsToScore(cards: Array<ICard>) {
    return (
      cards
        .map((card) => {
          const scoreValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]

          return scoreValues[card.value]
        })
        .reduce((prev, curr) => prev + curr, 0) % 10
    )
  }

  function isPok(cards: Array<ICard>): boolean {
    const score = cardsToScore(cards)
    return cards.length == 2 && (score == 8 || score == 9)
  }

  function cardsToDeng(cards: Array<ICard>): number {
    const suitValues = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    const suits = cards.map((card) => suitValues[card.suit])

    // สองเด้ง
    if (suits.length == 2 && (suits[0] == suits[1] || cards[0].value == cards[1].value)) {
      return 2
    }

    // ตอง (ห้าเด้ง)
    if (suits.length == 3 && cards[0].value == cards[1].value && cards[1].value == cards[2].value) {
      return 5
    }

    // สามเด้ง
    if (suits.length == 3 && suits[0] == suits[1] && suits[1] == suits[2]) {
      return 3
    }

    // สามเหลือง
    const lueang = ["J", "Q", "K"]
    if (
      suits.length == 3 &&
      lueang.includes(suits[0]) &&
      lueang.includes(suits[1]) &&
      lueang.includes(suits[2])
    ) {
      return 3
    }

    return 1
  }
</script>

<main class="p-4 min-h-screen w-full flex flex-col items-center justify-center gap-4">
  <h1 class="text-3xl text-black">ป๊อกเด้ง on Twitch</h1>

  <input
    bind:value={command}
    type="text"
    class="input bg-gray-400 text-black"
    on:keydown={sendCommand}
  />

  <div class="flex flex-col gap-4 container mx-auto">
    <div class="flex items-center">
      <div class="flex-1">{dealer.name}</div>
      <div class="flex-1">{dealer.amount}</div>
      <div class="flex-1">
        {dealer.cards.map((card) => cardToString(card.suit, card.value)).join(", ")}
      </div>
      <div class="flex-1">Score: {cardsToScore(dealer.cards)}</div>
      <div class="flex-1">ป๊อก: {isPok(dealer.cards)}</div>
      <div class="flex-1">เด้ง: {cardsToDeng(dealer.cards)}</div>
      {#if dealerCanDraw}
        <button class="btn btn-primary" on:click={() => dealerDrawCard()}> จั่วเพิ่ม </button>
      {/if}
    </div>

    {#each players as { name, amount, cards }, idx}
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
          <button class="btn btn-primary" on:click={() => drawCard(idx)}> จั่วเพิ่ม </button>
        {/if}
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

  Cards left in deck: {cards.length}
</main>
