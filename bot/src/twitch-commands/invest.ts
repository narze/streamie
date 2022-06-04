import { ITwitchCommand } from "../../types"
import { isError, gacha as gachaFn } from "../invest"
import prisma from "../prisma"

const invest: ITwitchCommand = {
  name: "!invest",
  execute: async (client, channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()
    const [_, ...cmdArgs] = message.split(/\s+/)

    let amount = 1

    if (cmdArgs.length) {
      let group = cmdArgs[0].match(/(-?\d+)/)
      if (group && group[1]) {
        amount = Number.parseInt(group[1])
      }
    }

    const gachaResult = await gachaFn(name, amount)

    if (isError(gachaResult)) {
      const user = await prisma.user.findUnique({ where: { name } })

      await client.say(
        channel,
        `@${name} มี $OULONG ไม่พอ! (มีอยู่ ${user!.coin} $OULONG).`
      )
    } else {
      const win = gachaResult.data.win > gachaResult.data.bet

      await client.say(
        channel,
        `@${name} ${win ? "📈" : "🧂"} ลงทุน ${
          gachaResult.data.bet
        } -> ได้ผลตอบแทน ${gachaResult.data.win} $OULONG (${
          gachaResult.data.balance
        })`
      )

      misc?.io?.emit("gacha", {
        data: gachaResult.data,
        name: name,
      })
    }
  },
}

export default invest
