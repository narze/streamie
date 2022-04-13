import { describe, expect, it } from "vitest"
import { onBits } from "../../twitch/actions"
import { prismaMock } from "../prisma-mock"

describe("onBits", () => {
  it("gives user 3 x bits amount of coin", async () => {
    await onBits("narzelive", 3)

    // Assert: expect narzelive to get 9 coins
    expect(prismaMock.user.update).toBeCalledWith({
      where: { name: "narzelive".toLowerCase() },
      data: { coin: { increment: 9 } },
    })
  })

  it("throws error is amount is zero", async () => {
    await expect(onBits("narzelive", 0)).rejects.toThrowError()
  })
})
