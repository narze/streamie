import { ITwitchCommand } from "../../types"

export const onlyfans: ITwitchCommand = {
  name: ["!onlyfans", "!olf"],
  execute: async (client, channel, _tags, _message) => {
    client.say(channel, `onlyfans.narze.live`)
  },
}

export default onlyfans
