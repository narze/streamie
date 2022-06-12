import { ITwitchCommand } from "../../types"

const pokdeng: ITwitchCommand = {
  name: "!pok",
  execute: async (_client, _channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()

    const [_, subcommand, ...args] = message.split(/\s+/)

    if (subcommand == "join") {
      // TODO: Check amount of bet

      const amount =
        args[0] && Number(args[0]) !== NaN ? Math.abs(~~Number(args[0])) : 1

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
