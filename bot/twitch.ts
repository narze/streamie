import tmi from "tmi.js"
import { Server } from "socket.io"
import prisma from "./prisma"

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

    if (message.startsWith("!register")) {
      const name = tags.username!.toLowerCase()

      await prisma.user.upsert({
        create: {
          name,
        },
        update: {},
        where: {
          name,
        },
      })

      client.say(channel, `@${tags.username} registered`)
    }
  })
}
