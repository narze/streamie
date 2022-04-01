import fs from "node:fs"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import dotenvFlow from "dotenv-flow"
import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction } from "discord.js"

dotenvFlow.config()

const { clientId, guildId, token } = {
  clientId: process.env.OAUTH_CLIENT_ID!,
  guildId: process.env.DEV_GUILD_ID!,
  token: process.env.DISCORD_TOKEN!,
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

interface ICommand {
  data: SlashCommandBuilder
  execute: (interaction: Interaction) => void
}

const commands: ICommand[] = []
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".ts"))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(token)

console.log({ commands })

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() =>
    console.log(`Successfully registered application commands to ${guildId}`)
  )
  .catch(console.error)
