// Package http is the inbound HTTP adapter. It exposes the app use cases as a
// Huma REST API and is the only package aware of status codes and wire formats.
package http

import (
	nethttp "net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/harbur/movie-catalog/backend/internal/app"
)

// Options are the non-port inputs the HTTP adapter needs.
type Options struct {
	Title    string
	Version  string
	Gatherer prometheus.Gatherer

	// UI serves the single-page application. Every path not claimed by the
	// API, the schema documentation or the metrics endpoint is handed to it.
	UI nethttp.Handler
}

// NewHandler builds the HTTP handler serving the API, its schema documentation
// under /docs, the raw OpenAPI spec alongside it, Prometheus metrics, and the
// embedded single-page application on everything else.
func NewHandler(opts Options, movies *app.MovieService, health *app.HealthService) nethttp.Handler {
	mux := nethttp.NewServeMux()

	config := huma.DefaultConfig(opts.Title, opts.Version)
	config.Info.Description = "Movie catalogue."
	config.Info.Contact = &huma.Contact{
		Name:  "API Support",
		Email: "contact@harbur.io",
	}
	config.Info.License = &huma.License{
		Name: "MIT",
		URL:  "https://github.com/harbur/movie-catalog/blob/main/LICENSE",
	}

	api := humago.New(mux, config)

	registerHealth(api, health)
	registerMovies(api, movies)

	if opts.Gatherer != nil {
		mux.Handle("GET /metrics", promhttp.HandlerFor(opts.Gatherer, promhttp.HandlerOpts{}))
	}

	// Registered last and least specific: the API and /docs patterns above are
	// more specific, so ServeMux prefers them and the UI gets the remainder.
	if opts.UI != nil {
		mux.Handle("GET /", opts.UI)
	}

	return mux
}
