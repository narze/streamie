import { ITwitchCommand } from "../../types"
import prisma from "../prisma"
import { upsertUser } from "../upsertUser"

const coin: ITwitchCommand = {
  name: ["!coin", "!c"],
  execute: async (client, channel, tags, _message) => {
    const name = tags.username!.toLowerCase()
    const id = tags["user-id"]

    await upsertUser(name, id)

    const user = await prisma.user.findUnique({ where: { name } })

    if (user) {
      client.say(channel, `@${name} has ${user.coin} $OULONG`)
    }
  },
}

export default coin
