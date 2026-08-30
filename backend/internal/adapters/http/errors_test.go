package http_test

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"

	adapterhttp "github.com/harbur/movie-catalog/backend/internal/adapters/http"
	"github.com/harbur/movie-catalog/backend/internal/app"
	"github.com/harbur/movie-catalog/backend/internal/domain"
)

// failingMovieRepo is a fake MovieRepository that always fails with err. It lets
// mapError's branches be reached deterministically through the real HTTP
// handler, since the in-memory repository never errors.
type failingMovieRepo struct {
	err error
}

func (r failingMovieRepo) List(context.Context) ([]domain.Movie, error) { return nil, r.err }
func (r failingMovieRepo) Create(context.Context, domain.Movie) (domain.Movie, error) {
	return domain.Movie{}, r.err
}
func (r failingMovieRepo) Get(context.Context, uint) (domain.Movie, error) {
	return domain.Movie{}, r.err
}
func (r failingMovieRepo) Update(context.Context, domain.Movie) (domain.Movie, error) {
	return domain.Movie{}, r.err
}
func (r failingMovieRepo) Delete(context.Context, uint) error { return r.err }

type noopActions struct{}

func (noopActions) IncrementAction(string) {}

// TestMapErrorBranches drives every branch of mapError (including the
// "unhandled error" default) through GET /api/movies/{id}, the simplest route
// whose success path never itself returns an error.
func TestMapErrorBranches(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		wantCode int
	}{
		{
			name:     "movie not found",
			err:      fmt.Errorf("get movie 1: %w", domain.ErrMovieNotFound),
			wantCode: 404,
		},
		{
			name:     "invalid id",
			err:      fmt.Errorf("get movie 1: %w", domain.ErrInvalidID),
			wantCode: 409,
		},
		{
			name:     "name required",
			err:      fmt.Errorf("get movie 1: %w", domain.ErrNameRequired),
			wantCode: 422,
		},
		{
			name:     "unknown error falls back to 500",
			err:      errors.New("boom"),
			wantCode: 500,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := app.NewMovieService(failingMovieRepo{err: tt.err}, noopActions{})
			handler := adapterhttp.NewHandler(
				adapterhttp.Options{Title: "t", Version: "1.0.0"},
				svc,
				app.NewHealthService(domain.BuildInfo{}),
			)

			w := do(t, handler, "GET", "/api/movies/1", "")
			require.Equal(t, tt.wantCode, w.Code)
		})
	}
}
