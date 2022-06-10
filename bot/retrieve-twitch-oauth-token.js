const dotenvFlow = require("dotenv-flow")
const axios = require("axios")

dotenvFlow.config()

axios
  .post(
    "https://id.twitch.tv/oauth2/token",
    {
      client_id: process.env.TWITCH_HELIX_CLIENT_ID,
      client_secret: process.env.TWITCH_HELIX_CLIENT_SECRET,
      grant_type: "client_credentials",
    },
    { headers: { "Content-Type": "application/json" } }
  )
  .then(function (response) {
    console.log(response.data)
    console.log("Update your TWITCH_HELIX_OAUTH_TOKEN env")
  })
  .catch(function (err) {
    console.error(err)
  })
