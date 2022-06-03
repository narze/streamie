import { ITwitchCommand } from "../../types"

const pomodoro: ITwitchCommand = {
  name: "!pomodoro",
  execute: async (_client, _channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()
    if (name !== "narzelive") {
      return
    }

    const [_, ...cmdArgs] = message.split(/\s+/)

    let minutes = 25

    if (cmdArgs.length) {
      if (cmdArgs[0].match(/^[a-zA-Z]+$/)) {
        const command = cmdArgs[0]

        await misc?.io?.emit("pomodoro", {
          command,
          args: cmdArgs.slice(1),
        })
        return
      }

      let group = cmdArgs[0].match(/(-?\d+)/)
      if (group && group[1]) {
        minutes = Number.parseInt(group[1])
      }
    }

    await misc?.io?.emit("pomodoro", {
      minutes,
    })
  },
}

export default pomodoro
