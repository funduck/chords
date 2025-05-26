caddy-set-priveleges:
	sudo setcap cap_net_bind_service=+ep /home/oleg/Downloads/caddy_linux_amd64 

caddy-dev:
	caddy run --config Caddyfile.local

mini-app-dev:
	cd mini-app && yarn run dev

api-dev:
	cd api && make dev