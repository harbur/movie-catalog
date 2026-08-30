# movie-catalog

A movie catalogue served as a single artifact: a Go backend that exposes the REST
API and embeds the built React UI, so one binary and one container ship both.

```
backend/   Go service — hexagonal architecture, Huma REST API
ui/        React app — shadcn/ui, TanStack Query, Tailwind
```

## Running it

Development runs the two halves separately, so the UI keeps hot reload:

```sh
make backend   # API on :8080
make dev       # Vite on :5173, proxying /api to :8080
```

Production is a single process. `make install` builds the UI into the backend's
embed path and links it into the binary:

```sh
make install
movie-catalog   # UI, API, docs and metrics on :8080
```

| Path       | Served by                                     |
| ---------- | --------------------------------------------- |
| `/api/...` | REST API                                      |
| `/docs`    | Schema documentation (`/openapi.json`, `.yaml`) |
| `/healthz` | Liveness probe with build information         |
| `/metrics` | Prometheus metrics                            |
| everything else | The SPA, with fallback to `index.html`   |

## Make targets

```sh
make help
```

## Configuration

All configuration lives in `application.yaml`, delivered in the cluster as a
ConfigMap under a single application key and located via `CONFIG_FILE`. It is
validated at startup, so an invalid value fails the process rather than a
request. Secrets never appear here — they come from Google Secret Manager.

## Delivery

Every commit builds and pushes an image to GitHub Packages, tagged with the
commit SHA. Deployment is a manifest change in the `kubernetic-apps` repository,
reconciled by Flux; rollback is a git revert there.
