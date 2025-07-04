clean:
	rm -rf docs
	go clean -cache -testcache
	go mod download

gen-openapi:
	swag init --parseDependency -g cmd/api/main.go
	swag fmt -g cmd/api/main.go

dev:
	make gen-openapi
	air

test:
	go test -v ./...

build-api:
	go build --tags fts5 -a -o bin/api ./cmd/api/main.go

build-uploader:
	go build --tags fts5 -a -o bin/uploader ./cmd/uploader/main.go