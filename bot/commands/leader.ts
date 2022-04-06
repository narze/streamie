import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import prisma from "../prisma"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leader")
    .setDescription("Show top $OULONG hodlers"),
  async execute(interaction: CommandInteraction<"cached">) {
    const helpers = {
      buildEmbedMessage: (
        messages: { name: string; value: string; inline?: boolean }[]
      ): MessageEmbed => {
        const messageEmbed = new MessageEmbed()
        messages.forEach((message) => {
          messageEmbed.addField(message.name, message.value, message.inline)
        })

        return messageEmbed
      },
    }

    const topUsers = await prisma.user.findMany({
      select: { name: true, coin: true },
      orderBy: [{ coin: "desc" }],
      take: 20,
      where: {
        NOT: {
          name: "narzelive",
        },
      },
    })

    let embed = helpers.buildEmbedMessage(
      topUsers.map((player, idx) => ({
        name: player.name,
        value: String(player.coin),
        inline: idx >= 5,
      }))
    )

    embed.setTitle("กลุ่มผู้นำ $OULONG")
    // .setDescription("นายทุนผู้ถือเหรียญดิจิทัลที่มาแรงที่สุดในขณะนี้")
    // .setThumbnail(
    //   "https://cdn.shopify.com/s/files/1/1955/3977/products/stonl_800x.png"
    // )

    await interaction.reply({ embeds: [embed], ephemeral: true })
  },
}
