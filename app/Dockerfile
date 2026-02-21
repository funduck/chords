# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install dependencies (this layer will be cached if package.json doesn't change)
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN yarn run build

# Production stage - serve with Caddy
FROM caddy:2-alpine

# Copy built static files from builder stage (docs contains index.html and assets)
COPY --from=builder /app/docs /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

RUN caddy fmt --overwrite /etc/caddy/Caddyfile

EXPOSE 8080
