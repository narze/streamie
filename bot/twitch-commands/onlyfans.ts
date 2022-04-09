import { ITwitchCommand } from "../types"

export const onlyfans: ITwitchCommand = {
  name: "!onlyfans",
  execute: async (client, channel, _tags, _message) => {
    client.say(channel, `onlyfans.narze.live`)
  },
}

export default onlyfans
