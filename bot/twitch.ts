import tmi from "tmi.js"
import { Server } from "socket.io"

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
  client.on("message", (channel, tags, message, self) => {
    if (self) return
    if (message.toLowerCase() === "!hello") {
      client.say(channel, `@${tags.username}, heya!`)
    }

    if (message.toLowerCase().startsWith("!say")) {
      const sayMessage = message.split("!say")[1]

      io.sockets.emit("message", {
        message: sayMessage,
        username: tags.username,
      })
    }
  })
}
