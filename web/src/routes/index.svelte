<script lang="ts">
  import MainFullVh from "$lib/components/MainFullVh.svelte"
  import Middle from "$lib/components/Middle.svelte"
  import { io } from "socket.io-client"
  import { onMount } from "svelte"

  let messages = []

  onMount(() => {
    const socket = io("ws://localhost:8080")

    // send a message to the server
    socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) })

    // receive a message from the server
    socket.on("hello from server", (...args) => {
      // ...
      console.log({ args })
    })

    socket.on("message", ({ message }) => {
      console.log({ message })
      messages = [...messages, message]
    })
  })
</script>

<MainFullVh class="p-4">
  <Middle class="p-8 border rounded-xl">
    <h1 class="text-3xl">Sample Overlay</h1>

    {#each messages as message}
      <p>{message}</p>
    {/each}
  </Middle>
</MainFullVh>
