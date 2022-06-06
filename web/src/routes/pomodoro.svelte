<script lang="ts">
  import { onMount } from "svelte"
  import { io } from "socket.io-client"
  import { Howl } from "howler"
  import { page } from "$app/stores"
  import dayjs from "dayjs"
  import { createMachine, assign } from "xstate"
  import { useMachine } from "$lib/useMachine"
  import axios from "axios"

  const DEFAULT_WORK_TIMER = 60 * 25
  const DEFAULT_BREAK_TIMER = 60 * 5
  let workTimer = DEFAULT_WORK_TIMER
  let breakTimer = DEFAULT_BREAK_TIMER
  let workTimerInterval
  let breakTimerInterval
  let enabled = true
  let controls = false

  let tickInterval

  $: isIdle = $state.matches("idle")
  $: isRunning = $state.matches({ work: "working" })
  $: isWork = $state.matches("work")
  $: isBreak = $state.matches("break")
  $: isPaused = $state.matches({ work: "paused" })

  // $: console.log({ diffTime, isWork, state: $state.value })

  let workEndTime, breakEndTime, diffTime
  const alarm = new Howl({
    src: ["/sounds/alarm.mp3"],
    volume: 0.3,
    // autoplay: true,
  })

  function startTickInterval(_context, _event) {
    clearInterval(tickInterval)

    tickInterval = setInterval(() => {
      tick()
    }, 100)
  }

  function stopTickInterval(_context, _event) {
    clearInterval(tickInterval)
  }

  const machineData = {
    id: "Pomodoro",
    initial: "idle",
    states: {
      idle: {
        entry: ["stopTickInterval"],
        on: {
          START: {
            target: "work",
          },
        },
      },
      work: {
        initial: "working",
        entry: "setWorkEndTime",
        states: {
          working: {
            entry: ["startTickInterval"],
            on: {
              PAUSE: {
                target: "paused",
              },
            },
          },
          paused: {
            entry: "stopTickInterval",
            on: {
              RESUME: {
                target: "working",
                actions: () => {
                  console.log("resume")
                  workEndTime = dayjs().add(diffTime + 1, "second")
                },
              },
            },
          },
        },
        on: {
          FINISH: {
            target: "break",
          },
          CANCEL: {
            target: "idle",
          },
        },
      },
      break: {
        entry: () => {
          breakEndTime = dayjs().add(breakTimer, "second")

          alarm.play()

          const message = "Break Time!"
          axios.get(`/api/notify?message=${message}`)
        },
        on: {
          FINISH: {
            target: "idle",
            actions: () => {
              alarm.play()

              const message = "Break Is Over!"
              axios.get(`/api/notify?message=${message}`)
            },
          },
        },
      },
    },
  }

  const options = {
    actions: {
      startTickInterval,
      stopTickInterval,
      setWorkEndTime: () => {
        // console.log({ workEndTime })

        workEndTime = dayjs().add(workTimer, "second")
        tick()
      },
    },
  }

  const toggleMachine = createMachine(machineData, options)
  const { state: state, send } = useMachine(toggleMachine)

  // $: active = $state.matches("active")
  // $: count = $state.context.count

  function tick() {
    if (isWork) {
      diffTime = workEndTime?.diff(new Date(), "second")

      if (diffTime < 0) {
        send("FINISH")
      }
    } else if (isBreak) {
      diffTime = breakEndTime?.diff(new Date(), "second")

      if (diffTime < 0) {
        send("FINISH")
      }
    }
  }

  function onCommand(command: string, minutes: number = 25) {
    switch (command) {
      case "setWorkTime":
        workTimer = 60 * minutes
        break
      case "setBreakTime":
        breakTimer = 60 * minutes
        break
      case "start":
        send("START")
        break
      case "pause":
        send("PAUSE")
        break
      case "resume":
        send("RESUME")
        break
      case "reset":
      case "cancel":
        send("CANCEL")
        break

      default:
        send(command.toUpperCase())
        break
    }
  }

  onMount(() => {
    controls = !!$page.url.searchParams.get("controls")

    window["command"] = onCommand

    const socket = io("ws://streamie-socket.narze.live")

    socket.on("pomodorov2", ({ args }) => {
      if (args.length == 0) {
        onCommand("start")
      } else if (!isNaN(+args[0])) {
        onCommand("setWorkTime", +args[0])
        onCommand("start")
      } else if (args[0].match(/^[a-zA-Z]+$/) && !isNaN(+args[1])) {
        onCommand(args[0], +args[1])
      } else {
        onCommand(args[0])
      }
    })
  })

  function toMMSS(seconds: number) {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`
  }
</script>

<div class="min-h-screen w-full flex items-center justify-center">
  {#if enabled}
    <div class="rounded-3xl bg-zinc-900 p-8 min-h-48 flex items-center">
      <div class="flex flex-col gap-4">
        {#if isIdle}
          <div class="text-4xl">Pomodoro</div>
          <div class="text-3xl text-center">
            {toMMSS(workTimer)} / {toMMSS(breakTimer)}
          </div>

          {#if controls}
            <button on:click={() => send("START")} class="btn btn-outline">Start</button>
          {/if}
        {:else if isRunning || isPaused}
          <div class="text-4xl">Pomodoro</div>
          <div class="text-3xl text-center">
            {isPaused ? "⏸" : "▶️"}
            {toMMSS(diffTime)}
          </div>

          {#if controls}
            {#if isPaused}
              <button on:click={() => send("RESUME")} class="btn btn-outline">Start</button>
            {:else}
              <button on:click={() => send("PAUSE")} class="btn btn-outline">Pause</button>
            {/if}

            <button class="btn btn-outline" on:click={() => send("CANCEL")}>Reset</button>
          {/if}
        {:else if isBreak}
          <div class="text-4xl">Break ☕️</div>
          <div class="text-3xl text-center">
            {toMMSS(diffTime)}
          </div>
          {#if controls}
            <button class="btn btn-outline" on:click={() => send("FINISH")}>End Break</button>
          {/if}
        {:else}
          Unknown state
        {/if}
      </div>
    </div>
  {/if}
</div>
