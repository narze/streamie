import { ITwitchCommand } from "../../types"

const discord: ITwitchCommand = {
  name: "!discord",
  execute: async (client, channel, _tags, _message) => {
    client.say(channel, `discord.narze.live`)
  },
}

export default discord
