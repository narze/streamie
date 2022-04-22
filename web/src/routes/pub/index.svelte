<script context="module" lang="ts">
  import { browser } from "$app/env"
  import type { Load } from "@sveltejs/kit"

  const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
  const DISCORD_OAUTH_REDIRECT_URI = import.meta.env.VITE_DISCORD_OAUTH_REDIRECT_URI
  const DISCORD_API_URL = "https://discord.com/api"

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${DISCORD_OAUTH_REDIRECT_URI}&response_type=code&scope=identify%20connections`

  export const load: Load = async ({ session, fetch }) => {
    // Receives refreshed tokens from session & store it to httpOnly cookie
    if (session["tokens"] && browser) {
      await fetch("/pub/store_session", {
        method: "POST",
        body: JSON.stringify(session["tokens"]),
      })
    }

    return {
      props: { user: session["user"] || false },
    }
  }
</script>

<script lang="ts">
  import { session } from "$app/stores"
  export let user

  $: if (user && browser) {
    fetchConnections()
  }

  async function fetchConnections() {
    const request = await fetch(`/pub/discord/fetch_discord_connections`, {})

    const data = await request.json()

    const twitchConnection = data.find((connection) => connection.type === "twitch")

    if (twitchConnection) {
      // Get user from twitch id
      await fetch(`/pub/discord/connect_twitch`, {
        method: "POST",
        body: JSON.stringify({
          discord_id: user.id,
          twitch_id: twitchConnection.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          console.log(res)
          alert("ผูก Discord กับ Twitch ID สำเร็จ")
        })
        .catch((err) => {
          alert(err.message)
        })
    } else {
      alert("โปรด Connect Twitch ในแอป Discord ก่อน")
    }

    return data
  }
</script>

<main class="prose lg:prose-xl p-4">
  <h1>Streamie - Public</h1>

  {#if user}
    <h1>Hello {user.username}!</h1>

    <h3>Session Data</h3>

    <pre>{JSON.stringify($session["user"], null, 2)}</pre>

    <p><a href="/pub/logout">Log Out</a></p>
  {:else}
    <a href={authUrl}>Login with Discord</a>
  {/if}
</main>
