import { io, Socket } from "socket.io-client"

let client: Socket

export default function socket() {
  if (!client) {
    client = io(process.env.SOCKET_IO_SERVER_URL!, {})
  }

  return client
}
