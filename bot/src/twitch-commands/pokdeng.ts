import { ITwitchCommand } from "../../types"
import prisma from "../prisma"

const pokdeng: ITwitchCommand = {
  name: "!pok",
  execute: async (client, channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()

    const [_, subcommand, ...args] = message.split(/\s+/)

    if (
      !subcommand ||
      subcommand == "join" ||
      String(subcommand).match(/^[0-9]+$/)
    ) {
      if (`${subcommand}`.match(/^[0-9]+$/)) {
        args[0] = subcommand
      }

      const amount =
        args[0] && Number(args[0]) !== NaN ? Math.abs(~~Number(args[0])) : 1

      // Check amount of bet
      const user = await prisma.user.findUnique({ where: { name } })

      if (!user) {
        console.error("User not found")
        return
      }

      let coin = user.coin

      if (coin < amount) {
        await client.say(
          channel,
          `@${name} มี $OULONG ไม่พอ! (มีอยู่ ${user!.coin} $OULONG).`
        )
        return
      }

      await misc?.io?.emit("pokdeng", {
        command: "join",
        amount,
        name,
      })

      return
    }

    // Generic commands
    await misc?.io?.emit("pokdeng", {
      command: subcommand,
      name,
    })
  },
}

export default pokdeng
