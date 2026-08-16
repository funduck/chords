# Setup
api-openapi:
	docker compose -f docker-compose.dev.yml run --rm --no-deps --build api-dev \
		sh -c "swag init --parseDependency -g cmd/api/main.go && swag fmt -g cmd/api/main.go"

app-codegen:
	cd app && make codegen

# One command: generate OpenAPI spec, generate TS client from it, then start the stack
dev:
	$(MAKE) api-openapi
	$(MAKE) app-codegen
	$(MAKE) up

# Test mode
api-test:
	cd api && make test

build-tools:
	cd api && make build-uploader

overwrite-dev-database:
	cd ./scripts && ./overwrite-dev-database.sh

# Development mode (Docker)
up:
	docker compose -f docker-compose.dev.yml up --build -d

down:
	docker compose -f docker-compose.dev.yml down

logs:
	docker compose -f docker-compose.dev.yml logs -f

logs-api:
	docker compose -f docker-compose.dev.yml logs -f api-dev

logs-app:
	docker compose -f docker-compose.dev.yml logs -f app-dev

# Production mode (Docker)
up-prod:
	docker compose -f docker-compose.yml up --build -d

down-prod:
	docker compose -f docker-compose.yml down

logs-prod:
	docker compose -f docker-compose.yml logs -f

logs-api-prod:
	docker compose -f docker-compose.yml logs -f mychords-api

logs-app-prod:
	docker compose -f docker-compose.yml logs -f mychords-app

ci:
	cd deploy && ./CI.sh
