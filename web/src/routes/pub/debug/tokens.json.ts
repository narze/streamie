import type { RequestHandler } from "@sveltejs/kit"
import cookie from "cookie"

export const GET: RequestHandler = (event) => {
  const cookies = cookie.parse(event.request.headers.get("cookie") || "")

  return {
    body: {
      access_token: cookies.access_token,
      refresh_token: cookies.refresh_token,
    },
  }
}
