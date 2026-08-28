package http_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	adapterhttp "github.com/harbur/movie-catalog/backend/internal/adapters/http"
	"github.com/harbur/movie-catalog/backend/internal/adapters/memory"
	"github.com/harbur/movie-catalog/backend/internal/adapters/metrics"
	"github.com/harbur/movie-catalog/backend/internal/app"
	"github.com/harbur/movie-catalog/backend/internal/domain"
)

func newTestHandler(t *testing.T) http.Handler {
	t.Helper()

	registry := prometheus.NewRegistry()
	actions, err := metrics.NewPrometheus(registry)
	require.NoError(t, err)

	ui := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte("<!doctype html><title>ui</title>"))
	})

	return adapterhttp.NewHandler(
		adapterhttp.Options{Title: "Movie Catalog", Version: "1.0.0", Gatherer: registry, UI: ui},
		app.NewMovieService(memory.NewMovieRepository(), actions),
		app.NewHealthService(domain.BuildInfo{}),
	)
}

func do(t *testing.T, handler http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()

	req := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}

	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	return w
}

// assertBody compares a response body against want, ignoring the "$schema"
// link Huma adds to every response by default.
func assertBody(t *testing.T, want string, w *httptest.ResponseRecorder) {
	t.Helper()

	var got map[string]any
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &got))
	delete(got, "$schema")

	actual, err := json.Marshal(got)
	require.NoError(t, err)
	assert.JSONEq(t, want, string(actual))
}

func TestHealthz(t *testing.T) {
	handler := newTestHandler(t)

	for _, path := range []string{"/healthz", "/api/healthz"} {
		t.Run(path, func(t *testing.T) {
			w := do(t, handler, "GET", path, "")

			assert.Equal(t, http.StatusOK, w.Code)
			assertBody(t,
				`{"buildInfo":{"buildDate":"","gitBranch":"","gitCommit":"","gitState":"","gitSummary":""}}`,
				w)
		})
	}
}

func TestUIIsServedOnUnclaimedPaths(t *testing.T) {
	handler := newTestHandler(t)

	// "/movies" is a client-side route: it must reach the SPA, not the API,
	// whose movie collection lives under "/api/movies".
	for _, path := range []string{"/", "/movies", "/movies/42"} {
		t.Run(path, func(t *testing.T) {
			w := do(t, handler, "GET", path, "")

			assert.Equal(t, http.StatusOK, w.Code)
			assert.Contains(t, w.Header().Get("Content-Type"), "text/html")
		})
	}
}

func TestDocsAndSpecAreServed(t *testing.T) {
	handler := newTestHandler(t)

	for _, path := range []string{"/docs", "/openapi.json", "/openapi.yaml"} {
		t.Run(path, func(t *testing.T) {
			assert.Equal(t, http.StatusOK, do(t, handler, "GET", path, "").Code)
		})
	}
}

func TestMetricsAreServed(t *testing.T) {
	w := do(t, newTestHandler(t), "GET", "/metrics", "")

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestListMoviesEmpty(t *testing.T) {
	w := do(t, newTestHandler(t), "GET", "/api/movies", "")

	assert.Equal(t, http.StatusOK, w.Code)
	assert.JSONEq(t, `[]`, w.Body.String())
}

func TestCreateMovie(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		wantCode int
	}{
		{
			name:     "valid movie",
			body:     `{"name":"godfather"}`,
			wantCode: http.StatusCreated,
		},
		{
			name:     "name is required",
			body:     `{}`,
			wantCode: http.StatusUnprocessableEntity,
		},
		{
			name:     "empty name is rejected by the schema",
			body:     `{"name":""}`,
			wantCode: http.StatusUnprocessableEntity,
		},
		{
			name:     "malformed json",
			body:     `{`,
			wantCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := do(t, newTestHandler(t), "POST", "/api/movies", tt.body)

			assert.Equal(t, tt.wantCode, w.Code)
			if tt.wantCode == http.StatusCreated {
				assertBody(t, `{"id":1,"name":"godfather"}`, w)
			}
		})
	}
}

func TestGetMovie(t *testing.T) {
	handler := newTestHandler(t)
	require.Equal(t, http.StatusCreated, do(t, handler, "POST", "/api/movies", `{"name":"godfather"}`).Code)

	t.Run("existing movie", func(t *testing.T) {
		w := do(t, handler, "GET", "/api/movies/1", "")

		assert.Equal(t, http.StatusOK, w.Code)
		assertBody(t, `{"id":1,"name":"godfather"}`, w)
	})

	t.Run("missing movie", func(t *testing.T) {
		assert.Equal(t, http.StatusNotFound, do(t, handler, "GET", "/api/movies/99999", "").Code)
	})

	t.Run("non numeric id", func(t *testing.T) {
		assert.Equal(t, http.StatusUnprocessableEntity, do(t, handler, "GET", "/api/movies/abc", "").Code)
	})
}

func TestUpdateMovie(t *testing.T) {
	handler := newTestHandler(t)
	require.Equal(t, http.StatusCreated, do(t, handler, "POST", "/api/movies", `{"name":"godfather"}`).Code)

	t.Run("existing movie", func(t *testing.T) {
		w := do(t, handler, "PUT", "/api/movies/1", `{"name":"godfather 2"}`)

		assert.Equal(t, http.StatusOK, w.Code)
		assertBody(t, `{"id":1,"name":"godfather 2"}`, w)
	})

	t.Run("missing movie", func(t *testing.T) {
		w := do(t, handler, "PUT", "/api/movies/99999", `{"name":"godfather 2"}`)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("name is required", func(t *testing.T) {
		assert.Equal(t, http.StatusUnprocessableEntity, do(t, handler, "PUT", "/api/movies/1", `{}`).Code)
	})
}

func TestDeleteMovie(t *testing.T) {
	handler := newTestHandler(t)
	require.Equal(t, http.StatusCreated, do(t, handler, "POST", "/api/movies", `{"name":"godfather"}`).Code)

	w := do(t, handler, "DELETE", "/api/movies/1", "")

	assert.Equal(t, http.StatusNoContent, w.Code)
	assert.Empty(t, w.Body.String())
	assert.Equal(t, http.StatusNotFound, do(t, handler, "GET", "/api/movies/1", "").Code)
}
