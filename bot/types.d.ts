import tmi from "tmi.js"
import { Server } from "socket.io"

export interface ITwitchCommand {
  name: string
  execute: (
    client: tmi.Client,
    channel: string,
    tags: tmi.ChatUserstate,
    message: string,
    misc?: {
      io?: Server
    }
  ) => void
}
