// Package ui is the inbound static-asset adapter. It serves the built React
// single-page application from a filesystem embedded into the binary, so the
// service ships as one artifact with no separate web server.
package ui

import (
	"embed"
	"fmt"
	"io/fs"
	"net/http"
	"path"
	"strings"
)

// dist holds the UI build output, embedded at compile time. The `all:` prefix
// keeps files whose names start with a dot, so the committed .gitkeep alone is
// enough for this package to compile before the UI has ever been built.
//
//go:embed all:dist
var dist embed.FS

// Handler serves the SPA. Paths that exist in the build output are served as
// files; everything else falls back to index.html so that a cold load of a
// client-side route renders the app instead of a 404.
func Handler() (http.Handler, error) {
	assets, err := fs.Sub(dist, "dist")
	if err != nil {
		return nil, fmt.Errorf("ui assets: %w", err)
	}

	index, err := fs.ReadFile(assets, "index.html")
	if err != nil {
		// The binary was built without the UI. A clear message beats an opaque
		// 404 while running the backend on its own during development.
		return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			http.Error(w, "UI not built into this binary: run `make ui`", http.StatusNotFound)
		}), nil
	}

	files := http.FileServer(http.FS(assets))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		name := strings.TrimPrefix(path.Clean(r.URL.Path), "/")

		if name == "" || name == "." {
			serveIndex(w, index)
			return
		}
		if _, err := fs.Stat(assets, name); err != nil {
			serveIndex(w, index)
			return
		}

		files.ServeHTTP(w, r)
	}), nil
}

// serveIndex writes the SPA entry point. It is deliberately not cached: asset
// filenames are content-hashed, but index.html is what points at them.
func serveIndex(w http.ResponseWriter, index []byte) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(index)
}
