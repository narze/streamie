#!/usr/bin/env node

// Loads .env.* file into devspace `vars` instead of using single .env file natively
// See values with `devspace list vars`

const dotenvFlow = require("dotenv-flow")

const envName = process.argv[2]
const devspaceProfile = process.argv[3]

const node_env = devspaceProfile === "production" ? "production" : "development"

console.log(dotenvFlow.config({ node_env }).parsed[envName])
