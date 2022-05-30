<script lang="ts">
  import { onMount } from "svelte"
  import { io } from "socket.io-client"

  const DEFAULT_WORK_TIMER = 60 * 25
  const DEFAULT_BREAK_TIMER = 60 * 5
  const TICK = 1000
  let workTimer = DEFAULT_WORK_TIMER
  let breakTimer = DEFAULT_BREAK_TIMER
  let workTimerInterval
  let breakTimerInterval
  let isPaused = false

  let state = "idle"
  $: isIdle = state == "idle"
  $: isRunning = state == "work"
  $: isBreak = state == "break"
  $: isBreakEnd = state == "break-end"

  onMount(() => {
    const socket = io("ws://streamie-socket.narze.live")

    socket.on("pomodoro", ({ minutes, command }) => {
      if (command == "pause") {
        pauseTimer()
        return
      } else if (command == "resume") {
        startTimer()
        return
      } else if (command == "reset") {
        resetTimer()
        return
      }

      workTimer = 60 * minutes
      startTimer()
    })
  })

  function startTimer() {
    state = "work"
    isPaused = false
    clearInterval(workTimerInterval)

    workTimerInterval = setInterval(() => {
      workTimer -= 1
      if (workTimer < 0) {
        startBreakTimer()
        clearInterval(workTimerInterval)
      }
    }, TICK)
  }

  function startBreakTimer() {
    state = "break"
    clearInterval(breakTimerInterval)
    breakTimerInterval = setInterval(() => {
      breakTimer -= 1
      if (breakTimer < 0) {
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
  <div class="border border-white rounded p-8">
    <div class="flex flex-col gap-4">
      {#if isIdle}
        <div class="text-4xl">Pomodoro</div>
        <div class="text-3xl text-center">
          {toMMSS(workTimer)}
        </div>

        <button on:click={startTimer} class="btn">Start</button>
      {:else if isRunning}
        <div class="text-4xl">Pomodoro</div>
        <div class="text-3xl text-center">
          {toMMSS(workTimer)}
          {!isPaused ? "▶️" : "⏸"}
        </div>

        {#if isPaused}
          <button on:click={startTimer} class="btn">Start</button>
        {:else}
          <button on:click={pauseTimer} class="btn">Pause</button>
        {/if}

        <button class="btn" on:click={resetTimer}>Reset</button>
      {:else if isBreak}
        <div class="text-4xl">Break ☕️</div>
        <div class="text-3xl text-center">
          {toMMSS(breakTimer)}
        </div>
        <button class="btn" on:click={resetTimer}>End Break</button>
      {:else if isBreakEnd}
        <div class="text-3xl text-center">Break Ended</div>
        <button on:click={resetTimer} class="btn">Restart</button>
      {:else}
        Unknown state
      {/if}
    </div>
  </div>
</div>
