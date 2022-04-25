TAG = $(shell uuidgen | tr "[:upper:]" "[:lower:]" | cut -c 1-8)

build:
	@docker buildx build --platform linux/arm64 -t ghcr.io/narze/streamie/streamie:$(TAG) --build-arg VITE_DISCORD_OAUTH_REDIRECT_URI=${VITE_DISCORD_OAUTH_REDIRECT_URI} --build-arg VITE_HOST=${VITE_HOST} --build-arg VITE_DISCORD_CLIENT_ID=${VITE_DISCORD_CLIENT_ID} --build-arg VITE_DISCORD_CLIENT_SECRET=${VITE_DISCORD_CLIENT_SECRET} --build-arg VITE_STREAMIE_SOCKET_IO_SERVER_URL=${VITE_STREAMIE_SOCKET_IO_SERVER_URL} --push .

build-socket:
	@docker buildx build --platform linux/arm64 -t ghcr.io/narze/streamie/streamie-socket:$(TAG) --push ./socket-server
