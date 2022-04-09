// For testing
const { io } = require("socket.io-client")

const socket = io("http://localhost:8888", {})

let interval

socket.on("connect", () => {
  console.log("connected to server")

  interval = setInterval(() => {
    socket.emit("message", `Hello : ${new Date()}`)
    socket.emit("message-with-object", {
      key: "value",
      key2: ~~(Math.random() * 100),
    })
  }, 10000)
})

socket.on("disconnect", () => {
  console.log("disconnected from server")

  clearInterval(interval)
})

socket.connect()
