import tmi from "tmi.js"
import { Server } from "socket.io"
import prisma from "./prisma"
import axios from "axios"

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

    if (message.toLowerCase() === "!hello") {
      client.say(channel, `@${tags.username}, heya!`)
    }

    if (message.toLowerCase().startsWith("!say")) {
      const matches = message.match(/^!say(!(\w+))?(!slow)?\s(.+)$/)

      if (matches) {
        const [_0, _1, lang, slow, msg] = matches

        io.sockets.emit("message", {
          message: msg,
          username: tags.username,
          language: lang,
          slow: !!slow,
        })
      }
    }

    if (message === "!register") {
      const name = tags.username!.toLowerCase()

      await upsertUser(name)

      client.say(channel, `@${tags.username} registered`)
    }

    if (message === "!coin") {
      const name = tags.username!.toLowerCase()

      await upsertUser(name)

      const user = await prisma.user.findUnique({ where: { name } })

      if (user) {
        client.say(channel, `@${tags.username} has ${user.coin} $OULONG`)
      }
    }

    if (message === "!airdrop") {
      const name = tags.username!.toLowerCase()

      if (name !== "narzelive") {
        return
      }

      const chattersResponse = await axios.get(
        "https://tmi.twitch.tv/group/user/narzelive/chatters",
        { responseType: "json" }
      )

      const viewers = chattersResponse.data.chatters.viewers

      console.log({ viewers })

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
        `@${tags.username} gives $OULONG to ${viewers.length} viewers!`
      )
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
