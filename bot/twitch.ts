import tmi from "tmi.js"
import { Server } from "socket.io"
import prisma from "./prisma"
import axios from "axios"
import gacha from "./gacha"
import { isError } from "./gacha"

interface ITwitchCommand {
  execute: (channel: string, tags: tmi.ChatUserstate, message: string) => void
}

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

  commands.set("!hello", {
    execute: (channel, tags, _message) => {
      const name = tags.username!.toLowerCase()
      client.say(channel, `@${name}, heya!`)
    },
  })

  commands.set("!register", {
    execute: async (channel, tags, _message) => {
      const name = tags.username!.toLowerCase()

      await upsertUser(name)

      client.say(channel, `@${name} registered`)
    },
  })

  commands.set("!coin", {
    execute: async (channel, tags, _message) => {
      const name = tags.username!.toLowerCase()

      await upsertUser(name)

      const user = await prisma.user.findUnique({ where: { name } })

      if (user) {
        client.say(channel, `@${name} has ${user.coin} $OULONG`)
      }
    },
  })

  commands.set("!airdrop", {
    execute: async (channel, tags, _message) => {
      const name = tags.username!.toLowerCase()
      if (name !== "narzelive") {
        return
      }

      const chattersResponse = await axios.get(
        "https://tmi.twitch.tv/group/user/narzelive/chatters",
        { responseType: "json" }
      )

      const viewers = chattersResponse.data.chatters.viewers

      // Upsert user
      await prisma.user.createMany({
        data: viewers.map((v) => ({ name: v })),
        skipDuplicates: true,
      })

      await prisma.user.updateMany({
        data: {
          coin: {
            increment: 1,
          },
        },
        where: {
          name: { in: viewers },
        },
      })

      client.say(
        channel,
        `@${name} gives $OULONG to ${viewers.length} viewers!`
      )
    },
  })

  commands.set("!gacha", {
    execute: async (channel, tags, message) => {
      const name = tags.username!.toLowerCase()
      const [_, ...cmdArgs] = message.split(/\s+/)

      let amount = 1

      if (cmdArgs.length) {
        let group = cmdArgs[0].match(/(-?\d+)/)
        if (group && group[1]) {
          amount = Number.parseInt(group[1])
        }
      }

      const gachaResult = await gacha(name, amount)

      if (!isError(gachaResult)) {
        if (gachaResult.data.state == "win") {
          await client.say(
            channel,
            `@${name} ลงทุน ${gachaResult.data.bet} -> ได้รางวัล ${gachaResult.data.win} $OULONG (${gachaResult.data.balance}).`
          )
        } else if (gachaResult.data.state == "lose") {
          await client.say(
            channel,
            `@${name} ลงทุน ${gachaResult.data.bet} $OULONG -> แตก! (${gachaResult.data.balance}).`
          )
        }
      }
    },
  })

  commands.set("!say", {
    execute: async (_channel, tags, message) => {
      const name = tags.username!.toLowerCase()
      const matches = message.match(/^!say(!(\w+))?(!slow)?\s(.+)$/)

      if (matches) {
        const [_0, _1, lang, slow, msg] = matches

        io.sockets.emit("message", {
          message: msg,
          username: name,
          language: lang,
          slow: !!slow,
        })
      }
    },
  })

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

    command.execute(channel, tags, message)
  })
}

async function upsertUser(name: string) {
  await prisma.user.upsert({
    create: {
      name,
    },
    update: {},
    where: {
      name,
    },
  })
}
