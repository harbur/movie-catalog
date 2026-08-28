package http

import (
	"errors"

	"github.com/danielgtaylor/huma/v2"
	log "github.com/sirupsen/logrus"

	"github.com/harbur/movie-catalog/backend/internal/domain"
)

// mapError translates a domain error into an HTTP status. This is the one place
// in the codebase where a domain failure acquires a status code.
//
// The wrapped error chain carries call-site context for the logs and is
// deliberately not echoed to the client.
func mapError(err error) error {
	switch {
	case err == nil:
		return nil
	case errors.Is(err, domain.ErrMovieNotFound):
		return huma.Error404NotFound("movie not found")
	case errors.Is(err, domain.ErrInvalidID):
		return huma.Error409Conflict("invalid id")
	case errors.Is(err, domain.ErrNameRequired):
		return huma.Error422UnprocessableEntity("name is required")
	default:
		log.WithError(err).Error("unhandled error")
		return huma.Error500InternalServerError("internal server error")
	}
}
