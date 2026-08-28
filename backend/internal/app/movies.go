package app

import (
	"context"
	"fmt"

	"github.com/harbur/golang-gin-starter/internal/domain"
)

// MovieService holds the movie use cases.
type MovieService struct {
	repo    MovieRepository
	actions ActionCounter
}

// NewMovieService wires a MovieService to its ports.
func NewMovieService(repo MovieRepository, actions ActionCounter) *MovieService {
	return &MovieService{repo: repo, actions: actions}
}

// ListMovies returns every movie in the catalogue.
func (s *MovieService) ListMovies(ctx context.Context) ([]domain.Movie, error) {
	movies, err := s.repo.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list movies: %w", err)
	}

	s.actions.IncrementAction("list movies")
	return movies, nil
}

// CreateMovie adds a movie. The id is assigned by the repository, so a caller
// supplying one is rejected.
func (s *MovieService) CreateMovie(ctx context.Context, movie domain.Movie) (domain.Movie, error) {
	if movie.ID != 0 {
		return domain.Movie{}, domain.ErrInvalidID
	}
	if err := movie.Validate(); err != nil {
		return domain.Movie{}, err
	}

	created, err := s.repo.Create(ctx, movie)
	if err != nil {
		return domain.Movie{}, fmt.Errorf("create movie: %w", err)
	}

	s.actions.IncrementAction("post movie")
	return created, nil
}

// GetMovie returns a single movie, or domain.ErrMovieNotFound.
func (s *MovieService) GetMovie(ctx context.Context, id uint) (domain.Movie, error) {
	movie, err := s.repo.Get(ctx, id)
	if err != nil {
		return domain.Movie{}, fmt.Errorf("get movie %d: %w", id, err)
	}

	s.actions.IncrementAction("get movie")
	return movie, nil
}

// UpdateMovie replaces the movie stored under id.
func (s *MovieService) UpdateMovie(ctx context.Context, id uint, movie domain.Movie) (domain.Movie, error) {
	if movie.ID != 0 && movie.ID != id {
		return domain.Movie{}, domain.ErrInvalidID
	}
	if err := movie.Validate(); err != nil {
		return domain.Movie{}, err
	}
	movie.ID = id

	updated, err := s.repo.Update(ctx, movie)
	if err != nil {
		return domain.Movie{}, fmt.Errorf("update movie %d: %w", id, err)
	}

	s.actions.IncrementAction("put movie")
	return updated, nil
}

// DeleteMovie removes a movie. Deleting a movie that does not exist succeeds.
func (s *MovieService) DeleteMovie(ctx context.Context, id uint) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete movie %d: %w", id, err)
	}

	s.actions.IncrementAction("delete movie")
	return nil
}
