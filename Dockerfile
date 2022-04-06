FROM node:16-slim

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

ENV NODE_ENV production

# Add package.json to WORKDIR and install dependencies
COPY package.json yarn.lock ./
RUN yarn

# Add source code files to WORKDIR
COPY . .

# Install dependencies from sub-packages
RUN yarn

# Application port (optional)
EXPOSE 3000

# Debugging port (optional)
# For remote debugging, add this port to devspace.yaml: dev.ports[*].forward[*].port: 9229
EXPOSE 9229

# Socket.io
EXPOSE 8080

RUN npx -w bot prisma generate

# Build web
RUN yarn web build

# Container start command (DO NOT CHANGE and see note below)
CMD ["yarn", "start"]

# To start using a different `npm run [name]` command (e.g. to use nodemon + debugger),
# edit devspace.yaml:
# 1) remove: images.app.injectRestartHelper (or set to false)
# 2) add this: images.app.cmd: ["npm", "run", "dev"]
