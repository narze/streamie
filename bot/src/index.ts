import dotenvFlow from "dotenv-flow"
dotenvFlow.config()

import twitch from "./twitch"
import discord from "./discord"
import connect from "./connect"
import streamlabs from "./streamlabs"

discord()
twitch()
streamlabs()
connect()
