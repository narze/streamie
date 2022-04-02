import { ITwitchCommand } from "../types"

const say: ITwitchCommand = {
  name: "!say",
  execute: async (_client, _channel, tags, message, misc) => {
    const name = tags.username!.toLowerCase()
    const matches = message.match(/^!say(!(\w+))?(!slow)?\s(.+)$/)

    if (matches) {
      const [_0, _1, lang, slow, msg] = matches

      misc?.io?.sockets.emit("message", {
        message: msg,
        username: name,
        language: lang,
        slow: !!slow,
      })
    }
  },
}

export default say
