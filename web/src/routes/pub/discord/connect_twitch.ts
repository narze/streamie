import type { RequestHandler } from "@sveltejs/kit"
import { io } from "socket.io-client"

export const post: RequestHandler = async (event) => {
  const payload = await event.request.json()

  console.log({ payload })

  const socket = io("ws://streamie-socket.narze.live")

  const promise = new Promise((resolve, _reject) => {
    socket.on("connect", async () => {
      await socket.emit("discord_connect_twitch", payload)
      resolve("sent")
    })
  })

  await promise

  return { body: "TODO" }
}
