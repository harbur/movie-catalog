package memory_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/harbur/golang-gin-starter/internal/adapters/memory"
	"github.com/harbur/golang-gin-starter/internal/domain"
)

func TestCreateAssignsSequentialIDs(t *testing.T) {
	repo := memory.NewMovieRepository()
	ctx := context.Background()

	first, err := repo.Create(ctx, domain.Movie{Name: "godfather"})
	require.NoError(t, err)
	second, err := repo.Create(ctx, domain.Movie{Name: "godfather 2"})
	require.NoError(t, err)

	assert.Equal(t, uint(1), first.ID)
	assert.Equal(t, uint(2), second.ID)
}

func TestListReturnsMoviesInIDOrder(t *testing.T) {
	repo := memory.NewMovieRepository()
	ctx := context.Background()

	for _, name := range []string{"a", "b", "c"} {
		_, err := repo.Create(ctx, domain.Movie{Name: name})
		require.NoError(t, err)
	}
	require.NoError(t, repo.Delete(ctx, 2))

	movies, err := repo.List(ctx)
	require.NoError(t, err)
	assert.Equal(t, []domain.Movie{{ID: 1, Name: "a"}, {ID: 3, Name: "c"}}, movies)
}

func TestGetAndUpdateMissingMovie(t *testing.T) {
	repo := memory.NewMovieRepository()
	ctx := context.Background()

	_, err := repo.Get(ctx, 1)
	assert.ErrorIs(t, err, domain.ErrMovieNotFound)

	_, err = repo.Update(ctx, domain.Movie{ID: 1, Name: "godfather"})
	assert.ErrorIs(t, err, domain.ErrMovieNotFound)
}

func TestUpdateReplacesStoredMovie(t *testing.T) {
	repo := memory.NewMovieRepository()
	ctx := context.Background()

	created, err := repo.Create(ctx, domain.Movie{Name: "godfather"})
	require.NoError(t, err)

	_, err = repo.Update(ctx, domain.Movie{ID: created.ID, Name: "godfather 2"})
	require.NoError(t, err)

	got, err := repo.Get(ctx, created.ID)
	require.NoError(t, err)
	assert.Equal(t, "godfather 2", got.Name)
}

func TestDeleteIsIdempotent(t *testing.T) {
	repo := memory.NewMovieRepository()
	ctx := context.Background()

	assert.NoError(t, repo.Delete(ctx, 42))
}
