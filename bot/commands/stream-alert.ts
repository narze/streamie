import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stream")
    .setDescription("Admin: Alert livestream"),
  async execute(interaction: CommandInteraction<"cached">) {
    if (interaction.user.id !== process.env.DISCORD_ADMIN_USER_ID) {
      await interaction.reply(`You are not admin! :<`)
      return
    }

    // const everyone = await interaction.guild.roles.fetch("@everyone")
    await interaction.channel!.send(
      `@everyone narzeLIVE is live! https://twitch.tv/narzeLIVE`
    )
  },
}
