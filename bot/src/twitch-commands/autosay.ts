import { ITwitchCommand } from "../../types"

let autosayEnabled = false

export function isAutosayEnabled(): boolean {
  return autosayEnabled
}

const autosay: ITwitchCommand = {
  name: "!autosay",
  execute: async (client, channel, tags, _message, _misc) => {
    const name = tags.username!.toLowerCase()
    if (name !== "narzelive") {
      return
    }

    autosayEnabled = !autosayEnabled

    await client.say(channel, `Autosay mode: ${autosayEnabled ? "ON" : "OFF"}`)
  },
}

export default autosay
