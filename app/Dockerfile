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

# Production stage - serve static files
FROM caddy:2.4.5-alpine

# Copy built static files from builder stage
COPY --from=builder /app/docs /usr/share/caddy

# Copy Caddyfile if you have one, otherwise Caddy will serve files from /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

# Caddy runs automatically, no need for CMD
