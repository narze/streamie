FROM node:16-slim as builder

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

RUN mkdir -p /deploy/bot
RUN mkdir -p /deploy/web

RUN npm i -g @microsoft/rush

COPY ./common ./common
COPY ./rush.json .

COPY ./bot/package.json ./bot/package.json
COPY ./socket-server/package.json ./socket-server/package.json
COPY ./web/package.json ./web/package.json

RUN rush install --purge

COPY . .

RUN rush build
RUN rush deploy --scenario bot -t /deploy/bot
RUN rush deploy --scenario web -t /deploy/web

# Generate Prisma Client manually (rush deploy does not copy them)
RUN cd /deploy/bot/bot && npx prisma generate

FROM node:16-slim as app

WORKDIR /app

ENV NODE_ENV production

RUN apt-get update
RUN apt-get install -y openssl

COPY --from=builder /deploy/bot bot
COPY --from=builder /deploy/web web

# Application port (optional)
EXPOSE 3000

# Debugging port (optional)
# For remote debugging, add this port to devspace.yaml: dev.ports[*].forward[*].port: 9229
EXPOSE 9229

# Socket.io
EXPOSE 8080

# docker run --rm -it --workdir /app/bot/bot --entrypoint node streamie-rush dist
WORKDIR /app/bot/bot

# Container start command (DO NOT CHANGE and see note below)
CMD ["node", "."]

# To start using a different `npm run [name]` command (e.g. to use nodemon + debugger),
# edit devspace.yaml:
# 1) remove: images.app.injectRestartHelper (or set to false)
# 2) add this: images.app.cmd: ["npm", "run", "dev"]
