import qs from "qs"
import { serialize } from "cookie"

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = import.meta.env.VITE_DISCORD_CLIENT_SECRET
const DISCORD_OAUTH_REDIRECT_URI = import.meta.env.VITE_DISCORD_OAUTH_REDIRECT_URI

export async function get({ url }) {
  const authCode = url.searchParams.get("code")

  const data = qs.stringify({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: DISCORD_OAUTH_REDIRECT_URI,
  })

  const request = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams(data),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })

  const response = await request.json()

  // redirect to front page in case of error
  if (response.error) {
    console.log("redirect to / due error")
    return {
      headers: { Location: "/pub" },
      status: 302,
    }
  }

  const access_token_expires_in = new Date(Date.now() + response.expires_in) // 10 minutes
  const refresh_token_expires_in = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days,

  // redirect user to front page with cookies set
  return {
    headers: {
      // Location: '/', // Use refresh instead of redirect to make cookie available
      refresh: `0; url=/pub`,
      "Set-Cookie": [
        serialize("access_token", response.access_token, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          expires: access_token_expires_in,
        }),
        serialize("refresh_token", response.refresh_token, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          expires: refresh_token_expires_in,
        }),
      ],
    },
    status: 302,
    body: "", // Show blank page before refresh
  }
}
