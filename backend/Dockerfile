# Build Image
FROM golang:1.27-bookworm AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
# The API has no cgo dependency, so the binary is fully static.
ENV CGO_ENABLED=0
RUN make install GOBIN=/out

# Runtime Image
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=build /out/golang-gin-starter /bin/
COPY application.yaml /app/application.yaml

EXPOSE 8080
ENTRYPOINT ["golang-gin-starter"]
