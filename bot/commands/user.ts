import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info!"),
  async execute(interaction: CommandInteraction<"cached">) {
    await interaction.reply(
      `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
    )
  },
}
