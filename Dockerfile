# Stage 1: build the UI. Dependency manifests are copied first so the install
# layer is reused whenever only application source changes.
FROM node:24-alpine AS ui
WORKDIR /src/ui

COPY ui/package.json ui/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ui/ ./
RUN yarn build

# Stage 2: build the Go binary with the UI embedded.
FROM golang:1.27-bookworm AS build
WORKDIR /src

COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download

COPY backend/ ./backend/
# The UI build output has to be in the embed path before the Go build runs.
COPY --from=ui /src/backend/internal/adapters/ui/dist ./backend/internal/adapters/ui/dist

# The service has no cgo dependency, so the binary is fully static.
ENV CGO_ENABLED=0
RUN cd backend && go build -o /out/movie-catalog ./cmd/movie-catalog

# Stage 3: runtime.
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=build /out/movie-catalog /bin/
COPY application.yaml /app/application.yaml

EXPOSE 8080
ENTRYPOINT ["movie-catalog"]
