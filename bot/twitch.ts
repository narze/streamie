import tmi from "tmi.js"
import fs from "node:fs"
// import axios from "axios"
import { createClient } from "redis"

import { ITwitchCommand } from "./types"
import socket from "./socket-client"

const io = socket()
const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on("error", (err) => console.log("Redis Client Error", err))

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
  redisClient.connect().catch(console.error)

  const commands = new Map<string, ITwitchCommand>()

  const commandFiles = fs
    .readdirSync("./twitch-commands")
    .filter((file: string) => file.endsWith(".ts"))

  for (const file of commandFiles) {
    const command: ITwitchCommand = require(`./twitch-commands/${file}`).default
    commands.set(command.name!, command)
  }

  // interval = setInterval(async () => {
  //   const chattersResponse = await axios.get(
  //     "https://tmi.twitch.tv/group/user/narzelive/chatters",
  //     { responseType: "json" }
  //   )

  //   const moderators = chattersResponse.data.chatters.moderators

  //   // if "narzebotdev" is offline, unpause automatically
  //   if (!moderators.includes("narzebotdev")) {
  //     // TODO: Find better way to periodially inform prod bot to pause
  //     if (process.env.NODE_ENV !== "production") {
  //       await client.say("narzelive", `!pause`)
  //       return
  //     }

  //     if (isPaused) {
  //       isPaused = false
  //       client.say("narzelive", `isPaused: ${isPaused}`)
  //     }
  //   }
  // }, 60000)

  // Dev mode - set streamie-dev-mode to true
  if (process.env.NODE_ENV !== "production") {
    redisClient.set("streamie-dev-mode", "true")

    // client.say(channel, "!pause")
  }

  client.on("message", async (channel, tags, message, self) => {
    if (self) return

    // // Production bot pause
    // // TODO: refactor to twitch-commands/pause
    // if (
    //   ["narzelive", "narzebotdev"].includes(tags.username!.toLowerCase()) &&
    //   message.includes("!pause") &&
    //   process.env.NODE_ENV === "production"
    // ) {
    //   isPaused = true
    //   client.say(channel, `isPaused: ${isPaused}`)
    //   return
    // }

    // if (
    //   ["narzelive", "narzebotdev"].includes(tags.username!.toLowerCase()) &&
    //   message.includes("!unpause") &&
    //   process.env.NODE_ENV === "production"
    // ) {
    //   isPaused = false
    //   client.say(channel, `isPaused: ${isPaused}`)
    //   return
    // }

    const isCommaCommand = message.startsWith(",")
    const isBangCommand = message.startsWith("!")

    if (isCommaCommand || isBangCommand) {
      const commandStr = message.replace(/^[,!](\s*)(\w+)$/, "$2")

      console.log({ commandStr })

      if (commandStr) {
        switch (commandStr) {
          case "w":
            io.emit("play", { key: "up" })
            break
          case "a":
            io.emit("play", { key: "left" })
            break
          case "s":
            io.emit("play", { key: "down" })
            break
          case "d":
            io.emit("play", { key: "right" })
            break
          case "z":
            io.emit("play", { key: "z" })
            break
          case "x":
            io.emit("play", { key: "x" })
            break
          case "r":
            io.emit("play", { key: "r" })
            break
          default:
            break
        }
      }
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
    if (process.env.NODE_ENV === "production") {
      const value = await redisClient.get("streamie-dev-mode")

      if (value === "true") {
        return
      }
    }

    await command.execute(client, channel, tags, message, { io })
  })

  async function disconnect(exitCode: number = 0) {
    await redisClient.set("streamie-dev-mode", "false")

    // await client.say("narzeLIVE", "!unpause")

    console.log("disconnect", await client.disconnect())

    clearInterval(interval)

    process.exit(exitCode)
  }

  process.on("SIGINT", () => disconnect())
  process.on("SIGTERM", () => disconnect())
  process.on("uncaughtException", (err) => {
    console.error(err)
    disconnect(1)
  })
}
