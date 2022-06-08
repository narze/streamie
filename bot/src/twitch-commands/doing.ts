import { ITwitchCommand } from "../../types"

const doing: ITwitchCommand = {
  name: "!doing",
  execute: async (_client, _channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()
    if (name !== "narzelive") {
      return
    }

    const [_, ...args] = message.split(/\s+/)

    await misc?.io?.emit("doing", {
      message: args.join(" "),
    })
  },
}

export default doing
