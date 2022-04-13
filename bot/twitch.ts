import tmi from "tmi.js"
import fs from "node:fs"
import { createClient } from "redis"

import { ITwitchCommand } from "./types"
import socket from "./socket-client"
import { onBits } from "./twitch/actions"

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

    if (Array.isArray(command.name)) {
      for (const name of command.name) {
        commands.set(name, command)
      }
    } else {
      commands.set(command.name!, command)
    }
  }

  // Dev mode - set streamie-dev-mode to true
  if (process.env.NODE_ENV !== "production") {
    redisClient.set("streamie-dev-mode", "true")
  }

  client.on("message", async (channel, tags, message, self) => {
    if (self) return

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

  // client.on(
  //   "subscription",
  //   async (_channel, username, _methods, _message, _userstate) => {
  //     return await subscriptionPayout(username)
  //   }
  // )

  // client.on(
  //   "resub",
  //   async (_channel, username, _months, _message, _userstate, _methods) => {
  //     return await subscriptionPayout(username)
  //   }
  // )

  // client.on(
  //   "subgift",
  //   async (
  //     channel,
  //     username,
  //     _streakMonths,
  //     recipient,
  //     _methods,
  //     _userstate
  //   ) => {
  //     await commands.giveCoin(username, 10)
  //     await subscriptionPayout(recipient)

  //     await botSay(
  //       client,
  //       channel,
  //       `${username} ได้รับ 10 $ARM จากการ Gift ให้ ${recipient} armKraab `
  //     )
  //   }
  // )

  // client.on(
  //   "submysterygift",
  //   async (channel, username, numberOfSubs, _methods, _userstate) => {
  //     await commands.giveCoin(username, 10 * numberOfSubs)

  //     await botSay(
  //       client,
  //       channel,
  //       `${username} ได้รับ ${
  //         10 * numberOfSubs
  //       } $ARM จากการ Gift Sub ให้สมาชิก ${numberOfSubs} คน armKraab`
  //     )

  //     await widget.feed(
  //       `<b class="badge bg-primary">${username}</b> ได้รับ <i class="fas fa-coins"></i> ${
  //         10 * numberOfSubs
  //       } $ARM จากการ Gift Sub x ${numberOfSubs}`
  //     )
  //   }
  // )

  client.on("cheer", async (channel, tags, _message) => {
    const bits = Number(tags.bits!)
    const name = tags.username!.toLowerCase()

    const coin = await onBits(name, bits)

    await client.say(channel, `@${name} รับ ${coin} $OULONG จาก ${bits} Bits`)

    io.emit("text", {
      text: `🤗 ${name} ${bits} Bits -> ${coin} $OULONG`,
    })
  })

  async function disconnect(exitCode: number = 0) {
    await redisClient.set("streamie-dev-mode", "false")

    console.log("disconnect twitch client", await client.disconnect())
    console.log("disconnect redis client", await redisClient.disconnect())

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
