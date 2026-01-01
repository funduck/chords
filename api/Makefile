clean:
	rm -rf docs
	go clean -cache -testcache
	go mod download

gen-openapi:
	swag init --parseDependency -g cmd/api/main.go
	echo "swag init ok"
	swag fmt -g cmd/api/main.go
	echo "swag fmt ok"

dev:
	make gen-openapi
	air

test:
	go test --tags fts5 ./...

build-api:
	go build --tags fts5 -o bin/api ./cmd/api/main.go

build-uploader:
	go build --tags fts5 -o bin/uploader ./cmd/uploader/main.go
