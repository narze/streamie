import { ITwitchCommand } from "../types"
import { upsertUser } from "../upsertUser"
import prisma from "../prisma"

const farm: ITwitchCommand = {
  name: "!farm",
  execute: async (client, channel, tags, _message, _misc) => {
    const name = tags.username!.toLowerCase()

    const farmAmount = 5

    const user = await upsertUser(name)

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

        await client.say(channel, `@${name} ฟาร์มได้ ${farmAmount} $OULONG`)
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
  },
}

export default farm
