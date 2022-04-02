import { ITwitchCommand } from "../types"
import { isError, gacha as gachaFn } from "../gacha"

const gacha: ITwitchCommand = {
  name: "!gacha",
  execute: async (client, channel, tags, message) => {
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

    if (!isError(gachaResult)) {
      if (gachaResult.data.state == "win") {
        await client.say(
          channel,
          `@${name} ลงทุน ${gachaResult.data.bet} -> ได้รางวัล ${gachaResult.data.win} $OULONG (${gachaResult.data.balance}).`
        )
      } else if (gachaResult.data.state == "lose") {
        await client.say(
          channel,
          `@${name} ลงทุน ${gachaResult.data.bet} $OULONG -> แตก! (${gachaResult.data.balance}).`
        )
      }
    }
  },
}

export default gacha
