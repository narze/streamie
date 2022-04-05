import { ITwitchCommand } from "../types"
import prisma from "../prisma"
import axios from "axios"

const airdrop: ITwitchCommand = {
  name: "!airdrop",
  execute: async (client, channel, tags, _message, misc) => {
    const name = tags.username!.toLowerCase()
    if (name !== "narzelive") {
      return
    }

    const chattersResponse = await axios.get(
      "https://tmi.twitch.tv/group/user/narzelive/chatters",
      { responseType: "json" }
    )

    const viewers = chattersResponse.data.chatters.viewers

    // Upsert user
    await prisma.user.createMany({
      data: viewers.map((v) => ({ name: v })),
      skipDuplicates: true,
    })

    await prisma.user.updateMany({
      data: {
        coin: {
          increment: 1,
        },
      },
      where: {
        name: { in: viewers },
      },
    })

    client.say(channel, `@${name} gives $OULONG to ${viewers.length} viewers!`)

    misc?.io?.sockets.emit("airdrop", {
      viewerCount: viewers.length,
    })
  },
}

export default airdrop
