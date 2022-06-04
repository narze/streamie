<script lang="ts">
  import { onMount } from "svelte"
  import { io } from "socket.io-client"
  import { Howl } from "howler"
  import { page } from "$app/stores"

  const controls = !!$page.url.searchParams.get("controls")

  const DEFAULT_WORK_TIMER = 60 * 25
  const DEFAULT_BREAK_TIMER = 60 * 5
  const TICK = 1000
  let workTimer = DEFAULT_WORK_TIMER
  let breakTimer = DEFAULT_BREAK_TIMER
  let workTimerInterval
  let breakTimerInterval
  let isPaused = false
  let enabled = true

  let state = "idle"
  $: isIdle = state == "idle"
  $: isRunning = state == "work"
  $: isBreak = state == "break"
  $: isBreakEnd = state == "break-end"

  const alarm = new Howl({
    src: ["/sounds/alarm.mp3"],
    volume: 0.3,
    // autoplay: true,
  })

  function onCommand(command: string, minutes: number = 25) {
    if (command == "pause") {
      pauseTimer()
      return
    } else if (command == "resume" || command == "start") {
      startTimer()
      return
    } else if (command == "reset") {
      resetTimer()
      return
    } else if (command == "enable") {
      enabled = true
      return
    } else if (command == "disable") {
      enabled = false
      return
    }

    workTimer = 60 * minutes
    startTimer()
  }

  onMount(() => {
    window["command"] = onCommand

    const socket = io("ws://streamie-socket.narze.live")

    socket.on("pomodoro", ({ minutes, command }) => {
      onCommand(command, minutes)
    })
  })

  function startTimer() {
    state = "work"
    isPaused = false
    clearInterval(workTimerInterval)

    workTimerInterval = setInterval(() => {
      workTimer -= 1
      if (workTimer < 0) {
        alarm.play()
        startBreakTimer()
        clearInterval(workTimerInterval)
      }
    }, TICK)
  }

  function startBreakTimer() {
    state = "break"
    breakTimer = DEFAULT_BREAK_TIMER
    clearInterval(breakTimerInterval)
    breakTimerInterval = setInterval(() => {
      breakTimer -= 1
      if (breakTimer < 0) {
        alarm.play()
        clearInterval(breakTimerInterval)
        state = "break-end"
      }
    }, TICK)
  }

  function pauseTimer() {
    isPaused = true
    clearInterval(workTimerInterval)
  }

  function resetTimer() {
    pauseTimer()
    clearInterval(breakTimerInterval)

    workTimer = DEFAULT_WORK_TIMER
    breakTimer = DEFAULT_BREAK_TIMER
    state = "idle"
  }

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
            {toMMSS(workTimer)}
          </div>

          {#if controls}
            <button on:click={startTimer} class="btn btn-outline">Start</button>
          {/if}
        {:else if isRunning}
          <div class="text-4xl">Pomodoro</div>
          <div class="text-3xl text-center">
            {isPaused ? "⏸" : "▶️"}
            {toMMSS(workTimer)}
          </div>

          {#if controls}
            {#if isPaused}
              <button on:click={startTimer} class="btn btn-outline">Start</button>
            {:else}
              <button on:click={pauseTimer} class="btn btn-outline">Pause</button>
            {/if}

            <button class="btn btn-outline" on:click={resetTimer}>Reset</button>
          {/if}
        {:else if isBreak}
          <div class="text-4xl">Break ☕️</div>
          <div class="text-3xl text-center">
            {toMMSS(breakTimer)}
          </div>
          {#if controls}
            <button class="btn btn-outline" on:click={resetTimer}>End Break</button>
          {/if}
        {:else if isBreakEnd}
          <div class="text-4xl">Pomodoro</div>
          <div class="text-3xl text-center">Break Ended</div>
          {#if controls}
            <button on:click={resetTimer} class="btn btn-outline">Restart</button>
          {/if}
        {:else}
          Unknown state
        {/if}
      </div>
    </div>
  {/if}
</div>
