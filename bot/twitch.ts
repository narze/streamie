import tmi from "tmi.js"
import { Server } from "socket.io"
import prisma from "./prisma"
import axios from "axios"
import gacha from "./gacha"
import { isError } from "./gacha"

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

  client.on("message", async (channel, tags, message, self) => {
    if (self) return

    const name = tags.username!.toLowerCase()

    if (message.toLowerCase() === "!hello") {
      client.say(channel, `@${name}, heya!`)
    }

    if (message.toLowerCase().startsWith("!say")) {
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
    }

    if (message === "!register") {
      await upsertUser(name)

      client.say(channel, `@${name} registered`)
    }

    if (message === "!coin") {
      await upsertUser(name)

      const user = await prisma.user.findUnique({ where: { name } })

      if (user) {
        client.say(channel, `@${name} has ${user.coin} $OULONG`)
      }
    }

    if (message === "!airdrop") {
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
    }

    if (message.startsWith("!gacha")) {
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
    }
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
