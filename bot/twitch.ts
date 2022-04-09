import tmi from "tmi.js"
import { ITwitchCommand } from "./types"
import fs from "node:fs"
import axios from "axios"
import socket from "./socket-client"

const io = socket()

let isPaused = false

let interval

export default function twitch() {
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

  interval = setInterval(async () => {
    const chattersResponse = await axios.get(
      "https://tmi.twitch.tv/group/user/narzelive/chatters",
      { responseType: "json" }
    )

    const moderators = chattersResponse.data.chatters.moderators

    // if "narzebotdev" is offline, unpause automatically
    if (!moderators.includes("narzebotdev")) {
      // TODO: Find better way to periodially inform prod bot to pause
      if (process.env.NODE_ENV !== "production") {
        await client.say("narzelive", `!pause`)
        return
      }

      if (isPaused) {
        isPaused = false
        client.say("narzelive", `isPaused: ${isPaused}`)
      }
    }
  }, 60000)

  client.on("join", (channel, _name, self) => {
    if (!self) {
      return
    }

    // Dev mode - send message to @narzebot to pause receiving commands
    if (process.env.NODE_ENV !== "production") {
      client.say(channel, "!pause")
    }
  })

  client.on("message", async (channel, tags, message, self) => {
    if (self) return

    // Production bot pause
    // TODO: refactor to twitch-commands/pause
    if (
      ["narzelive", "narzebotdev"].includes(tags.username!.toLowerCase()) &&
      message.includes("!pause") &&
      process.env.NODE_ENV === "production"
    ) {
      isPaused = true
      client.say(channel, `isPaused: ${isPaused}`)
      return
    }

    if (
      ["narzelive", "narzebotdev"].includes(tags.username!.toLowerCase()) &&
      message.includes("!unpause") &&
      process.env.NODE_ENV === "production"
    ) {
      isPaused = false
      client.say(channel, `isPaused: ${isPaused}`)
      return
    }

    const commandStr = message
      .toLowerCase()
      .split(" ")[0]
      .replace(/(!\w+)(!\w+)*/, "$1")

    const command = commands.get(commandStr)

    if (!command) {
      return
    }

    // Production bot skip !commands if paused
    if (isPaused && process.env.NODE_ENV === "production") {
      return
    }

    await command.execute(client, channel, tags, message, { io })
  })

  async function disconnect() {
    await client.say("narzeLIVE", "!unpause")

    console.log("disconnect", await client.disconnect())

    clearInterval(interval)

    process.exit(0)
  }

  process.on("SIGINT", () => disconnect())
  process.on("SIGTERM", () => disconnect())
  process.on("uncaughtException", (err) => {
    console.error(err)
    disconnect()
  })
}
