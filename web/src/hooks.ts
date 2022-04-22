import type { GetSession, Handle } from "@sveltejs/kit"
import cookie from "cookie"
const DISCORD_API_URL = "https://discord.com/api"
const HOST = import.meta.env.VITE_HOST

async function getDiscordUser(access_token: string) {
  const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  return await request.json()
}

export const handle: Handle = async ({ event, resolve }) => {
  const cookies = cookie.parse(event.request.headers.get("cookie") || "")
  console.log("handle", { cookies })

  // if only refresh token is found, then access token has expired. perform a refresh on it (in getSession).
  if (cookies.refresh_token && !cookies.access_token) {
    event.locals["needs_refresh"] = true
    event.locals["refresh_token"] = cookies.refresh_token
  }

  const originalResponse = await resolve(event)

  return originalResponse
}

export const getSession: GetSession = async (event) => {
  const cookies = cookie.parse(event.request.headers.get("cookie") || "")

  console.log("getSession", { cookies })

  const session = {}

  if (cookies.access_token) {
    session["user"] = await getDiscordUser(cookies.access_token)
  }

  // Refresh token & pass it to the client via session
  if (event.locals["needs_refresh"]) {
    const refresh_token = event.locals["refresh_token"]

    const refresh_token_response = await fetch(
      `${HOST}/auth/refresh?refresh_token=${refresh_token}`
    )
    const discord_response_data = await refresh_token_response.json()

    if (refresh_token_response.ok) {
      const access_token = discord_response_data.access_token
      const refresh_token = discord_response_data.refresh_token
      const access_token_expires_in = new Date(Date.now() + discord_response_data.expires_in) // 10 minutes
      const refresh_token_expires_in = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days,

      session["tokens"] = {
        access_token,
        access_token_expires_in,
        refresh_token,
        refresh_token_expires_in,
      }

      if (!session["user"]) {
        session["user"] = { ...(await getDiscordUser(access_token)) }
      }
    }
  }

  return session
}
