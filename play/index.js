const robot = require("robotjs")
const { io } = require("socket.io-client")

const socket = io("ws://streamie-socket.narze.live")

socket.on("play", ({ key }) => {
  console.log({ key })

  robot.keyToggle(key, "down")

  setTimeout(() => {
    robot.keyToggle(key, "up")
  }, 30)
})
