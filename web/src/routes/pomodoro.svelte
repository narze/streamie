<script lang="ts">
  const DEFAULT_TIMER = 60 * 25
  let timer = DEFAULT_TIMER
  let timerInterval
  let isRunning = false

  function startTimer() {
    isRunning = true
    timerInterval = setInterval(() => {
      timer -= 1
    }, 1000)
  }

  function pauseTimer() {
    isRunning = false
    clearInterval(timerInterval)
  }

  function resetTimer() {
    pauseTimer()
    timer = DEFAULT_TIMER
  }

  function toMMSS(seconds: number) {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`
  }
</script>

<div class="min-h-screen w-full flex items-center justify-center">
  <div class="border border-white rounded p-8">
    <div class="flex flex-col gap-4">
      <div class="text-4xl">Pomodoro</div>
      <div class="text-3xl text-center">
        {toMMSS(timer)}
        {isRunning ? "▶️" : "⏸"}
      </div>

      {#if isRunning}
        <button on:click={pauseTimer} class="btn">Pause</button>
      {:else}
        <button on:click={startTimer} class="btn">Start</button>
      {/if}

      <button class="btn" on:click={resetTimer}>Reset</button>
    </div>
  </div>
</div>
