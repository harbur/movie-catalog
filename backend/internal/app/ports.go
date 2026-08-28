package app

import (
	"context"

	"github.com/harbur/movie-catalog/backend/internal/domain"
)

// MovieRepository is the persistence port for movies. It is defined here, by
// the consumer, and implemented by an adapter. Implementations return domain
// types and domain errors — never storage-specific ones.
type MovieRepository interface {
	List(ctx context.Context) ([]domain.Movie, error)
	Create(ctx context.Context, movie domain.Movie) (domain.Movie, error)
	Get(ctx context.Context, id uint) (domain.Movie, error)
	Update(ctx context.Context, movie domain.Movie) (domain.Movie, error)
	Delete(ctx context.Context, id uint) error
}

// ActionCounter is the telemetry port used to record successful use cases.
type ActionCounter interface {
	IncrementAction(action string)
}
