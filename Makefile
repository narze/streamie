TAG = $(shell uuidgen | tr "[:upper:]" "[:lower:]" | cut -c 1-8)

deploy:
	@docker buildx build --platform linux/arm64 -t ghcr.io/narze/streamie/streamie:$(TAG) --push .