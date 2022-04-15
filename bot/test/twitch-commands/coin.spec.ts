import { User } from "@prisma/client"
import { prismaMock } from "../prisma-mock"
import coin from "../../src/twitch-commands/coin"
import { describe, expect, it, vi } from "vitest"
import { Client } from "tmi.js"

describe("name", () => {
  it("is !coin and !c", () => {
    expect(coin.name).toEqual(expect.arrayContaining(["!c", "!coin"]))
  })
})

describe("execute", () => {
  it("retrives user then returns coin count", async () => {
    const client = { say: vi.fn() } as unknown as Client
    const channel = "foo"
    const tags = { username: "NARZELIVE" }
    const message = "foo"

    const user: User = {
      id: "1",
      name: "narzelive",
      coin: 42,
      farmedAt: null,
    }

    prismaMock.user.findUnique.mockResolvedValue(user)

    await coin.execute(client, channel, tags, message)

    expect(prismaMock.user.findUnique).toBeCalledWith({
      where: { name: "NARZELIVE".toLowerCase() },
    })

    const expectedReply = "@narzelive has 42 $OULONG"

    expect(client.say).toHaveBeenCalledWith(channel, expectedReply)
  })
})
