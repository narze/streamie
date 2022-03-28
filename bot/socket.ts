import { Server } from "socket.io"

export default function socket() {
  const io = new Server(8080, {
    cors: {
      origin: "http://localhost:4000",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    // send a message to the client
    socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) })

    // receive a message from the client
    socket.on("hello from client", (...args) => {
      // ...
      console.log({ args })
    })
  })
  console.log("started socket server at port 8000")

  return io
}
