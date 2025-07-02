gen-openapi:
	swag init --parseDependency -g cmd/api/main.go

dev:
	make gen-openapi
	air

test:
	go test -v ./...

build-api:
	go build --tags fts5 -o bin/api ./cmd/api/main.go

build-uploader:
	go build --tags fts5 -o bin/uploader ./cmd/uploader/main.go