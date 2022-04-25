import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import prisma from "../prisma"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coin")
    .setDescription("Query for your $OULONG"),
  async execute(interaction: CommandInteraction) {
    const discordId = interaction.user.id
    const discordUsername = interaction.user.username

    // Get user by discordId
    const user = await prisma.user.findFirst({
      where: { discordId },
    })

    if (user) {
      await interaction.reply(`คุณ ${discordUsername} มี ${user.coin} $OULONG`)
    } else {
      const content = `คุณยังไม่ได้ผูกบัญชี Twitch กับ Discord -> https://streamie-public.narze.live/pub`

      await interaction.reply({ content, ephemeral: true })
    }
  },
}
