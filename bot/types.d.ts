import tmi from "tmi.js"
import { Socket } from "socket.io-client"
import { createClient } from "redis"

export interface ITwitchCommand {
  name: string | string[]
  execute: (
    client: tmi.Client,
    channel: string,
    tags: tmi.ChatUserstate,
    message: string,
    misc?: {
      io?: Socket
      redis?: ReturnType<typeof createClient>
    }
  ) => void
}
