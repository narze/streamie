import { ITwitchCommand } from "../types"
import { isError, gacha as gachaFn } from "../invest"
import prisma from "../prisma"

const allin: ITwitchCommand = {
  name: "!allin",
  execute: async (client, channel, tags, _message, misc) => {
    const name = tags.username!.toLowerCase()
    const user = await prisma.user.findUnique({ where: { name } })

    if (!user) {
      return
    }

    let amount = user.coin

    const gachaResult = await gachaFn(name, amount)

    if (amount == 0 || isError(gachaResult)) {
      await client.say(
        channel,
        `@${name} มี $OULONG ไม่พอ! (มีอยู่ ${user!.coin} $OULONG).`
      )
    } else {
      if (gachaResult.data.state == "win") {
        await client.say(
          channel,
          `@${name} ลงทุน ${gachaResult.data.bet} -> ได้ผลตอบแทน ${gachaResult.data.win} $OULONG (${gachaResult.data.balance}).`
        )
      } else if (gachaResult.data.state == "lose") {
        // TODO: remove this

        await client.say(
          channel,
          `@${name} ลงทุน ${gachaResult.data.bet} $OULONG -> แตก! (${gachaResult.data.balance}).`
        )
      }

      misc?.io?.emit("gacha", {
        data: gachaResult.data,
        name: name,
      })
    }
  },
}

export default allin
