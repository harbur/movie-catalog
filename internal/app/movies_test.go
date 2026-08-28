package app_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/harbur/golang-gin-starter/internal/adapters/memory"
	"github.com/harbur/golang-gin-starter/internal/app"
	"github.com/harbur/golang-gin-starter/internal/domain"
)

// countingActions is a fake for the ActionCounter port.
type countingActions struct {
	counted []string
}

func (c *countingActions) IncrementAction(action string) {
	c.counted = append(c.counted, action)
}

// failingRepo is a fake for the MovieRepository port that always fails.
type failingRepo struct {
	err error
}

func (r failingRepo) List(context.Context) ([]domain.Movie, error) { return nil, r.err }
func (r failingRepo) Create(context.Context, domain.Movie) (domain.Movie, error) {
	return domain.Movie{}, r.err
}
func (r failingRepo) Get(context.Context, uint) (domain.Movie, error) { return domain.Movie{}, r.err }
func (r failingRepo) Update(context.Context, domain.Movie) (domain.Movie, error) {
	return domain.Movie{}, r.err
}
func (r failingRepo) Delete(context.Context, uint) error { return r.err }

func newService() (*app.MovieService, *countingActions) {
	actions := &countingActions{}
	return app.NewMovieService(memory.NewMovieRepository(), actions), actions
}

func TestCreateMovie(t *testing.T) {
	tests := []struct {
		name    string
		movie   domain.Movie
		wantErr error
	}{
		{
			name:  "valid movie is created",
			movie: domain.Movie{Name: "godfather"},
		},
		{
			name:    "caller supplied id is rejected",
			movie:   domain.Movie{ID: 1, Name: "godfather"},
			wantErr: domain.ErrInvalidID,
		},
		{
			name:    "name is required",
			movie:   domain.Movie{},
			wantErr: domain.ErrNameRequired,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			service, actions := newService()

			created, err := service.CreateMovie(context.Background(), tt.movie)

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				assert.Empty(t, actions.counted)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, uint(1), created.ID)
			assert.Equal(t, tt.movie.Name, created.Name)
			assert.Equal(t, []string{"post movie"}, actions.counted)
		})
	}
}

func TestGetMovie(t *testing.T) {
	service, _ := newService()
	created, err := service.CreateMovie(context.Background(), domain.Movie{Name: "godfather"})
	require.NoError(t, err)

	t.Run("existing movie is returned", func(t *testing.T) {
		got, err := service.GetMovie(context.Background(), created.ID)
		require.NoError(t, err)
		assert.Equal(t, created, got)
	})

	t.Run("missing movie is not found", func(t *testing.T) {
		_, err := service.GetMovie(context.Background(), 99999)
		assert.ErrorIs(t, err, domain.ErrMovieNotFound)
	})
}

func TestUpdateMovie(t *testing.T) {
	tests := []struct {
		name    string
		id      uint
		movie   domain.Movie
		wantErr error
	}{
		{
			name:  "movie is replaced",
			id:    1,
			movie: domain.Movie{Name: "godfather 2"},
		},
		{
			name:  "matching id in the body is accepted",
			id:    1,
			movie: domain.Movie{ID: 1, Name: "godfather 2"},
		},
		{
			name:    "mismatched id in the body is rejected",
			id:      1,
			movie:   domain.Movie{ID: 2, Name: "godfather 2"},
			wantErr: domain.ErrInvalidID,
		},
		{
			name:    "name is required",
			id:      1,
			movie:   domain.Movie{},
			wantErr: domain.ErrNameRequired,
		},
		{
			name:    "missing movie is not found",
			id:      99999,
			movie:   domain.Movie{Name: "godfather 2"},
			wantErr: domain.ErrMovieNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			service, _ := newService()
			_, err := service.CreateMovie(context.Background(), domain.Movie{Name: "godfather"})
			require.NoError(t, err)

			updated, err := service.UpdateMovie(context.Background(), tt.id, tt.movie)

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tt.id, updated.ID)
			assert.Equal(t, tt.movie.Name, updated.Name)
		})
	}
}

func TestListMovies(t *testing.T) {
	service, actions := newService()

	movies, err := service.ListMovies(context.Background())
	require.NoError(t, err)
	assert.Empty(t, movies)

	created, err := service.CreateMovie(context.Background(), domain.Movie{Name: "godfather"})
	require.NoError(t, err)

	movies, err = service.ListMovies(context.Background())
	require.NoError(t, err)
	assert.Equal(t, []domain.Movie{created}, movies)
	assert.Equal(t, []string{"list movies", "post movie", "list movies"}, actions.counted)
}

func TestDeleteMovie(t *testing.T) {
	service, _ := newService()
	created, err := service.CreateMovie(context.Background(), domain.Movie{Name: "godfather"})
	require.NoError(t, err)

	require.NoError(t, service.DeleteMovie(context.Background(), created.ID))

	_, err = service.GetMovie(context.Background(), created.ID)
	assert.ErrorIs(t, err, domain.ErrMovieNotFound)

	// deleting an absent movie is not an error
	assert.NoError(t, service.DeleteMovie(context.Background(), created.ID))
}

func TestRepositoryFailuresAreWrapped(t *testing.T) {
	boom := errors.New("boom")
	service := app.NewMovieService(failingRepo{err: boom}, &countingActions{})
	ctx := context.Background()

	_, err := service.ListMovies(ctx)
	assert.ErrorIs(t, err, boom)

	_, err = service.CreateMovie(ctx, domain.Movie{Name: "godfather"})
	assert.ErrorIs(t, err, boom)

	_, err = service.GetMovie(ctx, 1)
	assert.ErrorIs(t, err, boom)

	_, err = service.UpdateMovie(ctx, 1, domain.Movie{Name: "godfather"})
	assert.ErrorIs(t, err, boom)

	assert.ErrorIs(t, service.DeleteMovie(ctx, 1), boom)
}
