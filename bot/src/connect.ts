import prisma from "./prisma"
import socket from "./socket-client"

const io = socket()

export default function connect() {
  io.on("connect", () => {
    console.log("CONNECTED")

    io.on("discord_connect_twitch", async ({ discord_id, twitch_id }) => {
      console.log({ discord_id, twitch_id })

      // Get user from twitch id
      const user = await prisma.user.findFirst({
        where: { twitchId: twitch_id },
      })

      if (user) {
        // Update user with discord id
        await prisma.user.update({
          where: { id: user.id },
          data: { discordId: discord_id },
        })
      }
    })
  })
}
