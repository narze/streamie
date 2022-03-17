const fs = require("node:fs")
const { Client, Collection, Intents } = require("discord.js")
require("dotenv").config()
require("./ping-server")
require("./twitch")

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
})

client.commands = new Collection()

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command)
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!")
})

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    })
  }
})

// Intents.FLAGS.GUILD_MESSAGES
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return

  console.log("received message", `${msg.author.tag}: ${msg.content}`)
})

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
