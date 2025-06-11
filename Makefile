# Setup
caddy-set-priveleges:
	sudo setcap cap_net_bind_service=+ep /home/oleg/Downloads/caddy_linux_amd64 

mini-app-codegen:
	cd mini-app && bash -c './codegen.sh'

# Development mode
caddy-dev:
	caddy run --config Caddyfile.local

mini-app-dev:
	cd mini-app && yarn run dev

api-dev:
	cd api && make dev