import tmi from "tmi.js"
import { Server } from "socket.io"
import { ITwitchCommand } from "./types"
import fs from "node:fs"

export default function twitch(io: Server) {
  const client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      username: "narzeBOT",
      password: process.env.TWITCH_OAUTH_TOKEN,
    },
    channels: ["narzeLIVE"],
  })

  client.connect().catch(console.error)

  const commands = new Map<string, ITwitchCommand>()

  const commandFiles = fs
    .readdirSync("./twitch-commands")
    .filter((file: string) => file.endsWith(".ts"))

  for (const file of commandFiles) {
    const command: ITwitchCommand = require(`./twitch-commands/${file}`).default
    commands.set(command.name!, command)
  }

  client.on("message", async (channel, tags, message, self) => {
    if (self) return

    const commandStr = message
      .toLowerCase()
      .split(" ")[0]
      .replace(/(!\w+)(!\w+)*/, "$1")

    const command = commands.get(commandStr)

    if (!command) {
      return
    }

    await command.execute(client, channel, tags, message, { io })
  })
}
