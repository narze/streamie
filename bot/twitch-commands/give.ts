import prisma from "../prisma"
import { ITwitchCommand } from "../types"
// import { isError, give as giveFn } from "../give"

const give: ITwitchCommand = {
  name: "!give",
  execute: async (client, channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()
    const [_, recipientName, ...rest] = message.split(/\s+/)

    let amount = 1

    if (rest.length) {
      let group = rest[0].match(/(-?\d+)/)
      if (group && group[1]) {
        amount = Number.parseInt(group[1])
      }
    }

    // verify that the recipient exists
    const recipient = await prisma.user.findUnique({
      where: { name: recipientName.toLowerCase() },
    })

    if (!recipient) {
      await client.say(channel, `ไม่มีผู้ใช้ชื่อ ${recipientName} ในระบบ`)

      return
    }

    if (name == recipientName.toLowerCase()) {
      await client.say(channel, `@${name} อย่าโอนให้ตัวเองสิฟะ!`)

      return
    }

    // verify that sender has sufficient coin with 30% fee (rounded up)
    const amountWithFee = Math.ceil(1.3 * amount)

    const sender = await prisma.user.findUnique({
      where: { name },
    })

    if (!sender || sender.coin < amountWithFee) {
      await client.say(
        channel,
        `@${name} มีเหรียญไม่พอโอน! (ต้องใช้ ${amountWithFee} $OULONG)`
      )

      return
    }

    // deduct sender coin
    await prisma.user.update({
      where: { name },
      data: { coin: { decrement: amountWithFee } },
    })

    // increase recipient coin
    await prisma.user.update({
      where: { name: recipientName.toLowerCase() },
      data: { coin: { increment: amount } },
    })

    // Message
    await client.say(
      channel,
      `@${name} โอน ${amount} $OULONG ให้ @${recipientName} (ค่าธรรมเนียม ${
        amountWithFee - amount
      } $OULONG)`
    )

    misc?.io?.emit("text", {
      text: `${name} -> ${amount} $OULONG -> ${recipientName}`,
    })
  },
}

export default give
