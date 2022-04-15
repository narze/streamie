import { ITwitchCommand } from "../../types"

const hello: ITwitchCommand = {
  name: "!hello",
  execute: (client, channel, tags, _message) => {
    const name = tags.username!.toLowerCase()
    client.say(channel, `@${name}, heya!`)
  },
}

export default hello
