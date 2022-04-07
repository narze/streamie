import { Server } from "socket.io"

export default function socket() {
  const io = new Server(+(process.env.SOCKET_IO_PORT || 8080), {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  console.log("started socket server at port 8080")

  return io
}
