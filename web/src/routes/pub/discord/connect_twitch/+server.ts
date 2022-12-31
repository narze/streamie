import type { RequestHandler } from "@sveltejs/kit"
import { io } from "socket.io-client"
const VITE_STREAMIE_SOCKET_IO_SERVER_URL = import.meta.env.VITE_STREAMIE_SOCKET_IO_SERVER_URL

const socket = io(VITE_STREAMIE_SOCKET_IO_SERVER_URL)

export const POST: RequestHandler = async (event) => {
  const payload = await event.request.json()

  console.log({ payload })

  // TODO: Extract to env

  // const promise = new Promise((resolve, _reject) => {
  // socket.on("connect", async () => {
  await socket.emit("discord_connect_twitch", payload)
  // resolve("sent")
  // })
  // })

  // await promise

  return new Response("TODO")
}
