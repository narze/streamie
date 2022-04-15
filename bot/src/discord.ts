import fs from "node:fs"
import { Client, Collection, Intents, Interaction, Message } from "discord.js"

import type { SlashCommandBuilder } from "@discordjs/builders"
// import type { SendEmbed } from "./lib/MessageEmbed"

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>
  }
  interface Command extends NodeModule {
    data: SlashCommandBuilder
    execute(interaction: CommandInteraction): Promise<any>
  }
  interface TextWithEmbed extends TextChannel {
    send(options: string | MessagePayload | MessageOptions): Promise<Message>
  }
}

export default function discord() {
  // Create a new client instance
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  })

  client.commands = new Collection()

  const commandFiles = fs.readdirSync("./src/commands")

  for (const file of commandFiles) {
    const command = require(`./commands/${file.split(".")[0]}`)
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command)
  }

  // When the client is ready, run this code (only once)
  client.once("ready", () => {
    console.log("Ready!")
  })

  client.on("interactionCreate", async (interaction: Interaction) => {
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
  client.on("messageCreate", async (msg: Message) => {
    if (msg.author.bot) return

    console.log("received message", `${msg.author.tag}: ${msg.content}`)

    if (msg.content.match(/^ping/i)) {
      msg.channel.send("Pong from dev env!")
    }
  })

  // Login to Discord with your client's token
  client.login(process.env.DISCORD_TOKEN)
}
