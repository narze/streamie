TAG = $(shell uuidgen | tr "[:upper:]" "[:lower:]" | cut -c 1-8)

build:
	@docker buildx build --platform linux/arm64 -t ghcr.io/narze/streamie/streamie:$(TAG) --push .

build-socket:
	@docker buildx build --platform linux/arm64 -t ghcr.io/narze/streamie/streamie-socket:$(TAG) --push ./socket-server
