import dotenvFlow from "dotenv-flow"
dotenvFlow.config()

import socket from "./socket"
import twitch from "./twitch"
import discord from "./discord"

discord()
const socketServer = socket()
twitch(socketServer)
