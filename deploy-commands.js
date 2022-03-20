const fs = require("node:fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
require("dotenv-flow").config()

const { clientId, guildId, token } = {
  clientId: process.env.OAUTH_CLIENT_ID,
  guildId: process.env.DEV_GUILD_ID,
  token: process.env.DISCORD_TOKEN,
}

// const commands = [
//   new SlashCommandBuilder()
//     .setName("ping")
//     .setDescription("Replies with pong!"),
//   new SlashCommandBuilder()
//     .setName("server")
//     .setDescription("Replies with server info!"),
//   new SlashCommandBuilder()
//     .setName("user")
//     .setDescription("Replies with user info!"),
// ].map((command) => command.toJSON())

const commands = []
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(token)

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error)
