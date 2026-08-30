package http_test

import (
	"testing"

	"github.com/stretchr/testify/require"
)

// toMovieBodies is unexported, so it is exercised through list-movies. The
// existing tests only ever populate the catalogue with zero or one movie;
// this covers the loop actually iterating over more than one.
func TestListMoviesWithSeveralMovies(t *testing.T) {
	handler := newTestHandler(t)

	require.Equal(t, 201, do(t, handler, "POST", "/api/movies", `{"name":"godfather"}`).Code)
	require.Equal(t, 201, do(t, handler, "POST", "/api/movies", `{"name":"godfather 2"}`).Code)

	w := do(t, handler, "GET", "/api/movies", "")
	require.JSONEq(t, `[{"id":1,"name":"godfather"},{"id":2,"name":"godfather 2"}]`, w.Body.String())
}
