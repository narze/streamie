import { describe, expect, it, vi } from "vitest"
import { onBits, onGiftSub, onSub } from "../../src/twitch/actions"
import { prismaMock } from "../prisma-mock"

describe("onBits", () => {
  it("gives user 3 x bits amount of coin", async () => {
    const result = await onBits("narzelive", 3)

    // Assert: expect narzelive to get 9 coins
    expect(prismaMock.user.update).toBeCalledWith({
      where: { name: "narzelive" },
      data: { coin: { increment: 9 } },
    })

    expect(result).toEqual(9)
  })

  it("throws error is amount is zero", async () => {
    await expect(onBits("narzelive", 0)).rejects.toThrowError()
  })
})

describe("onSub", () => {
  vi.mock("axios", () => ({
    __esModule: true,
    default: {
      get: vi.fn().mockResolvedValue({
        data: {
          chatter_count: 7,
          chatters: {
            broadcaster: ["narzelive"],
            vips: ["bosssoq", "pandadhada"],
            moderators: ["narzebot"],
            staff: [],
            admins: [],
            global_mods: [],
            viewers: ["foo", "bar", "baz"],
          },
        },
      }),
    },
  }))

  it("gives user 100 coins, and airdrop 1 coins to every online users", async () => {
    prismaMock.user.updateMany.mockResolvedValue({ count: 7 })

    const result = await onSub("narzelive")

    expect(result).toEqual(7)

    // Assert: expect narzelive to get 100 coins
    expect(prismaMock.user.update).toBeCalledWith({
      where: { name: "narzelive" },
      data: { coin: { increment: 100 } },
    })

    // Expect chatters to receive 5 coins each
    expect(prismaMock.user.updateMany).toBeCalledWith({
      where: {
        name: {
          in: expect.arrayContaining([
            "bosssoq",
            "pandadhada",
            "narzebot",
            "foo",
            "bar",
            "baz",
          ]),
        },
      },
      data: {
        coin: { increment: 5 },
      },
    })
  })
})

describe("onGiftSub", () => {
  vi.mock("axios", () => ({
    __esModule: true,
    default: {
      get: vi.fn().mockResolvedValue({
        data: {
          chatter_count: 7,
          chatters: {
            broadcaster: ["narzelive"],
            vips: ["bosssoq", "pandadhada"],
            moderators: ["narzebot"],
            staff: [],
            admins: [],
            global_mods: [],
            viewers: ["foo", "bar", "baz"],
          },
        },
      }),
    },
  }))

  it("gives user 100 * number-of-subs coins", async () => {
    const numberOfSubs = 5

    const result = await onGiftSub("narzelive", numberOfSubs)

    // Assert: expect narzelive to get 100 * n coins
    expect(prismaMock.user.update).toBeCalledWith({
      where: { name: "narzelive" },
      data: { coin: { increment: 100 * numberOfSubs } },
    })

    expect(result).toEqual(100 * numberOfSubs)
  })
})
