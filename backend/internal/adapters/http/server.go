// Package http is the inbound HTTP adapter. It exposes the app use cases as a
// Huma REST API and is the only package aware of status codes and wire formats.
package http

import (
	nethttp "net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/harbur/golang-gin-starter/internal/app"
)

// Options are the non-port inputs the HTTP adapter needs.
type Options struct {
	Title    string
	Version  string
	Gatherer prometheus.Gatherer
}

// NewHandler builds the HTTP handler serving the API, its schema documentation
// under /docs, the raw OpenAPI spec alongside it, and Prometheus metrics.
func NewHandler(opts Options, movies *app.MovieService, health *app.HealthService) nethttp.Handler {
	mux := nethttp.NewServeMux()

	config := huma.DefaultConfig(opts.Title, opts.Version)
	config.Info.Description = "Golang Starter."
	config.Info.Contact = &huma.Contact{
		Name:  "API Support",
		Email: "contact@harbur.io",
	}
	config.Info.License = &huma.License{
		Name: "MIT",
		URL:  "https://github.com/harbur/golang-gin-starter/blob/main/LICENSE",
	}

	api := humago.New(mux, config)

	registerHealth(api, health)
	registerMovies(api, movies)

	// The schema documentation is the entry point of the service.
	mux.HandleFunc("GET /{$}", func(w nethttp.ResponseWriter, r *nethttp.Request) {
		nethttp.Redirect(w, r, config.DocsPath, nethttp.StatusTemporaryRedirect)
	})

	if opts.Gatherer != nil {
		mux.Handle("GET /metrics", promhttp.HandlerFor(opts.Gatherer, promhttp.HandlerOpts{}))
	}

	return mux
}
