# syntax=docker/dockerfile:1

FROM golang:1.23-alpine AS build_base
WORKDIR /app

ENV CGO_ENABLED=1
# Install gcc for cgo support
RUN apk add --no-cache gcc musl-dev

RUN go install github.com/swaggo/swag/cmd/swag@v1.16.4

COPY ./go.mod .
COPY ./go.sum .
RUN go mod download

COPY . .
RUN swag init --parseDependency -g cmd/api/main.go
RUN go build --tags fts5 -o bin/api ./cmd/api/main.go

FROM alpine:3.18
WORKDIR /app

COPY --from=build_base /app/bin/api ./api
COPY --from=build_base /app/docs ./docs

CMD ["/app/api"]