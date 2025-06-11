# Server

Server api and telegram mini app template

## Installation

Prepare configs, by default it should work for local development

```
cp .env.example .env
cp api/api.env.example api/api.env
cp mini-app/.env.example mini-app/.env
```

### Deploy

Build and run services

```
docker compose up --build
```

### Setup TWA

Set `<domain>` as URL for TWA in telegram bot  
And telegram wants https

## Local development
Run services in development mode

```
caddy-dev
mini-app-dev
api-dev
```

## Openapi

`GET /api/swagger/index.html`

MiniApp has codegen built on this spec
