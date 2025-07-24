# Setup
caddy-set-priveleges:
	sudo setcap cap_net_bind_service=+ep /home/oleg/Downloads/caddy_linux_amd64 

mini-app-codegen:
	cd mini-app && bash -c './codegen.sh'

# Development mode
caddy-dev:
	caddy run --config Caddyfile.local

mini-app-dev:
	cd mini-app && make dev

api-dev:
	cd api && make dev

# Test mode
api-test:
	cd api && make test

build-tools:
	cd tools && yarn run build
	cd api && make build-uploader

overwrite-database:
	./overwrite-database.sh

dev:
	concurrently \
		"make caddy-dev" \
		"make mini-app-dev" \
		"make api-dev"

caddy-start:
	bash -c './start-caddy.sh'

mini-app-build:
	cd mini-app && make build

mini-app-start:
	cd mini-app && make start

api-build:
	cd api && make build-api

api-start:
	cd api && make start

build:
	make mini-app-build
	make api-build

start:
	concurrently \
		"make caddy-start" \
		"make api-start"