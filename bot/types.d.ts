import tmi from "tmi.js"
import { Socket } from "socket.io-client"

export interface ITwitchCommand {
  name: string
  execute: (
    client: tmi.Client,
    channel: string,
    tags: tmi.ChatUserstate,
    message: string,
    misc?: {
      io?: Socket
    }
  ) => void
}
