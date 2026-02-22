# Setup
app-codegen:
	cd app && make codegen

# Test mode
api-test:
	cd api && make test

build-tools:
	cd tools && yarn run build
	cd api && make build-uploader

overwrite-database:
	./scripts/overwrite-database.sh

# Development mode (Docker)
up:
	docker compose -f docker-compose.dev.yml up --build -d

down:
	docker compose -f docker-compose.dev.yml down

logs:
	docker compose -f docker-compose.dev.yml logs -f

logs-api:
	docker compose -f docker-compose.dev.yml logs -f api

logs-app:
	docker compose -f docker-compose.dev.yml logs -f app

# Production mode (Docker)
up-prod:
	docker compose -f docker-compose.yml up --build -d

down-prod:
	docker compose -f docker-compose.yml down

logs-prod:
	docker compose -f docker-compose.yml logs -f

logs-api-prod:
	docker compose -f docker-compose.yml logs -f api

logs-app-prod:
	docker compose -f docker-compose.yml logs -f app

ci:
	cd deploy && ./CI.sh