import { Server } from "socket.io"

export default function socket() {
  const io = new Server(8080, {
    cors: {
      origin: "http://localhost:4000",
      methods: ["GET", "POST"],
    },
  })

  console.log("started socket server at port 8000")

  return io
}
