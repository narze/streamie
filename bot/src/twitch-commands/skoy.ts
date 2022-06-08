import { ITwitchCommand } from "../../types"
import Skoy from "skoy"

const skoy: ITwitchCommand = {
  name: "!skoy",
  execute: async (client, channel, tags, message, _misc) => {
    const name = tags.username!.toLowerCase()

    const [_, sentence] = message.split(/\s+/, 2)

    client.say(channel, `@${name} ${Skoy.convert(sentence)}`)
  },
}

export default skoy
