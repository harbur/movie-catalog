# Architecture

The repository holds one deployable: a Go binary that serves the REST API and
embeds the built React UI. There is no separate frontend container, no nginx
sidecar and no CDN step.

```sh
.
├── backend/                    # Go service
│   ├── cmd/movie-catalog/      # Wiring only: load config, build adapters, serve
│   └── internal/
│       ├── domain/             # Entities and their invariants. Depends on nothing.
│       ├── app/                # Use cases and the ports they need
│       ├── config/             # Config loading and validation
│       └── adapters/
│           ├── http/           # Inbound: Huma REST API, wire models, error mapping
│           ├── ui/             # Inbound: the embedded SPA and its fallback
│           ├── memory/         # Outbound: in-memory movie repository
│           └── metrics/        # Outbound: Prometheus
├── ui/                         # React app
│   └── src/
│       ├── models/             # Data models
│       ├── services/           # Calls to the API
│       ├── stores/             # Declarative state over the services
│       ├── components/         # Reusable components, isolated from stores
│       ├── ui/layouts/         # Reusable layouts
│       └── pages/              # Pages of the application
├── charts/movie-catalog/       # Helm chart
├── application.yaml            # The whole configuration, validated at startup
├── Dockerfile                  # UI stage → Go stage → runtime stage
└── Makefile
```

**NOTE**: In both halves, source is ordered by dependency: a directory may only
use the ones above it.

## How the two halves meet

The UI build output is written straight into `backend/internal/adapters/ui/dist`,
which that package embeds at compile time. Two consequences worth remembering:

- **The UI must be built before the Go build.** The Dockerfile enforces this with
  stage ordering; locally `make install` does the same.
- **The backend owns the routes it claims.** `/api`, `/docs`, `/healthz` and
  `/metrics` are registered as specific patterns; the UI is mounted at `/` as the
  catch-all, and unknown paths fall back to `index.html` so client-side routes
  survive a cold load.

The package compiles without a UI build: `dist/.gitkeep` is committed so the
embed always has something to match, and the handler answers with an explicit
"UI not built" message instead of an opaque 404.

In development the halves are split again — Vite serves the UI on :5173 and
proxies `/api` to the backend on :8080 — so the API contract is the only thing
the two share, in either mode.
