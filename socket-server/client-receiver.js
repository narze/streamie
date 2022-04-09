// For testing
const { io } = require("socket.io-client")

const socket = io("http://localhost:8888", {})

const events = ["airdrop", "gacha", "text", "say"]

socket.on("connect", () => {
  console.log("connected to server")

  events.forEach((event) => {
    socket.on(event, (...args) => {
      console.log(`[${event}]`, ...args)
    })
  })
})

socket.on("disconnect", () => {
  console.log("disconnected from server")

  events.forEach((event) => {
    socket.off(event)
  })
})

socket.connect()
