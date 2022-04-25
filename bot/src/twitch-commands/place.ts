import axios from "axios"
import { ITwitchCommand } from "../../types"

const place: ITwitchCommand = {
  name: ["!place", "!p"],
  execute: async (client, channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()
    const params = message.split(/\s+/)
    let [_, xStr, yStr, c] = params

    if (message === "!place") {
      await client.say(
        channel,
        `@${name} https://streamie-public.narze.live/pub/place`
      )
      return
    }

    if (xStr.match(/[^0-9]/) || yStr.match(/[^0-9]/)) {
      return
    }

    // Reject when not live streaming
    const twitchToken = process.env.TWITCH_HELIX_OAUTH_TOKEN!
    const twitchClientId = process.env.TWITCH_HELIX_CLIENT_ID!

    const streamsRes = await axios.get(
      "https://api.twitch.tv/helix/streams?user_login=narzelive",
      {
        headers: {
          Authorization: `Bearer ${twitchToken}`,
          "Client-Id": twitchClientId,
        },
      }
    )

    if (streamsRes?.data?.data[0]?.type !== "live") {
      await client.say(channel, `@${name} !place ได้เฉพาะตอน live`)

      return
    }

    if (c === "" || c === undefined) {
      c = Math.floor(Math.random() * 16777215).toString(16)
    } else if (!c.match(/^(?:[0-9a-fA-F]{3}){1,2}$/)) {
      return
    }

    const x = Number(xStr)
    const y = Number(yStr)

    await misc?.io?.emit("place", {
      x,
      y,
      c,
    })

    await misc?.redis?.HSET(`place:row:${y}`, `${x}`, c)

    await client.say(channel, `@${name} Placed at ${x},${y}`)
  },
}

export default place
