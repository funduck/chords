gen-openapi:
	swag init --parseDependency -g cmd/api/main.go

dev:
	make gen-openapi
	air

test:
	go test -v ./...

build:
	go build -o bin/api ./cmd/api/main.go
	go build -o bin/uploader ./cmd/uploader/main.go