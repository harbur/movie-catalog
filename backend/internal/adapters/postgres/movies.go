// Package postgres holds the Postgres-backed implementation of the app
// ports, using pgx directly with no ORM and numbered SQL migrations under
// migrations/. Wiring this adapter into cmd/movie-catalog/main.go in place
// of internal/adapters/memory — plus the config, local dev, and CI changes
// that go with a real database dependency — is a deliberately separate,
// follow-up change: internal/app only depends on the app.MovieRepository
// port, so the swap needs no changes there.
package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/harbur/movie-catalog/backend/internal/app"
	"github.com/harbur/movie-catalog/backend/internal/domain"
)

// MovieRepository stores movies in Postgres.
type MovieRepository struct {
	pool *pgxpool.Pool
}

// compile-time check that the adapter satisfies the port it is written against.
var _ app.MovieRepository = (*MovieRepository)(nil)

// NewMovieRepository connects to Postgres at dsn and applies any pending
// migrations before returning.
func NewMovieRepository(ctx context.Context, dsn string) (*MovieRepository, error) {
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("connect to postgres: %w", err)
	}

	if err := migrate(ctx, pool); err != nil {
		pool.Close()
		return nil, fmt.Errorf("apply migrations: %w", err)
	}

	return &MovieRepository{pool: pool}, nil
}

// Close releases the underlying connection pool.
func (r *MovieRepository) Close() {
	r.pool.Close()
}

// List returns every movie, ordered by id.
func (r *MovieRepository) List(ctx context.Context) ([]domain.Movie, error) {
	rows, err := r.pool.Query(ctx, "SELECT id, name FROM movies ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("list movies: %w", err)
	}
	defer rows.Close()

	movies := make([]domain.Movie, 0)
	for rows.Next() {
		var movie domain.Movie
		if err := rows.Scan(&movie.ID, &movie.Name); err != nil {
			return nil, fmt.Errorf("scan movie: %w", err)
		}
		movies = append(movies, movie)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("list movies: %w", err)
	}
	return movies, nil
}

// Create assigns an id and stores the movie.
func (r *MovieRepository) Create(ctx context.Context, movie domain.Movie) (domain.Movie, error) {
	err := r.pool.QueryRow(ctx,
		"INSERT INTO movies (name) VALUES ($1) RETURNING id",
		movie.Name,
	).Scan(&movie.ID)
	if err != nil {
		return domain.Movie{}, fmt.Errorf("create movie: %w", err)
	}
	return movie, nil
}

// Get returns the movie stored under id, or domain.ErrMovieNotFound.
func (r *MovieRepository) Get(ctx context.Context, id uint) (domain.Movie, error) {
	var movie domain.Movie
	err := r.pool.QueryRow(ctx, "SELECT id, name FROM movies WHERE id = $1", id).Scan(&movie.ID, &movie.Name)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Movie{}, domain.ErrMovieNotFound
	}
	if err != nil {
		return domain.Movie{}, fmt.Errorf("get movie: %w", err)
	}
	return movie, nil
}

// Update replaces an existing movie, or returns domain.ErrMovieNotFound.
func (r *MovieRepository) Update(ctx context.Context, movie domain.Movie) (domain.Movie, error) {
	tag, err := r.pool.Exec(ctx, "UPDATE movies SET name = $1 WHERE id = $2", movie.Name, movie.ID)
	if err != nil {
		return domain.Movie{}, fmt.Errorf("update movie: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.Movie{}, domain.ErrMovieNotFound
	}
	return movie, nil
}

// Delete removes a movie. Deleting an absent movie is not an error.
func (r *MovieRepository) Delete(ctx context.Context, id uint) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM movies WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete movie: %w", err)
	}
	return nil
}
