import discord from "../../twitch-commands/discord"
import { describe, expect, it, vi } from "vitest"
import { Client } from "tmi.js"

describe("name", () => {
  it("is !discord", () => {
    expect(discord.name).toBe("!discord")
  })
})

describe("execute", () => {
  it("replies `discord.narze.live`", () => {
    const client = { say: vi.fn() } as unknown as Client
    const channel = "foo"
    const tags = {}
    const message = "foo"

    discord.execute(client, channel, tags, message)

    const expectedReply = "discord.narze.live"

    expect(client.say).toHaveBeenCalledWith(channel, expectedReply)
  })
})
