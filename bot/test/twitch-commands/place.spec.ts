import { User } from "@prisma/client"
import { prismaMock } from "../prisma-mock"
import place from "../../src/twitch-commands/place"
import { describe, expect, it, vi } from "vitest"
import { Client } from "tmi.js"
import { Socket } from "socket.io-client"
import { createClient } from "redis"

it("exists", () => {
  expect(place).toBeDefined()
})

describe("name", () => {
  it("is !place and !p", () => {
    expect(place.name).toEqual(expect.arrayContaining(["!p", "!place"]))
  })
})

describe("execute", () => {
  const client = { say: vi.fn() } as unknown as Client
  const channel = "foo"
  const tags = { username: "NARZELIVE" }

  it("does nothing if x is invalid", async () => {
    const message = "!place 1.2 34 FF0000"
    const misc = {
      io: {
        emit: vi.fn(),
      } as unknown as Socket,
    }

    await place.execute(client, channel, tags, message, misc)

    expect(misc.io.emit).not.toHaveBeenCalled()
  })

  it("does nothing if y is invalid", async () => {
    const message = "!place 12 abc FF0000"
    const misc = {
      io: {
        emit: vi.fn(),
      } as unknown as Socket,
    }

    await place.execute(client, channel, tags, message, misc)

    expect(misc.io.emit).not.toHaveBeenCalled()
  })

  it("does nothing if c is invalid", async () => {
    const message = "!place 12 34 F0000Z"
    const misc = {
      io: {
        emit: vi.fn(),
      } as unknown as Socket,
    }

    await place.execute(client, channel, tags, message, misc)

    expect(misc.io.emit).not.toHaveBeenCalled()
  })

  it("sends x, y, and color via socket channel", async () => {
    const message = "!place 12 34 FF0000"
    const misc = {
      io: {
        emit: vi.fn(),
      } as unknown as Socket,
    }

    await place.execute(client, channel, tags, message, misc)

    expect(misc.io.emit).toBeCalledWith("place", {
      x: 12,
      y: 34,
      c: "FF0000",
    })
  })

  it("stores in redis hash", async () => {
    const message = "!place 12 34 FF0000"
    const misc = {
      io: {
        emit: vi.fn(),
      } as unknown as Socket,
      redis: {
        HSET: vi.fn(),
      } as unknown as ReturnType<typeof createClient>,
    }

    await place.execute(client, channel, tags, message, misc)

    expect(misc.redis.HSET).toBeCalledWith(`place:row:34`, "12", "FF0000")
  })

  it("randomizes color is not defined", async () => {
    const message = "!place 12 34"
    const misc = {
      io: {
        emit: vi.fn(),
      } as unknown as Socket,
    }

    await place.execute(client, channel, tags, message, misc)

    expect(misc.io.emit).toBeCalledWith("place", {
      x: 12,
      y: 34,
      c: expect.any(String),
    })
  })
})
