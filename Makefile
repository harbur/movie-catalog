# Well documented Makefile following: https://www.thapaliya.com/en/writings/well-documented-makefiles/
.DEFAULT_GOAL:=help

APP=movie-catalog
CMD=./cmd/$(APP)
ALL=./...

# The UI build output is embedded into the binary at compile time.
UI_DIST=backend/internal/adapters/ui/dist

# Build information stamped into the binary and reported by /healthz.
GIT_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT?=$(shell git rev-parse HEAD)
GIT_SUMMARY?=$(shell git describe --tags --dirty --always)
GIT_STATE?=$(shell test -z "$$(git status --porcelain)" && echo clean || echo dirty)
BUILD_DATE?=$(shell date -u +%Y-%m-%dT%H:%M:%SZ)

PKG=github.com/harbur/movie-catalog/backend/cmd/$(APP)
LDFLAGS=-X $(PKG).gitBranch=$(GIT_BRANCH) \
        -X $(PKG).gitCommit=$(GIT_COMMIT) \
        -X $(PKG).gitSummary=$(GIT_SUMMARY) \
        -X $(PKG).gitState=$(GIT_STATE) \
        -X $(PKG).buildDate=$(BUILD_DATE)

-include .env

.EXPORT_ALL_VARIABLES:

.PHONY: all install ui backend dev test lint coverage deps setup help

all: test install ## Runs test and install

install: ui ## Builds the UI and installs the binary with the UI embedded
	cd backend && go install -ldflags "$(LDFLAGS)" $(CMD)

ui: ## Builds the UI into the backend embed path
	cd ui && yarn install --frozen-lockfile && yarn build
	@touch $(UI_DIST)/.gitkeep

backend: ## Runs the backend only (listens at the address in application.yaml)
	cd backend && CONFIG_FILE=../application.yaml go run $(CMD)

dev: ## Runs the Vite dev server, proxying /api to a backend started with `make backend`
	cd ui && yarn dev

test: ## Runs tests
	cd backend && go test $(ALL)

lint: ## Runs go vet and eslint
	cd backend && go vet $(ALL)
	cd ui && yarn lint

coverage: ## Runs tests with a coverage report
	./scripts/coverage.sh

deps: ## Checks dependencies
	cd backend && go mod download && go mod tidy && go mod verify
	cd ui && yarn install

setup: ## Installs dev dependencies
	cd backend && go mod download
	cd ui && yarn install

help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
