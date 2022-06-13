<script lang="ts">
  import { io } from "socket.io-client"
  import { onDestroy, onMount } from "svelte"
  import { createMachine } from "xstate"
  import dayjs from "dayjs"
  import type { Dayjs } from "dayjs"
  import { fly } from "svelte/transition"

  import { useMachine } from "$lib/useMachine"
  import {
    calculateResult,
    cardsToDeng,
    cardsToScore,
    handResult,
    isPok,
    type IPlayer,
    type IPokdengCommand,
  } from "$lib/pokdeng"
  import PokdengPlayer from "$lib/components/PokdengPlayer.svelte"
  import { page } from "$app/stores"

  const SECONDS_PER_STATE = 30
  const DEBUG = false

  const socket = io("ws://streamie-socket.narze.live")

  // let command = ""
  let dealer: IPlayer = { name: "เจ้ามือ", amount: 0, cards: [] }
  let players: Array<IPlayer> = []

  let gameStartAt: Dayjs | null
  let gameEndAt: Dayjs | null
  let gameRestartAt: Dayjs | null
  let countdownTimer: number
  let tickInterval
  let debug: boolean

  // $: playersCanDraw = players.map((_player, idx) => {
  //   if (!$state.matches("Playing")) {
  //     return false
  //   }
  //   return canDraw(idx)
  // })
  $: dealerCanDraw = $state.matches("Playing") && dealer.cards.length < 3 && !isPok(dealer.cards)

  let cards = shuffle(generateDeck())

  const machineData = {
    id: "Pokdeng",
    initial: "Waiting",
    states: {
      Waiting: {
        entry: ["resetTimers", "clearPlayers"],

        on: {
          START: {
            target: "Playing",
            actions: ["setGameTimer"],
          },
        },
      },
      Playing: {
        entry: ["distributeCards", "checkIfDealerPok"],

        on: {
          END: {
            target: "Ending",
            actions: ["setRestartTimer"],
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
      resetTimers: () => {
        gameStartAt = null
        gameEndAt = null
        gameRestartAt = null
      },
      setGameTimer: () => {
        gameEndAt = dayjs().add(SECONDS_PER_STATE, "seconds")
      },
      setRestartTimer: () => {
        gameRestartAt = dayjs().add(10, "seconds")
      },
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
      checkIfDealerPok: () => {
        if (isPok(dealer.cards)) {
          setTimeout(() => {
            socket.emit("send_twitch_message", {
              message: `${debug ? "[DEBUG] " : ""}เจ้ามือป๊อก! แดกรอบวง!`,
            })
          }, 4000)

          send("END")
        }
      },
      clearPlayers: () => {
        players = []
        dealer = { ...dealer, cards: [] }
      },
      calculateAndPayout: async () => {
        players = players.map((player) => {
          const resultAmount = calculateResult(dealer, player)
          return { ...player, resultAmount }
        })

        const messages = players.map(
          (player) =>
            `@${player.name}: ${handResult(player)} (${
              player.resultAmount > 0 ? `+${player.resultAmount}` : player.resultAmount
            })`
        )

        messages.push(`เจ้ามือ: ${handResult(dealer)}`)

        setTimeout(() => {
          socket.emit("send_twitch_message", {
            message: `${debug ? "[DEBUG] " : ""}ผลป๊อกเด้ง: ${messages.join(" | ")}`,
          })
        }, 5000)

        if (!debug) {
          await socket.emit("pokdeng_payout", {
            players,
          })
        }
      },
    },
  }
  const toggleMachine = createMachine(machineData, options)
  const { state, send } = useMachine(toggleMachine)

  function onCommand(command: string, name: string, args?: Array<string | number>) {
    if (command == "join" && $state.matches("Waiting")) {
      const amount = +args[0] || 1

      addPlayer(name, amount)
    }

    if (command == "draw" && $state.matches("Playing")) {
      drawCard(name)
    }
  }

  onMount(() => {
    debug = !!$page.url.searchParams.get("debug")

    window["command"] = onCommand

    socket.on("pokdeng", async (args: IPokdengCommand) => {
      if (args.command == "join") {
        const amount = args.amount!

        onCommand("join", args.name, [amount])

        if ($state.matches("Playing")) {
          await socket.emit("send_twitch_message", {
            message: `@${args.name} รอตาหน้านะจ๊ะ`,
          })
        }
      }

      if (args.command == "draw") {
        onCommand("draw", args.name)
      }
    })

    clearInterval(tickInterval)

    tickInterval = setInterval(() => {
      tick()
    }, 200)
  })

  onDestroy(() => {
    socket.off("pokdeng")
    clearInterval(tickInterval)
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

  // function canDraw(playerId) {
  //   if (!$state.matches("Playing")) {
  //     return false
  //   }

  //   const player = players[playerId]
  //   if (player.cards.length < 3 && !isPok(player.cards)) {
  //     return true
  //   }
  //   return false
  // }

  // function sendCommand(e) {
  //   if (e.key === "Enter") {
  //     onCommand(command, "narze-test")
  //     command = ""
  //   }
  // }

  function addPlayer(name, amount) {
    if (players.length >= 16) {
      return
    }

    // Update player if already exists
    const playerIndex = players.findIndex((player) => player.name == name)

    if (playerIndex == -1) {
      players = [...players, { name, amount, cards: [] }]
    } else {
      players[playerIndex] = { name, amount, cards: [] }
      players = players
    }

    // Start timer when at least one player joins
    if (players.length == 1) {
      gameStartAt = dayjs().add(SECONDS_PER_STATE, "second")
    }
  }

  function tick() {
    if ($state.matches("Waiting")) {
      countdownTimer = gameStartAt?.diff(new Date(), "second")

      if (countdownTimer < 0) {
        countdownTimer = 0
        send("START")
      }
    } else if ($state.matches("Playing")) {
      countdownTimer = gameEndAt?.diff(new Date(), "second")

      if (countdownTimer < 0) {
        countdownTimer = 0
        send("END")
      }
    } else if ($state.matches("Ending")) {
      countdownTimer = gameRestartAt?.diff(new Date(), "second")

      if (countdownTimer < 0) {
        countdownTimer = 0
        send("RESTART")
      }
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

  function shuffle<T>(deck: Array<T>) {
    const shuffled = []

    while (deck.length) {
      const i = Math.floor(Math.random() * deck.length)
      shuffled.push(deck.splice(i, 1)[0])
    }

    return shuffled
  }
</script>

<main
  class={`font-sans p-2 min-h-screen w-full flex flex-col items-start gap-2 text-white ${
    debug ? "bg-gray-800" : ""
  }`}
>
  <!-- <h1 class="text-3xl text-black">ป๊อกเด้ง</h1> -->

  <!-- <input
    bind:value={command}
    type="text"
    class="input bg-gray-400 text-black"
    on:keydown={sendCommand}
  /> -->

  <section
    class="p-2 flex flex-col gap-2 border-2 border-white rounded items-center bg-gray-900 bg-opacity-50"
  >
    {#if DEBUG}
      State: {$state.value}
    {/if}

    {#if $state.matches("Waiting")}
      <p in:fly={{ y: 300 }} class="text-sm ">
        {#if debug}<span class="mr-1 bg-red-300 p-1 rounded">DEBUG</span>{/if}[ป๊อกเด้ง] พิมพ์
        <code class="bg-slate-500 text-white rounded p-1">!pok join [จำนวนเงิน]</code>
        เพื่อเข้าร่วม
      </p>
      {#if countdownTimer != undefined}
        <div class="text-sm">
          เริ่มใน {countdownTimer} วินาที
        </div>
      {/if}
      {#if DEBUG}
        <button class="btn btn-primary" on:click={() => send("START")}> Start </button>
      {/if}
    {:else if $state.matches("Playing")}
      <p>
        พิมพ์ <code class="bg-slate-500 text-white rounded p-1">!pok draw</code>
        เพื่อจั่วเพิ่ม
        {#if countdownTimer != undefined}
          <span>(นับแต้มใน {countdownTimer} วินาที)</span>
        {/if}
      </p>
      {#if DEBUG}
        <button class="btn btn-primary" on:click={() => send("END")}> End </button>
      {/if}
    {:else if $state.matches("Ending")}
      {#if countdownTimer != undefined}
        <div>
          เริ่มใหม่ใน {countdownTimer} วินาที
        </div>
      {/if}
      {#if DEBUG}
        <button class="btn btn-primary" on:click={() => send("RESTART")}> Restart </button>
      {/if}
    {/if}
  </section>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      {#if players.length > 0}
        <PokdengPlayer player={dealer} isDealer={true} gameState={`${$state.value}`} />
      {/if}
      {#each players as player}
        <PokdengPlayer {player} gameState={`${$state.value}`} />
        <!-- <div class="flex items-center">
          <div class="flex-1">{name}</div>
          <div class="flex-1">{amount}</div>
          <div class="flex-1">
            {cards.map((card) => cardToString(card.suit, card.value)).join(", ")}
          </div>
          <div class="flex-1">Score: {cardsToScore(cards)}</div>
          <div class="flex-1">ป๊อก: {isPok(cards)}</div>
          <div class="flex-1">เด้ง: {cardsToDeng(cards)}</div>
          {#if DEBUG && playersCanDraw[idx]}
            <button class="btn btn-primary" on:click={() => drawCard(name)}> จั่วเพิ่ม </button>
          {/if}
          {#if resultAmount != undefined}
            <div class="flex-1">Result: {resultAmount}</div>
          {/if}
        </div> -->
      {/each}
    </div>

    {#if DEBUG && dealerCanDraw}
      <button class="btn btn-primary" on:click={() => dealerDrawCard()}> จั่วเพิ่ม </button>
    {/if}
  </div>

  <!-- <div class="grid grid-cols-8 gap-2 items-center">
    {#each cards as card}
      <div>{cardToString(card.suit, card.value)}</div>
    {/each}
  </div> -->

  <!-- Cards left in deck: {cards.length} -->
</main>
