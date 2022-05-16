import tmi from "tmi.js"
import fs from "node:fs"
import { createClient } from "redis"

import { ITwitchCommand } from "../types"
import socket from "./socket-client"
import { onBits, onGiftSub, onSub } from "./twitch/actions"

const MIN_BITS_TO_PRINT = 10

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

  const commandFiles = fs.readdirSync("./src/twitch-commands")

  for (const file of commandFiles) {
    const command: ITwitchCommand = require(`./twitch-commands/${
      file.split(".")[0]
    }`).default

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

      console.log({ commandStr, tags })

      if (commandStr) {
        switch (commandStr) {
          case "w":
            await io.emit("play", { key: "up" })
            break
          case "a":
            await io.emit("play", { key: "left" })
            break
          case "s":
            await io.emit("play", { key: "down" })
            break
          case "d":
            await io.emit("play", { key: "right" })
            break
          case "z":
            await io.emit("play", { key: "z" })
            break
          case "x":
            await io.emit("play", { key: "x" })
            break
          case "r":
            await io.emit("play", { key: "r" })
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

    await command.execute(client, channel, tags, message, {
      io,
      redis: redisClient,
    })
  })

  client.on("subscription", subActions(client))
  client.on("resub", subActions(client))

  client.on(
    "subgift",
    async (channel, name, _streakMonths, recipient, _methods, _userstate) => {
      const numberOfSubs = 1
      const coinAmount = await onGiftSub(name, numberOfSubs)

      await client.say(
        channel,
        `@${name} รับ ${coinAmount} $OULONG จากการ Gift Sub ให้ @${recipient}`
      )

      await io.emit("text", {
        text: `😍 ${name} Gift sub to @${recipient}`,
      })

      await io.emit("print", {
        text: `${name} ส่ง ${numberOfSubs} GiftSub`,
      })
    }
  )

  client.on(
    "submysterygift",
    async (channel, name, numberOfSubs, _methods, _userstate) => {
      const coinAmount = await onGiftSub(name, numberOfSubs)

      await client.say(
        channel,
        `@${name} รับ ${coinAmount} $OULONG จากการ Gift Sub ให้ ${numberOfSubs} คน`
      )

      await io.emit("text", {
        text: `😍😍😍 ${name} Gift subs to ${numberOfSubs} people`,
      })

      await io.emit("print", {
        text: `${name} ส่ง ${numberOfSubs} GiftSubs`,
      })
    }
  )

  client.on("cheer", async (channel, tags, message) => {
    const bits = Number(tags.bits!)
    const name = tags.username!.toLowerCase()

    const coin = await onBits(name, bits)

    await client.say(channel, `@${name} รับ ${coin} $OULONG จาก ${bits} Bits`)

    await io.emit("text", {
      text: `🤗 ${name} ${bits} Bits -> ${coin} $OULONG`,
    })

    if (bits >= MIN_BITS_TO_PRINT) {
      await io.emit("print", {
        text: `${name} ส่ง ${bits} Bits`,
      })

      await io.emit("print", {
        text: message,
      })
    }
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

function subActions(client) {
  return async (channel, name, _methods, message, _userstate) => {
    const airdropCount = await onSub(name)

    await client.say(
      channel,
      `@${name} รับ 100 $OULONG จากการ Subscribe และ Airdrop 5 $OULONG ให้ ${airdropCount} คน`
    )

    await io.emit("text", {
      text: `😍 ${name} Subscribed`,
    })

    await io.emit("text", {
      text: `✈️ Airdrop to ${airdropCount} people`,
    })

    await io.emit("print", {
      text: `${name} Subscribed`,
    })

    await io.emit("print", {
      text: message,
    })
  }
}
