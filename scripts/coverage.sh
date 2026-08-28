#!/bin/sh
set -e

cd "$(dirname "$0")/../backend"

go test -covermode=count -coverprofile=profile.cov ./...
go tool cover -func profile.cov
rm profile.cov
