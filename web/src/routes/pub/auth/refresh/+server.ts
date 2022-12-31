import qs from "qs"
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = import.meta.env.VITE_DISCORD_CLIENT_SECRET

export async function GET({ url }) {
  const refresh_token = url.searchParams.get("refresh_token")

  if (!refresh_token) {
    return {
      body: JSON.stringify({ error: "No refresh token found" }),
      status: 500,
    }
  }

  const data = qs.stringify({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  })

  const request = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams(data),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })

  const response = await request.json()

  if (response.error) {
    return {
      body: JSON.stringify({ error: response.error }),
      status: 500,
    }
  }

  return {
    status: 200,
    body: JSON.stringify({ ...response }),
  }
}
