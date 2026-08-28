package domain

import "errors"

// Movie is the core entity of the catalogue.
type Movie struct {
	ID   uint
	Name string
}

// Domain errors. Adapters translate these into transport-specific failures;
// nothing outside the domain invents its own equivalents.
var (
	// ErrMovieNotFound is returned when no movie exists for the given id.
	ErrMovieNotFound = errors.New("movie not found")

	// ErrInvalidID is returned when a caller supplies an id that conflicts
	// with the operation, e.g. an id on create or a mismatched id on update.
	ErrInvalidID = errors.New("invalid id")

	// ErrNameRequired is returned when a movie is missing its name.
	ErrNameRequired = errors.New("name is required")
)

// Validate enforces the invariants a Movie must always satisfy.
func (m Movie) Validate() error {
	if m.Name == "" {
		return ErrNameRequired
	}
	return nil
}
