import { ITwitchCommand } from "../types"
import { upsertUser } from "../upsertUser"

const register: ITwitchCommand = {
  name: "!register",
  execute: async (client, channel, tags, _message) => {
    const name = tags.username!.toLowerCase()

    await upsertUser(name)

    client.say(channel, `@${name} registered`)
  },
}

export default register
