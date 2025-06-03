gen-openapi:
	swag init --parseDependency -g cmd/api/main.go

dev:
	make gen-openapi
	air

test:
	go test -v ./...