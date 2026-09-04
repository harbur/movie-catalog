package postgres

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/harbur/movie-catalog/backend/internal/domain"
)

// newTestRepository connects to the Postgres instance named by
// TEST_DATABASE_URL and truncates the movies table so each test starts
// empty. It skips the test when the variable is unset, so `go test ./...`
// still passes without a database reachable (matching the pattern already
// used for DB-backed tests elsewhere in this org).
func newTestRepository(t *testing.T) *MovieRepository {
	t.Helper()

	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping Postgres-backed test")
	}

	ctx := context.Background()
	repo, err := NewMovieRepository(ctx, dsn)
	require.NoError(t, err)
	t.Cleanup(repo.Close)

	_, err = repo.pool.Exec(ctx, "TRUNCATE movies RESTART IDENTITY")
	require.NoError(t, err)

	return repo
}

func TestCreateAssignsIDs(t *testing.T) {
	repo := newTestRepository(t)
	ctx := context.Background()

	first, err := repo.Create(ctx, domain.Movie{Name: "godfather"})
	require.NoError(t, err)
	second, err := repo.Create(ctx, domain.Movie{Name: "godfather 2"})
	require.NoError(t, err)

	assert.NotZero(t, first.ID)
	assert.NotZero(t, second.ID)
	assert.NotEqual(t, first.ID, second.ID)
}

func TestListReturnsMoviesInIDOrder(t *testing.T) {
	repo := newTestRepository(t)
	ctx := context.Background()

	var created []domain.Movie
	for _, name := range []string{"a", "b", "c"} {
		movie, err := repo.Create(ctx, domain.Movie{Name: name})
		require.NoError(t, err)
		created = append(created, movie)
	}
	require.NoError(t, repo.Delete(ctx, created[1].ID))

	movies, err := repo.List(ctx)
	require.NoError(t, err)
	assert.Equal(t, []domain.Movie{created[0], created[2]}, movies)
}

func TestGetAndUpdateMissingMovie(t *testing.T) {
	repo := newTestRepository(t)
	ctx := context.Background()

	_, err := repo.Get(ctx, 1)
	assert.ErrorIs(t, err, domain.ErrMovieNotFound)

	_, err = repo.Update(ctx, domain.Movie{ID: 1, Name: "godfather"})
	assert.ErrorIs(t, err, domain.ErrMovieNotFound)
}

func TestUpdateReplacesStoredMovie(t *testing.T) {
	repo := newTestRepository(t)
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
	repo := newTestRepository(t)
	ctx := context.Background()

	assert.NoError(t, repo.Delete(ctx, 42))
}

func TestMigrationsAreIdempotent(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping Postgres-backed test")
	}

	ctx := context.Background()
	repo, err := NewMovieRepository(ctx, dsn)
	require.NoError(t, err)
	defer repo.Close()

	// Connecting (and so migrating) a second time against the same database
	// must not fail or re-apply already-applied migrations.
	repo2, err := NewMovieRepository(ctx, dsn)
	require.NoError(t, err)
	repo2.Close()
}
