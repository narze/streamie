import axios from "axios"

export async function get({ url }) {
  const message = url.searchParams.get("message") ?? "Ping"
  const names = ["narzem1pro", "narzilicon", "nyzen"]

  const result = {}

  await Promise.all(
    names.map((name) => {
      return axios
        .get(
          `http://${name}.narze.github.beta.tailscale.net:4490/action.html?macro=108ECC8F-2E1C-4E30-B3E6-2F6C5CA651A7&value=${encodeURIComponent(
            message
          )}`,
          { timeout: 1000 }
        )
        .then(() => {
          result[name] = true
        })
        .catch((err) => {
          result[name] = err.message
        })
    })
  )

  return {
    body: { notified: true, message, result },
  }
}
