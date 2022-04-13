import { ITwitchCommand } from "../types"
import prisma from "../prisma"
import { upsertUser } from "../upsertUser"

const place: ITwitchCommand = {
  name: ["!place", "!p"],
  execute: async (_client, _channel, _tags, message, misc) => {
    const params = message.split(/\s+/)
    let [_, xStr, yStr, c] = params

    if (xStr.match(/[^0-9]/) || yStr.match(/[^0-9]/)) {
      return
    }

    if (!c.match(/^(?:[0-9a-fA-F]{3}){1,2}$/)) {
      return
    }

    const x = Number(xStr)
    const y = Number(yStr)

    await misc?.io?.emit("place", {
      x,
      y,
      c,
    })
  },
}

export default place
