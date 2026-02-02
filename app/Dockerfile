# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install dependencies (this layer will be cached if package.json doesn't change)
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Override with production environment variables
COPY ./prod.env .env

# Build the application
RUN yarn run build

# Production stage - put static files to right place for Caddy
FROM alpine:latest

# Copy built static files from builder stage
COPY --from=builder /app/docs /app/docs
COPY --from=builder /app/index.html /app/index.html

CMD ["cp", "-r", "/app", "/public/mychords/app"]
