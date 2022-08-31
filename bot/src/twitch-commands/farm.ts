import { ITwitchCommand } from "../../types"
import { upsertUser } from "../upsertUser"
import prisma from "../prisma"
import axios from "axios"

const farm: ITwitchCommand = {
  name: ["!farm", "!f"],
  execute: async (client, channel, tags, _message, misc) => {
    const name = tags.username!.toLowerCase()
    const id = tags["user-id"]

    // Get streams
    const twitchToken = process.env.TWITCH_HELIX_OAUTH_TOKEN!
    const twitchClientId = process.env.TWITCH_HELIX_CLIENT_ID!

    let streamsRes
    try {
      streamsRes = await axios.get(
        "https://api.twitch.tv/helix/streams?user_login=narzelive",
        {
          headers: {
            Authorization: `Bearer ${twitchToken}`,
            "Client-Id": twitchClientId,
          },
        }
      )
    } catch (e) {
      console.error(e.message)
      return
    }

    if (streamsRes?.data?.data[0]?.type !== "live") {
      await client.say(channel, `@${name} ฟาร์มได้เฉพาะตอน Live เท่านั้น`)

      return
    }

    let farmAmount = 5 + Math.ceil(Math.random() * 10)

    if (!!tags.subscriber) {
      farmAmount *= 2
    }

    const user = await upsertUser(name, id)

    // check if farmedAt is not null
    if (user.farmedAt) {
      const elapsedSeconds = Math.floor(
        (Date.now() - user.farmedAt.getTime()) / 1000
      )

      // if not past by 5 minutes, inform user to wait for x minutes
      if (elapsedSeconds < 300) {
        await client.say(
          channel,
          `@${name} รออีก ${300 - elapsedSeconds} วินาที`
        )
      } else {
        // else, reset farmedAt to now
        // give user 5 coins
        await prisma.user.update({
          where: { name },
          data: { farmedAt: new Date(), coin: { increment: farmAmount } },
        })

        await client.say(
          channel,
          `@${name} ฟาร์มได้ ${farmAmount} $OULONG${
            !!tags.subscriber ? " (x2 sub bonus)" : ""
          }`
        )
      }

      return
    }

    // for new users with no farmedAt, reset farmedAt to now
    // give user 5 coins
    await prisma.user.update({
      where: { name },
      data: { farmedAt: new Date(), coin: { increment: farmAmount } },
    })

    await client.say(channel, `@${name} ฟาร์มได้ ${farmAmount} $OULONG`)

    misc?.io?.emit("text", {
      text: `🍄 ${name} !farm -> ${farmAmount} $OULONG`,
    })
  },
}

export default farm
