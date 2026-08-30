package ui

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// The dist/ directory embedded into this package holds only a .gitkeep in the
// repo (the real UI build output is generated separately by `make ui` and is
// git-ignored), so Handler always takes the "UI not built" fallback in this
// test environment. serveIndex, the branch that fires once a real build is
// embedded, is exercised directly instead.

func TestHandlerWithoutBuiltUI(t *testing.T) {
	handler, err := Handler()
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.Contains(t, w.Body.String(), "make ui")
}

func TestServeIndex(t *testing.T) {
	w := httptest.NewRecorder()

	serveIndex(w, []byte("<!doctype html><title>ui</title>"))

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "text/html; charset=utf-8", w.Header().Get("Content-Type"))
	assert.Equal(t, "no-cache", w.Header().Get("Cache-Control"))
	assert.Equal(t, "<!doctype html><title>ui</title>", w.Body.String())
}
