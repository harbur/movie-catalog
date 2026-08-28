// Package memory holds an in-memory implementation of the app ports. It keeps
// the starter runnable without external infrastructure; a real service swaps it
// for internal/adapters/postgres without touching app or domain.
package memory

import (
	"context"
	"sync"

	"github.com/harbur/golang-gin-starter/internal/app"
	"github.com/harbur/golang-gin-starter/internal/domain"
)

// MovieRepository stores movies in memory, keyed by id.
type MovieRepository struct {
	mu     sync.RWMutex
	movies map[uint]domain.Movie
	nextID uint
}

// compile-time check that the adapter satisfies the port it is written against.
var _ app.MovieRepository = (*MovieRepository)(nil)

// NewMovieRepository returns an empty repository.
func NewMovieRepository() *MovieRepository {
	return &MovieRepository{
		movies: make(map[uint]domain.Movie),
		nextID: 1,
	}
}

// List returns every movie, ordered by id.
func (r *MovieRepository) List(ctx context.Context) ([]domain.Movie, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	movies := make([]domain.Movie, 0, len(r.movies))
	for id := uint(1); id < r.nextID; id++ {
		if movie, ok := r.movies[id]; ok {
			movies = append(movies, movie)
		}
	}
	return movies, nil
}

// Create assigns an id and stores the movie.
func (r *MovieRepository) Create(ctx context.Context, movie domain.Movie) (domain.Movie, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	movie.ID = r.nextID
	r.nextID++
	r.movies[movie.ID] = movie
	return movie, nil
}

// Get returns the movie stored under id, or domain.ErrMovieNotFound.
func (r *MovieRepository) Get(ctx context.Context, id uint) (domain.Movie, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	movie, ok := r.movies[id]
	if !ok {
		return domain.Movie{}, domain.ErrMovieNotFound
	}
	return movie, nil
}

// Update replaces an existing movie, or returns domain.ErrMovieNotFound.
func (r *MovieRepository) Update(ctx context.Context, movie domain.Movie) (domain.Movie, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.movies[movie.ID]; !ok {
		return domain.Movie{}, domain.ErrMovieNotFound
	}
	r.movies[movie.ID] = movie
	return movie, nil
}

// Delete removes a movie. Deleting an absent movie is not an error.
func (r *MovieRepository) Delete(ctx context.Context, id uint) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.movies, id)
	return nil
}
