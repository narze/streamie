import { ITwitchCommand } from "../types"
import prisma from "../prisma"
import axios from "axios"

const airdrop: ITwitchCommand = {
  name: "!airdrop",
  execute: async (client, channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()
    if (name !== "narzelive") {
      return
    }

    const [_, ...cmdArgs] = message.split(/\s+/)

    let amount = 1

    if (cmdArgs.length) {
      let group = cmdArgs[0].match(/(-?\d+)/)
      if (group && group[1]) {
        amount = Number.parseInt(group[1])
      }
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
          increment: amount,
        },
      },
      where: {
        name: { in: viewers },
      },
    })

    client.say(
      channel,
      `@${name} gives ${amount} $OULONG to ${viewers.length} viewers!`
    )

    misc?.io?.sockets.emit("airdrop", {
      amount,
      viewerCount: viewers.length,
    })
  },
}

export default airdrop
