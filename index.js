const { Client, Intents } = require("discord.js")
const dotenv = require("dotenv")
dotenv.config()

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!")
})

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
