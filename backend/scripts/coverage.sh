#!/bin/sh
set -e

go test -covermode=count -coverprofile=profile.cov ./...
go tool cover -func profile.cov
rm profile.cov
