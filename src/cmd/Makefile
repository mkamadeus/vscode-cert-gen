build:
	env GOOS=linux GOARCH=amd64 go build -o ./build/certgen main.go
	env GOOS=windows GOARCH=amd64 go build -o ./build/certgen.exe main.go
.PHONY: build

build-prod:
	env GOOS=linux GOARCH=amd64 go build -o ../certgen main.go
	env GOOS=windows GOARCH=amd64 go build -o ../certgen.exe main.go
.PHONY: build-prod