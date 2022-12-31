import type { RequestHandler } from "@sveltejs/kit"
import cookie from "cookie"

const DISCORD_API_URL = "https://discord.com/api"

export const GET: RequestHandler = async (event) => {
  const cookies = cookie.parse(event.request.headers.get("cookie") || "")

  const accessToken = cookies.access_token

  const request = await fetch(`${DISCORD_API_URL}/users/@me/connections`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data = await request.json()

  return new Response(data)
}
