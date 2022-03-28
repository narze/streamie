import tmi from "tmi.js"
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
    client.say(channel, `@${tags.username}, heya from development!`)
  }
})
