import { ITwitchCommand } from "../../types"

const pomodoro: ITwitchCommand = {
  name: "!pomodoro",
  execute: async (_client, _channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()
    if (name !== "narzelive") {
      return
    }

    const [_, ...args] = message.split(/\s+/)

    await misc?.io?.emit("pomodorov2", {
      args,
    })
  },
}

export default pomodoro
