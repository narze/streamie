import dotenvFlow from "dotenv-flow"
dotenvFlow.config()

import twitch from "./twitch"
import discord from "./discord"
import connect from "./connect"

discord()
twitch()
connect()
