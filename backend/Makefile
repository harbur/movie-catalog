# Well documented Makefile following: https://www.thapaliya.com/en/writings/well-documented-makefiles/
.DEFAULT_GOAL:=help

# Go parameters
APP=golang-gin-starter
CMD=./cmd/$(APP)
ALL=./...

# Build information stamped into the binary and reported by /healthz.
GIT_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT?=$(shell git rev-parse HEAD)
GIT_SUMMARY?=$(shell git describe --tags --dirty --always)
GIT_STATE?=$(shell test -z "$$(git status --porcelain)" && echo clean || echo dirty)
BUILD_DATE?=$(shell date -u +%Y-%m-%dT%H:%M:%SZ)

PKG=github.com/harbur/golang-gin-starter/cmd/$(APP)
LDFLAGS=-X $(PKG).gitBranch=$(GIT_BRANCH) \
        -X $(PKG).gitCommit=$(GIT_COMMIT) \
        -X $(PKG).gitSummary=$(GIT_SUMMARY) \
        -X $(PKG).gitState=$(GIT_STATE) \
        -X $(PKG).buildDate=$(BUILD_DATE)

-include .env

.EXPORT_ALL_VARIABLES:

.PHONY: all test install run deps lint coverage changelog setup help

all: test install ## Runs test and install

install: ## Installs app
	go install -ldflags "$(LDFLAGS)" $(CMD)

test: ## Runs tests
	go test $(ALL)

coverage: ## Runs tests with a coverage report
	./scripts/coverage.sh

lint: ## Runs go vet
	go vet $(ALL)

run: ## Runs app in dev mode (listens at the address in application.yaml)
	go run $(CMD)

deps: ## Checks dependencies
	go mod download
	go mod tidy
	go mod verify

changelog: ## Generates changelog
	conventional-changelog -r0 > CHANGELOG.md
	git add CHANGELOG.md
	git commit -m "chore(changelog) update changelog"

setup: ## Installs dev dependencies
	go mod download

help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
