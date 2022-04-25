import { User } from "@prisma/client"
import { prismaMock } from "../prisma-mock"
import farm from "../../src/twitch-commands/farm"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Client } from "tmi.js"

vi.mock("axios", () => ({
  __esModule: true,
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: [{ type: "live" }],
      },
    }),
  },
}))

describe("name", () => {
  it("is !farm and !f", () => {
    expect(farm.name).toEqual(expect.arrayContaining(["!f", "!farm"]))
  })
})

describe("execute", () => {
  beforeEach(() => {
    vi.spyOn(global.Math, "random").mockReturnValue(0)
  })

  afterEach(() => {
    vi.spyOn(global.Math, "random").mockRestore()
  })

  it("gives user coins", async () => {
    const client = { say: vi.fn() } as unknown as Client
    const channel = "foo"
    const tags = { username: "NARZELIVE" }
    const message = "foo"

    const user: User = {
      id: "1",
      name: "narzelive",
      coin: 42,
      farmedAt: null,
      twitchId: null,
      discordId: null,
    }

    prismaMock.user.upsert.mockResolvedValue(user)

    await farm.execute(client, channel, tags, message)

    expect(prismaMock.user.update).toBeCalledWith({
      where: { name: "NARZELIVE".toLowerCase() },
      data: expect.anything(),
    })

    const expectedReply = "@narzelive ฟาร์มได้ 5 $OULONG"

    expect(client.say).toHaveBeenCalledWith(channel, expectedReply)
  })
})
